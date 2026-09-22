"""
Rate limiting. Desde la Sesión 4, la implementación real es
`RedisRateLimiter` — la ventana deslizante ya no vive en la memoria de un
solo proceso (esa era la limitación honesta documentada en las sesiones
anteriores: no sobrevivía a un segundo worker/réplica). `InMemoryRateLimiter`
se mantiene, pero solo como el fake que usan los tests (mismo patrón que
`StubOrchestrator` para el proveedor de modelo) — no correr Redis real por
cada test unitario es una decisión de velocidad, no de "no importa si
funciona", así que igual hay un test de integración contra Redis real (ver
test_rate_limit.py) para no caer en el anti-patrón "el mock pasa aunque
producción falle".

Segunda limitación, agregada al montar el gateway de la Sesión 3
(`gateway/nginx.conf`): `request.client.host` es la IP de quien le habla
directo al backend. Si el tráfico entra por el gateway, esa IP es la del
contenedor del gateway, no la del cliente real — todo el tráfico que pasa
por el gateway queda bucketed junto. Arreglarlo bien (confiar en
`X-Forwarded-For` solo cuando viene de un proxy conocido) es trabajo para
cuando el gateway sea el camino de entrada real, no antes — confiar en ese
header sin validar de dónde viene es abrir la puerta a que cualquiera
falsifique su IP.
"""

from __future__ import annotations

import threading
import time
import uuid
from collections import defaultdict, deque
from functools import lru_cache
from typing import Protocol

from fastapi import Depends, HTTPException, Request

from ..config import get_settings
from .dependencies import get_redis_client


class RateLimiter(Protocol):
    """Interfaz chica a propósito (Interface Segregation, CLAUDE.md sección
    13): lo único que un limitador necesita exponer es "¿se permite esta
    clave ahora?". `InMemoryRateLimiter` y `RedisRateLimiter` la cumplen
    sin que `enforce_rate_limit` sepa (ni le importe) cuál es cuál."""

    def check(self, key: str) -> bool: ...


class InMemoryRateLimiter:
    """Ventana deslizante en memoria de un solo proceso — solo para tests,
    ver el docstring del módulo."""

    def __init__(self, max_requests: int, window_seconds: float):
        self._max_requests = max_requests
        self._window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            hits = self._hits[key]
            while hits and now - hits[0] > self._window_seconds:
                hits.popleft()
            if len(hits) >= self._max_requests:
                return False
            hits.append(now)
            return True


class RedisRateLimiter:
    """Ventana deslizante real, compartida entre cualquier número de
    procesos/instancias del backend — el sorted set de Redis reemplaza al
    `deque` en memoria. Cada miembro es único (timestamp + uuid) para que
    dos hits en el mismo milisegundo no se pisen entre sí en el set.

    Nota de atomicidad, honesta: el trim (ZREMRANGEBYSCORE) + conteo
    (ZCARD) + inserción (ZADD) no corren como una sola operación atómica —
    hay una ventana muy chica donde dos requests concurrentes del mismo
    cliente podrían leer el mismo conteo antes de que cualquiera de las dos
    inserte. Para un freno de cuota (no una garantía de seguridad exacta),
    ese margen es aceptable; si algún día hiciera falta exactitud estricta,
    la forma correcta es un script Lua evaluado atómicamente en el server.
    """

    def __init__(self, client: redis.Redis, max_requests: int, window_seconds: float):
        self._client = client
        self._max_requests = max_requests
        self._window_seconds = window_seconds

    def check(self, key: str) -> bool:
        redis_key = f"ratelimit:{key}"
        now = time.time()
        window_start = now - self._window_seconds
        self._client.zremrangebyscore(redis_key, 0, window_start)
        current_count = self._client.zcard(redis_key)
        if current_count >= self._max_requests:
            return False
        member = f"{now}:{uuid.uuid4().hex}"
        self._client.zadd(redis_key, {member: now})
        # +1 de margen sobre la ventana: si nadie vuelve a pegarle a esta
        # clave, Redis limpia la llave sola en vez de acumular para siempre.
        self._client.expire(redis_key, int(self._window_seconds) + 1)
        return True


@lru_cache
def get_rate_limiter() -> RateLimiter:
    settings = get_settings()
    return RedisRateLimiter(
        get_redis_client(),
        max_requests=settings.rate_limit_max_requests,
        window_seconds=settings.rate_limit_window_seconds,
    )


def enforce_rate_limit(
    request: Request,
    limiter: RateLimiter = Depends(get_rate_limiter),
) -> None:
    """Dependencia de FastAPI. `limiter` llega inyectado vía Depends(get_rate_limiter)
    — es lo que permite a los tests reemplazarlo con `app.dependency_overrides`
    sin tocar el estado global del proceso (get_rate_limiter usa @lru_cache).
    """
    client_key = request.client.host if request.client else "unknown"
    if not limiter.check(client_key):
        raise HTTPException(
            status_code=429,
            detail="Demasiadas solicitudes. Espera un momento antes de volver a intentar.",
        )

"""
Limitador de tasa en memoria — decidimos no sumar una dependencia nueva
(tipo slowapi) porque el `.venv` de este repo ya demostró ser frágil por
vivir dentro de OneDrive, y una ventana deslizante simple resuelve el
problema real: que un bug de frontend o un cliente mal portado no queme la
cuota de NVIDIA a fuerza de reintentos.

Limitación honesta, no oculta: este limitador vive en la memoria de un solo
proceso. Si el backend corre con varios workers o varias réplicas, cada uno
lleva su propia cuenta — el límite real efectivo sería
`rate_limit_max_requests * numero_de_procesos`, no el valor configurado. Para
el tamaño actual del despliegue (un solo proceso) esto no es un problema,
pero si el proyecto crece a correr con varios workers, este limitador deja de
ser suficiente y hay que migrar a algo respaldado por Redis o similar.
"""

from __future__ import annotations

import threading
import time
from collections import defaultdict, deque
from functools import lru_cache

from fastapi import Depends, HTTPException, Request

from ..config import get_settings


class InMemoryRateLimiter:
    """Ventana deslizante por clave (en la práctica, IP del cliente)."""

    def __init__(self, max_requests: int, window_seconds: float):
        self._max_requests = max_requests
        self._window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, key: str) -> bool:
        """True si se permite la request (y la registra). False si excede el límite."""
        now = time.monotonic()
        with self._lock:
            hits = self._hits[key]
            while hits and now - hits[0] > self._window_seconds:
                hits.popleft()
            if len(hits) >= self._max_requests:
                return False
            hits.append(now)
            return True


@lru_cache
def get_rate_limiter() -> InMemoryRateLimiter:
    settings = get_settings()
    return InMemoryRateLimiter(
        max_requests=settings.rate_limit_max_requests,
        window_seconds=settings.rate_limit_window_seconds,
    )


def enforce_rate_limit(
    request: Request,
    limiter: InMemoryRateLimiter = Depends(get_rate_limiter),
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

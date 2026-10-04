import uuid

import redis
from fastapi.testclient import TestClient

from backend.app.api.dependencies import (
    get_evidence_store,
    get_triage_orchestrator,
    require_authenticated,
)
from backend.app.api.rate_limit import InMemoryRateLimiter, RedisRateLimiter, get_rate_limiter
from backend.app.config import get_settings
from backend.app.main import app
from backend.app.storage.evidence_store import EvidenceStore
from backend.tests.test_api import StubOrchestrator, make_stub_user, model_output


def teardown_function():
    app.dependency_overrides.clear()


def test_exceeding_limit_returns_429(db):
    store = EvidenceStore(db)
    stub_user = make_stub_user(db)
    app.dependency_overrides[get_triage_orchestrator] = lambda: StubOrchestrator(model_output())
    app.dependency_overrides[get_evidence_store] = lambda: store
    # Limite bajo a proposito para no tener que golpear el endpoint 1000 veces
    # solo para probar que el 429 existe. Importante: se crea UNA instancia y
    # el override siempre devuelve esa misma — si el lambda construyera una
    # instancia nueva en cada llamada (FastAPI llama al override una vez por
    # request), el estado nunca se acumularia y el limite jamas se activaria.
    limiter = InMemoryRateLimiter(max_requests=2, window_seconds=60)
    app.dependency_overrides[get_rate_limiter] = lambda: limiter
    app.dependency_overrides[require_authenticated] = lambda: stub_user
    client = TestClient(app)
    payload = {"symptoms_text": "Tengo un sintoma cualquiera desde ayer."}

    first = client.post("/api/triage", json=payload)
    second = client.post("/api/triage", json=payload)
    third = client.post("/api/triage", json=payload)

    assert first.status_code == 200
    assert second.status_code == 200
    assert third.status_code == 429


def test_limit_is_per_client_key():
    """El limitador cuenta por clave (IP), no globalmente para todo el proceso —
    una prueba directa sobre InMemoryRateLimiter, sin pasar por HTTP, para
    confirmar esto sin depender de como TestClient asigna la IP simulada."""
    limiter = InMemoryRateLimiter(max_requests=1, window_seconds=60)

    assert limiter.check("cliente_a") is True
    assert limiter.check("cliente_a") is False
    assert limiter.check("cliente_b") is True


def test_redis_rate_limiter_shares_state_across_instances():
    """La prueba que justifica la Sesión 4: dos objetos RedisRateLimiter
    *distintos* (como los tendría cada worker/réplica del backend), contra
    el mismo Redis real, tienen que compartir el conteo — si esto pasara
    con un mock en memoria pasaría igual aunque la implementación real
    estuviera rota, que es exactamente el anti-patrón que CONSTRAINTS.md
    pide evitar."""
    client = redis.from_url(get_settings().redis_url)
    key = f"test-{uuid.uuid4().hex}"
    client.delete(f"ratelimit:{key}")

    limiter_en_instancia_a = RedisRateLimiter(client, max_requests=2, window_seconds=60)
    limiter_en_instancia_b = RedisRateLimiter(client, max_requests=2, window_seconds=60)

    assert limiter_en_instancia_a.check(key) is True
    assert limiter_en_instancia_b.check(key) is True
    # La tercera, sin importar por cual "instancia" entra, ya debería estar
    # bloqueada — el límite es 2, compartido entre las dos.
    assert limiter_en_instancia_a.check(key) is False
    assert limiter_en_instancia_b.check(key) is False

    client.delete(f"ratelimit:{key}")


def test_triage_limit_is_per_client_behind_a_proxy(db, monkeypatch):
    """Mismo arreglo que login: detrás de un proxy, cada cliente su propio bucket."""
    monkeypatch.setenv("TRUSTED_PROXY_HOPS", "1")
    store = EvidenceStore(db)
    app.dependency_overrides[get_triage_orchestrator] = lambda: StubOrchestrator(model_output())
    app.dependency_overrides[get_evidence_store] = lambda: store
    limiter = InMemoryRateLimiter(max_requests=1, window_seconds=60)
    app.dependency_overrides[get_rate_limiter] = lambda: limiter
    client = TestClient(app)
    payload = {"symptoms_text": "Tengo un sintoma cualquiera desde ayer."}

    client.post("/api/triage", json=payload, headers={"X-Forwarded-For": "200.1.1.1"})
    blocked = client.post("/api/triage", json=payload, headers={"X-Forwarded-For": "200.1.1.1"})
    other = client.post("/api/triage", json=payload, headers={"X-Forwarded-For": "200.2.2.2"})

    assert blocked.status_code == 429
    assert other.status_code == 200

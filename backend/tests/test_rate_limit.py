from fastapi.testclient import TestClient

from backend.app.api.dependencies import (
    get_evidence_store,
    get_triage_orchestrator,
    require_authenticated,
)
from backend.app.api.rate_limit import InMemoryRateLimiter, get_rate_limiter
from backend.app.main import app
from backend.app.storage.evidence_store import EvidenceStore

from backend.tests.test_api import STUB_USER, StubOrchestrator, model_output


def teardown_function():
    app.dependency_overrides.clear()


def test_exceeding_limit_returns_429(tmp_path):
    store = EvidenceStore(tmp_path / "evidence.jsonl")
    app.dependency_overrides[get_triage_orchestrator] = lambda: StubOrchestrator(model_output())
    app.dependency_overrides[get_evidence_store] = lambda: store
    # Limite bajo a proposito para no tener que golpear el endpoint 1000 veces
    # solo para probar que el 429 existe. Importante: se crea UNA instancia y
    # el override siempre devuelve esa misma — si el lambda construyera una
    # instancia nueva en cada llamada (FastAPI llama al override una vez por
    # request), el estado nunca se acumularia y el limite jamas se activaria.
    limiter = InMemoryRateLimiter(max_requests=2, window_seconds=60)
    app.dependency_overrides[get_rate_limiter] = lambda: limiter
    app.dependency_overrides[require_authenticated] = lambda: STUB_USER
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

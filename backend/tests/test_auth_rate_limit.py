"""Freno de fuerza bruta en login y registro (hallazgo de QA, Sesión 13)."""

import uuid

from fastapi.testclient import TestClient

from backend.app.api.dependencies import get_evidence_store, get_triage_orchestrator
from backend.app.api.rate_limit import InMemoryRateLimiter, get_auth_rate_limiter, get_rate_limiter
from backend.app.main import app
from backend.app.storage.evidence_store import EvidenceStore
from backend.tests.test_api import StubOrchestrator, model_output


def teardown_function():
    app.dependency_overrides.clear()


def test_login_is_rate_limited_after_too_many_attempts():
    limiter = InMemoryRateLimiter(max_requests=3, window_seconds=60)
    app.dependency_overrides[get_auth_rate_limiter] = lambda: limiter
    client = TestClient(app)
    payload = {"email": "nadie@example.com", "password": "incorrecta"}

    statuses = [client.post("/api/v1/auth/login", json=payload).status_code for _ in range(4)]

    assert statuses == [401, 401, 401, 429]
    assert client.post("/api/v1/auth/login", json=payload).json()["error"]["request_id"]


def test_signup_shares_the_auth_limit():
    limiter = InMemoryRateLimiter(max_requests=1, window_seconds=60)
    app.dependency_overrides[get_auth_rate_limiter] = lambda: limiter
    client = TestClient(app)

    client.post("/api/v1/auth/login", json={"email": "a@example.com", "password": "x"})
    response = client.post("/api/v1/auth/signup", json={"email": "b@example.com", "password": "clave123"})

    assert response.status_code == 429


def test_blocked_login_does_not_block_triage(db):
    """Buckets separados: quien agotó los intentos de login sigue pudiendo
    consultar, y la cuota de triage no se gastó en esos intentos."""
    auth_limiter = InMemoryRateLimiter(max_requests=1, window_seconds=60)
    triage_limiter = InMemoryRateLimiter(max_requests=1, window_seconds=60)
    store = EvidenceStore(db)
    app.dependency_overrides[get_auth_rate_limiter] = lambda: auth_limiter
    app.dependency_overrides[get_rate_limiter] = lambda: triage_limiter
    app.dependency_overrides[get_triage_orchestrator] = lambda: StubOrchestrator(model_output())
    app.dependency_overrides[get_evidence_store] = lambda: store
    client = TestClient(app)
    login = {"email": "a@example.com", "password": "x"}

    client.post("/api/v1/auth/login", json=login)
    assert client.post("/api/v1/auth/login", json=login).status_code == 429

    triage = client.post("/api/v1/triage", json={"symptoms_text": "Tengo tos seca desde hace tres días, sin fiebre."})
    assert triage.status_code == 200


def test_auth_limiter_reads_its_limit_from_settings(monkeypatch):
    """Sin override: el limitador real (Redis) toma AUTH_RATE_LIMIT_MAX_REQUESTS."""
    monkeypatch.setenv("AUTH_RATE_LIMIT_MAX_REQUESTS", "3")
    get_auth_rate_limiter.cache_clear()
    try:
        limiter = get_auth_rate_limiter()
        key = f"auth:test-{uuid.uuid4().hex}"
        assert [limiter.check(key) for _ in range(4)] == [True, True, True, False]
    finally:
            get_auth_rate_limiter.cache_clear()

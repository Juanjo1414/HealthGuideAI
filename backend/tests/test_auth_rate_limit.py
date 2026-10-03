"""Freno de fuerza bruta en login y registro (hallazgo de QA, Sesión 13)."""

from fastapi.testclient import TestClient

from backend.app.api.rate_limit import InMemoryRateLimiter, get_auth_rate_limiter
from backend.app.main import app


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


def test_signup_shares_the_auth_limit_but_not_the_triage_one():
    limiter = InMemoryRateLimiter(max_requests=1, window_seconds=60)
    app.dependency_overrides[get_auth_rate_limiter] = lambda: limiter
    client = TestClient(app)

    client.post("/api/v1/auth/login", json={"email": "a@example.com", "password": "x"})
    response = client.post("/api/v1/auth/signup", json={"email": "b@example.com", "password": "clave123"})

    assert response.status_code == 429


def test_auth_limiter_uses_its_own_bucket():
    """La clave lleva prefijo `auth:`: un intento de login no consume la cuota
    de triage de la misma IP."""
    limiter = InMemoryRateLimiter(max_requests=1, window_seconds=60)
    app.dependency_overrides[get_auth_rate_limiter] = lambda: limiter
    client = TestClient(app)

    client.post("/api/v1/auth/login", json={"email": "a@example.com", "password": "x"})

    assert limiter.check("testclient") is True

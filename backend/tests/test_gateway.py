"""
Tests de la capa de gateway agregada en la Sesion 3: versionado (/api/v1
vs /api legado), request ID, sobre de error consistente, y /ready.
No repite lo que ya cubren test_api.py/test_auth.py sobre la logica de
negocio de cada endpoint — esto es puramente sobre la infraestructura de
la API.
"""

from __future__ import annotations

from fastapi.testclient import TestClient

from backend.app.api.dependencies import get_db, get_redis_client
from backend.app.main import app


def teardown_function():
    app.dependency_overrides.clear()


def test_ready_reports_ok_when_dependencies_available(monkeypatch):
    monkeypatch.setenv("NVIDIA_API_KEY", "clave-de-prueba")

    response = TestClient(app).get("/ready")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["checks"] == {"nvidia_configured": True, "postgres": True, "redis": True}


def test_ready_reports_not_ready_when_nvidia_key_missing(monkeypatch):
    monkeypatch.delenv("NVIDIA_API_KEY", raising=False)

    response = TestClient(app).get("/ready")

    assert response.status_code == 503
    body = response.json()
    assert body["status"] == "not_ready"
    assert body["checks"]["nvidia_configured"] is False


def test_ready_reports_not_ready_when_postgres_fails(monkeypatch):
    monkeypatch.setenv("NVIDIA_API_KEY", "clave-de-prueba")

    class BrokenDb:
        def query_one(self, *_args, **_kwargs):
            raise RuntimeError("simulando Postgres caido")

    app.dependency_overrides[get_db] = lambda: BrokenDb()

    response = TestClient(app).get("/ready")

    assert response.status_code == 503
    assert response.json()["checks"]["postgres"] is False


def test_ready_reports_not_ready_when_redis_fails(monkeypatch):
    monkeypatch.setenv("NVIDIA_API_KEY", "clave-de-prueba")

    class BrokenRedis:
        def ping(self):
            raise ConnectionError("simulando Redis caido")

    app.dependency_overrides[get_redis_client] = lambda: BrokenRedis()

    response = TestClient(app).get("/ready")

    assert response.status_code == 503
    assert response.json()["checks"]["redis"] is False


def test_v1_prefix_behaves_identical_to_legacy_alias():
    client = TestClient(app)

    v1_response = client.get("/api/v1/auth/me")
    legacy_response = client.get("/api/auth/me")

    assert v1_response.status_code == legacy_response.status_code == 401
    # request_id es distinto por request (cada uno el suyo) — se compara
    # todo lo demás, que es lo que debe ser idéntico entre alias.
    v1_body, legacy_body = v1_response.json(), legacy_response.json()
    assert v1_body["detail"] == legacy_body["detail"]
    assert v1_body["error"]["code"] == legacy_body["error"]["code"]


def test_response_includes_request_id_header():
    response = TestClient(app).get("/health")

    assert "X-Request-ID" in response.headers
    assert len(response.headers["X-Request-ID"]) > 0


def test_incoming_request_id_is_respected():
    response = TestClient(app).get("/health", headers={"X-Request-ID": "id-de-prueba-123"})

    assert response.headers["X-Request-ID"] == "id-de-prueba-123"


def test_error_envelope_has_detail_and_stable_code():
    response = TestClient(app).get("/api/v1/auth/me")

    assert response.status_code == 401
    body = response.json()
    # `detail` se mantiene para no romper frontend/src/api/*.js, que ya lo lee así.
    assert body["detail"] == "Inicia sesión para continuar."
    assert body["error"]["code"] == "unauthorized"
    assert body["error"]["request_id"] == response.headers["X-Request-ID"]

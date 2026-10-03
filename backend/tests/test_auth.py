from fastapi.testclient import TestClient

from backend.app.api.dependencies import get_db, get_session_store, get_user_store
from backend.app.main import app
from backend.app.storage.session_store import SessionStore
from backend.app.storage.user_store import UserStore


def client_with_fresh_db(db):
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_user_store] = lambda: UserStore(db)
    app.dependency_overrides[get_session_store] = lambda: SessionStore(db, ttl_seconds=3600)
    return TestClient(app), db


def teardown_function():
    app.dependency_overrides.clear()


def test_signup_creates_user_and_sets_session_cookie(db):
    client, _ = client_with_fresh_db(db)

    response = client.post(
        "/api/auth/signup", json={"email": "hola@gmail.com", "password": "clave123"}
    )

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "hola@gmail.com"
    assert body["role"] == "user"
    assert "healthguide_session" in response.cookies


def test_signup_with_duplicate_email_returns_409(db):
    client, _ = client_with_fresh_db(db)
    client.post("/api/auth/signup", json={"email": "hola@gmail.com", "password": "clave123"})

    response = client.post(
        "/api/auth/signup", json={"email": "hola@gmail.com", "password": "otraclave"}
    )

    assert response.status_code == 409


def test_login_with_correct_credentials_succeeds(db):
    client, _ = client_with_fresh_db(db)
    client.post("/api/auth/signup", json={"email": "hola@gmail.com", "password": "clave123"})

    response = client.post(
        "/api/auth/login", json={"email": "hola@gmail.com", "password": "clave123"}
    )

    assert response.status_code == 200
    assert "healthguide_session" in response.cookies


def test_login_with_wrong_password_returns_401(db):
    client, _ = client_with_fresh_db(db)
    client.post("/api/auth/signup", json={"email": "hola@gmail.com", "password": "clave123"})

    response = client.post(
        "/api/auth/login", json={"email": "hola@gmail.com", "password": "incorrecta"}
    )

    assert response.status_code == 401


def test_me_without_session_returns_401(db):
    client, _ = client_with_fresh_db(db)

    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_me_with_valid_session_returns_user(db):
    client, _ = client_with_fresh_db(db)
    client.post("/api/auth/signup", json={"email": "hola@gmail.com", "password": "clave123"})

    response = client.get("/api/auth/me")

    assert response.status_code == 200
    assert response.json()["email"] == "hola@gmail.com"


def test_logout_invalidates_session(db):
    client, _ = client_with_fresh_db(db)
    client.post("/api/auth/signup", json={"email": "hola@gmail.com", "password": "clave123"})

    logout_response = client.post("/api/auth/logout")
    me_response = client.get("/api/auth/me")

    assert logout_response.status_code == 204
    assert me_response.status_code == 401


def test_triage_is_anonymous_but_history_requires_login(db):
    """Sesión 10/11: consultar no exige cuenta (decisión de producto); lo
    que sí la exige es ver el historial, que es para lo que existe la cuenta."""
    client, _ = client_with_fresh_db(db)

    triage = client.post("/api/triage", json={"symptoms_text": "Tengo fiebre desde ayer."})
    history = client.get("/api/triage/history")

    assert triage.status_code != 401
    assert history.status_code == 401


def test_signup_rejects_unexpected_field(db):
    """extra='forbid' (Sesion 5): un campo colado a mano (ej. "role":
    "admin") tiene que dar 422, no ignorarse en silencio."""
    client, _ = client_with_fresh_db(db)

    response = client.post(
        "/api/auth/signup",
        json={"email": "hola@gmail.com", "password": "clave123", "role": "admin"},
    )

    assert response.status_code == 422


def test_session_cookie_is_not_secure_in_development(db, monkeypatch):
    monkeypatch.delenv("ENVIRONMENT", raising=False)
    client, _ = client_with_fresh_db(db)

    response = client.post(
        "/api/auth/signup", json={"email": "cookie-dev@example.com", "password": "clave123"}
    )

    set_cookie = response.headers.get("set-cookie", "")
    assert "Secure" not in set_cookie


def test_session_cookie_is_secure_in_production(db, monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "production")
    client, _ = client_with_fresh_db(db)

    response = client.post(
        "/api/auth/signup", json={"email": "cookie-prod@example.com", "password": "clave123"}
    )

    set_cookie = response.headers.get("set-cookie", "")
    assert "Secure" in set_cookie

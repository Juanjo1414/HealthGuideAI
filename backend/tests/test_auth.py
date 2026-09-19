from fastapi.testclient import TestClient

from backend.app.api.dependencies import get_db, get_session_store, get_user_store
from backend.app.main import app
from backend.app.storage.db import Database
from backend.app.storage.session_store import SessionStore
from backend.app.storage.user_store import UserStore


def client_with_fresh_db(tmp_path):
    db = Database(tmp_path / "auth.db")
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_user_store] = lambda: UserStore(db)
    app.dependency_overrides[get_session_store] = lambda: SessionStore(db, ttl_seconds=3600)
    return TestClient(app), db


def teardown_function():
    app.dependency_overrides.clear()


def test_signup_creates_user_and_sets_session_cookie(tmp_path):
    client, _ = client_with_fresh_db(tmp_path)

    response = client.post(
        "/api/auth/signup", json={"email": "hola@gmail.com", "password": "clave123"}
    )

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "hola@gmail.com"
    assert body["role"] == "user"
    assert "healthguide_session" in response.cookies


def test_signup_with_duplicate_email_returns_409(tmp_path):
    client, _ = client_with_fresh_db(tmp_path)
    client.post("/api/auth/signup", json={"email": "hola@gmail.com", "password": "clave123"})

    response = client.post(
        "/api/auth/signup", json={"email": "hola@gmail.com", "password": "otraclave"}
    )

    assert response.status_code == 409


def test_login_with_correct_credentials_succeeds(tmp_path):
    client, _ = client_with_fresh_db(tmp_path)
    client.post("/api/auth/signup", json={"email": "hola@gmail.com", "password": "clave123"})

    response = client.post(
        "/api/auth/login", json={"email": "hola@gmail.com", "password": "clave123"}
    )

    assert response.status_code == 200
    assert "healthguide_session" in response.cookies


def test_login_with_wrong_password_returns_401(tmp_path):
    client, _ = client_with_fresh_db(tmp_path)
    client.post("/api/auth/signup", json={"email": "hola@gmail.com", "password": "clave123"})

    response = client.post(
        "/api/auth/login", json={"email": "hola@gmail.com", "password": "incorrecta"}
    )

    assert response.status_code == 401


def test_me_without_session_returns_401(tmp_path):
    client, _ = client_with_fresh_db(tmp_path)

    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_me_with_valid_session_returns_user(tmp_path):
    client, _ = client_with_fresh_db(tmp_path)
    client.post("/api/auth/signup", json={"email": "hola@gmail.com", "password": "clave123"})

    response = client.get("/api/auth/me")

    assert response.status_code == 200
    assert response.json()["email"] == "hola@gmail.com"


def test_logout_invalidates_session(tmp_path):
    client, _ = client_with_fresh_db(tmp_path)
    client.post("/api/auth/signup", json={"email": "hola@gmail.com", "password": "clave123"})

    logout_response = client.post("/api/auth/logout")
    me_response = client.get("/api/auth/me")

    assert logout_response.status_code == 204
    assert me_response.status_code == 401


def test_triage_without_session_requires_login(tmp_path):
    client, _ = client_with_fresh_db(tmp_path)

    response = client.post("/api/triage", json={"symptoms_text": "Tengo fiebre desde ayer."})

    assert response.status_code == 401

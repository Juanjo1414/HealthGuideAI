"""
Tests del CSRFOriginCheckMiddleware — verificacion de origen para metodos
que cambian estado, ver backend/app/api/csrf.py.
"""

from __future__ import annotations

from fastapi.testclient import TestClient

from backend.app.main import app


def teardown_function():
    app.dependency_overrides.clear()


def test_post_with_untrusted_origin_is_rejected():
    response = TestClient(app).post(
        "/api/v1/auth/login",
        json={"email": "a@example.com", "password": "clave123"},
        headers={"Origin": "https://sitio-malicioso.com"},
    )

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "forbidden_origin"


def test_post_with_trusted_origin_is_not_blocked_by_csrf():
    # No estamos probando login exitoso acá (eso vive en test_auth.py) —
    # solo que el origen confiable no dispara el 403. Un 401 (credenciales
    # incorrectas) confirma que pasó el chequeo de CSRF y llegó al handler.
    response = TestClient(app).post(
        "/api/v1/auth/login",
        json={"email": "no-existe@example.com", "password": "clave123"},
        headers={"Origin": "http://localhost:8080"},
    )

    assert response.status_code == 401


def test_post_without_origin_or_referer_is_allowed():
    """Un cliente que no es navegador (curl, un test, un futuro cliente
    movil) no manda Origin — bloquearlo de por si no defiende nada."""
    response = TestClient(app).post(
        "/api/v1/auth/login",
        json={"email": "no-existe@example.com", "password": "clave123"},
    )

    assert response.status_code == 401


def test_post_from_backends_own_origin_is_allowed():
    """Simula "Try it out" en /docs: el Origin es el propio backend, no
    está en cors_allowed_origins (esa lista es para el frontend), pero
    tiene que pasar igual — ver _is_trusted_origin en csrf.py."""
    client = TestClient(app, base_url="http://testserver")
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "no-existe@example.com", "password": "clave123"},
        headers={"Origin": "http://testserver"},
    )

    assert response.status_code == 401


def test_post_falls_back_to_referer_when_origin_missing():
    """Algunos navegadores viejos no mandan Origin en same-origin POST,
    pero sí Referer — el fallback tiene que leer el origen de ahí."""
    response = TestClient(app).post(
        "/api/v1/auth/login",
        json={"email": "no-existe@example.com", "password": "clave123"},
        headers={"Referer": "https://sitio-malicioso.com/pagina-de-ataque"},
    )

    assert response.status_code == 403


def test_get_request_is_never_blocked_by_csrf():
    response = TestClient(app).get(
        "/api/v1/auth/me", headers={"Origin": "https://sitio-malicioso.com"}
    )

    # 401 (sin sesión), no 403 — GET es un método seguro, el middleware ni
    # lo mira.
    assert response.status_code == 401

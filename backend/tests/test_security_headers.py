"""
Tests de SecurityHeadersMiddleware — ver backend/app/api/security_headers.py.
"""

from __future__ import annotations

from fastapi.testclient import TestClient

from backend.app.main import app


def test_api_response_has_strict_security_headers():
    response = TestClient(app).get("/health")

    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
    assert response.headers["Content-Security-Policy"] == "default-src 'none'; frame-ancestors 'none'"


def _csp_directives(header: str) -> dict[str, list[str]]:
    """"script-src 'self' https://x" -> {"script-src": ["'self'", "https://x"]}.

    Se compara cada directiva completa, no por substring del header entero: con
    "in" pasaba también un origen como
    https://cdn.jsdelivr.net.evil.com (alerta de CodeQL
    py/incomplete-url-substring-sanitization), y no se verificaba en qué
    directiva quedaba permitido."""
    directives: dict[str, list[str]] = {}
    for part in header.split(";"):
        tokens = part.split()
        if tokens:
            directives[tokens[0]] = tokens[1:]
    return directives


def test_docs_response_has_permissive_csp_for_swagger_assets():
    response = TestClient(app).get("/docs")

    assert response.status_code == 200
    csp = _csp_directives(response.headers["Content-Security-Policy"])
    # El CDN de Swagger solo se permite para scripts y estilos, nada más.
    swagger_cdn = ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"]
    assert csp["script-src"] == swagger_cdn
    assert csp["style-src"] == swagger_cdn
    assert csp["default-src"] == ["'self'"]
    assert csp["connect-src"] == ["'self'"]
    # Los headers "duros" siguen aplicando igual en /docs.
    assert response.headers["X-Content-Type-Options"] == "nosniff"


def test_hsts_is_absent_outside_production(monkeypatch):
    monkeypatch.delenv("ENVIRONMENT", raising=False)

    response = TestClient(app).get("/health")

    assert "Strict-Transport-Security" not in response.headers

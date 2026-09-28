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


def test_docs_response_has_permissive_csp_for_swagger_assets():
    response = TestClient(app).get("/docs")

    assert response.status_code == 200
    csp = response.headers["Content-Security-Policy"]
    assert "cdn.jsdelivr.net" in csp
    # Los headers "duros" siguen aplicando igual en /docs.
    assert response.headers["X-Content-Type-Options"] == "nosniff"


def test_hsts_is_absent_outside_production(monkeypatch):
    monkeypatch.delenv("ENVIRONMENT", raising=False)

    response = TestClient(app).get("/health")

    assert "Strict-Transport-Security" not in response.headers

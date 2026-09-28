"""
Headers de seguridad (Sesion 5) — defensa en profundidad para el
navegador, aparte de lo que ya hace CORS/CSRF. Se aplican a toda
respuesta, con una excepcion deliberada: `/docs` y `/redoc` (Swagger UI
y ReDoc, HTML+JS servido por este mismo proceso) necesitan un
Content-Security-Policy mas permisivo — cargan assets desde un CDN, y un
`default-src 'none'` los rompe. El resto de la API es JSON puro, asi que
ahi el CSP puede ser tan estricto como se pueda.
"""

from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.types import ASGIApp

from ..config import get_settings

_DOCS_PATHS = {"/docs", "/redoc", "/openapi.json", "/docs/oauth2-redirect"}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        if request.url.path in _DOCS_PATHS:
            # Swagger UI/ReDoc traen su JS/CSS de un CDN — sin esto, el CSP
            # estricto de abajo los deja en blanco.
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
                "style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
                "img-src 'self' https://fastapi.tiangolo.com data:; "
                "connect-src 'self'"
            )
        else:
            # API JSON pura: no necesita cargar nada, no necesita renderizar
            # nada. La politica mas estricta posible.
            response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"

        # HSTS solo tiene sentido si de verdad se sirve por HTTPS — activarlo
        # en desarrollo (HTTP plano) no rompe nada, pero es ruido que no
        # dice la verdad sobre el entorno actual.
        if get_settings().environment == "production":
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"

        return response

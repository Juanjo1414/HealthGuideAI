"""
CSRF (Sesion 5) via verificacion de origen, no double-submit token.

La auth ya usa `SameSite=Lax` en la cookie de sesion (routes_auth.py), que
en navegadores modernos ya bloquea el ataque clasico (un sitio ajeno que
hace un POST/fetch a nuestra API, la cookie no viaja porque es cross-site).
Esta capa es defensa en profundidad para el resto: verifica que el header
`Origin` (o `Referer` si el navegador no mando Origin) sea uno de los
origenes esperados, antes de dejar pasar cualquier metodo que cambie
estado. Es el mismo mecanismo que recomienda OWASP como alternativa
valida a un token CSRF cuando no hay que soportar navegadores viejos.

Deliberadamente permisivo si NO hay Origin ni Referer: un cliente que no
es un navegador (un script, un test, un futuro cliente movil) no manda
esos headers, y bloquearlo de por si no defiende nada — el ataque real que
esto previene es "un navegador con la cookie de la victima haciendo un
POST desde otro sitio", y un navegador real SI manda Origin en ese caso.
"""

from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.types import ASGIApp

from ..config import get_settings

_UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


def _origin_from_referer(referer: str) -> str | None:
    # No hace falta parsear la URL completa — el origen es scheme://host[:port],
    # que es exactamente el prefijo antes del tercer "/".
    parts = referer.split("/")
    if len(parts) < 3:
        return None
    return f"{parts[0]}//{parts[2]}"


class CSRFOriginCheckMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        if request.method in _UNSAFE_METHODS:
            origin = request.headers.get("origin")
            if origin is None:
                referer = request.headers.get("referer")
                origin = _origin_from_referer(referer) if referer else None

            if origin is not None and not self._is_trusted_origin(request, origin):
                # RequestIdMiddleware es mas externo que este (ver main.py),
                # asi que request.state.request_id ya deberia existir para
                # cuando esto corre — el fallback es solo por las dudas.
                request_id = getattr(request.state, "request_id", None)
                return JSONResponse(
                    status_code=403,
                    content={
                        "detail": "Origen no permitido para esta operación.",
                        "error": {"code": "forbidden_origin", "request_id": request_id},
                    },
                )

        return await call_next(request)

    @staticmethod
    def _is_trusted_origin(request: Request, origin: str) -> bool:
        settings = get_settings()
        if origin in settings.cors_allowed_origins:
            return True
        # El propio host del backend tambien cuenta como confiable — es lo
        # que permite que /docs (Swagger UI, servido por este mismo
        # proceso) pueda usar "Try it out" en un POST sin que esto lo
        # bloquee. No es parte de CORS a proposito: CORS es sobre que
        # puede llamar un OTRO origen, esto es "este origen es este mismo
        # servidor".
        same_origin = f"{request.url.scheme}://{request.url.netloc}"
        return origin == same_origin

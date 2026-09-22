"""
Middleware de gateway: request ID y logging de acceso estructurado.

Orden de montaje en main.py importa. Starlette arma el stack en el orden
INVERSO al que se agregan los middleware — el último agregado queda más
afuera y es el primero en tocar el request entrante. Por eso ahi se agrega
CORS primero, despues el logging, y RequestIdMiddleware al final: así
RequestId queda más afuera (le asigna ID al request antes que nada) y su
header de respuesta es lo último que se agrega antes de salir.

Nada de esto loguea el texto de síntomas ni la respuesta del modelo — eso
ya vive (con su propia política de privacidad) en EvidenceStore. Este log
es solo de acceso: método, ruta, status, duración.
"""

from __future__ import annotations

import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.types import ASGIApp

access_logger = logging.getLogger("healthguide.access")

REQUEST_ID_HEADER = "X-Request-ID"


class RequestIdMiddleware(BaseHTTPMiddleware):
    """Asigna un request_id (o respeta el que mande un proxy delante
    nuestro, ej. el gateway de la Sesión 3) y lo deja en request.state
    para que errors.py y el logging de acceso lo puedan leer."""

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        incoming = request.headers.get(REQUEST_ID_HEADER)
        request_id = incoming or uuid.uuid4().hex
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers[REQUEST_ID_HEADER] = request_id
        return response


class AccessLogMiddleware(BaseHTTPMiddleware):
    """Una línea por request, sin datos sensibles: quién (método+ruta),
    qué pasó (status) y cuánto tardó — lo mínimo para diagnosticar
    latencia o errores sin abrir el log de evidencia clínica."""

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        start = time.monotonic()
        response = await call_next(request)
        duration_ms = (time.monotonic() - start) * 1000
        request_id = getattr(request.state, "request_id", "unknown")
        access_logger.info(
            "%s %s -> %d (%.1fms) request_id=%s",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            request_id,
        )
        return response

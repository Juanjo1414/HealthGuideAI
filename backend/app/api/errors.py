"""
Sobre de error consistente para toda la API. Antes de esto, cada endpoint
devolvía el `detail` crudo de FastAPI (`{"detail": "..."}`) sin codigo ni
forma de correlacionar un error con el log del servidor — para el usuario
alcanza, pero para debuggear "un usuario reporta que algo fallo" no.

Se mantiene el campo `detail` (mensaje humano) porque el frontend ya lo lee
así (`frontend/src/api/*.js`, `errorBody?.detail`) — no hay motivo para
romper eso a mitad de la Sesion 3, que es de backend. Lo nuevo es el objeto
`error` con un codigo estable y el `request_id` que ya viaja en el header
`X-Request-ID` (ver middleware.py), para que un reporte de bug se pueda
cruzar con el log del servidor sin adivinar.

Nunca se expone un stack trace ni el mensaje crudo de una excepcion no
controlada al cliente — el catch-all de abajo siempre devuelve un mensaje
generico, y lo real queda solo en el log del servidor.
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger("healthguide.errors")

# Un codigo estable por status HTTP — estable en el sentido de que un
# cliente (o un test) puede confiar en el string sin parsear el mensaje
# humano, que puede cambiar de redaccion sin previo aviso.
_CODE_BY_STATUS: dict[int, str] = {
    400: "bad_request",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    409: "conflict",
    422: "validation_error",
    429: "rate_limited",
    502: "provider_error",
    503: "service_unavailable",
}


def _request_id(request: Request) -> str:
    # RequestIdMiddleware siempre lo setea antes de que el request llegue
    # acá — el fallback es solo para no reventar si algún test construye
    # un Request a mano sin pasar por el middleware.
    return getattr(request.state, "request_id", "unknown")


def _envelope(detail: str, code: str, request_id: str) -> dict:
    return {"detail": detail, "error": {"code": code, "request_id": request_id}}


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def handle_http_exception(request: Request, exc: HTTPException) -> JSONResponse:
        code = _CODE_BY_STATUS.get(exc.status_code, "error")
        return JSONResponse(
            status_code=exc.status_code,
            content=_envelope(str(exc.detail), code, _request_id(request)),
            headers=exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        # Pydantic ya valida el shape del request (ej. symptoms_text vacío) —
        # acá solo se homogeniza el sobre, no se repite la validación.
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=_envelope(
                "La solicitud no tiene el formato esperado.",
                "validation_error",
                _request_id(request),
            ),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        # Acá sí se loguea el detalle real — el cliente nunca lo ve, pero
        # con el request_id se puede cruzar el reporte de un usuario contra
        # esta línea del log.
        logger.exception(
            "Error no controlado en %s %s (request_id=%s)",
            request.method,
            request.url.path,
            _request_id(request),
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_envelope(
                "Ocurrió un error inesperado. Intenta de nuevo en unos segundos.",
                "internal_error",
                _request_id(request),
            ),
        )

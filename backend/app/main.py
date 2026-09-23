"""
Punto de entrada. Corre con: uvicorn app.main:app --reload --app-dir backend

Versionado de API (Sesion 3, ver docs/PLAN_IMPLEMENTACION.md y
DECISION_TABLE.md): /api/v1/* es la ruta canonica. /api/* (sin version)
sigue funcionando identico, marcado `deprecated` en OpenAPI, porque el
frontend actual ya le pega a esas rutas (VITE_API_BASE_URL) y romperlas a
mitad de una sesion de backend no tiene ningun beneficio. Politica de
deprecacion: /api/* sin version se retira recien cuando el frontend migre
a VITE_API_BASE_URL=.../api/v1 (parte de las Sesiones 9-11), nunca antes.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.errors import install_error_handlers
from .api.middleware import AccessLogMiddleware, RequestIdMiddleware
from .api.routes_auth import router as auth_router
from .api.routes_health import router as health_router
from .api.routes_triage import router as triage_router
from .config import get_settings

app = FastAPI(
    title="HealthGuide AI — API",
    description=(
        "Clasifica prioridad de atencion a partir de sintomas en texto libre. "
        "Nunca diagnostica una enfermedad especifica ni recomienda medicamentos "
        "(ver CLAUDE.md seccion 2) — orienta, la decision final es humana."
    ),
    version="0.1.0",
)

settings = get_settings()

# Orden de montaje: Starlette arma el stack en el orden INVERSO al que se
# agrega cada middleware (el ultimo agregado queda mas afuera). Se agrega
# CORS primero, despues logging, y RequestId al final — asi RequestId es
# lo primero que toca un request entrante y lo ultimo en salir, con su
# header ya puesto incluso en respuestas de error. Ver middleware.py.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
    # Necesario para que la cookie de sesion viaje en requests cross-origin
    # (frontend en :5173/:8080, backend en :8000). allow_origins ya lista
    # dominios exactos (nunca "*"), asi que combinarlo con credentials=True
    # es seguro.
    allow_credentials=True,
)
app.add_middleware(AccessLogMiddleware)
app.add_middleware(RequestIdMiddleware)

install_error_handlers(app)

# /health y /ready son de infraestructura, no de negocio — no llevan prefijo
# de version (ver routes_health.py).
app.include_router(health_router)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(triage_router, prefix="/api/v1")

app.include_router(auth_router, prefix="/api", deprecated=True)
app.include_router(triage_router, prefix="/api", deprecated=True)

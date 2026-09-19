"""
Punto de entrada. Corre con: uvicorn app.main:app --reload --app-dir backend
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes_auth import router as auth_router
from .api.routes_triage import router as triage_router
from .config import get_settings

app = FastAPI(
    title="HealthGuide AI — API",
    description="Clasifica prioridad de atencion a partir de sintomas en texto libre. No diagnostica ni prescribe.",
    version="0.1.0",
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
    # Necesario para que la cookie de sesion viaje en requests cross-origin
    # (frontend en :5173/:8080, backend en :8000). allow_origins ya lista
    # dominios exactos (nunca "*"), asi que combinarlo con credentials=True
    # es seguro.
    allow_credentials=True,
)

app.include_router(auth_router, prefix="/api")
app.include_router(triage_router, prefix="/api")


@app.get("/api/health")
def health_check() -> dict:
    return {"status": "ok"}

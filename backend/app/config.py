"""
Configuracion del backend. Todo lo que depende del entorno (keys, orígenes
permitidos, dónde vive el log de evidencia) vive acá — nada de leer
os.environ desde adentro de la lógica de negocio.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

# El .env vive en la raíz del repo (mismo que usan los notebooks), no en backend/,
# para no duplicar credenciales en dos lugares distintos.
REPO_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(REPO_ROOT / ".env")


@dataclass(frozen=True)
class Settings:
    nvidia_api_key: str | None = None
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_model: str = "nvidia/nemotron-3-super-120b-a12b"
    nvidia_timeout_seconds: float = 30.0
    nvidia_max_retries: int = 0
    # 5173 es el puerto de "npm run dev" (Vite); 8080 es el puerto publicado
    # por el frontend en compose.yml. Configurable por env var para cuando
    # esto se despliegue en un dominio real — ver backend/README.md.
    cors_allowed_origins: list[str] = field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8080",
            "http://127.0.0.1:8080",
        ]
    )
    evidence_log_path: Path = REPO_ROOT / "backend" / "data" / "evidence.jsonl"
    evidence_include_sensitive_payloads: bool = False
    # Cada llamada a /api/triage cuesta una llamada real a NVIDIA — el limite
    # por defecto es conservador a proposito, no es un numero de infra pensado
    # para trafico alto, sino un freno para que un cliente (o un bug de
    # frontend) no queme la cuota de la API sin querer.
    rate_limit_max_requests: int = 20
    rate_limit_window_seconds: float = 60.0
    # Base de datos de usuarios/sesiones. SQLite (stdlib, sin ORM) por la
    # misma razon que evidence_store.py usa un JSONL plano: para el tamano
    # actual del proyecto no hace falta un motor de base de datos aparte.
    auth_db_path: Path = REPO_ROOT / "backend" / "data" / "auth.db"
    # "Sesion que nunca se cierra" en la practica: una cookie de vida muy
    # larga (1 año), no una sesion sin expiracion real (los navegadores no
    # soportan eso). El logout manual si invalida la sesion en el servidor
    # borrando la fila de session_store — es el unico mecanismo de cierre.
    session_ttl_seconds: float = 60 * 60 * 24 * 365
    session_cookie_name: str = "healthguide_session"
    # Credencial de la cuenta admin de arranque. Deliberadamente NO
    # hardcodeada en el codigo: sale de ADMIN_PASSWORD en el .env de la raiz
    # (que ya esta en .gitignore) para poder "borrarla facil" antes de salir
    # a produccion sin dejar rastro permanente en el historial de git. El
    # default solo existe para no bloquear desarrollo local.
    admin_username: str = "admin"
    admin_password: str = "12345"


def get_settings() -> Settings:
    cors_env = os.getenv("CORS_ALLOWED_ORIGINS")
    settings_kwargs = {}
    if cors_env:
        # Antes de un despliegue real hay que fijar esto al dominio real del
        # frontend — ver README.md, seccion "Pendiente". Formato: origenes
        # separados por coma, ej. "https://healthguide.miapp.com".
        settings_kwargs["cors_allowed_origins"] = [
            origin.strip() for origin in cors_env.split(",") if origin.strip()
        ]

    return Settings(
        **settings_kwargs,
        nvidia_api_key=os.getenv("NVIDIA_API_KEY") or None,
        nvidia_timeout_seconds=float(os.getenv("NVIDIA_TIMEOUT_SECONDS", "30")),
        nvidia_max_retries=int(os.getenv("NVIDIA_MAX_RETRIES", "0")),
        evidence_include_sensitive_payloads=os.getenv(
            "EVIDENCE_INCLUDE_SENSITIVE_PAYLOADS", "false"
        ).lower()
        in {"1", "true", "yes"},
        rate_limit_max_requests=int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "20")),
        rate_limit_window_seconds=float(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60")),
        session_ttl_seconds=float(os.getenv("SESSION_TTL_SECONDS", str(60 * 60 * 24 * 365))),
        admin_username=os.getenv("ADMIN_USERNAME", "admin"),
        admin_password=os.getenv("ADMIN_PASSWORD", "12345"),
    )

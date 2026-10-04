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
    # nemotron-3-super-120b-a12b fue dado de baja por NVIDIA el 2026-10-03
    # (410 Gone). El reemplazo se eligio con el gate de evals, ver
    # evals/results.md y DECISION_LOG.md (decision 6).
    nvidia_model: str = "nvidia/nemotron-3.5-lightning-30b-a3b"
    nvidia_enable_thinking: bool = False
    nvidia_timeout_seconds: float = 30.0
    # Sesion 7: estaba en 0 a proposito en sesiones anteriores, pero las
    # corridas reales de evals (Sesion 6, evals/results.md) mostraron 503
    # "Service temporarily overloaded" repetidos — un error que casi
    # siempre rechaza rapido, no cuelga la conexion, asi que un reintento
    # con backoff (lo maneja el SDK de openai internamente) suele resolver
    # en un par de segundos extra, no en otros 30s completos. El SDK
    # reintenta solo errores razonablemente reintentables (5xx, timeouts,
    # rate limits), no cualquier fallo.
    # Tradeoff honesto: en el peor caso patologico (cada intento agota los
    # 30s completos sin responder nada), 2 reintentos podrian superar el
    # timeout de 35s que ya tiene el frontend (frontend/src/api/triageApi.js)
    # — en ese caso el usuario ve el mismo "tardo demasiado" que ya veria
    # hoy con 0 reintentos, no es peor. El caso comun (503 rapido) es donde
    # esto realmente ayuda, y es el que se vio repetidas veces en las
    # corridas reales.
    nvidia_max_retries: int = 2
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
    evidence_include_sensitive_payloads: bool = False
    # Cada llamada a /api/triage cuesta una llamada real a NVIDIA — el limite
    # por defecto es conservador a proposito, no es un numero de infra pensado
    # para trafico alto, sino un freno para que un cliente (o un bug de
    # frontend) no queme la cuota de la API sin querer.
    rate_limit_max_requests: int = 20
    rate_limit_window_seconds: float = 60.0
    # Login/registro (hallazgo de QA, Sesión 13): sin esto se podía probar
    # contraseñas sin freno. Bucket aparte del de triage para que un intento
    # fallido no consuma la cuota de consultas.
    auth_rate_limit_max_requests: int = 10
    auth_rate_limit_window_seconds: float = 60.0
    # Postgres (Sesion 4 — reemplaza el SQLite/JSONL de sesiones anteriores).
    # El default apunta a localhost:5433 (no 5432: ver el comentario en
    # compose.yml sobre el conflicto con un Postgres nativo instalado por
    # fuera de Docker) — es el puerto que compose.yml publica para el
    # servicio `postgres`, sirve para correr el backend o los tests desde
    # el host sin Docker, siempre que `docker compose up -d postgres redis`
    # este corriendo. Dentro de un contenedor, compose.yml sobreescribe
    # esto a "postgres:5432" (el hostname/puerto interno de Docker).
    database_url: str = "postgresql://healthguide:healthguide_dev_only@localhost:5433/healthguide"
    # Redis (Sesion 4): rate limiting distribuido, ver api/rate_limit.py.
    redis_url: str = "redis://localhost:6379/0"
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
    # "development" por defecto para no bloquear a nadie corriendo local.
    # Sesion 5: el guard de arranque de abajo lo usa para decidir si
    # admin/12345 llegando sin cambiar es un problema silencioso (dev) o
    # un arranque que tiene que fallar ruidosamente (production).
    environment: str = "development"


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
        nvidia_model=(os.getenv("NVIDIA_MODEL") or "").strip() or Settings.nvidia_model,
        nvidia_enable_thinking=os.getenv("NVIDIA_ENABLE_THINKING", "false").lower()
        in {"1", "true", "yes"},
        nvidia_timeout_seconds=float(os.getenv("NVIDIA_TIMEOUT_SECONDS", "30")),
        nvidia_max_retries=int(os.getenv("NVIDIA_MAX_RETRIES", "2")),
        evidence_include_sensitive_payloads=os.getenv(
            "EVIDENCE_INCLUDE_SENSITIVE_PAYLOADS", "false"
        ).lower()
        in {"1", "true", "yes"},
        rate_limit_max_requests=int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "20")),
        rate_limit_window_seconds=float(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60")),
        auth_rate_limit_max_requests=int(os.getenv("AUTH_RATE_LIMIT_MAX_REQUESTS", "10")),
        auth_rate_limit_window_seconds=float(os.getenv("AUTH_RATE_LIMIT_WINDOW_SECONDS", "60")),
        database_url=os.getenv(
            "DATABASE_URL",
            "postgresql://healthguide:healthguide_dev_only@localhost:5433/healthguide",
        ),
        redis_url=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
        session_ttl_seconds=float(os.getenv("SESSION_TTL_SECONDS", str(60 * 60 * 24 * 365))),
        admin_username=os.getenv("ADMIN_USERNAME", "admin"),
        admin_password=os.getenv("ADMIN_PASSWORD", "12345"),
        environment=os.getenv("ENVIRONMENT", "development"),
    )


def validate_production_config(settings: Settings) -> None:
    """Guard de arranque (Sesion 5): si esto no revienta ahora, revienta
    en produccion de una forma mucho peor — alguien entra con admin/12345.
    Se llama una sola vez, al importar main.py, antes de que el proceso
    pueda aceptar un solo request. No es una validacion de Pydantic porque
    la regla no es "el campo tiene el tipo correcto", es "esta combinacion
    de valores es insegura para este entorno especifico".
    """
    if settings.environment != "production":
        return
    problems = []
    if settings.admin_password == "12345":  # noqa: S105 - comparando contra el default inseguro, no un secreto
        problems.append(
            "ADMIN_PASSWORD sigue en el default de desarrollo (12345). "
            "Definila en el entorno antes de arrancar en produccion."
        )
    if not settings.nvidia_api_key:
        problems.append("NVIDIA_API_KEY no esta configurada.")
    # Auditoria cyber-neo (Sesion 5, hallazgo low/CWE-798): el guard de
    # admin_password ya existia, pero database_url tenia el mismo problema
    # (una credencial de desarrollo hardcodeada como default) sin nadie
    # chequeandola antes de arrancar en produccion.
    if "healthguide_dev_only" in settings.database_url:
        problems.append(
            "DATABASE_URL sigue apuntando a la base de desarrollo. "
            "Definila en el entorno antes de arrancar en produccion."
        )
    if problems:
        raise RuntimeError(
            "No se puede arrancar con ENVIRONMENT=production por configuracion insegura:\n- "
            + "\n- ".join(problems)
        )

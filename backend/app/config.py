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
    )

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
    nvidia_api_key: str
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_model: str = "nvidia/nemotron-3-super-120b-a12b"
    cors_allowed_origins: list[str] = field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    )
    evidence_log_path: Path = REPO_ROOT / "backend" / "data" / "evidence.jsonl"


def get_settings() -> Settings:
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        raise RuntimeError(
            "Falta NVIDIA_API_KEY. Copia .env.example a .env en la raíz del repo "
            "y agrega tu key real (ver README.md, seccion 'Como correr esto')."
        )
    return Settings(nvidia_api_key=api_key)

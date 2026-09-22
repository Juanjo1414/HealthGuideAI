"""
/health vs /ready — a propósito NO viven bajo /api (ver DECISION_TABLE.md,
nota de versionado): son endpoints de infraestructura, no del contrato de
negocio versionado, y así los puede pollear un balanceador o Docker
healthcheck sin tener que saber en qué versión de la API está el backend.

- /health (liveness): "¿el proceso está vivo?" — no toca nada externo, si
  responde 200 el proceso puede recibir tráfico a nivel de proceso.
- /ready (readiness): "¿puede atender un request de verdad ahora mismo?" —
  chequea lo que hoy es real: que haya API key de NVIDIA configurada y que
  la base de auth responda. Cuando la Sesión 4 traiga Postgres y Redis,
  esos checks se agregan acá — no antes, porque un check contra un
  servicio que todavía no existe en este compose.yml sería un check falso.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Response, status

from ..config import Settings, get_settings
from ..storage.db import Database
from .dependencies import get_db

logger = logging.getLogger("healthguide.health")

router = APIRouter()


@router.get("/health")
def liveness() -> dict:
    return {"status": "ok"}


@router.get("/ready")
def readiness(
    response: Response,
    settings: Settings = Depends(get_settings),
    db: Database = Depends(get_db),
) -> dict:
    checks = {
        "nvidia_configured": bool(settings.nvidia_api_key),
        "auth_db": _check_auth_db(db),
    }
    ready = all(checks.values())
    response.status_code = status.HTTP_200_OK if ready else status.HTTP_503_SERVICE_UNAVAILABLE
    return {"status": "ok" if ready else "not_ready", "checks": checks}


def _check_auth_db(db: Database) -> bool:
    try:
        db.query_one("SELECT 1")
        return True
    except Exception:  # noqa: BLE001 — un /ready no debe tumbar el proceso, solo reportar
        logger.exception("auth_db no respondió en /ready")
        return False

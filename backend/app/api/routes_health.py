"""
/health vs /ready — a propósito NO viven bajo /api (ver DECISION_TABLE.md,
nota de versionado): son endpoints de infraestructura, no del contrato de
negocio versionado, y así los puede pollear un balanceador o Docker
healthcheck sin tener que saber en qué versión de la API está el backend.

- /health (liveness): "¿el proceso está vivo?" — no toca nada externo, si
  responde 200 el proceso puede recibir tráfico a nivel de proceso.
- /ready (readiness): "¿puede atender un request de verdad ahora mismo?" —
  desde la Sesión 4 chequea Postgres y Redis de verdad (antes solo
  chequeaba la API key de NVIDIA y la base de auth en SQLite, con una nota
  explícita de que Postgres/Redis se sumarían cuando existieran — ya
  existen).
"""

from __future__ import annotations

import logging

import redis
from fastapi import APIRouter, Depends, Response, status

from ..config import Settings, get_settings
from ..storage.db import Database
from .dependencies import get_db, get_redis_client

logger = logging.getLogger("healthguide.health")

router = APIRouter()


# HEAD además de GET: los monitores externos (UptimeRobot, el plan gratuito
# solo hace HEAD) piden con ese método, y un 405 los marcaba como caído aunque
# el servicio estuviera sano. /ready se deja solo en GET: toca Postgres y Redis,
# y un monitor consultándolo cada pocos minutos mantendría despierta la base.
@router.api_route("/health", methods=["GET", "HEAD"])
def liveness() -> dict:
    return {"status": "ok"}


@router.get("/ready")
def readiness(
    response: Response,
    settings: Settings = Depends(get_settings),
    db: Database = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis_client),
) -> dict:
    checks = {
        "nvidia_configured": bool(settings.nvidia_api_key),
        "postgres": _check_postgres(db),
        "redis": _check_redis(redis_client),
    }
    ready = all(checks.values())
    response.status_code = status.HTTP_200_OK if ready else status.HTTP_503_SERVICE_UNAVAILABLE
    return {"status": "ok" if ready else "not_ready", "checks": checks}


def _check_postgres(db: Database) -> bool:
    try:
        db.query_one("SELECT 1")
        return True
    except Exception:  # noqa: BLE001 — un /ready no debe tumbar el proceso, solo reportar
        logger.exception("Postgres no respondió en /ready")
        return False


def _check_redis(client: redis.Redis) -> bool:
    try:
        return bool(client.ping())
    except Exception:  # noqa: BLE001 — mismo criterio que _check_postgres
        logger.exception("Redis no respondió en /ready")
        return False

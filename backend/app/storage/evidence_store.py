"""
Capa de evidencia — cada request/response/veredicto de validación queda
como una fila en `evidence`, ya no como línea de un JSONL (Sesión 4: ver
docs/PLAN_IMPLEMENTACION.md). Mismo espíritu de siempre: registrar lo
mínimo necesario para trazabilidad, sin guardar el texto médico ni la
respuesta completa a menos que `EVIDENCE_INCLUDE_SENSITIVE_PAYLOADS=true`.

Por qué esto justificaba moverse de un archivo a una tabla real, más allá
de que "todo lo demás también se movió a Postgres" en esta sesión: un
JSONL append-only no se puede filtrar por usuario sin leerlo entero. La
pantalla de Historial (docs/PANTALLAS.md, bloqueada hasta ahora) necesita
`WHERE user_id = ...` — por eso esta tabla ya incluye `user_id` desde esta
migración, aunque el endpoint que lo consuma sea trabajo de la Sesión 11.
"""

from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timezone

import psycopg2.extras

from .db import Database


class EvidenceStore:
    def __init__(self, db: Database, include_sensitive_payloads: bool = False):
        self._db = db
        self._include_sensitive_payloads = include_sensitive_payloads

    def record(
        self, symptoms_text: str, model_output: dict, validation: dict, user_id: int | None = None
    ) -> str:
        request_id = str(uuid.uuid4())
        symptoms_payload = symptoms_text if self._include_sensitive_payloads else None
        output_payload = model_output if self._include_sensitive_payloads else None
        self._db.execute(
            """
            INSERT INTO evidence (
                request_id, user_id, "timestamp", input_sha256, input_length,
                output_fields, model_priority, model_requires_review,
                validation, symptoms_text, model_output
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                request_id,
                user_id,
                datetime.now(timezone.utc),
                hashlib.sha256(symptoms_text.encode("utf-8")).hexdigest(),
                len(symptoms_text),
                sorted(model_output.keys()),
                model_output.get("prioridad"),
                model_output.get("requiere_revision"),
                psycopg2.extras.Json(validation),
                symptoms_payload,
                psycopg2.extras.Json(output_payload) if output_payload is not None else None,
            ),
        )
        return request_id

    def record_provider_error(
        self, symptoms_text: str, error: Exception, user_id: int | None = None
    ) -> str:
        request_id = str(uuid.uuid4())
        self._db.execute(
            """
            INSERT INTO evidence (
                request_id, user_id, "timestamp", input_sha256, input_length,
                provider_error_type
            ) VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                request_id,
                user_id,
                datetime.now(timezone.utc),
                hashlib.sha256(symptoms_text.encode("utf-8")).hexdigest(),
                len(symptoms_text),
                type(error).__name__,
            ),
        )
        return request_id

    def all_entries(self) -> list[dict]:
        """Todas las filas de evidencia, más nuevas primero. A propósito NO
        filtra acá qué está "flagged" — esa regla es `_is_flagged()` en
        backend/scripts/list_flagged_for_review.py, una sola fuente de
        verdad en vez de reimplementar el mismo criterio en SQL y en
        Python (que se podrían desincronizar sin que nadie lo note)."""
        rows = self._db.query_all(
            """
            SELECT request_id, user_id, "timestamp", model_priority,
                   model_requires_review, validation, provider_error_type
            FROM evidence
            ORDER BY "timestamp" DESC
            """
        )
        return [dict(row) for row in rows]

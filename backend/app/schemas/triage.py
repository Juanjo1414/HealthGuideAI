"""
Esquemas de la API. TriageResponse envuelve el contrato de salida fijo de
HealthGuideAI (ver .claude/CLAUDE.md seccion 4) con el veredicto del
validador de seguridad — la API nunca devuelve el JSON crudo del modelo
sin pasar antes por esa capa.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Priority = Literal["BAJA", "MEDIA", "ALTA", "EMERGENCIA"]


class TriageRequest(BaseModel):
    symptoms_text: str = Field(
        min_length=1,
        max_length=4000,
        description="Sintomas descritos en lenguaje natural por el usuario.",
    )


class ValidationSummary(BaseModel):
    passed: bool
    checks: dict[str, bool]
    reasons: list[str]


class TriageResponse(BaseModel):
    resumen: str
    sintomas_detectados: list[str]
    prioridad: Priority
    posibles_causas: list[str]
    alertas: list[str]
    recomendacion: str
    requiere_revision: bool
    confianza: float = Field(ge=0.0, le=1.0)

    validation: ValidationSummary
    requires_human_review: bool
    request_id: str

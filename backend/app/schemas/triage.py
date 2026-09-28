"""
Esquemas de la API. TriageResponse envuelve el contrato de salida fijo de
HealthGuideAI (ver .claude/CLAUDE.md seccion 4) con el veredicto del
validador de seguridad — la API nunca devuelve el JSON crudo del modelo
sin pasar antes por esa capa.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

Priority = Literal["BAJA", "MEDIA", "ALTA", "EMERGENCIA"]


class TriageRequest(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "symptoms_text": (
                    "Tengo dolor de cabeza fuerte desde ayer y algo de fiebre, "
                    "39 grados esta mañana."
                )
            }
        }
    )

    symptoms_text: str = Field(
        min_length=1,
        max_length=4000,
        description="Sintomas descritos en lenguaje natural por el usuario.",
    )

    @field_validator("symptoms_text")
    @classmethod
    def normalize_symptoms_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("La descripción de síntomas no puede estar vacía.")
        return normalized


class ValidationSummary(BaseModel):
    passed: bool
    checks: dict[str, bool]
    reasons: list[str]


class TriageResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "resumen": "Dolor de cabeza con fiebre moderada desde hace un día.",
                "sintomas_detectados": ["dolor de cabeza", "fiebre"],
                "prioridad": "MEDIA",
                "posibles_causas": ["infección viral común"],
                "alertas": [],
                "recomendacion": (
                    "Descansa, mantente hidratado y consulta a un médico si "
                    "los síntomas empeoran o persisten más de 3 días."
                ),
                "requiere_revision": False,
                "confianza": 0.72,
                "validation": {"passed": True, "checks": {"no_diagnostica": True}, "reasons": []},
                "requires_human_review": False,
                "request_id": "9f1c2e7a4b3d4e8f8a1b2c3d4e5f6a7b",
            }
        },
    )

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

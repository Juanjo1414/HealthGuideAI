"""
El contrato de producto es estable — ya fue validado por el modelo en la
Parte 4 del notebook y quedo fijado como el contrato de salida de
.claude/CLAUDE.md seccion 4. En produccion no tiene sentido volver a
generarlo con un LLM en cada arranque (costaria una llamada extra y seria
no determinista para algo que ya es una decision de producto tomada);
por eso vive acá como una constante versionada en código.
"""

from __future__ import annotations

PRODUCT_NAME = "HealthGuide AI"

USER_DESCRIPTION = (
    "Adultos que presentan sintomas y no saben si deben esperar, "
    "agendar una cita o ir a urgencias."
)

AI_JOB = [
    "Extraer sintomas del texto libre del usuario",
    "Clasificar la prioridad de atencion (BAJA, MEDIA, ALTA, EMERGENCIA)",
    "Sugerir posibles causas generales, nunca un diagnostico cerrado",
    "Recomendar un siguiente paso conservador",
]

SYSTEM_VALIDATIONS = [
    "El JSON debe cumplir el esquema exacto de output_fields",
    "No debe contener afirmaciones diagnosticas cerradas",
    "No debe mencionar medicamentos ni categorias de medicacion",
    "Debe pedir mas informacion si el input es insuficiente",
    "Debe escalar a ALTA/EMERGENCIA + requiere_revision=true ante señales de alarma",
]

HUMAN_DECISION = (
    "El usuario (o un profesional de salud si el caso se escala) decide "
    "el paso final. El sistema orienta, nunca decide."
)

# Mismas claves y significados que documenta .claude/CLAUDE.md seccion 4.
OUTPUT_FIELDS: dict[str, str] = {
    "resumen": "string - sintesis breve del caso",
    "sintomas_detectados": "array de strings - sintomas identificados",
    "prioridad": "string - BAJA | MEDIA | ALTA | EMERGENCIA",
    "posibles_causas": "array de strings - causas generales, nunca diagnosticos cerrados",
    "alertas": "array de strings - señales de riesgo detectadas",
    "recomendacion": "string - siguiente paso sugerido",
    "requiere_revision": "boolean - true si un humano debe revisar el caso",
    "confianza": "number entre 0 y 1",
}

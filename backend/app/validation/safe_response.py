"""Respuesta determinista usada cuando la salida del modelo no es segura."""

from __future__ import annotations


def build_safe_fallback(validation: dict, model_output: dict) -> dict:
    red_flag_was_undertriaged = validation.get("checks", {}).get("escala_red_flags") is False
    model_priority = str(model_output.get("prioridad", "")).strip().upper()
    if red_flag_was_undertriaged or model_priority == "EMERGENCIA":
        priority = "EMERGENCIA"
        recommendation = (
            "La respuesta automática no superó los controles de seguridad. "
            "Busca atención de urgencias de inmediato o llama a la línea de emergencias local."
        )
    else:
        priority = "ALTA"
        recommendation = (
            "La respuesta automática no superó los controles de seguridad. "
            "Busca valoración de un profesional de salud antes de tomar una decisión. "
            "Si los síntomas son intensos, empeoran o incluyen dificultad para respirar, "
            "pérdida de conciencia o dolor en el pecho, acude a urgencias."
        )

    return {
        "resumen": "No fue posible generar una orientación automática segura y completa.",
        "sintomas_detectados": [],
        "prioridad": priority,
        "posibles_causas": [],
        "alertas": ["El caso requiere valoración humana."],
        "recomendacion": recommendation,
        "requiere_revision": True,
        "confianza": 0.0,
    }

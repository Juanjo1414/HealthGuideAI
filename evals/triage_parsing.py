"""
triage_parsing.py

Parte "parsing" del validador de seguridad (ver validate_triage_output.py
para la vista general y por qué se partió en tres archivos — pedido del
mentor en MAKERS_ACCEPTANCE.md, gate de Mantenibilidad, Sesión 6 del plan).

Todo lo de acá es leer/normalizar la salida del modelo para que las reglas
(triage_rules.py) puedan comparar texto de forma consistente, sin
depender de que el modelo acentúe o mayuscule igual siempre. No contiene
ninguna regla de negocio en sí — solo transforma datos.
"""

from __future__ import annotations

import unicodedata

ALLOWED_PRIORITIES = {"BAJA", "MEDIA", "ALTA", "EMERGENCIA"}

REQUIRED_FIELDS = {
    "resumen": str,
    "sintomas_detectados": list,
    "prioridad": str,
    "posibles_causas": list,
    "alertas": list,
    "recomendacion": str,
    "requiere_revision": bool,
    "confianza": (int, float),
}


def strip_accents(text: str) -> str:
    """Normaliza tildes/diacríticos para que 'térmico' y 'termico' matcheen igual."""
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(ch for ch in nfkd if not unicodedata.combining(ch))


def text_blob(output: dict) -> str:
    """Concatena todos los campos de texto del output para buscar patrones (sin tildes)."""
    parts = [str(output.get("resumen", "")), str(output.get("recomendacion", ""))]
    parts += [str(x) for x in output.get("posibles_causas", []) or []]
    parts += [str(x) for x in output.get("alertas", []) or []]
    return strip_accents(" ".join(parts).lower())

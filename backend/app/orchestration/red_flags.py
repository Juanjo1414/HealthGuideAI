"""
Capa determinista de red flags (Sesion 6) — corre ANTES de llamar al
modelo, para que la seguridad clinica no dependa de que el LLM "adivine
bien" (pedido del mentor en MAKERS_ACCEPTANCE.md, gate de Jailbreak/Safety).

Reutiliza la misma funcion de deteccion que usa el validador de salida
(evals/triage_rules.py, detect_red_flags) — una sola fuente de verdad
para "que cuenta como señal de alarma" entre la capa de entrada
(orquestacion, este archivo) y la de salida (validacion, despues de
llamar al modelo). Import robusto por el mismo motivo que
evals/validate_triage_output.py: dos caminos de import distintos segun
quien cargue el modulo.
"""

from __future__ import annotations

try:
    from triage_rules import detect_red_flags as _detect_red_flags
except ImportError:
    from evals.triage_rules import detect_red_flags as _detect_red_flags


def detect_red_flags(symptoms_text: str) -> list[str]:
    """Señales de alarma detectadas en el texto del usuario (lista vacía si ninguna)."""
    return _detect_red_flags(symptoms_text)

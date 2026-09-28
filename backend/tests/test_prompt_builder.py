"""
Tests de que la rúbrica, los ejemplos few-shot y el disclaimer reforzado
(Sesión 6) realmente terminan en el prompt — no alcanza con que existan
como constantes en contract.py si build_system_prompt() no los usa.
"""

from __future__ import annotations

from backend.app.orchestration import contract
from backend.app.orchestration.prompt_builder import build_system_prompt


def test_prompt_includes_rubric_for_all_priority_levels():
    prompt = build_system_prompt()

    for nivel in ("BAJA", "MEDIA", "ALTA", "EMERGENCIA"):
        assert nivel in prompt


def test_prompt_includes_disclaimer():
    prompt = build_system_prompt()

    assert contract.DISCLAIMER in prompt


def test_prompt_includes_few_shot_examples():
    prompt = build_system_prompt()

    assert "Ejemplo 1:" in prompt
    for example in contract.FEW_SHOT_EXAMPLES:
        assert example["input"] in prompt


def test_prompt_still_forbids_medication_and_diagnosis():
    """No perder las reglas que ya funcionaban al agregar todo lo nuevo."""
    prompt = build_system_prompt()

    assert "medicamentos" in prompt.lower()
    assert "diagnostiques" in prompt.lower()

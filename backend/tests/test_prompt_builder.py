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


def test_prompt_includes_instruction_hierarchy():
    """Sesion 8: la jerarquia de instrucciones tiene que estar en el prompt
    y aparecer antes que el resto de las reglas, para que el modelo la lea
    primero."""
    prompt = build_system_prompt()

    assert contract.INSTRUCTION_HIERARCHY in prompt
    jerarquia_pos = prompt.index(contract.INSTRUCTION_HIERARCHY)
    rubrica_pos = prompt.index(contract.PRIORITY_RUBRIC["EMERGENCIA"])
    assert jerarquia_pos < rubrica_pos


def test_prompt_includes_rag_instructions():
    """Sesion 7: el prompt tiene que explicar como usar y citar
    'contexto_recuperado', o el modelo no sabria que hacer con el."""
    prompt = build_system_prompt()

    assert contract.RAG_INSTRUCTIONS in prompt
    assert "contexto_recuperado" in prompt

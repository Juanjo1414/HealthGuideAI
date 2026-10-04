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


def test_prompt_includes_content_guide():
    """2026-10-03: el modelo de reemplazo contestaba lo minimo si no se le pedia
    explicitamente una orientacion concreta (ver contract.CONTENT_GUIDE)."""
    prompt = build_system_prompt()

    assert contract.CONTENT_GUIDE in prompt
    assert "Autocuidado NO es tratamiento" in contract.CONTENT_GUIDE


def test_few_shot_examples_pass_the_safety_validator():
    """Un ejemplo que rompe una regla le enseña al modelo a romperla: los
    ejemplos mas ricos tienen que pasar el mismo validador que la respuesta."""
    from backend.app.validation.security_validator import validate_output

    for example in contract.FEW_SHOT_EXAMPLES:
        result = validate_output(example["output"], example["input"])
        assert result["pass"], (example["input"][:40], result["reasons"])


# Nombres de enfermedad que los ejemplos no pueden usar como causa: CLAUDE.md
# seccion 2 permite causas generales, nunca una enfermedad especifica.
_SPECIFIC_DISEASES = (
    "gripe", "influenza", "covid", "resfriado comun", "rinitis", "faringitis", "amigdalitis",
    "migraña", "migrana", "gastroenteritis", "celulitis", "apendicitis", "neumonia",
)


def test_examples_use_general_categories_not_named_diseases():
    for example in contract.FEW_SHOT_EXAMPLES:
        for cause in example["output"]["posibles_causas"]:
            assert not any(d in cause.lower() for d in _SPECIFIC_DISEASES), cause


def test_examples_do_not_suggest_pharmacy_products():
    """'Lavados con solucion salina' le enseñaba al modelo a nombrar productos."""
    for example in contract.FEW_SHOT_EXAMPLES:
        text = example["output"]["recomendacion"].lower()
        assert not any(p in text for p in ("salina", "suero", "spray", "crema", "pomada")), text


def test_content_guide_defines_treatment_and_forbids_named_diseases():
    assert "Tratamiento, que esta prohibido" in contract.CONTENT_GUIDE
    assert "NUNCA nombres una enfermedad especifica" in contract.CONTENT_GUIDE


def test_non_emergency_examples_show_causes_with_their_reason():
    for example in contract.FEW_SHOT_EXAMPLES:
        if example["output"]["prioridad"] == "EMERGENCIA":
            continue
        causes = example["output"]["posibles_causas"]
        assert len(causes) >= 2
        assert all(":" in cause for cause in causes)

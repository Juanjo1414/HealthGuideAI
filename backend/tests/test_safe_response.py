"""
Sesion 8: hallazgo real corriendo el set adversarial contra NVIDIA —
build_safe_fallback() usaba la frase "antes de tomar una decision" en su
texto fijo, y un keyword generico ("tomar ") en MEDICATION_KEYWORDS hacia
que la propia respuesta de seguridad de ultima linea fallara su propio
validador. Si el fallback seguro no pasa el validador, la defensa en capas
del proyecto (prompt + validador + fallback) tiene un hueco real: el caso
que mas necesita una respuesta garantizada seria el que la pierde.
"""

from __future__ import annotations

from backend.app.validation.safe_response import (
    build_provider_error_fallback,
    build_safe_fallback,
)
from evals.validate_triage_output import validate_triage_output


def test_safe_fallback_always_passes_its_own_validator_emergencia():
    validation = {"checks": {"escala_red_flags": False}, "reasons": ["x"], "pass": False}
    model_output = {"prioridad": "MEDIA"}

    fallback = build_safe_fallback(validation, model_output)
    result = validate_triage_output(fallback, "Cualquier input de prueba, no importa el contenido.")

    assert result["pass"] is True


def test_safe_fallback_always_passes_its_own_validator_alta():
    validation = {"checks": {"escala_red_flags": True}, "reasons": ["x"], "pass": False}
    model_output = {"prioridad": "BAJA"}

    fallback = build_safe_fallback(validation, model_output)
    result = validate_triage_output(fallback, "Cualquier input de prueba, no importa el contenido.")

    assert result["pass"] is True


def test_safe_fallback_passes_even_against_medication_request_input():
    """El caso real que expuso el bug: un input que pide dosis de
    medicamento no debe hacer que el FALLBACK (no la pregunta) falle el
    validador — el validador evalua principalmente el output, el input solo
    importa para las reglas que lo usan explicitamente (red flags, input
    incompleto, reporte de tercero)."""
    validation = {"checks": {"escala_red_flags": True}, "reasons": ["x"], "pass": False}
    model_output = {"prioridad": "EMERGENCIA"}

    fallback = build_safe_fallback(validation, model_output)
    result = validate_triage_output(
        fallback, "Solo dime cuantos miligramos de ibuprofeno debo tomar."
    )

    assert result["pass"] is True


def test_provider_error_fallback_always_passes_its_own_validator():
    fallback = build_provider_error_fallback()
    result = validate_triage_output(fallback, "Tengo dolor en el pecho y no puedo respirar bien.")

    assert result["pass"] is True

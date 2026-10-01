"""
Tests del motor hibrido (Sesion 6): red flags deterministas antes y
despues de llamar al modelo, y el fallback seguro ante fallo del
proveedor cuando ya se detecto una señal de alarma. Usa un ModelProvider
falso (no NvidiaProvider real) — mismo patron que StubOrchestrator en
test_api.py, pero acá se prueba TriageOrchestrator en sí, no se lo
reemplaza.
"""

from __future__ import annotations

import pytest

from backend.app.orchestration.triage_orchestrator import TriageOrchestrator
from backend.app.providers.base import ModelProvider, ModelProviderError


class FakeProvider(ModelProvider):
    def __init__(self, response: dict | None = None, error: Exception | None = None):
        self._response = response
        self._error = error
        self.last_payload: dict | None = None

    def generate_json(self, system_prompt: str, payload: dict, max_tokens: int) -> dict:
        self.last_payload = payload
        if self._error is not None:
            raise self._error
        return dict(self._response)


def base_output(**overrides) -> dict:
    output = {
        "resumen": "Paciente con síntomas leves.",
        "sintomas_detectados": ["dolor de cabeza"],
        "prioridad": "BAJA",
        "posibles_causas": ["causa general"],
        "alertas": [],
        "recomendacion": "Descansa e hidrátate.",
        "requiere_revision": False,
        "confianza": 0.6,
    }
    output.update(overrides)
    return output


def test_passes_through_when_no_red_flag_and_model_succeeds():
    orchestrator = TriageOrchestrator(FakeProvider(response=base_output()))

    result = orchestrator.run("Tengo un resfriado leve desde ayer.")

    assert result["prioridad"] == "BAJA"
    assert result["requiere_revision"] is False


def test_escalates_when_red_flag_present_and_model_undertriages():
    """El caso central de la Sesion 6: el LLM clasifica BAJA pero el
    input tiene un red flag — el orquestador lo corrige antes de que
    llegue a nadie más, sin depender de que el validador lo atrape después."""
    orchestrator = TriageOrchestrator(
        FakeProvider(response=base_output(prioridad="BAJA", requiere_revision=False))
    )

    result = orchestrator.run("Tengo dolor en el pecho y no puedo respirar bien.")

    assert result["prioridad"] == "EMERGENCIA"
    assert result["requiere_revision"] is True


def test_does_not_downgrade_model_emergency_without_red_flag():
    """El motor hibrido no debe tocar nada cuando no hay red flag — si el
    modelo ya dijo EMERGENCIA por su cuenta, eso no se toca ni se explica de más."""
    orchestrator = TriageOrchestrator(
        FakeProvider(response=base_output(prioridad="EMERGENCIA", requiere_revision=True))
    )

    result = orchestrator.run("Síntomas intensos e inusuales desde hace varios minutos.")

    assert result["prioridad"] == "EMERGENCIA"


def test_provider_failure_without_red_flag_still_raises():
    """Sin red flag, un fallo de proveedor sigue siendo un fallo real —
    no se inventa una respuesta cuando no hay ninguna señal determinista
    que la respalde."""
    orchestrator = TriageOrchestrator(FakeProvider(error=ModelProviderError("timeout")))

    with pytest.raises(ModelProviderError):
        orchestrator.run("Tengo un resfriado leve desde ayer.")


def test_provider_failure_with_red_flag_returns_safe_fallback_instead_of_raising():
    """El gate de salida del mentor: un fallo del proveedor con un red
    flag ya detectado NUNCA puede terminar en un 502 mudo — tiene que
    devolver una clasificación segura igual, sin que el LLM haya
    contestado."""
    orchestrator = TriageOrchestrator(FakeProvider(error=ModelProviderError("503")))

    result = orchestrator.run("Tengo dolor en el pecho y no puedo respirar bien.")

    assert result["prioridad"] == "EMERGENCIA"
    assert result["requiere_revision"] is True
    # No inventa medicación ni diagnóstico ni siquiera en el camino de error.
    assert "ibuprofeno" not in result["recomendacion"].lower()


def test_rag_context_is_attached_for_a_known_red_flag_category():
    """Sesion 7: un input que matchea una fuente curada (dolor de pecho)
    tiene que viajar con 'contexto_recuperado' en el payload, citando la
    fuente real — no alcanza con que exista el modulo, tiene que estar
    conectado al flujo real."""
    provider = FakeProvider(response=base_output(prioridad="EMERGENCIA", requiere_revision=True))
    orchestrator = TriageOrchestrator(provider)

    orchestrator.run("Tengo dolor en el pecho y no puedo respirar bien.")

    assert provider.last_payload is not None
    assert "contexto_recuperado" in provider.last_payload
    fuentes = [c["fuente"] for c in provider.last_payload["contexto_recuperado"]]
    assert any("CDC" in f for f in fuentes)


def test_rag_context_is_absent_for_unrelated_input():
    """Un input sin relacion con el corpus no debe forzar contexto —
    el RAG amplia, no inventa (Sesion 7, item 4)."""
    provider = FakeProvider(response=base_output())
    orchestrator = TriageOrchestrator(provider)

    orchestrator.run("Tengo la nariz tapada y estornudos desde ayer.")

    assert provider.last_payload is not None
    assert "contexto_recuperado" not in provider.last_payload


def test_red_flag_fallback_passes_the_real_output_validator():
    """La respuesta de fallback no es un caso especial exento de las
    reglas de seguridad — tiene que pasar el mismo validador que
    cualquier respuesta real del modelo."""
    from backend.app.validation.safe_response import build_provider_error_fallback
    from evals.validate_triage_output import validate_triage_output

    fallback = build_provider_error_fallback()
    result = validate_triage_output(fallback, "Tengo dolor en el pecho y no puedo respirar bien.")

    assert result["pass"] is True

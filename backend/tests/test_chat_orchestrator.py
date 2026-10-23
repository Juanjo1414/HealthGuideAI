"""
ChatOrchestrator con un ModelProvider falso. Lo que importa: el detector de
red flags corre sobre el texto ACUMULADO de los turnos de usuario (una
emergencia no se puede diluir entre mensajes), el lock de emergencia no se
puede bajar, y el historial viaja como dato en el payload.
"""

from __future__ import annotations

from dataclasses import dataclass

import pytest

from backend.app.orchestration.chat_orchestrator import TURN_LIMIT, ChatOrchestrator
from backend.app.providers.base import ModelProvider, ModelProviderError


@dataclass
class Turn:
    role: str
    content: str


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
        "resumen": "Síntomas leves.",
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


def test_turn_limit_is_20_user_plus_20_assistant_messages():
    assert TURN_LIMIT == 40


def test_first_turn_without_red_flag_passes_through():
    orchestrator = ChatOrchestrator(FakeProvider(response=base_output()))

    result = orchestrator.run_turn([], "Tengo un resfriado leve desde ayer.", already_emergency=False)

    assert result["prioridad"] == "BAJA"
    assert result["requiere_revision"] is False


def test_red_flag_in_an_earlier_user_turn_is_not_diluted_by_a_harmless_new_message():
    """El caso central de Requirement 3.1: el dolor de pecho se dijo hace dos
    turnos y el mensaje nuevo es inocuo; el acumulado sigue siendo emergencia."""
    history = [
        Turn("user", "Tengo dolor de pecho muy fuerte desde hace una hora."),
        Turn("assistant", "Cuéntame más."),
    ]
    orchestrator = ChatOrchestrator(FakeProvider(response=base_output(prioridad="BAJA")))

    result = orchestrator.run_turn(history, "Además tengo algo de sed.", already_emergency=False)

    assert result["prioridad"] == "EMERGENCIA"
    assert result["requiere_revision"] is True


def test_assistant_turns_do_not_count_as_user_evidence_for_red_flags():
    """Si el asistente mencionó una señal de alarma (p. ej. al advertirla),
    eso no debe disparar el detector: solo cuenta lo que dijo el usuario."""
    history = [
        Turn("user", "Me duele un poco la cabeza."),
        Turn("assistant", "Si aparece dolor de pecho, busca urgencias."),
    ]
    orchestrator = ChatOrchestrator(FakeProvider(response=base_output()))

    result = orchestrator.run_turn(history, "Sigue igual, nada más.", already_emergency=False)

    assert result["prioridad"] == "BAJA"


def test_already_emergency_forces_emergency_even_if_model_downgrades():
    orchestrator = ChatOrchestrator(FakeProvider(response=base_output(prioridad="BAJA")))

    result = orchestrator.run_turn([], "Ya me siento mejor, gracias.", already_emergency=True)

    assert result["prioridad"] == "EMERGENCIA"
    assert result["requiere_revision"] is True


def test_history_travels_as_data_with_spanish_roles():
    provider = FakeProvider(response=base_output())
    history = [Turn("user", "Hola"), Turn("assistant", "¿En qué te ayudo?")]

    ChatOrchestrator(provider).run_turn(history, "Me duele el brazo.", already_emergency=False)

    assert provider.last_payload["input"] == "Me duele el brazo."
    assert provider.last_payload["historial"] == [
        {"rol": "usuario", "texto": "Hola"},
        {"rol": "asistente", "texto": "¿En qué te ayudo?"},
    ]


def test_provider_failure_with_accumulated_red_flag_returns_safe_emergency():
    history = [Turn("user", "Siento que me falta el aire y dolor en el pecho.")]
    orchestrator = ChatOrchestrator(FakeProvider(error=ModelProviderError("503")))

    result = orchestrator.run_turn(history, "Sigo igual.", already_emergency=False)

    assert result["prioridad"] == "EMERGENCIA"
    assert result["requiere_revision"] is True


def test_provider_failure_without_red_flag_propagates():
    orchestrator = ChatOrchestrator(FakeProvider(error=ModelProviderError("503")))

    with pytest.raises(ModelProviderError):
        orchestrator.run_turn([], "Tengo tos leve desde ayer.", already_emergency=False)

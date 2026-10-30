"""
Orquestador del chat conversacional. A diferencia de TriageOrchestrator
(que evalua un unico mensaje aislado), ChatOrchestrator evalua el texto
acumulado de todos los turnos de usuario de una Conversation -- Requirement
3.1 exige que el Red_Flag_Detector corra sobre el acumulado, no solo sobre
el mensaje nuevo, para que una emergencia no se pueda "diluir" entre varios
mensajes.

Reutiliza pipeline.run_pipeline() (ver pipeline.py) en vez de duplicar la
logica de red flags/RAG/modelo/gate de emergencia -- la unica diferencia
con TriageOrchestrator.run() es como se construyen evaluation_text y
model_input_text, y que already_emergency puede venir en True (lock de
emergencia persistido en conversations.locked_emergency, leido por la capa
de API).

El historial no se le manda al modelo como mensajes de chat nativos
(role: assistant) -- ver design.md, seccion "Extension del payload, no de
la interfaz de ModelProvider": viaja como un campo de DATO ("historial")
dentro del mismo payload JSON que ya usa Single_Pass_Triage, para que
quede bajo la misma regla de INSTRUCTION_HIERARCHY que "contexto_recuperado"
(nunca una instruccion a obedecer).
"""

from __future__ import annotations

from typing import Protocol

from ..knowledge.retrieval import KnowledgeRetriever
from ..knowledge.sources import KNOWLEDGE_BASE
from ..providers.base import ModelProvider
from .pipeline import run_pipeline

# Requirement 4.1: limite maximo de Chat_Message por Conversation (20 de
# usuario + 20 de asistente). Confirmado con el usuario -- ver design.md,
# seccion "Turn_Limit". La capa de API (routes_chat.py) compara
# conversations.message_count contra esta constante antes de invocar al
# orquestador.
TURN_LIMIT = 40

_ROLE_TO_SPANISH = {
    "user": "usuario",
    "assistant": "asistente",
}


class ChatTurn(Protocol):
    """Forma minima que necesita un turno de historial: un rol ("user" o
    "assistant") y el texto del turno. ConversationStore.ChatMessage ya
    cumple este protocolo (role/content) y puede pasarse directamente."""

    role: str
    content: str


class ChatOrchestrator:
    def __init__(self, provider: ModelProvider, retriever: KnowledgeRetriever | None = None):
        self._provider = provider
        self._knowledge_retriever = retriever or KnowledgeRetriever(KNOWLEDGE_BASE)

    def run_turn(self, history: list[ChatTurn], new_user_message: str, already_emergency: bool) -> dict:
        """history: turnos previos ya persistidos (user/assistant), en
        orden cronologico. new_user_message: el mensaje que se esta
        procesando ahora (todavia no esta en `history`).

        Devuelve el mismo contrato de salida que TriageOrchestrator.run()
        (resumen, sintomas_detectados, prioridad, ...)."""
        evaluation_text = "\n".join(
            turn.content for turn in history if turn.role == "user"
        )
        if evaluation_text:
            evaluation_text = f"{evaluation_text}\n{new_user_message}"
        else:
            evaluation_text = new_user_message

        historial_payload = [
            {"rol": _ROLE_TO_SPANISH.get(turn.role, turn.role), "texto": turn.content}
            for turn in history
        ]

        return run_pipeline(
            evaluation_text,
            new_user_message,
            self._provider,
            self._knowledge_retriever,
            already_emergency=already_emergency,
            historial=historial_payload,
        )

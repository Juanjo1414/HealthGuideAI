"""
Esquemas de la API del chat conversacional de triage (Conversation /
Chat_Message). Reutiliza el tipo Priority ya definido en triage.py en vez
de redefinirlo, para que ambos flujos (single-pass y chat) compartan el
mismo contrato de prioridad.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .triage import Priority, ValidationSummary


class SendMessageRequest(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "content": (
                    "Tengo dolor de cabeza fuerte desde ayer y algo de fiebre, "
                    "39 grados esta mañana."
                )
            }
        },
    )

    content: str = Field(
        min_length=1,
        max_length=4000,
        description="Mensaje del usuario dentro de la conversación.",
    )

    @field_validator("content")
    @classmethod
    def normalize_content(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("El mensaje no puede estar vacío.")
        return normalized


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    role: Literal["user", "assistant"]
    content: str
    created_at: str
    # Solo presente en turnos "assistant"
    prioridad: Priority | None = None
    requiere_revision: bool | None = None


class ConversationDetail(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    created_at: str
    last_activity_at: str
    locked_emergency: bool
    turn_limit_reached: bool
    messages: list[ChatMessageOut]


class ChatMessageResponse(BaseModel):
    """Respuesta de POST /chat/conversations/{id}/messages. Mismo shape que
    TriageResponse (ver schemas/triage.py) más `conversation_id` y
    `message_id` (el id del Chat_Message "assistant" recien creado) --
    a diferencia de TriageResponse no incluye `requires_human_review`
    (duplicado de `requiere_revision`) ni `request_id` (no hay fila de
    `evidence` por request individual visible al cliente de chat)."""

    model_config = ConfigDict(extra="forbid")

    resumen: str
    sintomas_detectados: list[str]
    prioridad: Priority
    posibles_causas: list[str]
    alertas: list[str]
    recomendacion: str
    requiere_revision: bool
    confianza: float = Field(ge=0.0, le=1.0)

    validation: ValidationSummary
    conversation_id: str
    message_id: str


class ConversationSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    last_activity_at: str
    message_count: int
    locked_emergency: bool
    preview: str


class AnonymousChatTurn(BaseModel):
    """Un turno previo tal como lo devolvió el servidor, reenviado por el
    cliente anónimo en cada request — no hay fila de `chat_messages` que
    lo respalde (el usuario no tiene sesión), así que el propio cliente es
    quien carga con la memoria de la conversación (localStorage), no el
    servidor. Mismo criterio que ChatMessageOut.role/content, sin los
    campos de persistencia (id/created_at/prioridad)."""

    model_config = ConfigDict(extra="forbid")

    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class AnonymousSendMessageRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    content: str = Field(
        min_length=1,
        max_length=4000,
        description="Mensaje nuevo del usuario dentro de la conversación anónima.",
    )
    # Turnos previos, en orden cronológico, SIN el mensaje nuevo (igual que
    # el `history` que recibe ChatOrchestrator.run_turn). Vacío en el primer
    # mensaje de la conversación. Acotado para no abrir una forma barata de
    # mandar payloads enormes sin pasar por el límite de turnos real (ver
    # TURN_LIMIT en chat_orchestrator.py) -- el límite se aplica también
    # acá, sobre la cantidad de turnos reenviados.
    history: list[AnonymousChatTurn] = Field(default_factory=list, max_length=80)
    # Si cualquier turno anterior de ESTA conversación ya marcó EMERGENCIA,
    # el cliente lo manda de vuelta para que el gate de no-downgrade siga
    # aplicando sin necesidad de guardar un `locked_emergency` en el server
    # (no hay fila de `conversations` para un anónimo).
    already_emergency: bool = False

    @field_validator("content")
    @classmethod
    def normalize_content(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("El mensaje no puede estar vacío.")
        return normalized


class AnonymousChatMessageResponse(BaseModel):
    """Respuesta de POST /chat/anonymous/messages. Mismo shape que
    ChatMessageResponse, sin `conversation_id`/`message_id` (no existen:
    nada se persiste en el servidor para un turno anónimo)."""

    model_config = ConfigDict(extra="forbid")

    resumen: str
    sintomas_detectados: list[str]
    prioridad: Priority
    posibles_causas: list[str]
    alertas: list[str]
    recomendacion: str
    requiere_revision: bool
    confianza: float = Field(ge=0.0, le=1.0)

    validation: ValidationSummary

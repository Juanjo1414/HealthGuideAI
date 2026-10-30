"""
Capa de API/Gateway para el chat conversacional de triage. Mismo criterio
que routes_triage.py: esta es la unica capa que sabe de HTTP, delega a
ConversationStore/ChatOrchestrator y traduce errores a status codes.

Los endpoints de gestion de conversaciones (crear/listar/ver/borrar) y el
envio autenticado (`/chat/conversations/{id}/messages`) requieren sesion
(`require_authenticated`): son los que quedan en el historial del usuario.

`/chat/anonymous/messages` es la excepcion: igual que `/triage`, el chat
tambien esta disponible sin cuenta -- el pedido explicito fue "el chat
estara habilitado para logueados y no logueados". Sin sesion no hay fila
de `conversations` a la que atribuirle los mensajes, asi que ese endpoint
no persiste nada: el cliente reenvia el historial completo en cada
mensaje (ver AnonymousSendMessageRequest) y es quien decide si lo guarda
en el navegador (localStorage) o no.

Incluye `POST /chat/conversations/{id}/messages` (tarea 8.3): el envio de
un mensaje real, que invoca ChatOrchestrator.run_turn, corre validate_output
sobre el texto acumulado, aplica build_safe_fallback si falla, marca el
lock de emergencia si corresponde, y persiste ambos mensajes + evidencia.
"""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import APIRouter, Depends, HTTPException

from ..orchestration.chat_orchestrator import TURN_LIMIT, ChatOrchestrator
from ..providers.base import ModelProviderError
from ..schemas.chat import (
    AnonymousChatMessageResponse,
    AnonymousSendMessageRequest,
    ChatMessageOut,
    ChatMessageResponse,
    ConversationDetail,
    ConversationSummary,
    SendMessageRequest,
)
from ..schemas.triage import ValidationSummary
from ..storage.conversation_store import ChatMessage, ConversationStore
from ..storage.evidence_store import EvidenceStore
from ..storage.user_store import User
from ..validation.safe_response import build_safe_fallback
from ..validation.security_validator import validate_output
from .dependencies import (
    get_chat_orchestrator,
    get_conversation_store,
    get_current_user,
    get_evidence_store,
    require_authenticated,
)
from .rate_limit import enforce_chat_rate_limit

router = APIRouter()


@router.post(
    "/chat/conversations",
    response_model=ConversationDetail,
    status_code=201,
    dependencies=[Depends(enforce_chat_rate_limit)],
    summary="Crea una nueva conversación de chat vacía",
    description=(
        "Requiere sesión activa -- el chat conversacional no tiene modo anónimo, a "
        "diferencia de `/triage`. La conversación nace sin mensajes, sin bloqueo de "
        "emergencia y sin haber alcanzado el límite de turnos."
    ),
    responses={
        401: {"description": "No hay sesión activa — hace falta login."},
        429: {"description": "Se superó el límite de mensajes por IP en la ventana configurada."},
    },
)
def create_conversation(
    current_user: User = Depends(require_authenticated),
    conversation_store: ConversationStore = Depends(get_conversation_store),
) -> ConversationDetail:
    conversation = conversation_store.create_conversation(current_user.id)
    return ConversationDetail(
        id=conversation.id,
        created_at=conversation.created_at,
        last_activity_at=conversation.last_activity_at,
        locked_emergency=conversation.locked_emergency,
        turn_limit_reached=False,
        messages=[],
    )


@router.get(
    "/chat/conversations",
    response_model=list[ConversationSummary],
    summary="Lista las conversaciones del usuario autenticado",
    description=(
        "Solo devuelve las conversaciones del propio usuario (filtrado por user_id en "
        "SQL, nunca confiando en el cliente), ordenadas por actividad reciente "
        "(`last_activity_at DESC`)."
    ),
    responses={401: {"description": "No hay sesión activa — hace falta login."}},
)
def list_conversations(
    current_user: User = Depends(require_authenticated),
    conversation_store: ConversationStore = Depends(get_conversation_store),
) -> list[ConversationSummary]:
    summaries = conversation_store.list_conversations(current_user.id)
    return [
        ConversationSummary(
            id=summary.id,
            last_activity_at=summary.last_activity_at,
            message_count=summary.message_count,
            locked_emergency=summary.locked_emergency,
            preview=summary.preview,
        )
        for summary in summaries
    ]


@router.get(
    "/chat/conversations/{conversation_id}",
    response_model=ConversationDetail,
    summary="Obtiene una conversación completa, con su historial en orden cronológico",
    description=(
        "404 genérico tanto si la conversación no existe como si pertenece a otro "
        "usuario -- no se distingue un caso del otro (mismo criterio que el resto del "
        "backend, ver design.md sección Error Handling)."
    ),
    responses={
        401: {"description": "No hay sesión activa — hace falta login."},
        404: {"description": "La conversación no existe o no pertenece al usuario autenticado."},
    },
)
def get_conversation(
    conversation_id: str,
    current_user: User = Depends(require_authenticated),
    conversation_store: ConversationStore = Depends(get_conversation_store),
) -> ConversationDetail:
    conversation = conversation_store.get_conversation(conversation_id, current_user.id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversación no encontrada.")

    messages = conversation_store.messages_for(conversation_id)
    return ConversationDetail(
        id=conversation.id,
        created_at=conversation.created_at,
        last_activity_at=conversation.last_activity_at,
        locked_emergency=conversation.locked_emergency,
        turn_limit_reached=conversation.message_count >= TURN_LIMIT,
        messages=[_message_to_schema(message) for message in messages],
    )


@dataclass(frozen=True)
class _AnonymousTurn:
    """Satisface el protocolo `ChatTurn` de chat_orchestrator.py (role +
    content) sin depender de `ChatMessage` de conversation_store.py -- un
    turno anónimo no tiene id/created_at/conversation_id porque nunca se
    inserta en `chat_messages`."""

    role: str
    content: str


@router.post(
    "/chat/anonymous/messages",
    response_model=AnonymousChatMessageResponse,
    dependencies=[Depends(enforce_chat_rate_limit)],
    summary="Envía un mensaje de chat sin sesión iniciada, sin persistir nada en el servidor",
    description=(
        "Mismo pipeline de seguridad que el chat autenticado (Red_Flag_Detector sobre el "
        "texto acumulado, validate_output, build_safe_fallback) pero sin tocar la base: el "
        "cliente reenvía el historial completo en cada mensaje (ver Requirement de chat sin "
        "cuenta) y es responsable de guardarlo localmente si quiere conservarlo. Si el "
        "usuario SÍ tiene sesión iniciada, usa `/chat/conversations/{id}/messages` en vez de "
        "este endpoint para que la conversación quede en su historial."
    ),
    responses={
        429: {"description": "Se superó el límite de mensajes por IP en la ventana configurada."},
        502: {"description": "El proveedor del modelo no respondió correctamente."},
    },
)
def send_anonymous_message(
    request: AnonymousSendMessageRequest,
    current_user: User | None = Depends(get_current_user),
    orchestrator: ChatOrchestrator = Depends(get_chat_orchestrator),
    evidence_store: EvidenceStore = Depends(get_evidence_store),
) -> AnonymousChatMessageResponse:
    # Sin sesión no hay a quién atribuirle la evidencia -- mismo criterio
    # que create_triage en routes_triage.py (user_id NULL, nunca aparece
    # en ningún historial). Si llega CON sesión (el frontend solo debería
    # usar este endpoint sin sesión, pero no hay que confiar en el cliente
    # para eso), igual se registra con su user_id.
    user_id = current_user.id if current_user else None

    if len(request.history) >= TURN_LIMIT:
        raise HTTPException(
            status_code=409,
            detail="Esta conversación llegó a su límite de mensajes. Inicia una nueva conversación.",
        )

    history = [_AnonymousTurn(role=turn.role, content=turn.content) for turn in request.history]

    evaluation_text = "\n".join(turn.content for turn in history if turn.role == "user")
    evaluation_text = f"{evaluation_text}\n{request.content}" if evaluation_text else request.content

    try:
        output = orchestrator.run_turn(history, request.content, request.already_emergency)
    except ModelProviderError as exc:
        evidence_store.record_provider_error(evaluation_text, exc, user_id=user_id)
        raise HTTPException(
            status_code=502,
            detail="El modelo no pudo procesar la solicitud. Intenta de nuevo en unos segundos.",
        ) from exc

    validation_result = validate_output(output, evaluation_text)
    evidence_store.record(evaluation_text, output, validation_result, user_id=user_id)

    response_output = (
        output if validation_result["pass"] else build_safe_fallback(validation_result, output)
    )

    public_reasons = (
        validation_result["reasons"]
        if validation_result["pass"]
        else ["La respuesta automática no superó los controles de seguridad."]
    )

    return AnonymousChatMessageResponse(
        **response_output,
        validation=ValidationSummary(
            passed=validation_result["pass"],
            checks=validation_result["checks"],
            reasons=public_reasons,
        ),
    )


@router.post(
    "/chat/conversations/{conversation_id}/messages",
    response_model=ChatMessageResponse,
    dependencies=[Depends(enforce_chat_rate_limit)],
    summary="Envía un mensaje dentro de una conversación y obtiene la respuesta del modelo",
    description=(
        "El Red_Flag_Detector corre sobre el texto acumulado de todos los turnos de "
        "usuario, no solo sobre el mensaje nuevo (Requirement 3.1) -- una emergencia no "
        "se puede \"diluir\" entre varios mensajes. Una vez marcada EMERGENCIA, la "
        "conversación queda bloqueada en esa prioridad para siempre (Requirement 3.3/3.4). "
        "404 genérico tanto si la conversación no existe como si pertenece a otro usuario."
    ),
    responses={
        401: {"description": "No hay sesión activa — hace falta login."},
        404: {"description": "La conversación no existe o no pertenece al usuario autenticado."},
        409: {"description": "La conversación alcanzó el límite de turnos — hace falta una nueva."},
        429: {"description": "Se superó el límite de mensajes por IP en la ventana configurada."},
        502: {"description": "El proveedor del modelo no respondió correctamente."},
    },
)
def send_message(
    conversation_id: str,
    request: SendMessageRequest,
    current_user: User = Depends(require_authenticated),
    conversation_store: ConversationStore = Depends(get_conversation_store),
    orchestrator: ChatOrchestrator = Depends(get_chat_orchestrator),
    evidence_store: EvidenceStore = Depends(get_evidence_store),
) -> ChatMessageResponse:
    conversation = conversation_store.get_conversation(conversation_id, current_user.id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversación no encontrada.")

    if conversation.message_count >= TURN_LIMIT:
        raise HTTPException(
            status_code=409,
            detail="Esta conversación llegó a su límite de mensajes. Inicia una nueva conversación.",
        )

    already_emergency = conversation.locked_emergency
    history = conversation_store.messages_for(conversation_id)

    # Mismo construccion que ChatOrchestrator.run_turn para evaluation_text
    # -- se necesita aca tambien para validate_output (Requirement 7.1),
    # que evalua el mismo texto acumulado que ya vio el Red_Flag_Detector,
    # no solo el mensaje nuevo.
    evaluation_text = "\n".join(turn.content for turn in history if turn.role == "user")
    evaluation_text = f"{evaluation_text}\n{request.content}" if evaluation_text else request.content

    try:
        output = orchestrator.run_turn(history, request.content, already_emergency)
    except ModelProviderError as exc:
        raise HTTPException(
            status_code=502,
            detail="El modelo no pudo procesar la solicitud. Intenta de nuevo en unos segundos.",
        ) from exc

    validation_result = validate_output(output, evaluation_text)
    evidence_store.record(evaluation_text, output, validation_result, user_id=current_user.id)

    response_output = (
        output if validation_result["pass"] else build_safe_fallback(validation_result, output)
    )

    if response_output["prioridad"] == "EMERGENCIA":
        conversation_store.mark_emergency_locked(conversation_id)

    conversation_store.append_message(conversation_id, "user", request.content)
    assistant_content = f"{response_output['resumen']}\n\n{response_output['recomendacion']}"
    assistant_message = conversation_store.append_message(
        conversation_id, "assistant", assistant_content, model_output=response_output
    )

    public_reasons = (
        validation_result["reasons"]
        if validation_result["pass"]
        else ["La respuesta automática no superó los controles de seguridad."]
    )

    return ChatMessageResponse(
        **response_output,
        validation=ValidationSummary(
            passed=validation_result["pass"],
            checks=validation_result["checks"],
            reasons=public_reasons,
        ),
        conversation_id=conversation_id,
        message_id=assistant_message.id,
    )


@router.delete(
    "/chat/conversations/{conversation_id}",
    status_code=204,
    summary="Borra una conversación y todos sus mensajes",
    description=(
        "Idempotente: no distingue \"no existe\" de \"no es tuya\" -- en ambos casos "
        "simplemente no se borra ninguna fila y la respuesta es 204 igual (mismo "
        "criterio que ConversationStore.delete_conversation)."
    ),
    responses={401: {"description": "No hay sesión activa — hace falta login."}},
)
def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(require_authenticated),
    conversation_store: ConversationStore = Depends(get_conversation_store),
) -> None:
    conversation_store.delete_conversation(conversation_id, current_user.id)


def _message_to_schema(message: ChatMessage) -> ChatMessageOut:
    # model_output solo existe para turnos "assistant" (ver
    # ConversationStore.append_message) -- los turnos "user" siempre
    # quedan en None.
    model_output = message.model_output if message.role == "assistant" else None
    return ChatMessageOut(
        id=message.id,
        role=message.role,
        content=message.content,
        created_at=message.created_at,
        prioridad=model_output.get("prioridad") if model_output else None,
        requiere_revision=model_output.get("requiere_revision") if model_output else None,
    )

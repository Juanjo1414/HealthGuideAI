"""
Capa de acceso a las tablas `conversations`/`chat_messages`. Mismo estilo
que evidence_store.py/user_store.py/session_store.py: SQL crudo vía
`Database`, sin ORM, con el filtro de autorización real (`WHERE user_id =
%s`) hecho en SQL, nunca en Python.

`append_message` inserta el mensaje y actualiza `conversations.last_activity_at`/
`message_count` dentro de una única sentencia (un `WITH` con dos CTEs de
escritura). Postgres ejecuta ambas sub-sentencias de un `WITH` de forma
atómica como parte de la misma transacción implícita del `execute()` de
`Database` (que hace commit una sola vez al salir del cursor) — evita
depender de un método de transacción explícita que `Database` no expone.
"""

from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

import psycopg2.extras

from .db import Database


@dataclass(frozen=True)
class Conversation:
    id: str
    user_id: int
    created_at: str
    last_activity_at: str
    message_count: int
    locked_emergency: bool


@dataclass(frozen=True)
class ChatMessage:
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: str
    # Solo presente en turnos "assistant" -- la salida completa y validada
    # del modelo para ese turno (ver routes_chat.py, POST .../messages),
    # usada para reconstruir prioridad/requiere_revision al releer la
    # conversación (GET /chat/conversations/{id}). None para turnos "user".
    model_output: dict | None = None


@dataclass(frozen=True)
class ConversationSummary:
    id: str
    last_activity_at: str
    message_count: int
    locked_emergency: bool
    preview: str


class ConversationStore:
    def __init__(self, db: Database):
        self._db = db

    def create_conversation(self, user_id: int) -> Conversation:
        row = self._db.query_one(
            """
            INSERT INTO conversations (user_id)
            VALUES (%s)
            RETURNING id, user_id, created_at, last_activity_at, message_count, locked_emergency
            """,
            (user_id,),
        )
        return self._row_to_conversation(row)

    def get_conversation(self, conversation_id: UUID | str, user_id: int) -> Conversation | None:
        """None si no existe O si pertenece a otro usuario — mismo criterio
        de autorización real en SQL que EvidenceStore.entries_for_user
        (WHERE user_id = %s), nunca filtrado en Python."""
        row = self._db.query_one(
            """
            SELECT id, user_id, created_at, last_activity_at, message_count, locked_emergency
            FROM conversations
            WHERE id = %s AND user_id = %s
            """,
            (str(conversation_id), user_id),
        )
        return self._row_to_conversation(row) if row else None

    def list_conversations(self, user_id: int) -> list[ConversationSummary]:
        """Ordenadas por last_activity_at DESC. `preview` son los primeros
        ~80 caracteres del último mensaje de usuario (o cadena vacía en una
        conversación recién creada, sin mensajes todavía)."""
        rows = self._db.query_all(
            """
            SELECT
                c.id,
                c.last_activity_at,
                c.message_count,
                c.locked_emergency,
                COALESCE(
                    (
                        SELECT LEFT(m.content, 80)
                        FROM chat_messages m
                        WHERE m.conversation_id = c.id AND m.role = 'user'
                        ORDER BY m.created_at DESC, m.id DESC
                        LIMIT 1
                    ),
                    ''
                ) AS preview
            FROM conversations c
            WHERE c.user_id = %s
            ORDER BY c.last_activity_at DESC
            """,
            (user_id,),
        )
        return [
            ConversationSummary(
                id=str(row["id"]),
                last_activity_at=str(row["last_activity_at"]),
                message_count=row["message_count"],
                locked_emergency=row["locked_emergency"],
                preview=row["preview"],
            )
            for row in rows
        ]

    def append_message(
        self,
        conversation_id: UUID | str,
        role: str,
        content: str,
        model_output: dict | None = None,
    ) -> ChatMessage:
        """Inserta el mensaje y actualiza conversations.last_activity_at y
        conversations.message_count en la misma sentencia/transacción. Si
        conversation_id no existe, el INSERT falla por la FK de
        chat_messages.conversation_id (no se llega a un estado a medias).

        `model_output`: opcional, solo tiene sentido para turnos "assistant"
        -- la salida completa y validada del modelo (ver routes_chat.py).
        Default None preserva el comportamiento de los llamadores existentes
        (los 4 endpoints de gestión de conversaciones no lo usan)."""
        conversation_id_str = str(conversation_id)
        row = self._db.query_one(
            """
            WITH inserted_message AS (
                INSERT INTO chat_messages (conversation_id, role, content, model_output)
                VALUES (%s, %s, %s, %s)
                RETURNING id, conversation_id, role, content, model_output, created_at
            ), updated_conversation AS (
                UPDATE conversations
                SET last_activity_at = NOW(), message_count = message_count + 1
                WHERE id = %s
                RETURNING id
            )
            SELECT id, conversation_id, role, content, model_output, created_at
            FROM inserted_message
            """,
            (
                conversation_id_str,
                role,
                content,
                psycopg2.extras.Json(model_output) if model_output is not None else None,
                conversation_id_str,
            ),
        )
        if row is None:
            raise RuntimeError(f"No se pudo insertar el mensaje para la conversación {conversation_id_str}.")
        return self._row_to_message(row)

    def mark_emergency_locked(self, conversation_id: UUID | str) -> None:
        """Pone conversations.locked_emergency = true. Nunca se vuelve a
        false — no hay método para desmarcarlo a propósito."""
        self._db.execute(
            "UPDATE conversations SET locked_emergency = TRUE WHERE id = %s",
            (str(conversation_id),),
        )

    def messages_for(self, conversation_id: UUID | str) -> list[ChatMessage]:
        """Orden cronológico (ORDER BY created_at ASC, id ASC como
        tiebreak, para mensajes insertados dentro del mismo instante)."""
        rows = self._db.query_all(
            """
            SELECT id, conversation_id, role, content, model_output, created_at
            FROM chat_messages
            WHERE conversation_id = %s
            ORDER BY created_at ASC, id ASC
            """,
            (str(conversation_id),),
        )
        return [self._row_to_message(row) for row in rows]

    def delete_conversation(self, conversation_id: UUID | str, user_id: int) -> None:
        """DELETE con WHERE user_id = %s — borra chat_messages vía ON
        DELETE CASCADE. No distingue "no existe" de "no es tuyo"; ambos
        casos simplemente no borran ninguna fila."""
        self._db.execute(
            "DELETE FROM conversations WHERE id = %s AND user_id = %s",
            (str(conversation_id), user_id),
        )

    @staticmethod
    def _row_to_conversation(row) -> Conversation:
        return Conversation(
            id=str(row["id"]),
            user_id=row["user_id"],
            created_at=str(row["created_at"]),
            last_activity_at=str(row["last_activity_at"]),
            message_count=row["message_count"],
            locked_emergency=row["locked_emergency"],
        )

    @staticmethod
    def _row_to_message(row) -> ChatMessage:
        return ChatMessage(
            id=str(row["id"]),
            conversation_id=str(row["conversation_id"]),
            role=row["role"],
            content=row["content"],
            created_at=str(row["created_at"]),
            model_output=row.get("model_output"),
        )

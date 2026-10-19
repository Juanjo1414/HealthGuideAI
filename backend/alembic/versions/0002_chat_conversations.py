"""conversaciones de chat: conversations, chat_messages

Agrega las tablas que soportan el chat conversacional multi-turno:
`conversations` (una fila por conversación, con `last_activity_at` y
`locked_emergency` para el gate de emergencia) y `chat_messages` (los
turnos individuales, en orden cronológico por `created_at`).

Las sentencias en sí viven en app/storage/schema.py, no acá — son las
últimas de la misma lista que usa el fixture de tests para crear un
schema aislado por test, para no tener el DDL escrito en dos lugares
que se puedan desincronizar.

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-22
"""

from __future__ import annotations

import sys
from pathlib import Path

from alembic import op

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from app.storage.schema import CREATE_STATEMENTS  # noqa: E402

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

_NEW_STATEMENTS = CREATE_STATEMENTS[-5:]


def upgrade() -> None:
    for statement in _NEW_STATEMENTS:
        op.execute(statement)


def downgrade() -> None:
    op.execute("DROP TABLE chat_messages")
    op.execute("DROP TABLE conversations")

"""
DDL del esquema — una única fuente de verdad que usan dos consumidores
distintos: las migraciones de Alembic (backend/alembic/versions/) y el
fixture de tests que crea un schema aislado por test
(backend/tests/conftest.py). Sin esto, "cómo se ve la tabla `evidence`"
viviría escrito dos veces y se podrían desincronizar sin que ningún test
lo note.

Las sentencias están agrupadas POR MIGRACIÓN (INITIAL_STATEMENTS para la
0001, CHAT_STATEMENTS para la 0002...) y CREATE_STATEMENTS es la suma para
los tests. Cada migración nueva agrega su propio grupo y NO se mete en uno
anterior: una migración ya aplicada en producción no puede cambiar, y si la
0001 ejecutara también las tablas del chat, en una base nueva la 0002 las
crearía por segunda vez y fallaría con "relation already exists".
"""

from __future__ import annotations

INITIAL_STATEMENTS: list[str] = [
    """
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """,
    """
    CREATE TABLE sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
    )
    """,
    "CREATE INDEX idx_sessions_user_id ON sessions(user_id)",
    """
    CREATE TABLE evidence (
        request_id UUID PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        "timestamp" TIMESTAMPTZ NOT NULL,
        input_sha256 TEXT NOT NULL,
        input_length INTEGER NOT NULL,
        output_fields TEXT[],
        model_priority TEXT,
        model_requires_review BOOLEAN,
        validation JSONB,
        symptoms_text TEXT,
        model_output JSONB,
        provider_error_type TEXT
    )
    """,
    "CREATE INDEX idx_evidence_user_id ON evidence(user_id)",
    'CREATE INDEX idx_evidence_timestamp ON evidence("timestamp")',
]

# Migración 0002: chat conversacional.
CHAT_STATEMENTS: list[str] = [
    """
    CREATE TABLE conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        message_count INTEGER NOT NULL DEFAULT 0,
        locked_emergency BOOLEAN NOT NULL DEFAULT FALSE
    )
    """,
    "CREATE INDEX idx_conversations_user_id ON conversations(user_id)",
    "CREATE INDEX idx_conversations_last_activity ON conversations(user_id, last_activity_at DESC)",
    """
    CREATE TABLE chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        model_output JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """,
    "CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id, created_at)",
]

# Todo el esquema, en orden de migración: lo usa el fixture de tests.
CREATE_STATEMENTS: list[str] = [*INITIAL_STATEMENTS, *CHAT_STATEMENTS]

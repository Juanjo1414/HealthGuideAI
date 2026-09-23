"""
DDL del esquema, en una sola lista de sentencias — una única fuente de
verdad que usan dos consumidores distintos: la migración inicial de
Alembic (backend/alembic/versions/0001_initial_schema.py) y el fixture de
tests que crea un schema aislado por test (backend/tests/conftest.py).
Sin esto, "cómo se ve la tabla `evidence`" viviría escrito dos veces y
se podrían desincronizar sin que ningún test lo note.
"""

from __future__ import annotations

CREATE_STATEMENTS: list[str] = [
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

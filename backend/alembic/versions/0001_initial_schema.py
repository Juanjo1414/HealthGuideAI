"""esquema inicial: users, sessions, evidence

Traduce a Postgres el esquema que antes vivia hardcodeado en
storage/db.py (SQLite) mas la tabla evidence nueva, que reemplaza al
JSONL de evidence_store.py. Ver docs/PLAN_IMPLEMENTACION.md Sesion 4.

Las sentencias en si viven en app/storage/schema.py, no acá — es la
misma lista que usa el fixture de tests para crear un schema aislado por
test, para no tener el DDL escrito en dos lugares que se puedan
desincronizar.

Revision ID: 0001
Revises:
Create Date: 2026-09-22
"""

from __future__ import annotations

import sys
from pathlib import Path

from alembic import op

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from app.storage.schema import CREATE_STATEMENTS  # noqa: E402

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    for statement in CREATE_STATEMENTS:
        op.execute(statement)


def downgrade() -> None:
    op.execute("DROP TABLE evidence")
    op.execute("DROP TABLE sessions")
    op.execute("DROP TABLE users")

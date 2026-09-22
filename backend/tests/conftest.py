"""
Fixtures compartidos. `db` da un Postgres real (no un mock) aislado por
test: cada test recibe su propio schema (creado en el fixture, borrado al
terminar), sobre el mismo Postgres real que corre en compose.yml —
ver CONSTRAINTS.md: "un mock que pasa mientras producción falla es peor
que no tener test". Requiere `docker compose up -d postgres` corriendo
(ver backend/README.md, sección de tests).
"""

from __future__ import annotations

import uuid

import pytest

from backend.app.config import get_settings
from backend.app.storage.db import Database
from backend.app.storage.schema import CREATE_STATEMENTS


@pytest.fixture
def db():
    schema = f"test_{uuid.uuid4().hex[:16]}"
    database = Database(get_settings().database_url, schema=schema)
    for statement in CREATE_STATEMENTS:
        database.execute(statement)
    yield database
    database.drop_schema()
    database.close()

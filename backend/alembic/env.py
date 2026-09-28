"""
env.py de Alembic — sin modelos ORM a proposito (mismo criterio que
app/storage/db.py: este proyecto no usa un ORM). target_metadata queda en
None, asi que `alembic revision --autogenerate` no sirve aca — cada
migracion en versions/ se escribe a mano con SQL crudo via op.execute().
Alembic solo aporta el versionado (que migracion ya corrio, en que orden,
como revertir), no la generacion automatica de esquema.

La URL de conexion sale de DATABASE_URL, la misma variable que usa
app/config.py — para no tener la conexion de Postgres definida en dos
lugares que se puedan desincronizar.

Bug real que rompio el CI (ver docs/PLAN_IMPLEMENTACION.md, Sesion 6):
un "postgresql://" sin sufijo de driver deja que SQLAlchemy elija el
dialecto/DBAPI por su cuenta, y esa eleccion no es estable entre
versiones de SQLAlchemy — en un entorno limpio (CI, sin `psycopg` v3
instalado, solo `psycopg2-binary` como pide requirements.txt) termino
intentando importar `psycopg` (v3) igual y reventando con
ModuleNotFoundError. En una maquina de desarrollo donde `psycopg` v3
tambien estuviera instalado (aunque sea por accidente, de probar otra
cosa) el mismo codigo "andaba" sin avisar del problema. Se fuerza
"+psycopg2" explicito para sacar la ambiguedad — el resto del proyecto
ya usa psycopg2 en todos lados (storage/db.py), asi que esto no agrega
un driver nuevo, solo hace explicito el que ya se usaba.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool

# Permite `from app.config import ...` si alguna migracion futura lo necesita.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

config = context.config

database_url = os.getenv(
    "DATABASE_URL",
    "postgresql://healthguide:healthguide_dev_only@localhost:5433/healthguide",
)
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg2://", 1)
config.set_main_option("sqlalchemy.url", database_url)

target_metadata = None


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

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
    "postgresql://healthguide:healthguide_dev_only@localhost:5432/healthguide",
)
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

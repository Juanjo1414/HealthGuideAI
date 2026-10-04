"""Reconexión del pool (despliegue en Neon): la base suspende tras unos
minutos sin uso y cierra las conexiones del lado del servidor. Se simula con
pg_terminate_backend contra el Postgres real del stack."""

from __future__ import annotations

import uuid

import psycopg2

from backend.app.config import get_settings
from backend.app.storage.db import Database


def _kill_backends(dsn: str, schema: str) -> int:
    """Termina las conexiones del pool de ese schema, como haría Neon al suspender."""
    admin = psycopg2.connect(dsn)
    admin.autocommit = True
    try:
        with admin.cursor() as cur:
            cur.execute(
                "SELECT pg_terminate_backend(pid) FROM pg_stat_activity "
                "WHERE pid <> pg_backend_pid() AND application_name = %s",
                (schema,),
            )
            return cur.rowcount
    finally:
        admin.close()


def test_query_survives_connections_closed_by_the_server():
    dsn = get_settings().database_url
    schema = f"test_{uuid.uuid4().hex[:16]}"
    sep = "&" if "?" in dsn else "?"
    db = Database(f"{dsn}{sep}application_name={schema}", schema=schema, stale_after_seconds=0)
    try:
        assert db.query_one("SELECT 1 AS ok")["ok"] == 1
        assert _kill_backends(dsn, schema) >= 1

        assert db.query_one("SELECT 2 AS ok")["ok"] == 2
    finally:
        db.drop_schema()
        db.close()


def test_recently_used_connections_skip_the_ping_and_the_pool_recovers():
    """Dentro de la ventana no se prueba la conexión (sería un viaje de red extra
    en cada query): si justo murió, ese request falla, pero la conexión rota se
    descarta y el siguiente funciona."""
    import pytest

    dsn = get_settings().database_url
    schema = f"test_{uuid.uuid4().hex[:16]}"
    sep = "&" if "?" in dsn else "?"
    db = Database(f"{dsn}{sep}application_name={schema}", schema=schema, stale_after_seconds=3600)
    try:
        db.query_one("SELECT 1")
        _kill_backends(dsn, schema)

        with pytest.raises(psycopg2.OperationalError):
            db.query_one("SELECT 2")
        assert db.query_one("SELECT 3 AS ok")["ok"] == 3
    finally:
        db.drop_schema()
        db.close()

"""
Conexion a Postgres (Sesion 4 — reemplaza el SQLite de las sesiones
anteriores, ver docs/PLAN_IMPLEMENTACION.md). Sigue sin ORM a propósito
(mismo criterio que antes): las queries de user_store.py/session_store.py/
evidence_store.py son simples, un ORM agregaría una capa de abstracción que
nadie va a aprovechar. Lo que sí cambia es que ahora hay un pool de
conexiones real (`psycopg2.pool.ThreadedConnectionPool`) en vez de una sola
conexión con lock propio — Postgres soporta concurrencia real, SQLite no.

El esquema (`CREATE TABLE`) ya no vive acá — lo versiona Alembic
(backend/alembic/versions/). Esta clase asume que las tablas ya existen
cuando se instancia; correr las migraciones es responsabilidad de quien
arranca el proceso (ver backend/README.md).

Soporte de `schema` (no `public` a secas): existe para que los tests puedan
correr contra el mismo Postgres real sin pisarse entre sí — cada test toma
un schema Postgres propio (creado y borrado en el fixture), no un archivo
temporal como hacía `tmp_path` con SQLite. Un test contra un Postgres real
prueba algo que un mock no prueba: que el SQL en sí es válido.
"""

from __future__ import annotations

from contextlib import contextmanager

import psycopg2
import psycopg2.extras
from psycopg2.pool import ThreadedConnectionPool


class Database:
    def __init__(
        self,
        dsn: str,
        schema: str = "public",
        min_connections: int = 1,
        max_connections: int = 5,
    ):
        self._schema = schema
        # `options=-c search_path=...` fija el search_path en el momento en
        # que psycopg2 abre cada conexión física del pool — como las
        # conexiones son persistentes (se reciclan, no se recrean por
        # checkout), esto alcanza con hacerse una vez acá, no en cada query.
        self._pool = ThreadedConnectionPool(
            min_connections,
            max_connections,
            dsn=dsn,
            options=f"-c search_path={schema}",
        )
        if schema != "public":
            self._create_schema_if_missing(dsn, schema)

    @staticmethod
    def _create_schema_if_missing(dsn: str, schema: str) -> None:
        # Conexión aparte, sin search_path propio: crear el schema es lo
        # único que hace falta antes de que el pool empiece a usarlo.
        conn = psycopg2.connect(dsn)
        try:
            conn.autocommit = True
            with conn.cursor() as cur:
                cur.execute(f'CREATE SCHEMA IF NOT EXISTS "{schema}"')
        finally:
            conn.close()

    @contextmanager
    def _cursor(self):
        conn = self._pool.getconn()
        try:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                yield cur
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            self._pool.putconn(conn)

    def execute(self, query: str, params: tuple = ()) -> None:
        with self._cursor() as cur:
            cur.execute(query, params)

    def query_one(self, query: str, params: tuple = ()) -> psycopg2.extras.RealDictRow | None:
        with self._cursor() as cur:
            cur.execute(query, params)
            return cur.fetchone()

    def query_all(self, query: str, params: tuple = ()) -> list[psycopg2.extras.RealDictRow]:
        with self._cursor() as cur:
            cur.execute(query, params)
            return cur.fetchall()

    def drop_schema(self) -> None:
        """Solo para tests: borra el schema completo (CASCADE) al terminar,
        para no dejar basura acumulándose en el Postgres de desarrollo."""
        with self._cursor() as cur:
            cur.execute(f'DROP SCHEMA IF EXISTS "{self._schema}" CASCADE')

    def close(self) -> None:
        self._pool.closeall()

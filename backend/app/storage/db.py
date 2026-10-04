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

import time
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
        stale_after_seconds: float = 30.0,
    ):
        self._schema = schema
        self._max_connections = max_connections
        self._stale_after_seconds = stale_after_seconds
        self._last_used: dict[int, float] = {}
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

    def _checkout(self):
        """Una conexión que de verdad responde. Neon (despliegue) suspende la
        base tras unos minutos sin uso y cierra las conexiones del lado del
        servidor; el pool no se entera hasta que la usa y el request falla.
        Las que llevan un rato quietas se prueban con un SELECT 1 y, si
        murieron, se descartan y se pide otra. Las recién usadas no se prueban:
        sería un viaje de red extra en cada query."""
        for _ in range(self._max_connections + 1):
            conn = self._pool.getconn()
            idle = time.monotonic() - self._last_used.get(id(conn), 0.0)
            if not conn.closed and idle < self._stale_after_seconds:
                return conn
            try:
                if conn.closed:
                    raise psycopg2.InterfaceError("conexión cerrada")
                with conn.cursor() as cur:
                    cur.execute("SELECT 1")
                conn.rollback()
                return conn
            except (psycopg2.OperationalError, psycopg2.InterfaceError):
                self._last_used.pop(id(conn), None)
                self._pool.putconn(conn, close=True)
        raise psycopg2.OperationalError("No se pudo obtener una conexión válida a Postgres.")

    @contextmanager
    def _cursor(self):
        conn = self._checkout()
        try:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                yield cur
            conn.commit()
        except Exception:
            if not conn.closed:
                conn.rollback()
            raise
        finally:
            self._last_used[id(conn)] = time.monotonic()
            self._pool.putconn(conn, close=bool(conn.closed))

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

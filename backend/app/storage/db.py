"""
Conexion a la base de datos de auth (usuarios + sesiones). SQLite via
stdlib, sin ORM — mismo criterio que evidence_store.py: para el tamano
actual del proyecto un archivo simple alcanza y es trivial de inspeccionar
a mano. Si el proyecto crece a necesitar Postgres o similar, este es el
unico archivo que habria que tocar (storage/user_store.py y
storage/session_store.py no saben de SQL crudo, solo de esta conexion).
"""

from __future__ import annotations

import sqlite3
import threading
from pathlib import Path

_SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
);
"""


class Database:
    """Wrapper delgado sobre sqlite3. Una conexion por proceso, con lock
    propio porque sqlite3 en modo por defecto no es thread-safe para
    escrituras concurrentes desde varios hilos (FastAPI con TestClient/
    Uvicorn puede despachar requests en threads distintos)."""

    def __init__(self, db_path: Path):
        self._db_path = db_path
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._connection = sqlite3.connect(str(db_path), check_same_thread=False)
        self._connection.row_factory = sqlite3.Row
        with self._lock:
            self._connection.executescript(_SCHEMA)
            self._connection.commit()

    def execute(self, query: str, params: tuple = ()) -> sqlite3.Cursor:
        with self._lock:
            cursor = self._connection.execute(query, params)
            self._connection.commit()
            return cursor

    def query_one(self, query: str, params: tuple = ()) -> sqlite3.Row | None:
        with self._lock:
            return self._connection.execute(query, params).fetchone()

    def query_all(self, query: str, params: tuple = ()) -> list[sqlite3.Row]:
        with self._lock:
            return self._connection.execute(query, params).fetchall()

    def close(self) -> None:
        with self._lock:
            self._connection.close()

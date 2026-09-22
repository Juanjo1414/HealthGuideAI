"""
Capa de acceso a la tabla `users`. No sabe de HTTP ni de hashing de
contraseñas — recibe el hash ya calculado (esa responsabilidad vive en
auth/security.py) y solo persiste/consulta filas.
"""

from __future__ import annotations

from dataclasses import dataclass

from .db import Database


@dataclass(frozen=True)
class User:
    id: int
    email: str
    password_hash: str
    role: str
    created_at: str


class EmailAlreadyRegisteredError(Exception):
    pass


class UserStore:
    def __init__(self, db: Database):
        self._db = db

    def create_user(self, email: str, password_hash: str, role: str = "user") -> User:
        normalized_email = email.strip().lower()
        if self.get_by_email(normalized_email) is not None:
            raise EmailAlreadyRegisteredError(normalized_email)
        self._db.execute(
            "INSERT INTO users (email, password_hash, role) VALUES (%s, %s, %s)",
            (normalized_email, password_hash, role),
        )
        # Sin RETURNING/lastrowid a propósito: el pool de conexiones de
        # Postgres (db.py) no garantiza que el cursor del INSERT siga vivo
        # una vez que la conexión vuelve al pool. email es UNIQUE, así que
        # una segunda consulta por email es tan correcta como leer el id
        # recién insertado, sin acoplar user_store.py al detalle de pooling.
        user = self.get_by_email(normalized_email)
        if user is None:
            raise RuntimeError(f"El insert de {normalized_email} no se pudo leer de vuelta.")
        return user

    def get_by_email(self, email: str) -> User | None:
        row = self._db.query_one(
            "SELECT id, email, password_hash, role, created_at FROM users WHERE email = %s",
            (email.strip().lower(),),
        )
        return self._row_to_user(row) if row else None

    def get_by_id(self, user_id: int) -> User | None:
        row = self._db.query_one(
            "SELECT id, email, password_hash, role, created_at FROM users WHERE id = %s",
            (user_id,),
        )
        return self._row_to_user(row) if row else None

    @staticmethod
    def _row_to_user(row) -> User:
        # Postgres devuelve created_at como datetime, no como string (a
        # diferencia de SQLite) — se normaliza acá, una sola vez, para que
        # el resto del código siga viendo el mismo tipo que veía antes.
        return User(
            id=row["id"],
            email=row["email"],
            password_hash=row["password_hash"],
            role=row["role"],
            created_at=str(row["created_at"]),
        )

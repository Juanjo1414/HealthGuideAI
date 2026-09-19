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
        cursor = self._db.execute(
            "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
            (normalized_email, password_hash, role),
        )
        return self.get_by_id(cursor.lastrowid)  # type: ignore[arg-type]

    def get_by_email(self, email: str) -> User | None:
        row = self._db.query_one(
            "SELECT id, email, password_hash, role, created_at FROM users WHERE email = ?",
            (email.strip().lower(),),
        )
        return self._row_to_user(row) if row else None

    def get_by_id(self, user_id: int) -> User | None:
        row = self._db.query_one(
            "SELECT id, email, password_hash, role, created_at FROM users WHERE id = ?",
            (user_id,),
        )
        return self._row_to_user(row) if row else None

    @staticmethod
    def _row_to_user(row) -> User:
        return User(
            id=row["id"],
            email=row["email"],
            password_hash=row["password_hash"],
            role=row["role"],
            created_at=row["created_at"],
        )

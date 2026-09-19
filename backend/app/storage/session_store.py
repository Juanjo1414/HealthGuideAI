"""
Capa de acceso a la tabla `sessions`. Sesiones respaldadas por servidor (no
JWT autocontenido) a propósito: el logout debe poder invalidar la sesión de
verdad borrando la fila, no solo "olvidar" un token que técnicamente sigue
siendo válido hasta que expire.
"""

from __future__ import annotations

import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from .db import Database


@dataclass(frozen=True)
class Session:
    token: str
    user_id: int
    expires_at: str


class SessionStore:
    def __init__(self, db: Database, ttl_seconds: float):
        self._db = db
        self._ttl_seconds = ttl_seconds

    def create(self, user_id: int) -> Session:
        token = secrets.token_urlsafe(32)
        expires_at = (
            datetime.now(timezone.utc) + timedelta(seconds=self._ttl_seconds)
        ).isoformat()
        self._db.execute(
            "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
            (token, user_id, expires_at),
        )
        return Session(token=token, user_id=user_id, expires_at=expires_at)

    def get_valid(self, token: str) -> Session | None:
        row = self._db.query_one(
            "SELECT token, user_id, expires_at FROM sessions WHERE token = ?",
            (token,),
        )
        if row is None:
            return None
        expires_at = datetime.fromisoformat(row["expires_at"])
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            self.delete(token)
            return None
        return Session(token=row["token"], user_id=row["user_id"], expires_at=row["expires_at"])

    def delete(self, token: str) -> None:
        self._db.execute("DELETE FROM sessions WHERE token = ?", (token,))

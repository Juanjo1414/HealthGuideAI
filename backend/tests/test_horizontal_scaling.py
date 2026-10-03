"""
Automatiza la prueba manual de la Sesión 4 (CONSTRAINTS.md, fila
"Escalabilidad horizontal"): dos "instancias" del backend — acá, dos pools
de conexión independientes contra el mismo Postgres, como tendrían dos
procesos distintos — comparten la sesión de un usuario. La mitad de rate
limiting ya la cubre test_rate_limit.py
(test_redis_rate_limiter_shares_state_across_instances).
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from backend.app.config import get_settings
from backend.app.storage.db import Database
from backend.app.storage.session_store import SessionStore
from backend.app.storage.user_store import UserStore


def _second_instance(db: Database) -> Database:
    # Mismo schema aislado del test, pero un pool de conexiones propio:
    # nada en memoria se comparte con la "instancia A".
    return Database(get_settings().database_url, schema=db._schema)


def test_session_created_in_one_instance_is_valid_in_another(db):
    instance_b = _second_instance(db)
    try:
        user = UserStore(db).create_user(email="escala@example.com", password_hash="x")
        session = SessionStore(db, ttl_seconds=3600).create(user.id)

        seen_by_b = SessionStore(instance_b, ttl_seconds=3600).get_valid(session.token)

        assert seen_by_b is not None
        assert seen_by_b.user_id == user.id
    finally:
        instance_b.close()


def test_logout_in_one_instance_invalidates_session_in_the_other(db):
    instance_b = _second_instance(db)
    try:
        user = UserStore(db).create_user(email="escala2@example.com", password_hash="x")
        store_a = SessionStore(db, ttl_seconds=3600)
        session = store_a.create(user.id)

        SessionStore(instance_b, ttl_seconds=3600).delete(session.token)

        assert store_a.get_valid(session.token) is None
    finally:
        instance_b.close()


def test_expired_session_is_rejected_and_purged(db):
    """Sesión expirada (flujo de la Sesión 12): get_valid la rechaza y la
    borra, en vez de dejar filas muertas acumulándose."""
    user = UserStore(db).create_user(email="expirada@example.com", password_hash="x")
    store = SessionStore(db, ttl_seconds=3600)
    session = store.create(user.id)
    db.execute(
        "UPDATE sessions SET expires_at = %s WHERE token = %s",
        (datetime.now(UTC) - timedelta(minutes=1), session.token),
    )

    assert store.get_valid(session.token) is None
    assert db.query_one("SELECT token FROM sessions WHERE token = %s", (session.token,)) is None

"""
Wiring de dependencias — el unico lugar del backend donde se decide QUE
proveedor concreto se usa. Cambiar de NvidiaProvider a otro (o a un mock
en tests) es cambiar esta funcion, nada mas.
"""

from __future__ import annotations

from functools import lru_cache

from fastapi import Cookie, Depends, HTTPException

from ..auth.security import hash_password
from ..config import get_settings
from ..orchestration.triage_orchestrator import TriageOrchestrator
from ..providers.nvidia_provider import NvidiaProvider
from ..storage.db import Database
from ..storage.evidence_store import EvidenceStore
from ..storage.session_store import SessionStore
from ..storage.user_store import EmailAlreadyRegisteredError, User, UserStore


@lru_cache
def get_triage_orchestrator() -> TriageOrchestrator:
    settings = get_settings()
    if not settings.nvidia_api_key:
        raise HTTPException(
            status_code=503,
            detail="El servicio de orientación no está configurado. Intenta más tarde.",
        )
    provider = NvidiaProvider(
        api_key=settings.nvidia_api_key,
        base_url=settings.nvidia_base_url,
        model=settings.nvidia_model,
        timeout_seconds=settings.nvidia_timeout_seconds,
        max_retries=settings.nvidia_max_retries,
    )
    return TriageOrchestrator(provider)


@lru_cache
def get_evidence_store() -> EvidenceStore:
    settings = get_settings()
    return EvidenceStore(
        settings.evidence_log_path,
        include_sensitive_payloads=settings.evidence_include_sensitive_payloads,
    )


@lru_cache
def get_db() -> Database:
    settings = get_settings()
    db = Database(settings.auth_db_path)
    _ensure_admin_seeded(db)
    return db


def _ensure_admin_seeded(db: Database) -> None:
    """Crea la cuenta admin de arranque si todavia no existe. La contraseña
    sale de ADMIN_PASSWORD (.env), nunca esta hardcodeada — ver comentario en
    config.py sobre por que se puede "borrar facil" antes de salir a
    produccion (basta borrar la fila de la tabla users o quitar la env var,
    sin dejar la credencial permanente en el historial de git)."""
    settings = get_settings()
    store = UserStore(db)
    if store.get_by_email(settings.admin_username) is None:
        try:
            store.create_user(
                email=settings.admin_username,
                password_hash=hash_password(settings.admin_password),
                role="admin",
            )
        except EmailAlreadyRegisteredError:
            pass


@lru_cache
def get_user_store() -> UserStore:
    return UserStore(get_db())


@lru_cache
def get_session_store() -> SessionStore:
    settings = get_settings()
    return SessionStore(get_db(), ttl_seconds=settings.session_ttl_seconds)


def get_current_user(
    healthguide_session: str | None = Cookie(default=None),
    session_store: SessionStore = Depends(get_session_store),
    user_store: UserStore = Depends(get_user_store),
) -> User | None:
    """Devuelve el usuario autenticado si la cookie de sesion es valida, o
    None si no hay sesion. No lanza error aca — eso lo decide cada endpoint
    segun si requiere auth o no (require_authenticated / require_admin)."""
    if not healthguide_session:
        return None
    session = session_store.get_valid(healthguide_session)
    if session is None:
        return None
    return user_store.get_by_id(session.user_id)


def require_authenticated(current_user: User | None = Depends(get_current_user)) -> User:
    if current_user is None:
        raise HTTPException(status_code=401, detail="Inicia sesión para continuar.")
    return current_user


def require_admin(current_user: User = Depends(require_authenticated)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Esta acción requiere permisos de administrador.")
    return current_user

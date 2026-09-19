"""
Capa de API/Gateway para autenticación. Igual que routes_triage.py, esta es
la única capa que sabe de HTTP: recibe el request, delega a UserStore /
SessionStore / hashing, y setea la cookie de sesión. No valida contraseñas
en texto plano en ningún punto — eso vive en auth/security.py.
"""

from __future__ import annotations

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response

from ..auth.security import hash_password, verify_password
from ..config import get_settings
from ..schemas.auth import LoginRequest, SignupRequest, UserResponse
from ..storage.session_store import SessionStore
from ..storage.user_store import EmailAlreadyRegisteredError, User, UserStore
from .dependencies import get_session_store, get_user_store, require_authenticated

router = APIRouter()


def _set_session_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        max_age=int(settings.session_ttl_seconds),
        httponly=True,
        samesite="lax",
        secure=False,  # cambiar a True cuando se sirva por HTTPS en produccion
    )


@router.post("/auth/signup", response_model=UserResponse, status_code=201)
def signup(
    payload: SignupRequest,
    response: Response,
    user_store: UserStore = Depends(get_user_store),
    session_store: SessionStore = Depends(get_session_store),
) -> UserResponse:
    try:
        user = user_store.create_user(
            email=payload.email,
            password_hash=hash_password(payload.password),
            role="user",
        )
    except EmailAlreadyRegisteredError as exc:
        raise HTTPException(status_code=409, detail="Ese correo ya está registrado.") from exc

    session = session_store.create(user.id)
    _set_session_cookie(response, session.token)
    return UserResponse(id=user.id, email=user.email, role=user.role)


@router.post("/auth/login", response_model=UserResponse)
def login(
    payload: LoginRequest,
    response: Response,
    user_store: UserStore = Depends(get_user_store),
    session_store: SessionStore = Depends(get_session_store),
) -> UserResponse:
    user = user_store.get_by_email(payload.email)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos.")

    session = session_store.create(user.id)
    _set_session_cookie(response, session.token)
    return UserResponse(id=user.id, email=user.email, role=user.role)


@router.post("/auth/logout", status_code=204)
def logout(
    response: Response,
    healthguide_session: str | None = Cookie(default=None),
    session_store: SessionStore = Depends(get_session_store),
) -> None:
    """El logout manual es el unico mecanismo real de cierre de sesion en
    este proyecto (la cookie en si dura ~1 año, ver config.py) — por eso
    aca si invalidamos la sesion en el servidor de verdad, borrando la fila,
    en vez de solo pedirle al navegador que descarte la cookie."""
    if healthguide_session:
        session_store.delete(healthguide_session)
    settings = get_settings()
    response.delete_cookie(key=settings.session_cookie_name)


@router.get("/auth/me", response_model=UserResponse)
def me(current_user: User = Depends(require_authenticated)) -> UserResponse:
    return UserResponse(id=current_user.id, email=current_user.email, role=current_user.role)

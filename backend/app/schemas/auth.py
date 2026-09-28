"""
Esquemas de la API de autenticación. Sin verificación de email por diseño
en esta etapa (decisión explícita del equipo): solo se valida formato
básico, "hola@gmail.com" se acepta sin confirmar que exista de verdad.
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    model_config = ConfigDict(
        # Sesion 5: un campo extra en el body (ej. "role": "admin" colado a
        # mano) se rechaza con 422 en vez de ignorarse en silencio.
        extra="forbid",
        json_schema_extra={
            "example": {"email": "paciente@example.com", "password": "unaClaveSegura123"}
        },
    )

    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {"email": "paciente@example.com", "password": "unaClaveSegura123"}
        },
    )

    # No es EmailStr a proposito: la cuenta admin de arranque usa un
    # username simple ("admin"), no necesariamente un correo real. Los
    # usuarios normales sí se registran con email (validado en SignupRequest),
    # pero el login solo necesita comparar el string tal cual contra lo
    # guardado — la validez de formato ya se exigió una vez, en el signup.
    email: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email", "password")
    @classmethod
    def reject_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Este campo no puede estar vacío.")
        return value


class UserResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {"id": 1, "email": "paciente@example.com", "role": "user"}
        }
    )

    id: int
    email: str
    role: str

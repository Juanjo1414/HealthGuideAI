"""
Tests del guard de arranque (Sesion 5) — backend/app/config.py,
validate_production_config. Es la pieza que evita que admin/12345 llegue
a producción en silencio.
"""

from __future__ import annotations

import pytest

from backend.app.config import Settings, validate_production_config


def test_production_with_default_admin_password_fails_loudly():
    settings = Settings(environment="production", admin_password="12345", nvidia_api_key="clave-real")

    with pytest.raises(RuntimeError, match="ADMIN_PASSWORD"):
        validate_production_config(settings)


def test_production_without_nvidia_key_fails_loudly():
    settings = Settings(environment="production", admin_password="una-clave-real-fuerte", nvidia_api_key=None)

    with pytest.raises(RuntimeError, match="NVIDIA_API_KEY"):
        validate_production_config(settings)


def test_production_with_dev_database_url_fails_loudly():
    """Hallazgo de la auditoria cyber-neo (Sesion 5): database_url tenia
    el mismo problema que admin_password y nadie lo chequeaba."""
    settings = Settings(
        environment="production",
        admin_password="una-clave-real-fuerte",
        nvidia_api_key="clave-real",
        database_url="postgresql://healthguide:healthguide_dev_only@localhost:5433/healthguide",
    )

    with pytest.raises(RuntimeError, match="DATABASE_URL"):
        validate_production_config(settings)


def test_production_with_real_config_does_not_raise():
    settings = Settings(
        environment="production",
        admin_password="una-clave-real-fuerte",
        nvidia_api_key="clave-real",
        database_url="postgresql://prod_user:una-clave-real@db.miapp.com:5432/healthguide",
    )

    validate_production_config(settings)  # no debe levantar nada


def test_development_with_default_admin_password_is_allowed():
    settings = Settings(environment="development", admin_password="12345", nvidia_api_key=None)

    validate_production_config(settings)  # no debe levantar nada — es el default de dev

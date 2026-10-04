"""El modelo y el modo de razonamiento salen de la config (NVIDIA dio de baja
nemotron-3-super el 2026-10-03 y cambiar de modelo no debe requerir tocar código)."""

from dataclasses import replace
from types import SimpleNamespace

import pytest

from backend.app.config import Settings, get_settings
from backend.app.providers.nvidia_provider import NvidiaProvider


def _capture_request(provider: NvidiaProvider) -> dict:
    sent: dict = {}
    completion = SimpleNamespace(
        usage=None,
        choices=[SimpleNamespace(message=SimpleNamespace(content='{"prioridad": "BAJA"}'))],
    )

    def create(**kwargs):
        sent.update(kwargs)
        return completion

    provider._client = SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=create)))
    provider.generate_json("sys", {}, max_tokens=100)
    return sent


def test_from_settings_uses_configured_model_and_thinking_mode():
    settings = replace(Settings(), nvidia_api_key="k", nvidia_model="nvidia/otro", nvidia_enable_thinking=True)

    sent = _capture_request(NvidiaProvider.from_settings(settings))

    assert sent["model"] == "nvidia/otro"
    assert sent["extra_body"] == {"chat_template_kwargs": {"enable_thinking": True}}


def test_reasoning_budget_is_never_sent():
    """nemotron-3-ultra responde 400 si llega `reasoning_budget`."""
    sent = _capture_request(NvidiaProvider.from_settings(replace(Settings(), nvidia_api_key="k")))

    assert "reasoning_budget" not in sent["extra_body"]
    assert sent["extra_body"]["chat_template_kwargs"]["enable_thinking"] is False


def test_from_settings_without_api_key_fails_loudly():
    with pytest.raises(ValueError):
        NvidiaProvider.from_settings(Settings())


def test_model_and_thinking_come_from_env(monkeypatch):
    monkeypatch.setenv("NVIDIA_MODEL", "nvidia/desde-env")
    monkeypatch.setenv("NVIDIA_ENABLE_THINKING", "true")

    settings = get_settings()

    assert settings.nvidia_model == "nvidia/desde-env"
    assert settings.nvidia_enable_thinking is True


def test_default_model_is_not_the_retired_one(monkeypatch):
    monkeypatch.delenv("NVIDIA_MODEL", raising=False)

    assert get_settings().nvidia_model != "nvidia/nemotron-3-super-120b-a12b"


def test_requests_json_mode():
    """El contrato de salida es JSON: se le pide al endpoint en modo JSON en vez
    de confiar en que el modelo no conteste en texto plano."""
    sent = _capture_request(NvidiaProvider.from_settings(replace(Settings(), nvidia_api_key="k")))

    assert sent["response_format"] == {"type": "json_object"}

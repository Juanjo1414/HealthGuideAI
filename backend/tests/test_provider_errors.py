"""
Fallos del proveedor (Sesión 12): qué ve el usuario cuando NVIDIA no
responde o responde basura, y que NvidiaProvider nunca deje escapar una
excepción cruda del SDK hacia la capa de arriba.
"""

from __future__ import annotations

from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from backend.app.api.dependencies import get_evidence_store, get_triage_orchestrator
from backend.app.api.rate_limit import InMemoryRateLimiter, get_rate_limiter
from backend.app.main import app
from backend.app.providers.base import ModelProviderError
from backend.app.providers.nvidia_provider import NvidiaProvider
from backend.app.storage.evidence_store import EvidenceStore


class FailingOrchestrator:
    def run(self, symptoms_text: str) -> dict:
        raise ModelProviderError("timeout simulado")


def teardown_function():
    app.dependency_overrides.clear()


def _client_with_failing_provider(db):
    store = EvidenceStore(db)
    app.dependency_overrides[get_triage_orchestrator] = lambda: FailingOrchestrator()
    app.dependency_overrides[get_evidence_store] = lambda: store
    limiter = InMemoryRateLimiter(max_requests=1000, window_seconds=60)
    app.dependency_overrides[get_rate_limiter] = lambda: limiter
    return TestClient(app)


def test_provider_failure_returns_honest_502_and_records_evidence(db):
    client = _client_with_failing_provider(db)

    response = client.post(
        "/api/v1/triage", json={"symptoms_text": "Tengo tos leve desde ayer por la tarde."}
    )

    assert response.status_code == 502
    assert response.json()["error"]["code"]
    row = db.query_one("SELECT provider_error_type, symptoms_text FROM evidence")
    assert row["provider_error_type"] == "ModelProviderError"
    assert row["symptoms_text"] is None


def _provider_returning(content: str) -> NvidiaProvider:
    provider = NvidiaProvider(api_key="test", base_url="http://invalid.local", model="m")
    completion = SimpleNamespace(
        usage=SimpleNamespace(prompt_tokens=10, completion_tokens=5),
        choices=[SimpleNamespace(message=SimpleNamespace(content=content))],
    )
    provider._client = SimpleNamespace(
        chat=SimpleNamespace(completions=SimpleNamespace(create=lambda **_: completion))
    )
    return provider


def test_provider_strips_markdown_fence_and_records_usage():
    provider = _provider_returning('```json\n{"prioridad": "BAJA"}\n```')

    assert provider.generate_json("sys", {"x": 1}, max_tokens=100) == {"prioridad": "BAJA"}
    assert provider.last_usage == {"prompt_tokens": 10, "completion_tokens": 5}


@pytest.mark.parametrize("content", ["esto no es json", '["una", "lista"]'])
def test_provider_rejects_non_object_responses(content):
    provider = _provider_returning(content)

    with pytest.raises(ModelProviderError):
        provider.generate_json("sys", {}, max_tokens=100)


def test_provider_wraps_sdk_exceptions():
    provider = NvidiaProvider(api_key="test", base_url="http://invalid.local", model="m")

    def boom(**_):
        raise ConnectionError("sin red")

    provider._client = SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=boom)))

    with pytest.raises(ModelProviderError):
        provider.generate_json("sys", {}, max_tokens=100)

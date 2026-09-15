import json

from fastapi.testclient import TestClient

from backend.app.api.dependencies import get_evidence_store, get_triage_orchestrator
from backend.app.main import app
from backend.app.storage.evidence_store import EvidenceStore


class StubOrchestrator:
    def __init__(self, output):
        self.output = output

    def run(self, symptoms_text: str) -> dict:
        return dict(self.output)


def model_output(**overrides):
    output = {
        "resumen": "Dolor reportado por el usuario.",
        "sintomas_detectados": ["dolor de cabeza"],
        "prioridad": "MEDIA",
        "posibles_causas": ["causa general"],
        "alertas": [],
        "recomendacion": "Busca valoración si persiste.",
        "requiere_revision": False,
        "confianza": 0.5,
    }
    output.update(overrides)
    return output


def client_with_output(tmp_path, output):
    store = EvidenceStore(tmp_path / "evidence.jsonl")
    app.dependency_overrides[get_triage_orchestrator] = lambda: StubOrchestrator(output)
    app.dependency_overrides[get_evidence_store] = lambda: store
    return TestClient(app), store


def teardown_function():
    app.dependency_overrides.clear()


def test_health_does_not_require_provider_key(monkeypatch):
    monkeypatch.delenv("NVIDIA_API_KEY", raising=False)

    response = TestClient(app).get("/api/health")

    assert response.status_code == 200


def test_unsafe_model_output_is_replaced_by_safe_fallback(tmp_path):
    unsafe = model_output(
        prioridad="BAJA",
        recomendacion="Tome ibuprofeno 400 mg cada 8 horas.",
        confianza=0.9,
    )
    client, _ = client_with_output(tmp_path, unsafe)

    response = client.post(
        "/api/triage",
        json={"symptoms_text": "Tengo dolor de cabeza desde ayer y está empeorando."},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["validation"]["passed"] is False
    assert body["requires_human_review"] is True
    assert body["prioridad"] == "ALTA"
    assert "ibuprofeno" not in json.dumps(body).lower()


def test_undertriaged_red_flag_uses_emergency_fallback(tmp_path):
    client, _ = client_with_output(
        tmp_path,
        model_output(prioridad="BAJA", confianza=0.9),
    )

    response = client.post(
        "/api/triage",
        json={"symptoms_text": "Tengo dolor en el pecho y dificultad para respirar."},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["prioridad"] == "EMERGENCIA"
    assert body["requires_human_review"] is True


def test_fallback_never_downgrades_model_emergency(tmp_path):
    client, _ = client_with_output(
        tmp_path,
        model_output(
            prioridad="EMERGENCIA",
            recomendacion="Tome ibuprofeno mientras busca atención.",
            requiere_revision=True,
        ),
    )

    response = client.post(
        "/api/triage",
        json={"symptoms_text": "Tengo síntomas intensos desde hace varios minutos."},
    )

    assert response.status_code == 200
    assert response.json()["prioridad"] == "EMERGENCIA"


def test_evidence_omits_sensitive_payloads_by_default(tmp_path):
    symptoms = "Tengo un síntoma privado desde ayer y necesito orientación."
    client, store = client_with_output(tmp_path, model_output())

    response = client.post("/api/triage", json={"symptoms_text": symptoms})

    assert response.status_code == 200
    log_contents = store._log_path.read_text(encoding="utf-8")
    assert symptoms not in log_contents
    assert "causa general" not in log_contents
    assert "input_sha256" in log_contents


def test_whitespace_only_input_is_rejected(tmp_path):
    client, _ = client_with_output(tmp_path, model_output())

    response = client.post("/api/triage", json={"symptoms_text": "   "})

    assert response.status_code == 422

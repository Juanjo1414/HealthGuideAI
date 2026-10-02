import json

from fastapi.testclient import TestClient

from backend.app.api.dependencies import (
    get_current_user,
    get_evidence_store,
    get_triage_orchestrator,
    require_authenticated,
)
from backend.app.api.rate_limit import InMemoryRateLimiter, get_rate_limiter
from backend.app.main import app
from backend.app.storage.evidence_store import EvidenceStore
from backend.app.storage.user_store import UserStore


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


def client_with_output(db, output, authenticated=True):
    """Mismo patron que test_api.py (sin importarlo directo: el proyecto no
    tiene backend/tests/__init__.py, asi que pytest no resuelve imports
    relativos entre modulos de test)."""
    store = EvidenceStore(db)
    stub_user = UserStore(db).create_user(
        email="paciente@example.com", password_hash="x", role="user"
    )
    app.dependency_overrides[get_triage_orchestrator] = lambda: StubOrchestrator(output)
    app.dependency_overrides[get_evidence_store] = lambda: store
    permissive_limiter = InMemoryRateLimiter(max_requests=1000, window_seconds=60)
    app.dependency_overrides[get_rate_limiter] = lambda: permissive_limiter
    if authenticated:
        app.dependency_overrides[get_current_user] = lambda: stub_user
        app.dependency_overrides[require_authenticated] = lambda: stub_user
    return TestClient(app), store, stub_user


def teardown_function():
    app.dependency_overrides.clear()


def test_triage_works_without_account(db):
    """Decisión de producto (Sesión 10/11): se puede consultar sin cuenta."""
    client, _, _ = client_with_output(db, model_output(), authenticated=False)

    response = client.post(
        "/api/v1/triage", json={"symptoms_text": "Tengo fiebre y tos desde hace dos días."}
    )

    assert response.status_code == 200


def test_anonymous_triage_stores_no_content_and_no_user(db):
    client, _, _ = client_with_output(db, model_output(), authenticated=False)

    response = client.post(
        "/api/v1/triage", json={"symptoms_text": "Un síntoma privado desde ayer."}
    )

    row = db.query_one(
        "SELECT user_id, symptoms_text, model_output FROM evidence WHERE request_id = %s",
        (response.json()["request_id"],),
    )
    assert row["user_id"] is None
    assert row["symptoms_text"] is None
    assert row["model_output"] is None


def test_history_only_returns_own_entries(db):
    """Filtrado real en SQL (WHERE user_id), no un chequeo de UI — un
    usuario nunca debe recibir evidencia ajena en el payload."""
    client, store, _ = client_with_output(db, model_output(prioridad="MEDIA"))

    response = client.post(
        "/api/v1/triage", json={"symptoms_text": "Tengo fiebre y tos desde hace dos días."}
    )
    own_request_id = response.json()["request_id"]

    other_user = UserStore(db).create_user(
        email="otra.persona@example.com", password_hash="x", role="user"
    )
    store.record(
        "sintomas de otra persona, nunca deben aparecer",
        model_output(prioridad="ALTA"),
        {"pass": True},
        user_id=other_user.id,
    )

    body = client.get("/api/v1/triage/history").json()

    assert [entry["request_id"] for entry in body] == [own_request_id]


def test_history_of_account_includes_full_detail(db):
    client, _, _ = client_with_output(db, model_output(prioridad="MEDIA"))

    client.post(
        "/api/v1/triage",
        json={"symptoms_text": "Tengo dolor de cabeza leve desde ayer por la tarde, sin fiebre."},
    )

    entry = client.get("/api/v1/triage/history").json()[0]
    assert entry["detalle_disponible"] is True
    assert entry["resumen"] == "Dolor reportado por el usuario."
    assert entry["sintomas_texto"].startswith("Tengo dolor de cabeza leve")


def test_history_never_exposes_unsafe_raw_output(db):
    """Si el validador rechazó la salida del modelo, el usuario vio el
    fallback seguro — el historial tiene que mostrar eso mismo, nunca la
    recomendación cruda con medicación."""
    unsafe = model_output(prioridad="BAJA", recomendacion="Tome ibuprofeno 400 mg cada 8 horas.")
    client, _, _ = client_with_output(db, unsafe)

    client.post(
        "/api/v1/triage", json={"symptoms_text": "Tengo dolor de cabeza desde ayer y empeora."}
    )

    entry = client.get("/api/v1/triage/history").json()[0]
    assert entry["validation_passed"] is False
    assert entry["prioridad"] == "ALTA"
    assert "ibuprofeno" not in json.dumps(entry).lower()


def test_delete_history_removes_only_own_entries(db):
    client, store, _ = client_with_output(db, model_output())
    client.post("/api/v1/triage", json={"symptoms_text": "Tengo fiebre desde ayer por la tarde."})
    other_user = UserStore(db).create_user(email="otra@example.com", password_hash="x")
    store.record("ajeno", model_output(), {"pass": True}, user_id=other_user.id)

    response = client.delete("/api/v1/triage/history")

    assert response.status_code == 204
    assert client.get("/api/v1/triage/history").json() == []
    assert len(store.entries_for_user(other_user.id)) == 1


def test_history_requires_authentication(db):
    response = TestClient(app).get("/api/v1/triage/history")

    assert response.status_code == 401

import json

from fastapi.testclient import TestClient

from backend.app.api.dependencies import (
    get_evidence_store,
    get_triage_orchestrator,
    require_authenticated,
)
from backend.app.api.rate_limit import InMemoryRateLimiter, get_rate_limiter
from backend.app.main import app
from backend.app.storage.evidence_store import EvidenceStore
from backend.app.storage.user_store import UserStore


def make_stub_user(db):
    """Un usuario real en el schema de test, no un objeto armado a mano —
    evidence.user_id tiene FK contra users(id), asi que STUB_USER tiene que
    existir de verdad en la base para que el INSERT de evidencia no falle."""
    return UserStore(db).create_user(
        email="paciente@example.com", password_hash="x", role="user"
    )


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


def client_with_output(db, output):
    store = EvidenceStore(db)
    stub_user = make_stub_user(db)
    app.dependency_overrides[get_triage_orchestrator] = lambda: StubOrchestrator(output)
    app.dependency_overrides[get_evidence_store] = lambda: store
    # Estos tests no evaluan rate limiting — les damos un limitador
    # generosamente permisivo para que no les afecte el limite real de
    # produccion (compartido entre tests via @lru_cache en get_rate_limiter).
    # El comportamiento de 429 en si se prueba aparte, en test_rate_limit.py.
    permissive_limiter = InMemoryRateLimiter(max_requests=1000, window_seconds=60)
    app.dependency_overrides[get_rate_limiter] = lambda: permissive_limiter
    # /api/triage requiere sesion desde que se agrego login/signup. Estos
    # tests no ejercitan auth en si (eso vive en test_auth.py) — se simula
    # un usuario ya autenticado con el mismo patron de dependency_overrides
    # que ya usa el resto del archivo.
    app.dependency_overrides[require_authenticated] = lambda: stub_user
    return TestClient(app), store


def teardown_function():
    app.dependency_overrides.clear()


def test_health_does_not_require_provider_key(monkeypatch):
    # /health es liveness puro (Sesion 3): no depende de que haya API key de
    # NVIDIA configurada, a diferencia de /ready.
    monkeypatch.delenv("NVIDIA_API_KEY", raising=False)

    response = TestClient(app).get("/health")

    assert response.status_code == 200


def test_unsafe_model_output_is_replaced_by_safe_fallback(db):
    unsafe = model_output(
        prioridad="BAJA",
        recomendacion="Tome ibuprofeno 400 mg cada 8 horas.",
        confianza=0.9,
    )
    client, _ = client_with_output(db, unsafe)

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


def test_undertriaged_red_flag_uses_emergency_fallback(db):
    client, _ = client_with_output(
        db,
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


def test_fallback_never_downgrades_model_emergency(db):
    client, _ = client_with_output(
        db,
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


def test_evidence_omits_sensitive_payloads_by_default(db):
    symptoms = "Tengo un síntoma privado desde ayer y necesito orientación."
    client, _ = client_with_output(db, model_output())

    response = client.post("/api/triage", json={"symptoms_text": symptoms})

    assert response.status_code == 200
    request_id = response.json()["request_id"]
    row = db.query_one(
        "SELECT symptoms_text, model_output, input_sha256 FROM evidence WHERE request_id = %s",
        (request_id,),
    )
    assert row["symptoms_text"] is None
    assert row["model_output"] is None
    assert row["input_sha256"] is not None


def test_whitespace_only_input_is_rejected(db):
    client, _ = client_with_output(db, model_output())

    response = client.post("/api/triage", json={"symptoms_text": "   "})

    assert response.status_code == 422

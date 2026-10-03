"""
Capa de API/Gateway. Esta es la unica capa que sabe de HTTP — recibe el
request, delega a orquestacion + validacion + evidencia, y traduce
errores de proveedor a un status code. No arma prompts ni corre reglas
de seguridad aca.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from ..orchestration.triage_orchestrator import TriageOrchestrator
from ..providers.base import ModelProviderError
from ..schemas.triage import HistoryEntry, TriageRequest, TriageResponse, ValidationSummary
from ..storage.evidence_store import EvidenceStore
from ..storage.user_store import User
from ..validation.safe_response import build_safe_fallback
from ..validation.security_validator import validate_output
from .dependencies import (
    get_current_user,
    get_evidence_store,
    get_triage_orchestrator,
    require_authenticated,
)
from .rate_limit import enforce_rate_limit

router = APIRouter()


@router.post(
    "/triage",
    response_model=TriageResponse,
    dependencies=[Depends(enforce_rate_limit)],
    summary="Clasifica la prioridad de atención a partir de síntomas en texto libre",
    description=(
        "Nunca diagnostica una enfermedad específica ni recomienda medicamentos — orienta, "
        "la decisión final es humana. Ver CLAUDE.md sección 2 para las reglas completas. "
        "No requiere sesión: cualquiera puede consultar sin cuenta (decisión de producto, "
        "Sesión 10/11). Con sesión, la consulta queda guardada en el historial del usuario."
    ),
    responses={
        429: {"description": "Se superó el límite de solicitudes por IP en la ventana configurada."},
        502: {"description": "El proveedor del modelo no respondió correctamente."},
    },
)
def create_triage(
    request: TriageRequest,
    current_user: User | None = Depends(get_current_user),
    orchestrator: TriageOrchestrator = Depends(get_triage_orchestrator),
    evidence_store: EvidenceStore = Depends(get_evidence_store),
) -> TriageResponse:
    # Sin sesión no hay a quién atribuirle la evidencia: queda con user_id NULL
    # y nunca aparece en ningún historial. El rate limit sigue siendo por IP.
    user_id = current_user.id if current_user else None
    try:
        model_output = orchestrator.run(request.symptoms_text)
    except ModelProviderError as exc:
        evidence_store.record_provider_error(request.symptoms_text, exc, user_id=user_id)
        raise HTTPException(
            status_code=502,
            detail="El modelo no pudo procesar la solicitud. Intenta de nuevo en unos segundos.",
        ) from exc

    validation_result = validate_output(model_output, request.symptoms_text)
    request_id = evidence_store.record(
        request.symptoms_text, model_output, validation_result, user_id=user_id
    )

    response_output = (
        model_output
        if validation_result["pass"]
        else build_safe_fallback(validation_result, model_output)
    )
    requires_human_review = bool(response_output.get("requiere_revision"))
    public_reasons = (
        validation_result["reasons"]
        if validation_result["pass"]
        else ["La respuesta automática no superó los controles de seguridad."]
    )

    return TriageResponse(
        **response_output,
        validation=ValidationSummary(
            passed=validation_result["pass"],
            checks=validation_result["checks"],
            reasons=public_reasons,
        ),
        requires_human_review=requires_human_review,
        request_id=request_id,
    )


@router.get(
    "/triage/history",
    response_model=list[HistoryEntry],
    summary="Historial de consultas del usuario autenticado",
    description=(
        "Solo devuelve las consultas del propio usuario (filtrado por user_id en SQL, "
        "nunca confiando en el cliente). Muestra lo mismo que vio el usuario en su momento: "
        "si la respuesta del modelo no pasó el validador, se reconstruye el fallback seguro "
        "en vez de exponer la salida cruda. Si una fila vieja no guardó contenido, "
        "`detalle_disponible` queda en false en vez de inventar un resumen."
    ),
    responses={401: {"description": "No hay sesión activa — hace falta login."}},
)
def get_triage_history(
    current_user: User = Depends(require_authenticated),
    evidence_store: EvidenceStore = Depends(get_evidence_store),
) -> list[HistoryEntry]:
    entries = evidence_store.entries_for_user(current_user.id)
    return [_history_entry_from_row(row) for row in entries]


@router.delete(
    "/triage/history",
    status_code=204,
    summary="Borra todo el historial del usuario autenticado",
    responses={401: {"description": "No hay sesión activa — hace falta login."}},
)
def delete_triage_history(
    current_user: User = Depends(require_authenticated),
    evidence_store: EvidenceStore = Depends(get_evidence_store),
) -> None:
    evidence_store.delete_for_user(current_user.id)


def _history_entry_from_row(row: dict) -> HistoryEntry:
    validation = row.get("validation") if isinstance(row.get("validation"), dict) else {}
    stored_output = row.get("model_output")
    passed = validation.get("pass")
    raw_output = stored_output or {"prioridad": row.get("model_priority")}
    # Mismo criterio que create_triage: lo que el usuario vio fue el fallback
    # si el validador rechazó la salida — nunca la respuesta cruda insegura.
    shown = raw_output if passed is not False else build_safe_fallback(validation, raw_output)
    return HistoryEntry(
        request_id=str(row["request_id"]),
        timestamp=row["timestamp"].isoformat(),
        prioridad=shown.get("prioridad"),
        requiere_revision=bool(shown.get("requiere_revision", row.get("model_requires_review"))),
        validation_passed=passed,
        detalle_disponible=stored_output is not None,
        sintomas_texto=row.get("symptoms_text"),
        resumen=shown.get("resumen") if stored_output is not None else None,
        sintomas_detectados=shown.get("sintomas_detectados") if stored_output is not None else None,
        posibles_causas=shown.get("posibles_causas") if stored_output is not None else None,
        alertas=shown.get("alertas") if stored_output is not None else None,
        recomendacion=shown.get("recomendacion") if stored_output is not None else None,
        confianza=shown.get("confianza") if stored_output is not None else None,
    )

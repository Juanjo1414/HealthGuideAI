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
from ..schemas.triage import TriageRequest, TriageResponse, ValidationSummary
from ..storage.evidence_store import EvidenceStore
from ..validation.security_validator import validate_output
from .dependencies import get_evidence_store, get_triage_orchestrator

router = APIRouter()


@router.post("/triage", response_model=TriageResponse)
def create_triage(
    request: TriageRequest,
    orchestrator: TriageOrchestrator = Depends(get_triage_orchestrator),
    evidence_store: EvidenceStore = Depends(get_evidence_store),
) -> TriageResponse:
    try:
        model_output = orchestrator.run(request.symptoms_text)
    except ModelProviderError as exc:
        # Nunca se le muestra al usuario un stacktrace del proveedor —
        # el mensaje interno queda en el log de evidencia, no en la respuesta.
        raise HTTPException(
            status_code=502,
            detail="El modelo no pudo procesar la solicitud. Intenta de nuevo en unos segundos.",
        ) from exc

    validation_result = validate_output(model_output, request.symptoms_text)
    request_id = evidence_store.record(request.symptoms_text, model_output, validation_result)

    requires_human_review = bool(model_output.get("requiere_revision")) or not validation_result["pass"]

    return TriageResponse(
        **model_output,
        validation=ValidationSummary(
            passed=validation_result["pass"],
            checks=validation_result["checks"],
            reasons=validation_result["reasons"],
        ),
        requires_human_review=requires_human_review,
        request_id=request_id,
    )

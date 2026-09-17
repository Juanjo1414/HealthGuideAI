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
from ..validation.safe_response import build_safe_fallback
from ..validation.security_validator import validate_output
from .dependencies import get_evidence_store, get_triage_orchestrator
from .rate_limit import enforce_rate_limit

router = APIRouter()


@router.post("/triage", response_model=TriageResponse, dependencies=[Depends(enforce_rate_limit)])
def create_triage(
    request: TriageRequest,
    orchestrator: TriageOrchestrator = Depends(get_triage_orchestrator),
    evidence_store: EvidenceStore = Depends(get_evidence_store),
) -> TriageResponse:
    try:
        model_output = orchestrator.run(request.symptoms_text)
    except ModelProviderError as exc:
        evidence_store.record_provider_error(request.symptoms_text, exc)
        raise HTTPException(
            status_code=502,
            detail="El modelo no pudo procesar la solicitud. Intenta de nuevo en unos segundos.",
        ) from exc

    validation_result = validate_output(model_output, request.symptoms_text)
    request_id = evidence_store.record(request.symptoms_text, model_output, validation_result)

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

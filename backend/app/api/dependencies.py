"""
Wiring de dependencias — el unico lugar del backend donde se decide QUE
proveedor concreto se usa. Cambiar de NvidiaProvider a otro (o a un mock
en tests) es cambiar esta funcion, nada mas.
"""

from __future__ import annotations

from functools import lru_cache

from fastapi import HTTPException

from ..config import get_settings
from ..orchestration.triage_orchestrator import TriageOrchestrator
from ..providers.nvidia_provider import NvidiaProvider
from ..storage.evidence_store import EvidenceStore


@lru_cache
def get_triage_orchestrator() -> TriageOrchestrator:
    settings = get_settings()
    if not settings.nvidia_api_key:
        raise HTTPException(
            status_code=503,
            detail="El servicio de orientación no está configurado. Intenta más tarde.",
        )
    provider = NvidiaProvider(
        api_key=settings.nvidia_api_key,
        base_url=settings.nvidia_base_url,
        model=settings.nvidia_model,
        timeout_seconds=settings.nvidia_timeout_seconds,
        max_retries=settings.nvidia_max_retries,
    )
    return TriageOrchestrator(provider)


@lru_cache
def get_evidence_store() -> EvidenceStore:
    settings = get_settings()
    return EvidenceStore(
        settings.evidence_log_path,
        include_sensitive_payloads=settings.evidence_include_sensitive_payloads,
    )

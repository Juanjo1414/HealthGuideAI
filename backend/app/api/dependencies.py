"""
Wiring de dependencias — el unico lugar del backend donde se decide QUE
proveedor concreto se usa. Cambiar de NvidiaProvider a otro (o a un mock
en tests) es cambiar esta funcion, nada mas.
"""

from __future__ import annotations

from functools import lru_cache

from ..config import get_settings
from ..orchestration.triage_orchestrator import TriageOrchestrator
from ..providers.nvidia_provider import NvidiaProvider
from ..storage.evidence_store import EvidenceStore


@lru_cache
def get_triage_orchestrator() -> TriageOrchestrator:
    settings = get_settings()
    provider = NvidiaProvider(
        api_key=settings.nvidia_api_key,
        base_url=settings.nvidia_base_url,
        model=settings.nvidia_model,
    )
    return TriageOrchestrator(provider)


@lru_cache
def get_evidence_store() -> EvidenceStore:
    settings = get_settings()
    return EvidenceStore(settings.evidence_log_path)

"""
Capa de orquestacion — equivalente a run_prototype() en el notebook, pero
recibiendo el proveedor de modelo por inyeccion de dependencia (Dependency
Inversion) en vez de llamar a NVIDIA por su nombre. Esta clase no sabe si
el proveedor es NVIDIA, Gemini o un mock de tests.
"""

from __future__ import annotations

from ..providers.base import ModelProvider
from .contract import HUMAN_DECISION, SYSTEM_VALIDATIONS
from .prompt_builder import build_system_prompt

_MAX_TOKENS = 1800


class TriageOrchestrator:
    def __init__(self, provider: ModelProvider):
        self._provider = provider
        self._system_prompt = build_system_prompt()

    def run(self, symptoms_text: str) -> dict:
        output = self._provider.generate_json(
            self._system_prompt,
            {
                "input": symptoms_text,
                "context": {
                    "human_decision": HUMAN_DECISION,
                    "system_validations": SYSTEM_VALIDATIONS,
                },
            },
            max_tokens=_MAX_TOKENS,
        )
        # Misma normalizacion que run_prototype(): no se le "ruega" al prompt
        # que use mayusculas, se corrige en codigo (.claude/CLAUDE.md seccion 8).
        if isinstance(output.get("prioridad"), str):
            output["prioridad"] = output["prioridad"].strip().upper()
        return output

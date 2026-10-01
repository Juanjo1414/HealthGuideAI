"""
Capa de orquestacion — equivalente a run_prototype() en el notebook, pero
recibiendo el proveedor de modelo por inyeccion de dependencia (Dependency
Inversion) en vez de llamar a NVIDIA por su nombre. Esta clase no sabe si
el proveedor es NVIDIA, Gemini o un mock de tests.

Sesion 6: motor hibrido. Los red flags (orchestration/red_flags.py) se
chequean ANTES y DESPUES de llamar al modelo — antes, para decidir que
hacer si el proveedor falla; despues, para que el LLM no pueda "bajar"
una clasificacion que el propio input ya marco como señal de alarma. El
validador de evals/ sigue siendo la ultima linea de defensa (corre
despues, en routes_triage.py) — esto es una capa adicional, no un
reemplazo.

Sesion 7: RAG. El retriever es local (backend/app/knowledge/), no agrega
una llamada de red nueva sobre el timeout que ya tiene el proveedor. Se
construye una sola vez en __init__ (el corpus no cambia en caliente) y se
consulta por request segun el texto de sintomas — a diferencia del
system prompt (estatico, armado una sola vez), el contexto recuperado
depende de cada input, asi que viaja en el payload por request, no
horneado en el prompt.
"""

from __future__ import annotations

from ..knowledge.retrieval import KnowledgeRetriever
from ..knowledge.sources import KNOWLEDGE_BASE
from ..providers.base import ModelProvider, ModelProviderError
from ..validation.safe_response import build_provider_error_fallback
from .contract import HUMAN_DECISION, SYSTEM_VALIDATIONS
from .prompt_builder import build_system_prompt
from .red_flags import detect_red_flags

_MAX_TOKENS = 1800
_RAG_TOP_K = 2


class TriageOrchestrator:
    def __init__(self, provider: ModelProvider):
        self._provider = provider
        self._system_prompt = build_system_prompt()
        self._knowledge_retriever = KnowledgeRetriever(KNOWLEDGE_BASE)

    def run(self, symptoms_text: str) -> dict:
        red_flags = detect_red_flags(symptoms_text)
        retrieved = self._knowledge_retriever.search(symptoms_text, top_k=_RAG_TOP_K)

        payload = {
            "input": symptoms_text,
            "context": {
                "human_decision": HUMAN_DECISION,
                "system_validations": SYSTEM_VALIDATIONS,
            },
        }
        if retrieved:
            # Nunca se fuerza contexto irrelevante (retrieved viene vacio si
            # ningun chunk matcheo de verdad — ver KnowledgeRetriever.search).
            payload["contexto_recuperado"] = [
                {"fuente": chunk.source_name, "url": chunk.source_url, "contenido": chunk.text_es}
                for chunk in retrieved
            ]

        try:
            output = self._provider.generate_json(
                self._system_prompt,
                payload,
                max_tokens=_MAX_TOKENS,
            )
        except ModelProviderError:
            if red_flags:
                # Gate de salida del mentor (MAKERS_ACCEPTANCE.md): un fallo
                # del proveedor no puede omitir revision ante una señal de
                # alarma real que ya detectamos de forma determinista, sin
                # depender de que el LLM haya respondido.
                return build_provider_error_fallback()
            raise

        # Misma normalizacion que run_prototype(): no se le "ruega" al prompt
        # que use mayusculas, se corrige en codigo (.claude/CLAUDE.md seccion 8).
        if isinstance(output.get("prioridad"), str):
            output["prioridad"] = output["prioridad"].strip().upper()

        if red_flags and output.get("prioridad") not in {"ALTA", "EMERGENCIA"}:
            # El LLM ya no puede bajar esta clasificacion — el input tiene
            # una señal de alarma determinista, sin importar que haya
            # contestado el modelo. "Si hay duda, el nivel mas severo"
            # (mismo criterio que evals/CLINICAL_SAFETY_CATALOG.md).
            output["prioridad"] = "EMERGENCIA"
        if red_flags:
            output["requiere_revision"] = True

        return output

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

Sesion 8: blindaje contra prompt injection. El contenido recuperado por
RAG pasa por sanitize_chunk_text() antes de entrar al payload — es entrada
no confiable (aunque hoy el corpus es curado a mano, ver
knowledge/sanitization.py) y amplia la superficie de ataque. Esta clase no
guarda ningun estado entre llamadas a run() mas alla de lo que se
construye una sola vez en __init__ (prompt estatico, indice de
recuperacion de solo lectura) — no hay "memoria" de conversacion que un
usuario pueda envenenar entre requests.

Chat conversacional: la logica de run() (red flags, RAG, llamada al
modelo, normalizacion, drop_named_disease_causes, gate de emergencia) se
extrajo a pipeline.run_pipeline() para que ChatOrchestrator la reutilice
sin duplicarla. run() es ahora un wrapper de una linea — su comportamiento
observable no cambia.
"""

from __future__ import annotations

from ..knowledge.retrieval import KnowledgeRetriever
from ..knowledge.sources import KNOWLEDGE_BASE
from ..providers.base import ModelProvider
from .pipeline import run_pipeline


class TriageOrchestrator:
    def __init__(self, provider: ModelProvider, retriever: KnowledgeRetriever | None = None):
        self._provider = provider
        # Inyectable (Dependency Inversion, igual que provider) sobre todo
        # para tests: permite probar sanitizacion/recuperacion con un
        # corpus controlado sin depender del corpus real de produccion.
        self._knowledge_retriever = retriever or KnowledgeRetriever(KNOWLEDGE_BASE)

    def run(self, symptoms_text: str) -> dict:
        return run_pipeline(
            symptoms_text,
            symptoms_text,
            self._provider,
            self._knowledge_retriever,
            already_emergency=False,
        )

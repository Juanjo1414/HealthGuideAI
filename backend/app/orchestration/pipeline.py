"""
Pipeline compartido de triaje — extraido de TriageOrchestrator.run() (ver
triage_orchestrator.py para el contexto historico completo de por que cada
paso existe: red flags antes/despues del modelo, RAG local, sanitizacion de
contenido recuperado, gate de emergencia que nunca se puede "bajar").

Sesion de chat conversacional: esta misma logica la necesitan tanto
Single_Pass_Triage (TriageOrchestrator.run(), un wrapper de una linea sobre
run_pipeline()) como ChatOrchestrator (que evalua el texto acumulado de la
conversacion en vez de un solo mensaje). Se parametriza por:

- evaluation_text: el texto sobre el que corre detect_red_flags() (en
  single-pass, igual a model_input_text; en chat, el acumulado de todos los
  turnos de usuario).
- model_input_text: el texto que efectivamente ve el modelo en el payload
  (campo "input").
- already_emergency: si True, el gate fuerza EMERGENCIA sin siquiera llamar
  a detect_red_flags() de nuevo — implementa el requisito de no-downgrade
  entre turnos de una misma conversacion de forma directa.
"""

from __future__ import annotations

from ..knowledge.retrieval import KnowledgeRetriever
from ..knowledge.sanitization import sanitize_chunk_text
from ..providers.base import ModelProvider, ModelProviderError
from ..validation.safe_response import build_provider_error_fallback
from .cause_filter import drop_named_disease_causes
from .contract import HUMAN_DECISION, SYSTEM_VALIDATIONS
from .prompt_builder import build_system_prompt
from .red_flags import detect_red_flags

_MAX_TOKENS = 1800
_RAG_TOP_K = 2

# Construido una sola vez a nivel de modulo (igual que __init__ hacia antes
# de la extraccion): el prompt de sistema es estatico, no depende de ningun
# argumento de run_pipeline().
_SYSTEM_PROMPT = build_system_prompt()


def run_pipeline(
    evaluation_text: str,
    model_input_text: str,
    provider: ModelProvider,
    retriever: KnowledgeRetriever,
    already_emergency: bool,
    historial: list[dict] | None = None,
) -> dict:
    """historial: lista opcional de turnos previos ({"rol", "texto"}),
    usada por ChatOrchestrator. Single_Pass_Triage (TriageOrchestrator.run())
    no la pasa, por lo que default None mantiene su comportamiento
    inalterado (sin campo "historial" en el payload)."""
    red_flags = already_emergency or detect_red_flags(evaluation_text)
    retrieved = retriever.search(model_input_text, top_k=_RAG_TOP_K)

    payload = {
        "input": model_input_text,
        "context": {
            "human_decision": HUMAN_DECISION,
            "system_validations": SYSTEM_VALIDATIONS,
        },
    }
    if historial is not None:
        # Campo de dato, igual que "contexto_recuperado" — nunca una
        # instrucción a obedecer (ver INSTRUCTION_HIERARCHY en contract.py).
        payload["historial"] = historial
    if retrieved:
        # Nunca se fuerza contexto irrelevante (retrieved viene vacio si
        # ningun chunk matcheo de verdad — ver KnowledgeRetriever.search).
        payload["contexto_recuperado"] = [
            {
                "fuente": chunk.source_name,
                "url": chunk.source_url,
                "contenido": sanitize_chunk_text(chunk.text_es),
            }
            for chunk in retrieved
        ]

    try:
        output = provider.generate_json(
            _SYSTEM_PROMPT,
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

    # Causas generales, nunca enfermedades con nombre (cause_filter.py).
    if "posibles_causas" in output:
        output["posibles_causas"] = drop_named_disease_causes(output["posibles_causas"])

    if red_flags and output.get("prioridad") != "EMERGENCIA":
        # El LLM ya no puede bajar esta clasificacion — el input tiene
        # una señal de alarma determinista, sin importar que haya
        # contestado el modelo. "Si hay duda, el nivel mas severo"
        # (mismo criterio que evals/CLINICAL_SAFETY_CATALOG.md).
        #
        # Hallazgo real (Sesion 7, corrida de evals contra NVIDIA real):
        # esto antes toleraba "ALTA" sin corregir ("not in {ALTA,
        # EMERGENCIA}"), asumiendo que ALTA ya era "suficientemente
        # severo". red_flag_fiebre_bebe volvio a clasificar ALTA en esa
        # corrida — un falso negativo real de EMERGENCIA, violando el gate
        # bloqueante de CONSTRAINTS.md ("cero falsos negativos"). Cada
        # entrada de RED_FLAG_KEYWORDS y PEDIATRIC_FEVER_PATTERN es,
        # segun la propia rubrica del prompt (contract.PRIORITY_RUBRIC),
        # un criterio de EMERGENCIA — no existe un red flag que la
        # rubrica describa como "solo ALTA". Tolerar ALTA aca era una
        # excepcion sin respaldo en la rubrica, no una regla real.
        output["prioridad"] = "EMERGENCIA"
    if red_flags:
        output["requiere_revision"] = True

    return output

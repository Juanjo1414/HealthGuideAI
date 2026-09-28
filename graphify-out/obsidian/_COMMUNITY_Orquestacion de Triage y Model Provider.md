---
type: community
members: 56
---

# Orquestacion de Triage y Model Provider

**Members:** 56 nodes

## Members
- [[dot-__init__()_5]] - code - backend/app/orchestration/triage_orchestrator.py
- [[dot-__init__()_6]] - code - backend/app/providers/nvidia_provider.py
- [[dot-__init__()_7]] - code - backend/tests/test_triage_orchestrator.py
- [[dot-generate_json()]] - code - backend/app/providers/base.py
- [[dot-generate_json()_1]] - code - backend/app/providers/nvidia_provider.py
- [[dot-generate_json()_2]] - code - backend/tests/test_triage_orchestrator.py
- [[dot-run()_1]] - code - backend/app/orchestration/triage_orchestrator.py
- [[ABC_1]] - code
- [[Arma SYSTEM_PROTOTYPE a partir del contrato — mismo texto base que construye…]] - rationale - backend/app/orchestration/prompt_builder.py
- [[Capa de modelo — la interfaz que resuelve el pendiente de DECISION_LOG.md…]] - rationale - backend/app/providers/base.py
- [[Capa de orquestacion — equivalente a run_prototype() en el notebook, pero…]] - rationale - backend/app/orchestration/triage_orchestrator.py
- [[El caso central de la Sesion 6 el LLM clasifica BAJA pero el input tiene un…]] - rationale - backend/tests/test_triage_orchestrator.py
- [[El contrato de producto es estable — ya fue validado por el modelo en la Parte…]] - rationale - backend/app/orchestration/contract.py
- [[El gate de salida del mentor un fallo del proveedor con un red flag ya…]] - rationale - backend/tests/test_triage_orchestrator.py
- [[El motor hibrido no debe tocar nada cuando no hay red flag — si el modelo ya…]] - rationale - backend/tests/test_triage_orchestrator.py
- [[El proveedor no pudo devolver un JSON usable (timeout, respuesta invalida,…]] - rationale - backend/app/providers/base.py
- [[Envia system_prompt + payload al modelo y devuelve el JSON ya parseado. Debe…]] - rationale - backend/app/providers/base.py
- [[Exception_2]] - code
- [[FakeProvider]] - code - backend/tests/test_triage_orchestrator.py
- [[Implementacion de ModelProvider para NVIDIA nemotron-3-super-120b-a12b, via el…]] - rationale - backend/app/providers/nvidia_provider.py
- [[La respuesta de fallback no es un caso especial exento de las reglas de…]] - rationale - backend/tests/test_triage_orchestrator.py
- [[ModelProvider]] - code - backend/app/providers/base.py
- [[ModelProviderError]] - code - backend/app/providers/base.py
- [[No perder las reglas que ya funcionaban al agregar todo lo nuevo.]] - rationale - backend/tests/test_prompt_builder.py
- [[NvidiaProvider]] - code - backend/app/providers/nvidia_provider.py
- [[RuntimeError]] - code
- [[Sesion 6, gate de salida del mentor (MAKERS_ACCEPTANCE.md) ningún fallo del…]] - rationale - backend/app/validation/safe_response.py
- [[Sin red flag, un fallo de proveedor sigue siendo un fallo real — no se inventa…]] - rationale - backend/tests/test_triage_orchestrator.py
- [[Tests de que la rúbrica, los ejemplos few-shot y el disclaimer reforzado…]] - rationale - backend/tests/test_prompt_builder.py
- [[Tests del motor hibrido (Sesion 6) red flags deterministas antes y despues de…]] - rationale - backend/tests/test_triage_orchestrator.py
- [[TriageOrchestrator]] - code - backend/app/orchestration/triage_orchestrator.py
- [[_format_few_shot()]] - code - backend/app/orchestration/prompt_builder.py
- [[_format_rubric()]] - code - backend/app/orchestration/prompt_builder.py
- [[base.py]] - code - backend/app/providers/base.py
- [[base_output()]] - code - backend/tests/test_triage_orchestrator.py
- [[build_provider_error_fallback()]] - code - backend/app/validation/safe_response.py
- [[build_system_prompt()]] - code - backend/app/orchestration/prompt_builder.py
- [[contract.py]] - code - backend/app/orchestration/contract.py
- [[nvidia_provider.py]] - code - backend/app/providers/nvidia_provider.py
- [[openai]] - concept
- [[orchestration__init__.py]] - code - backend/app/orchestration/__init__.py
- [[prompt_builder.py]] - code - backend/app/orchestration/prompt_builder.py
- [[providers__init__.py]] - code - backend/app/providers/__init__.py
- [[test_does_not_downgrade_model_emergency_without_red_flag()]] - code - backend/tests/test_triage_orchestrator.py
- [[test_escalates_when_red_flag_present_and_model_undertriages()]] - code - backend/tests/test_triage_orchestrator.py
- [[test_passes_through_when_no_red_flag_and_model_succeeds()]] - code - backend/tests/test_triage_orchestrator.py
- [[test_prompt_builder.py]] - code - backend/tests/test_prompt_builder.py
- [[test_prompt_includes_disclaimer()]] - code - backend/tests/test_prompt_builder.py
- [[test_prompt_includes_few_shot_examples()]] - code - backend/tests/test_prompt_builder.py
- [[test_prompt_includes_rubric_for_all_priority_levels()]] - code - backend/tests/test_prompt_builder.py
- [[test_prompt_still_forbids_medication_and_diagnosis()]] - code - backend/tests/test_prompt_builder.py
- [[test_provider_failure_with_red_flag_returns_safe_fallback_instead_of_raising()]] - code - backend/tests/test_triage_orchestrator.py
- [[test_provider_failure_without_red_flag_still_raises()]] - code - backend/tests/test_triage_orchestrator.py
- [[test_red_flag_fallback_passes_the_real_output_validator()]] - code - backend/tests/test_triage_orchestrator.py
- [[test_triage_orchestrator.py]] - code - backend/tests/test_triage_orchestrator.py
- [[triage_orchestrator.py]] - code - backend/app/orchestration/triage_orchestrator.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Orquestacion_de_Triage_y_Model_Provider
SORT file.name ASC
```

## Connections to other communities
- 8 edges to [[_COMMUNITY_API de Triage y Esquema de Salida]]
- 6 edges to [[_COMMUNITY_API Dependencies & Rate Limiting]]
- 5 edges to [[_COMMUNITY_Validador de Salida y Diagrama de Arquitectura 2]]
- 4 edges to [[_COMMUNITY_Migraciones y Metricas de Evals]]
- 4 edges to [[_COMMUNITY_Deteccion de Red Flags y Reglas de Validacion]]
- 3 edges to [[_COMMUNITY_Base de Datos y Health Checks]]

## Top bridge nodes
- [[triage_orchestrator.py]] - degree 18, connects to 5 communities
- [[nvidia_provider.py]] - degree 11, connects to 4 communities
- [[TriageOrchestrator]] - degree 17, connects to 3 communities
- [[test_triage_orchestrator.py]] - degree 17, connects to 2 communities
- [[prompt_builder.py]] - degree 10, connects to 2 communities
---
source_file: "backend/app/orchestration/triage_orchestrator.py"
type: "code"
community: "Orquestacion de Triage y Model Provider"
location: "L27"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Orquestacion_de_Triage_y_Model_Provider
---

# TriageOrchestrator

## Connections
- [[dot-__init__()_5]] - `method` [EXTRACTED]
- [[dot-run()_1]] - `method` [EXTRACTED]
- [[ModelProvider]] - `uses` [INFERRED]
- [[ModelProviderError]] - `uses` [INFERRED]
- [[create_triage()]] - `uses` [INFERRED]
- [[dependencies.py]] - `imports` [EXTRACTED]
- [[get_triage_orchestrator()]] - `uses` [INFERRED]
- [[main()]] - `uses` [INFERRED]
- [[orchestration__init__.py]] - `imports` [EXTRACTED]
- [[routes_triage.py]] - `imports` [EXTRACTED]
- [[test_does_not_downgrade_model_emergency_without_red_flag()]] - `calls` [EXTRACTED]
- [[test_escalates_when_red_flag_present_and_model_undertriages()]] - `calls` [EXTRACTED]
- [[test_passes_through_when_no_red_flag_and_model_succeeds()]] - `calls` [EXTRACTED]
- [[test_provider_failure_with_red_flag_returns_safe_fallback_instead_of_raising()]] - `calls` [EXTRACTED]
- [[test_provider_failure_without_red_flag_still_raises()]] - `calls` [EXTRACTED]
- [[test_triage_orchestrator.py]] - `imports` [EXTRACTED]
- [[triage_orchestrator.py]] - `contains` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/Orquestacion_de_Triage_y_Model_Provider
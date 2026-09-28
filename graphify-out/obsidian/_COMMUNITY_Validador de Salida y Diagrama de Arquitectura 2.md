---
type: community
members: 30
---

# Validador de Salida y Diagrama de Arquitectura 2

**Members:** 30 nodes

## Members
- [[dot-validate()]] - code - evals/validate_triage_output.py
- [[1. Usuario]] - concept - docs/Arquitectura2.jpg
- [[10. Resultado Final]] - concept - docs/Arquitectura2.jpg
- [[2. Interfaz de Usuario]] - concept - docs/Arquitectura2.jpg
- [[3. Orquestador de Triage]] - concept - docs/Arquitectura2.jpg
- [[4. Configurador de Prompt]] - concept - docs/Arquitectura2.jpg
- [[5. Modelo LLM NVIDIA (nemotron-3-super122b)]] - concept - docs/Arquitectura2.jpg
- [[6. Validacion Determinista (red flags)]] - concept - docs/Arquitectura2.jpg
- [[7. Reglas de Seguridad]] - concept - docs/Arquitectura2.jpg
- [[8. Validador de Salida y JSON]] - concept - docs/Arquitectura2.jpg
- [[9. Respuesta Estructurada (JSON)]] - concept - docs/Arquitectura2.jpg
- [[Any]] - code
- [[Disclaimer no diagnostica, no prescribe, no reemplaza a un profesional]] - rationale - docs/Arquitectura2.jpg
- [[Evaluacion y Auditoria]] - concept - docs/Arquitectura2.jpg
- [[HealthGuideAI - Diagrama de Arquitectura (v2)]] - image - docs/Arquitectura2.jpg
- [[Revision Humana (gate passfail)]] - concept - docs/Arquitectura2.jpg
- [[Valida un output de run_prototype contra las reglas de seguridad de HealthGuide…]] - rationale - evals/validate_triage_output.py
- [[me duele' no debe confundirse con reporte de tercero solo porque comparte la…]] - rationale - backend/tests/test_security_validator.py
- [[test_own_symptoms_do_not_trigger_third_party_rule()]] - code - backend/tests/test_security_validator.py
- [[test_rejects_boolean_confidence()]] - code - backend/tests/test_security_validator.py
- [[test_rejects_extra_fields_and_non_string_list_items()]] - code - backend/tests/test_security_validator.py
- [[test_rejects_non_object_json()]] - code - backend/tests/test_security_validator.py
- [[test_security_validator.py]] - code - backend/tests/test_security_validator.py
- [[test_third_party_report_with_review_flag_passes()]] - code - backend/tests/test_security_validator.py
- [[test_third_party_report_without_review_flag_fails()]] - code - backend/tests/test_security_validator.py
- [[typing]] - concept
- [[valid_output()]] - code - backend/tests/test_security_validator.py
- [[validate_triage_output()]] - code - evals/validate_triage_output.py
- [[validate_triage_output.py]] - code - evals/validate_triage_output.py
- [[validate_triage_output.py Validador determinista de reglas de seguridad para…]] - rationale - evals/validate_triage_output.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Validador_de_Salida_y_Diagrama_de_Arquitectura_2
SORT file.name ASC
```

## Connections to other communities
- 7 edges to [[_COMMUNITY_Deteccion de Red Flags y Reglas de Validacion]]
- 5 edges to [[_COMMUNITY_Orquestacion de Triage y Model Provider]]
- 4 edges to [[_COMMUNITY_API de Triage y Esquema de Salida]]
- 1 edge to [[_COMMUNITY_API Dependencies & Rate Limiting]]
- 1 edge to [[_COMMUNITY_Migraciones y Metricas de Evals]]

## Top bridge nodes
- [[typing]] - degree 5, connects to 4 communities
- [[validate_triage_output()]] - degree 14, connects to 3 communities
- [[validate_triage_output.py]] - degree 12, connects to 2 communities
- [[4. Configurador de Prompt]] - degree 4, connects to 1 community
- [[5. Modelo LLM NVIDIA (nemotron-3-super122b)]] - degree 4, connects to 1 community
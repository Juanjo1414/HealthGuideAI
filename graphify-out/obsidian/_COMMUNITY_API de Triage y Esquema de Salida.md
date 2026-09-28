---
type: community
members: 21
---

# API de Triage y Esquema de Salida

**Members:** 21 nodes

## Members
- [[dot-normalize_symptoms_text()]] - code - backend/app/schemas/triage.py
- [[BaseModel_1]] - code
- [[Capa de APIGateway. Esta es la unica capa que sabe de HTTP — recibe el…]] - rationale - backend/app/api/routes_triage.py
- [[Esquemas de la API. TriageResponse envuelve el contrato de salida fijo de…]] - rationale - backend/app/schemas/triage.py
- [[Puente hacia evalsvalidate_triage_output.py — no se duplica el validador de…]] - rationale - backend/app/validation/security_validator.py
- [[Respuestas deterministas para cuando no se puede confiar en el modelo — ni en…]] - rationale - backend/app/validation/safe_response.py
- [[TriageRequest]] - code - backend/app/schemas/triage.py
- [[TriageResponse]] - code - backend/app/schemas/triage.py
- [[ValidationSummary]] - code - backend/app/schemas/triage.py
- [[build_safe_fallback()]] - code - backend/app/validation/safe_response.py
- [[create_triage()]] - code - backend/app/api/routes_triage.py
- [[field_validator_1]] - code
- [[post_1]] - code
- [[pydantic]] - concept
- [[routes_triage.py]] - code - backend/app/api/routes_triage.py
- [[safe_response.py]] - code - backend/app/validation/safe_response.py
- [[schemas__init__.py]] - code - backend/app/schemas/__init__.py
- [[security_validator.py]] - code - backend/app/validation/security_validator.py
- [[triage.py]] - code - backend/app/schemas/triage.py
- [[validate_output()]] - code - backend/app/validation/security_validator.py
- [[validation__init__.py]] - code - backend/app/validation/__init__.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/API_de_Triage_y_Esquema_de_Salida
SORT file.name ASC
```

## Connections to other communities
- 10 edges to [[_COMMUNITY_API Dependencies & Rate Limiting]]
- 8 edges to [[_COMMUNITY_Orquestacion de Triage y Model Provider]]
- 4 edges to [[_COMMUNITY_Autenticacion y Sesiones]]
- 4 edges to [[_COMMUNITY_Validador de Salida y Diagrama de Arquitectura 2]]
- 2 edges to [[_COMMUNITY_Migraciones y Metricas de Evals]]
- 1 edge to [[_COMMUNITY_Middleware de Seguridad y Config]]

## Top bridge nodes
- [[routes_triage.py]] - degree 26, connects to 4 communities
- [[create_triage()]] - degree 11, connects to 3 communities
- [[security_validator.py]] - degree 7, connects to 2 communities
- [[triage.py]] - degree 9, connects to 1 community
- [[validate_output()]] - degree 5, connects to 1 community
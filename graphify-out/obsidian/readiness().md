---
source_file: "backend/app/api/routes_health.py"
type: "code"
community: "Base de Datos y Health Checks"
location: "L38"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Base_de_Datos_y_Health_Checks
---

# readiness()

## Connections
- [[Database]] - `uses` [INFERRED]
- [[Redis_2]] - `references` [EXTRACTED]
- [[Response_1]] - `references` [EXTRACTED]
- [[Settings]] - `uses` [INFERRED]
- [[_check_postgres()]] - `calls` [EXTRACTED]
- [[_check_redis()]] - `calls` [EXTRACTED]
- [[get_1]] - `references` [EXTRACTED]
- [[routes_health.py]] - `contains` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/Base_de_Datos_y_Health_Checks
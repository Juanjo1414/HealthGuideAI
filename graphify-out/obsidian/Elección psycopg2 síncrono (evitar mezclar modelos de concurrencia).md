---
source_file: "backend/requirements.txt"
type: "rationale"
community: "CI y Requisitos de Escalabilidad"
tags:
  - graphify/rationale
  - graphify/EXTRACTED
  - community/CI_y_Requisitos_de_Escalabilidad
---

# Elección psycopg2 síncrono (evitar mezclar modelos de concurrencia)

## Connections
- [[Escalabilidad horizontal (Sesión 4) Postgres + Redis compartidos]] - `semantically_similar_to` [INFERRED]
- [[backendrequirements.txt (fastapi, uvicorn, pydantic, psycopg2, redis, alembic)]] - `rationale_for` [EXTRACTED]

#graphify/rationale #graphify/EXTRACTED #community/CI_y_Requisitos_de_Escalabilidad
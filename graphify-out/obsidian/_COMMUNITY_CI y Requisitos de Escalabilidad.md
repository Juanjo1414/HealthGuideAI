---
type: community
members: 10
---

# CI y Requisitos de Escalabilidad

**Members:** 10 nodes

## Members
- [[Elección psycopg2 síncrono (evitar mezclar modelos de concurrencia)]] - rationale - backend/requirements.txt
- [[Escalabilidad horizontal (Sesión 4) Postgres + Redis compartidos]] - concept - backend/README.md
- [[Migraciones Alembic (SQL crudo desde appstorageschema.py)]] - concept - backend/README.md
- [[Nota tests usan StubOrchestrator, no NVIDIA real]] - rationale - .github/workflows/ci.yml
- [[alembic como versionador de esquema (sin ORM)]] - concept - backend/requirements.txt
- [[backend-tests job]] - code - .github/workflows/ci.yml
- [[backendrequirements-dev.txt (pytest, httpx, pytest-cov)]] - code - backend/requirements-dev.txt
- [[backendrequirements.txt (fastapi, uvicorn, pydantic, psycopg2, redis, alembic)]] - code - backend/requirements.txt
- [[docker-build job]] - code - .github/workflows/ci.yml
- [[frontend-build job]] - code - .github/workflows/ci.yml

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/CI_y_Requisitos_de_Escalabilidad
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_Decisiones del API Gateway]]
- 2 edges to [[_COMMUNITY_Auditoria de Seguridad y Constraints]]

## Top bridge nodes
- [[backend-tests job]] - degree 6, connects to 1 community
- [[backendrequirements-dev.txt (pytest, httpx, pytest-cov)]] - degree 3, connects to 1 community
- [[Migraciones Alembic (SQL crudo desde appstorageschema.py)]] - degree 3, connects to 1 community
- [[Escalabilidad horizontal (Sesión 4) Postgres + Redis compartidos]] - degree 2, connects to 1 community
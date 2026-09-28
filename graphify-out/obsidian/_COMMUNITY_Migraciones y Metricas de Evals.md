---
type: community
members: 23
---

# Migraciones y Metricas de Evals

**Members:** 23 nodes

## Members
- [[0001_initial_schema.py]] - code - backend/alembic/versions/0001_initial_schema.py
- [[Corre cada caso contra run_prototype y compara la prioridad devuelta contra…]] - rationale - evals/metrics.py
- [[Lee uno o más CSV de evals y devuelve todas las filas como dicts. No valida…]] - rationale - evals/metrics.py
- [[PriorityMetricsReport]] - code - evals/metrics.py
- [[compute_priority_metrics()]] - code - evals/metrics.py
- [[csv]] - concept
- [[downgrade()]] - code - backend/alembic/versions/0001_initial_schema.py
- [[env.py]] - code - backend/alembic/env.py
- [[env.py de Alembic — sin modelos ORM a proposito (mismo criterio que…]] - rationale - backend/alembic/env.py
- [[load_cases()]] - code - evals/metrics.py
- [[main()]] - code - evals/run_priority_metrics.py
- [[metrics.py]] - code - evals/metrics.py
- [[metrics.py Mide algo que validate_triage_output.py no mide si la prioridad que…]] - rationale - evals/metrics.py
- [[os]] - concept
- [[pathlib]] - concept
- [[render_markdown_report()]] - code - evals/metrics.py
- [[run_migrations_offline()]] - code - backend/alembic/env.py
- [[run_migrations_online()]] - code - backend/alembic/env.py
- [[run_priority_metrics.py]] - code - evals/run_priority_metrics.py
- [[run_priority_metrics.py Corre los 25 casos de evals contra el modelo real y…]] - rationale - evals/run_priority_metrics.py
- [[sqlalchemy]] - concept
- [[sys]] - concept
- [[upgrade()]] - code - backend/alembic/versions/0001_initial_schema.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Migraciones_y_Metricas_de_Evals
SORT file.name ASC
```

## Connections to other communities
- 5 edges to [[_COMMUNITY_Base de Datos y Health Checks]]
- 4 edges to [[_COMMUNITY_Orquestacion de Triage y Model Provider]]
- 3 edges to [[_COMMUNITY_Middleware de Seguridad y Config]]
- 2 edges to [[_COMMUNITY_API de Triage y Esquema de Salida]]
- 1 edge to [[_COMMUNITY_API Dependencies & Rate Limiting]]
- 1 edge to [[_COMMUNITY_Autenticacion y Sesiones]]
- 1 edge to [[_COMMUNITY_Validador de Salida y Diagrama de Arquitectura 2]]

## Top bridge nodes
- [[pathlib]] - degree 8, connects to 3 communities
- [[run_priority_metrics.py]] - degree 11, connects to 2 communities
- [[metrics.py]] - degree 10, connects to 2 communities
- [[main()]] - degree 7, connects to 2 communities
- [[sys]] - degree 6, connects to 2 communities
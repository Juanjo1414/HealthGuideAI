---
type: community
members: 55
---

# Base de Datos y Health Checks

**Members:** 55 nodes

## Members
- [[dot-__init__()_8]] - code - backend/app/storage/db.py
- [[dot-__init__()_9]] - code - backend/app/storage/session_store.py
- [[dot-__init__()_10]] - code - backend/app/storage/user_store.py
- [[dot-_create_schema_if_missing()]] - code - backend/app/storage/db.py
- [[dot-_cursor()]] - code - backend/app/storage/db.py
- [[dot-close()]] - code - backend/app/storage/db.py
- [[dot-drop_schema()]] - code - backend/app/storage/db.py
- [[dot-execute()]] - code - backend/app/storage/db.py
- [[dot-query_all()]] - code - backend/app/storage/db.py
- [[dot-query_one()]] - code - backend/app/storage/db.py
- [[health vs ready — a propósito NO viven bajo api (ver DECISION_TABLE.md, nota…]] - rationale - backend/app/api/routes_health.py
- [[Conexion a Postgres (Sesion 4 — reemplaza el SQLite de las sesiones anteriores,…]] - rationale - backend/app/storage/db.py
- [[Connection]] - code
- [[DDL del esquema, en una sola lista de sentencias — una única fuente de verdad…]] - rationale - backend/app/storage/schema.py
- [[Database]] - code - backend/app/storage/db.py
- [[Fixtures compartidos. `db` da un Postgres real (no un mock) aislado por test…]] - rationale - backend/tests/conftest.py
- [[Las entradas de record_provider_error no tienen 'validation' ni…]] - rationale - backend/tests/test_list_flagged_for_review.py
- [[RealDictRow]] - code
- [[Redis_2]] - code
- [[Response_1]] - code
- [[Solo para tests borra el schema completo (CASCADE) al terminar, para no dejar…]] - rationale - backend/app/storage/db.py
- [[_check_postgres()]] - code - backend/app/api/routes_health.py
- [[_check_redis()]] - code - backend/app/api/routes_health.py
- [[_is_flagged()]] - code - backend/scripts/list_flagged_for_review.py
- [[_sha256()]] - code - backend/scripts/migrate_sqlite_to_postgres.py
- [[conftest.py]] - code - backend/tests/conftest.py
- [[contextlib]] - concept
- [[db()]] - code - backend/tests/conftest.py
- [[db.py]] - code - backend/app/storage/db.py
- [[fixture]] - code
- [[get_1]] - code
- [[json]] - concept
- [[list_flagged_for_review.py]] - code - backend/scripts/list_flagged_for_review.py
- [[list_flagged_for_review.py Esto NO es una cola de revisión ni un sistema de…]] - rationale - backend/scripts/list_flagged_for_review.py
- [[liveness()]] - code - backend/app/api/routes_health.py
- [[main()_1]] - code - backend/scripts/list_flagged_for_review.py
- [[main()_2]] - code - backend/scripts/migrate_sqlite_to_postgres.py
- [[migrate_evidence()]] - code - backend/scripts/migrate_sqlite_to_postgres.py
- [[migrate_sessions()]] - code - backend/scripts/migrate_sqlite_to_postgres.py
- [[migrate_sqlite_to_postgres.py]] - code - backend/scripts/migrate_sqlite_to_postgres.py
- [[migrate_sqlite_to_postgres.py Traslada los datos que hayan quedado en el…]] - rationale - backend/scripts/migrate_sqlite_to_postgres.py
- [[migrate_users()]] - code - backend/scripts/migrate_sqlite_to_postgres.py
- [[psycopg2]] - concept
- [[psycopg2_extras]] - concept
- [[psycopg2_pool]] - concept
- [[pytest]] - concept
- [[readiness()]] - code - backend/app/api/routes_health.py
- [[routes_health.py]] - code - backend/app/api/routes_health.py
- [[schema.py]] - code - backend/app/storage/schema.py
- [[sqlite3]] - concept
- [[test_does_not_flag_clean_entry()]] - code - backend/tests/test_list_flagged_for_review.py
- [[test_flags_entry_marked_by_model()]] - code - backend/tests/test_list_flagged_for_review.py
- [[test_flags_entry_that_failed_validation()]] - code - backend/tests/test_list_flagged_for_review.py
- [[test_list_flagged_for_review.py]] - code - backend/tests/test_list_flagged_for_review.py
- [[test_provider_error_entry_without_validation_key_is_not_flagged()]] - code - backend/tests/test_list_flagged_for_review.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Base_de_Datos_y_Health_Checks
SORT file.name ASC
```

## Connections to other communities
- 26 edges to [[_COMMUNITY_API Dependencies & Rate Limiting]]
- 8 edges to [[_COMMUNITY_Autenticacion y Sesiones]]
- 8 edges to [[_COMMUNITY_Middleware de Seguridad y Config]]
- 5 edges to [[_COMMUNITY_Migraciones y Metricas de Evals]]
- 3 edges to [[_COMMUNITY_Orquestacion de Triage y Model Provider]]
- 1 edge to [[_COMMUNITY_Manejo del Sobre de Error]]
- 1 edge to [[_COMMUNITY_Decisiones del API Gateway]]

## Top bridge nodes
- [[list_flagged_for_review.py]] - degree 14, connects to 4 communities
- [[routes_health.py]] - degree 17, connects to 3 communities
- [[migrate_sqlite_to_postgres.py]] - degree 15, connects to 3 communities
- [[Database]] - degree 33, connects to 2 communities
- [[db.py]] - degree 14, connects to 2 communities
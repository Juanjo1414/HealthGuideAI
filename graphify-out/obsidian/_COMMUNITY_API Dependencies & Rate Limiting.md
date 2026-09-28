---
type: community
members: 74
---

# API Dependencies & Rate Limiting

**Members:** 74 nodes

## Members
- [[dot-__init__()]] - code - backend/app/api/rate_limit.py
- [[dot-__init__()_1]] - code - backend/app/api/rate_limit.py
- [[dot-__init__()_2]] - code - backend/app/storage/evidence_store.py
- [[dot-__init__()_3]] - code - backend/tests/test_api.py
- [[dot-all_entries()]] - code - backend/app/storage/evidence_store.py
- [[dot-check()]] - code - backend/app/api/rate_limit.py
- [[dot-check()_1]] - code - backend/app/api/rate_limit.py
- [[dot-check()_2]] - code - backend/app/api/rate_limit.py
- [[dot-record()]] - code - backend/app/storage/evidence_store.py
- [[dot-record_provider_error()]] - code - backend/app/storage/evidence_store.py
- [[dot-run()]] - code - backend/tests/test_api.py
- [[Capa de evidencia — cada requestresponseveredicto de validación queda como…]] - rationale - backend/app/storage/evidence_store.py
- [[Crea la cuenta admin de arranque si todavia no existe. La contraseña sale de…]] - rationale - backend/app/api/dependencies.py
- [[Dependencia de FastAPI. `limiter` llega inyectado vía Depends(get_rate_limiter)…]] - rationale - backend/app/api/rate_limit.py
- [[El limitador cuenta por clave (IP), no globalmente para todo el proceso — una…]] - rationale - backend/tests/test_rate_limit.py
- [[EvidenceStore]] - code - backend/app/storage/evidence_store.py
- [[Exception]] - code
- [[FastAPI]] - code
- [[InMemoryRateLimiter]] - code - backend/app/api/rate_limit.py
- [[Interfaz chica a propósito (Interface Segregation, CLAUDE.md sección 13) lo…]] - rationale - backend/app/api/rate_limit.py
- [[La prueba que justifica la Sesión 4 dos objetos RedisRateLimiter distintos…]] - rationale - backend/tests/test_rate_limit.py
- [[Protocol]] - code
- [[Rate limiting. Desde la Sesión 4, la implementación real es `RedisRateLimiter`…]] - rationale - backend/app/api/rate_limit.py
- [[RateLimiter]] - code - backend/app/api/rate_limit.py
- [[Redis]] - code
- [[Redis_1]] - code
- [[RedisRateLimiter]] - code - backend/app/api/rate_limit.py
- [[Request]] - code
- [[StubOrchestrator]] - code - backend/tests/test_api.py
- [[Todas las filas de evidencia, más nuevas primero. A propósito NO filtra acá qué…]] - rationale - backend/app/storage/evidence_store.py
- [[Un usuario real en el schema de test, no un objeto armado a mano —…]] - rationale - backend/tests/test_api.py
- [[Ventana deslizante en memoria de un solo proceso — solo para tests, ver el…]] - rationale - backend/app/api/rate_limit.py
- [[Ventana deslizante real, compartida entre cualquier número de…]] - rationale - backend/app/api/rate_limit.py
- [[Wiring de dependencias — el unico lugar del backend donde se decide QUE…]] - rationale - backend/app/api/dependencies.py
- [[_ensure_admin_seeded()]] - code - backend/app/api/dependencies.py
- [[client_with_output()]] - code - backend/tests/test_api.py
- [[collections]] - concept
- [[dependencies.py]] - code - backend/app/api/dependencies.py
- [[enforce_rate_limit()]] - code - backend/app/api/rate_limit.py
- [[evidence_store.py]] - code - backend/app/storage/evidence_store.py
- [[extra='forbid' (Sesion 5) tambien en TriageRequest.]] - rationale - backend/tests/test_api.py
- [[functools]] - concept
- [[get_db()]] - code - backend/app/api/dependencies.py
- [[get_evidence_store()]] - code - backend/app/api/dependencies.py
- [[get_rate_limiter()]] - code - backend/app/api/rate_limit.py
- [[get_redis_client()]] - code - backend/app/api/dependencies.py
- [[get_session_store()]] - code - backend/app/api/dependencies.py
- [[get_settings()]] - code - backend/app/config.py
- [[get_triage_orchestrator()]] - code - backend/app/api/dependencies.py
- [[get_user_store()]] - code - backend/app/api/dependencies.py
- [[hashlib]] - concept
- [[make_stub_user()]] - code - backend/tests/test_api.py
- [[model_output()]] - code - backend/tests/test_api.py
- [[rate_limit.py]] - code - backend/app/api/rate_limit.py
- [[redis_3]] - concept
- [[require_admin()]] - code - backend/app/api/dependencies.py
- [[require_authenticated()]] - code - backend/app/api/dependencies.py
- [[storage__init__.py]] - code - backend/app/storage/__init__.py
- [[teardown_function()]] - code - backend/tests/test_api.py
- [[teardown_function()_1]] - code - backend/tests/test_rate_limit.py
- [[test_api.py]] - code - backend/tests/test_api.py
- [[test_evidence_omits_sensitive_payloads_by_default()]] - code - backend/tests/test_api.py
- [[test_exceeding_limit_returns_429()]] - code - backend/tests/test_rate_limit.py
- [[test_fallback_never_downgrades_model_emergency()]] - code - backend/tests/test_api.py
- [[test_health_does_not_require_provider_key()]] - code - backend/tests/test_api.py
- [[test_limit_is_per_client_key()]] - code - backend/tests/test_rate_limit.py
- [[test_rate_limit.py]] - code - backend/tests/test_rate_limit.py
- [[test_redis_rate_limiter_shares_state_across_instances()]] - code - backend/tests/test_rate_limit.py
- [[test_triage_rejects_unexpected_field()]] - code - backend/tests/test_api.py
- [[test_undertriaged_red_flag_uses_emergency_fallback()]] - code - backend/tests/test_api.py
- [[test_unsafe_model_output_is_replaced_by_safe_fallback()]] - code - backend/tests/test_api.py
- [[test_whitespace_only_input_is_rejected()]] - code - backend/tests/test_api.py
- [[threading]] - concept
- [[uuid]] - concept

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/API_Dependencies__Rate_Limiting
SORT file.name ASC
```

## Connections to other communities
- 32 edges to [[_COMMUNITY_Autenticacion y Sesiones]]
- 26 edges to [[_COMMUNITY_Base de Datos y Health Checks]]
- 15 edges to [[_COMMUNITY_Middleware de Seguridad y Config]]
- 10 edges to [[_COMMUNITY_API de Triage y Esquema de Salida]]
- 6 edges to [[_COMMUNITY_Orquestacion de Triage y Model Provider]]
- 5 edges to [[_COMMUNITY_Tests de Gateway y Seguridad]]
- 2 edges to [[_COMMUNITY_Manejo del Sobre de Error]]
- 1 edge to [[_COMMUNITY_Migraciones y Metricas de Evals]]
- 1 edge to [[_COMMUNITY_Validador de Salida y Diagrama de Arquitectura 2]]

## Top bridge nodes
- [[dependencies.py]] - degree 40, connects to 6 communities
- [[FastAPI]] - degree 8, connects to 5 communities
- [[get_settings()]] - degree 29, connects to 4 communities
- [[test_api.py]] - degree 27, connects to 4 communities
- [[rate_limit.py]] - degree 20, connects to 3 communities
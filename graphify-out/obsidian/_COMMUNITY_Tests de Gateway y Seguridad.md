---
type: community
members: 31
---

# Tests de Gateway y Seguridad

**Members:** 31 nodes

## Members
- [[Algunos navegadores viejos no mandan Origin en same-origin POST, pero sí…]] - rationale - backend/tests/test_csrf.py
- [[Simula Try it out en docs el Origin es el propio backend, no está en…]] - rationale - backend/tests/test_csrf.py
- [[Tests de SecurityHeadersMiddleware — ver backendappapisecurity_headers.py.]] - rationale - backend/tests/test_security_headers.py
- [[Tests de la capa de gateway agregada en la Sesion 3 versionado (apiv1 vs…]] - rationale - backend/tests/test_gateway.py
- [[Tests del CSRFOriginCheckMiddleware — verificacion de origen para metodos que…]] - rationale - backend/tests/test_csrf.py
- [[Un cliente que no es navegador (curl, un test, un futuro cliente movil) no…]] - rationale - backend/tests/test_csrf.py
- [[fastapi_testclient]] - concept
- [[ping()]] - code - backend/tests/test_gateway.py
- [[query_one()]] - code - backend/tests/test_gateway.py
- [[teardown_function()_3]] - code - backend/tests/test_csrf.py
- [[teardown_function()_4]] - code - backend/tests/test_gateway.py
- [[test_api_response_has_strict_security_headers()]] - code - backend/tests/test_security_headers.py
- [[test_csrf.py]] - code - backend/tests/test_csrf.py
- [[test_docs_response_has_permissive_csp_for_swagger_assets()]] - code - backend/tests/test_security_headers.py
- [[test_error_envelope_has_detail_and_stable_code()]] - code - backend/tests/test_gateway.py
- [[test_gateway.py]] - code - backend/tests/test_gateway.py
- [[test_get_request_is_never_blocked_by_csrf()]] - code - backend/tests/test_csrf.py
- [[test_hsts_is_absent_outside_production()]] - code - backend/tests/test_security_headers.py
- [[test_incoming_request_id_is_respected()]] - code - backend/tests/test_gateway.py
- [[test_post_falls_back_to_referer_when_origin_missing()]] - code - backend/tests/test_csrf.py
- [[test_post_from_backends_own_origin_is_allowed()]] - code - backend/tests/test_csrf.py
- [[test_post_with_trusted_origin_is_not_blocked_by_csrf()]] - code - backend/tests/test_csrf.py
- [[test_post_with_untrusted_origin_is_rejected()]] - code - backend/tests/test_csrf.py
- [[test_post_without_origin_or_referer_is_allowed()]] - code - backend/tests/test_csrf.py
- [[test_ready_reports_not_ready_when_nvidia_key_missing()]] - code - backend/tests/test_gateway.py
- [[test_ready_reports_not_ready_when_postgres_fails()]] - code - backend/tests/test_gateway.py
- [[test_ready_reports_not_ready_when_redis_fails()]] - code - backend/tests/test_gateway.py
- [[test_ready_reports_ok_when_dependencies_available()]] - code - backend/tests/test_gateway.py
- [[test_response_includes_request_id_header()]] - code - backend/tests/test_gateway.py
- [[test_security_headers.py]] - code - backend/tests/test_security_headers.py
- [[test_v1_prefix_behaves_identical_to_legacy_alias()]] - code - backend/tests/test_gateway.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Tests_de_Gateway_y_Seguridad
SORT file.name ASC
```

## Connections to other communities
- 5 edges to [[_COMMUNITY_API Dependencies & Rate Limiting]]
- 3 edges to [[_COMMUNITY_Middleware de Seguridad y Config]]
- 1 edge to [[_COMMUNITY_Autenticacion y Sesiones]]

## Top bridge nodes
- [[test_gateway.py]] - degree 15, connects to 2 communities
- [[fastapi_testclient]] - degree 6, connects to 2 communities
- [[test_csrf.py]] - degree 10, connects to 1 community
- [[test_security_headers.py]] - degree 6, connects to 1 community
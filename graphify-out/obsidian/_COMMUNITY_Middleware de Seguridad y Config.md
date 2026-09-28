---
type: community
members: 53
---

# Middleware de Seguridad y Config

**Members:** 53 nodes

## Members
- [[dot-__init__()_11]] - code - backend/app/api/csrf.py
- [[dot-__init__()_12]] - code - backend/app/api/middleware.py
- [[dot-__init__()_13]] - code - backend/app/api/middleware.py
- [[dot-__init__()_14]] - code - backend/app/api/security_headers.py
- [[dot-_is_trusted_origin()]] - code - backend/app/api/csrf.py
- [[dot-dispatch()]] - code - backend/app/api/csrf.py
- [[dot-dispatch()_1]] - code - backend/app/api/middleware.py
- [[dot-dispatch()_2]] - code - backend/app/api/middleware.py
- [[dot-dispatch()_3]] - code - backend/app/api/security_headers.py
- [[ASGIApp]] - code
- [[ASGIApp_1]] - code
- [[ASGIApp_2]] - code
- [[AccessLogMiddleware]] - code - backend/app/api/middleware.py
- [[Asigna un request_id (o respeta el que mande un proxy delante nuestro, ej. el…]] - rationale - backend/app/api/middleware.py
- [[BaseHTTPMiddleware]] - code
- [[BaseHTTPMiddleware_1]] - code
- [[BaseHTTPMiddleware_2]] - code
- [[CSRF (Sesion 5) via verificacion de origen, no double-submit token. La auth ya…]] - rationale - backend/app/api/csrf.py
- [[CSRFOriginCheckMiddleware]] - code - backend/app/api/csrf.py
- [[Configuracion del backend. Todo lo que depende del entorno (keys, orígenes…]] - rationale - backend/app/config.py
- [[Guard de arranque (Sesion 5) si esto no revienta ahora, revienta en produccion…]] - rationale - backend/app/config.py
- [[Hallazgo de la auditoria cyber-neo (Sesion 5) database_url tenia el mismo…]] - rationale - backend/tests/test_config_guard.py
- [[Headers de seguridad (Sesion 5) — defensa en profundidad para el navegador,…]] - rationale - backend/app/api/security_headers.py
- [[Middleware de gateway request ID y logging de acceso estructurado. Orden de…]] - rationale - backend/app/api/middleware.py
- [[Punto de entrada. Corre con uvicorn app.mainapp --reload --app-dir backend…]] - rationale - backend/app/main.py
- [[Request_2]] - code
- [[Request_3]] - code
- [[Request_4]] - code
- [[RequestIdMiddleware]] - code - backend/app/api/middleware.py
- [[SecurityHeadersMiddleware]] - code - backend/app/api/security_headers.py
- [[Settings]] - code - backend/app/config.py
- [[Tests del guard de arranque (Sesion 5) — backendappconfig.py,…]] - rationale - backend/tests/test_config_guard.py
- [[Una línea por request, sin datos sensibles quién (método+ruta), qué pasó…]] - rationale - backend/app/api/middleware.py
- [[_origin_from_referer()]] - code - backend/app/api/csrf.py
- [[config.py]] - code - backend/app/config.py
- [[csrf.py]] - code - backend/app/api/csrf.py
- [[dotenv]] - concept
- [[fastapi_middleware_cors]] - concept
- [[main.py]] - code - backend/app/main.py
- [[middleware.py]] - code - backend/app/api/middleware.py
- [[security_headers.py]] - code - backend/app/api/security_headers.py
- [[starlette_middleware_base]] - concept
- [[starlette_requests]] - concept
- [[starlette_responses]] - concept
- [[starlette_types]] - concept
- [[test_config_guard.py]] - code - backend/tests/test_config_guard.py
- [[test_development_with_default_admin_password_is_allowed()]] - code - backend/tests/test_config_guard.py
- [[test_production_with_default_admin_password_fails_loudly()]] - code - backend/tests/test_config_guard.py
- [[test_production_with_dev_database_url_fails_loudly()]] - code - backend/tests/test_config_guard.py
- [[test_production_with_real_config_does_not_raise()]] - code - backend/tests/test_config_guard.py
- [[test_production_without_nvidia_key_fails_loudly()]] - code - backend/tests/test_config_guard.py
- [[time]] - concept
- [[validate_production_config()]] - code - backend/app/config.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Middleware_de_Seguridad_y_Config
SORT file.name ASC
```

## Connections to other communities
- 15 edges to [[_COMMUNITY_API Dependencies & Rate Limiting]]
- 8 edges to [[_COMMUNITY_Base de Datos y Health Checks]]
- 4 edges to [[_COMMUNITY_Autenticacion y Sesiones]]
- 3 edges to [[_COMMUNITY_Manejo del Sobre de Error]]
- 3 edges to [[_COMMUNITY_Migraciones y Metricas de Evals]]
- 3 edges to [[_COMMUNITY_Tests de Gateway y Seguridad]]
- 1 edge to [[_COMMUNITY_API de Triage y Esquema de Salida]]

## Top bridge nodes
- [[main.py]] - degree 24, connects to 6 communities
- [[config.py]] - degree 21, connects to 4 communities
- [[Settings]] - degree 11, connects to 2 communities
- [[middleware.py]] - degree 10, connects to 2 communities
- [[csrf.py]] - degree 10, connects to 1 community
# Graph Report - HealthGuideAI  (2026-10-04)

## Corpus Check
- 163 files · ~216,395 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: (none) 8, .csv 4, .example 2)

## Summary
- 1286 nodes · 2714 edges · 72 communities (58 shown, 14 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 127 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `56a57071`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_api.py
- SessionStore
- authApi.ts
- triage_rules.py
- test_auth.py
- package.json
- csrf.py
- results.md — Resultados de evals
- ResultPage.tsx
- App.tsx
- backend/README.md
- Reporte del set adversarial (Sesión 8 — blindaje contra prompt injection)
- Capas del Diagrama de Arquitectura
- config.py
- DECISION_TABLE.md — Gemini vs NVIDIA
- CLAUDE.md — contexto del proyecto HealthGuideAI
- compilerOptions
- CONSTRAINTS.md — nivel de calidad exigido
- AuthContext.tsx
- triage_orchestrator.py
- routes_auth.py
- SOLID e Interfaz ModelProvider
- PLAN_IMPLEMENTACION.md — roadmap de 14 sesiones
- Design System del Frontend
- Skill de Refactor de Archivos Grandes
- Docker Entrypoint
- test_client_ip.py
- TriageOrchestrator
- test_triage_history.py
- EvidenceStore
- components.json
- get_settings
- validate_triage_output
- ProfilePage.tsx
- HistoryPage.tsx
- HomePage.tsx
- app_orchestration_triage_orchestrator
- routes_triage.py
- app_providers_base
- UserStore
- dependencies
- devDependencies
- button.tsx
- vite.config.js
- scripts
- migrate_sqlite_to_postgres.py
- app_validation_safe_response
- Database
- test_provider_errors.py
- AuthPage.tsx
- db.py
- fixtures.ts
- useSpeechDictation.ts
- rules
- dependencies.py
- app_providers_nvidia_provider
- Diseño visual de Stitch — cómo se implementó y qué queda pendiente
- Backend service (compose.yml)
- routes_health.py
- get
- Redis
- test_csrf.py
- rate_limit.py
- Response
- Despliegue gratuito: Vercel + Render + Neon
- test_gateway.py
- vercel.json
- Gate de evals — PASA
- test_security_headers.py

## God Nodes (most connected - your core abstractions)
1. `get_settings()` - 43 edges
2. `Database` - 37 edges
3. `validate_triage_output()` - 29 edges
4. `EvidenceStore` - 28 edges
5. `TriageOrchestrator` - 26 edges
6. `UserStore` - 26 edges
7. `ProfilePage()` - 26 edges
8. `KnowledgeRetriever` - 25 edges
9. `useAuth()` - 25 edges
10. `Settings` - 23 edges

## Surprising Connections (you probably didn't know these)
- `Known failures: medicación filtrada, omisión de prioridad, subestimación` --semantically_similar_to--> `DECISION_TABLE.md — Gemini vs NVIDIA`  [INFERRED] [semantically similar]
  README.md → DECISION_TABLE.md
- `Mapeo pantalla de Stitch → ruta` --references--> `EmergencyPanel()`  [INFERRED]
  docs/DESIGN_STITCH.md → frontend/src/components/triage/EmergencyPanel.tsx
- `Mapeo pantalla de Stitch → ruta` --references--> `OfflinePanel()`  [INFERRED]
  docs/DESIGN_STITCH.md → frontend/src/components/triage/OfflinePanel.tsx
- `Mapeo pantalla de Stitch → ruta` --references--> `VagueInputPanel()`  [INFERRED]
  docs/DESIGN_STITCH.md → frontend/src/components/triage/VagueInputPanel.tsx
- `Limitación: validador de palabras clave se puede colar (antitérmicos)` --semantically_similar_to--> `Bug: validador dejaba pasar categorías genéricas de medicación (antitérmicos)`  [INFERRED] [semantically similar]
  REFLEXION_MAKERS_REVIEW.md → CLAUDE.md

## Import Cycles
- 3-file cycle: `backend/app/orchestration/__init__.py -> backend/app/orchestration/triage_orchestrator.py -> backend/app/orchestration/prompt_builder.py -> backend/app/orchestration/__init__.py`

## Hyperedges (group relationships)
- **Gate de calidad en CI antes de mergear a main** — github_workflows_ci_ci, constraints_enforced_table, backend_requirements_dev_pkg, readme_ci_cd_section [INFERRED 0.75]
- **Escalabilidad horizontal con Postgres + Redis (Sesion 4)** — compose_postgres, compose_redis, compose_backend, docs_plan_implementacion_sesion4 [INFERRED 0.85]
- **Evidencia del motor de triage hibrido: fix pediatrico + ground truth clinico** — docs_plan_implementacion_sesion6, evals_results_pediatric_fever_fix, evals_clinical_safety_catalog, evals_priority_accuracy_report [INFERRED 0.85]
- **Evidencia consolidada de la decisión NVIDIA vs Gemini** — decision_log_decision1_nvidia_vs_gemini, decision_table_doc, readme_known_failures, claude_md_notebook_gemini [INFERRED 0.85]
- **Flujo compartido de validación de seguridad del triage (notebook + backend + evals)** — claude_md_output_contract, decision_log_validate_triage_output, backend_readme_doc, constraints_enforced_table [INFERRED 0.85]

## Communities (72 total, 14 thin omitted)

### Community 0 - "test_api.py"
Cohesion: 0.10
Nodes (29): InMemoryRateLimiter, Ventana deslizante en memoria de un solo proceso — solo para tests, ver el…, client_with_output(), make_stub_user(), model_output(), extra='forbid' (Sesion 5) tambien en TriageRequest., Un usuario real en el schema de test, no un objeto armado a mano —…, StubOrchestrator (+21 more)

### Community 1 - "SessionStore"
Cohesion: 0.27
Nodes (5): Capa de acceso a la tabla `sessions`. Sesiones respaldadas por servidor (no JWT…, Session, SessionStore, datetime, secrets

### Community 2 - "authApi.ts"
Cohesion: 0.29
Nodes (10): AuthApiError, authRequest(), AuthRequestOptions, getCurrentUser(), login(), logout(), signup(), AuthProvider() (+2 more)

### Community 3 - "triage_rules.py"
Cohesion: 0.06
Nodes (49): Any, detect_red_flags(), Capa determinista de red flags (Sesion 6) — corre ANTES de llamar al modelo,…, Señales de alarma detectadas en el texto del usuario (lista vacía si ninguna)., El input real puede venir sin tildes — el chequeo tiene que matchear igual., No dos formas de detectar red flags que se puedan desincronizar — entrada (este…, Hallazgo real de la Sesion 6: 'red_flag_fiebre_bebe' clasificaba ALTA en vez de…, No todo lo que menciona fiebre es un red flag — sin la combinacion con edad de… (+41 more)

### Community 4 - "test_auth.py"
Cohesion: 0.22
Nodes (14): client_with_fresh_db(), extra='forbid' (Sesion 5): un campo colado a mano (ej. "role": "admin") tiene…, Sesión 10/11: consultar no exige cuenta (decisión de producto); lo que sí la…, test_login_with_correct_credentials_succeeds(), test_login_with_wrong_password_returns_401(), test_logout_invalidates_session(), test_me_with_valid_session_returns_user(), test_me_without_session_returns_401() (+6 more)

### Community 5 - "package.json"
Cohesion: 0.11
Nodes (17): engines, node, name, private, type, version, jsdom, lucide-react (+9 more)

### Community 6 - "csrf.py"
Cohesion: 0.06
Nodes (35): CSRFOriginCheckMiddleware, _origin_from_referer(), ASGIApp, BaseHTTPMiddleware, Request, CSRF (Sesion 5) via verificacion de origen, no double-submit token. La auth ya…, _envelope(), install_error_handlers() (+27 more)

### Community 7 - "results.md — Resultados de evals"
Cohesion: 0.13
Nodes (22): Arquitectura por capas propuesta (canal/API/orquestacion/modelo/validacion/evidencia/escalamiento), arquitectura.md — Arquitectura HealthGuideAI, Flujo actual del notebook (diagrama), Frontera IA vs software vs humano, Rationale: modelo como capa intercambiable, Rationale: ningun fallo del proveedor puede omitir revision humana, Feedback de mentoria: 6 gates de aceptacion (Emmanuel, makers/review), Sesion 6 — Motor de triage hibrido: reglas + rubrica + few-shot (+14 more)

### Community 8 - "ResultPage.tsx"
Cohesion: 0.10
Nodes (25): Mapeo pantalla de Stitch → ruta, TriageResponse, EmergencyPanel(), EmergencyPanelProps, IMMEDIATE_ACTIONS, OfflinePanel(), OfflinePanelProps, QUICK_ADDS (+17 more)

### Community 9 - "App.tsx"
Cohesion: 0.13
Nodes (22): checkReady(), ReadyStatus, ROOT_URL, App(), renderRoute(), PageShell(), SiteFooter(), MobileTabBar() (+14 more)

### Community 10 - "backend/README.md"
Cohesion: 0.20
Nodes (9): API Gateway (Sesión 3): versionado /api/v1, /health, /ready, X-Request-ID, Revisión humana: flag registrado, no cola operativa, Estructura app/ por capas (api, orchestration, providers, validation, storage, schemas), Rate limiting con RedisRateLimiter (ventana deslizante), AI flow: input → validaciones deterministas → LLM → JSON → revisión, Sistema de evals (validate_triage_output), Contrato de salida JSON de triage, Decisión 2: canal web app + API ahora, WhatsApp fase 2 (+1 more)

### Community 12 - "Capas del Diagrama de Arquitectura"
Cohesion: 0.23
Nodes (21): Capa de Almacenamiento / Evidencia, Capa de API / Gateway, Capa de Canal, Capa de Modelo (intercambiable), Capa de Orquestación, Capa de Validación (dominio, sin LLM), contract (JTBD, output_fields, reglas del dominio), DECISION_LOG.md (+13 more)

### Community 13 - "config.py"
Cohesion: 0.22
Nodes (14): Configuracion del backend. Todo lo que depende del entorno (keys, orígenes…, Guard de arranque (Sesion 5): si esto no revienta ahora, revienta en produccion…, Settings, validate_production_config(), Punto de entrada. Corre con: uvicorn app.main:app --reload --app-dir backend…, Tests del guard de arranque (Sesion 5) — backend/app/config.py,…, Hallazgo de la auditoria cyber-neo (Sesion 5): database_url tenia el mismo…, test_development_with_default_admin_password_is_allowed() (+6 more)

### Community 14 - "DECISION_TABLE.md — Gemini vs NVIDIA"
Cohesion: 0.10
Nodes (24): Bug: validador dejaba pasar categorías genéricas de medicación (antitérmicos), HealthGuideAI_Gemini.ipynb (dado de baja), HealthGuideAI_Nvidia.ipynb, Decisión 1: proveedor de modelo NVIDIA nemotron vs Gemini, DECISION_TABLE.md — Gemini vs NVIDIA, Bug de contrato: Gemini generaba claves propias (prioridad_atencion), Hallazgo: no-determinismo estructural del JSON (thinking habilitado), Tabla de costo estimado NVIDIA (~$0.01/caso) (+16 more)

### Community 15 - "CLAUDE.md — contexto del proyecto HealthGuideAI"
Cohesion: 0.13
Nodes (14): Bug: login no aparecía por caché de Docker + fallo silencioso de npm ci, Bug: Postgres nativo en puerto 5432 chocaba con el de Docker, Bug: prioridad en minúscula tumbaba validación Pydantic, Bug: run_prototype reventaba con ValidationError de Pydantic, Bug: score de evaluación crítica en escala 0-100 en vez de 0-10, frontend/ (React 18 + Vite), Convención de ramas (dev/<nombre>, main, makers/review), CLAUDE.md — contexto del proyecto HealthGuideAI (+6 more)

### Community 16 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, allowJs, checkJs, isolatedModules, jsx, lib, module (+12 more)

### Community 17 - "CONSTRAINTS.md — nivel de calidad exigido"
Cohesion: 0.12
Nodes (19): Migraciones Alembic (SQL crudo desde app/storage/schema.py), Seguridad de la aplicación (Sesión 5): guard de arranque, CSRF, headers, Auditoría cyber-neo del repo (Sesión 5): root en contenedor, DATABASE_URL default, Escalabilidad horizontal (Sesión 4): Postgres + Redis compartidos, alembic como versionador de esquema (sin ORM), backend/requirements-dev.txt (pytest, httpx, pytest-cov), backend/requirements.txt (fastapi, uvicorn, pydantic, psycopg2, redis, alembic), Elección psycopg2 síncrono (evitar mezclar modelos de concurrencia) (+11 more)

### Community 18 - "AuthContext.tsx"
Cohesion: 0.17
Nodes (20): User, ProtectedRoute(), setAuth(), AuthContext, AuthContextValue, AuthStatus, useAuth(), login (+12 more)

### Community 19 - "triage_orchestrator.py"
Cohesion: 0.06
Nodes (42): Sesion 8 (blindaje contra prompt injection): sanitiza el contenido recuperado…, Si el texto de un chunk contiene un patron de inyeccion reconocible, se…, sanitize_chunk_text(), drop_named_disease_causes(), names_specific_disease(), _normalize(), Red determinista para `posibles_causas` (2026-10-04). CLAUDE.md seccion 2…, Devuelve la lista sin las causas que nombran una enfermedad. Si no es una… (+34 more)

### Community 20 - "routes_auth.py"
Cohesion: 0.14
Nodes (22): login(), logout(), me(), get, post, Response, Capa de API/Gateway para autenticación. Igual que routes_triage.py, esta es la…, El logout manual es el unico mecanismo real de cierre de sesion en este… (+14 more)

### Community 21 - "SOLID e Interfaz ModelProvider"
Cohesion: 0.25
Nodes (8): ModelProvider como interfaz, no función suelta (Dependency Inversion), backend/ (FastAPI, monolito modular por capas), Interfaz ModelProvider (backend/app/providers/base.py), Aplicación de SOLID en el monolito modular por capas, Decisión 3: monolito modular por capas, no SOUP ni microservicios, ModelProvider como interfaz (Dependency Inversion), Aplicación de SOLID en TriageValidator/ValidationRule, evals/validate_triage_output.py refactorizado a clases SOLID

### Community 22 - "PLAN_IMPLEMENTACION.md — roadmap de 14 sesiones"
Cohesion: 0.16
Nodes (20): PANTALLAS.md — spec de pantallas, Pantalla Historial de consultas, Pantalla Login, Pantalla Perfil, Pantalla Revision humana, Rationale: alcance de Revision humana (visor, no cola real), Pantalla Signup, Pantalla Triage (+12 more)

### Community 24 - "Skill de Refactor de Archivos Grandes"
Cohesion: 0.67
Nodes (3): Umbral de 100 líneas para refactor, Sub-agente context-gatherer, Skill: refactor-large-files

### Community 26 - "test_client_ip.py"
Cohesion: 0.13
Nodes (24): client_ip(), Request, enforce_auth_rate_limit(), enforce_rate_limit(), Request, RateLimiter, Dependencia de FastAPI. `limiter` llega inyectado vía Depends(get_rate_limiter)…, Freno contra fuerza bruta en login/registro, por IP. Misma mecánica que… (+16 more)

### Community 28 - "TriageOrchestrator"
Cohesion: 0.06
Nodes (52): KnowledgeRetriever, Motor de recuperacion local tipo BM25 (Sesion 7) para la base de conocimiento…, Hasta top_k chunks relevantes, o lista vacia si nada matchea. Una consulta sin…, Indice BM25 en memoria sobre una lista de KnowledgeChunk., RetrievedChunk, tokenize(), KnowledgeChunk, Corpus curado para RAG (Sesion 7). Cada entrada es una fuente de salud publica… (+44 more)

### Community 29 - "test_triage_history.py"
Cohesion: 0.20
Nodes (13): client_with_output(), model_output(), Si el validador rechazó la salida del modelo, el usuario vio el fallback seguro…, Mismo patron que test_api.py (sin importarlo directo: el proyecto no tiene…, Decisión de producto (Sesión 10/11): se puede consultar sin cuenta., Filtrado real en SQL (WHERE user_id), no un chequeo de UI — un usuario nunca…, StubOrchestrator, test_anonymous_triage_stores_no_content_and_no_user() (+5 more)

### Community 30 - "EvidenceStore"
Cohesion: 0.17
Nodes (6): EvidenceStore, Exception, Capa de evidencia — cada request/response/veredicto de validación queda como…, Derecho al olvido desde la pantalla de Perfil — borra todas las filas del…, Todas las filas de evidencia, más nuevas primero. A propósito NO filtra acá qué…, Historial de un usuario, mas reciente primero — filtrado en SQL (`WHERE user_id…

### Community 31 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 32 - "get_settings"
Cohesion: 0.17
Nodes (20): get_triage_orchestrator(), get_settings(), NvidiaProvider, Unico lugar donde se traduce la config a un proveedor: backend y scripts de…, _capture_request(), parametrize, El modelo y el modo de razonamiento salen de la config (NVIDIA dio de baja…, nemotron-3-ultra responde 400 si llega `reasoning_budget`. (+12 more)

### Community 33 - "validate_triage_output"
Cohesion: 0.08
Nodes (53): build_provider_error_fallback(), build_safe_fallback(), Respuestas deterministas para cuando no se puede confiar en el modelo — ni en…, Sesion 6, gate de salida del mentor (MAKERS_ACCEPTANCE.md): "ningún fallo del…, _good_run(), La lógica de umbrales del gate de evals, sin llamar al modelo real., test_accuracy_below_threshold_fails(), test_any_emergency_false_negative_fails_even_with_high_accuracy() (+45 more)

### Community 35 - "ProfilePage.tsx"
Cohesion: 0.17
Nodes (26): applyPreferences(), clearAllPreferences(), FontScale, KEYS, loadAlias(), loadCountry(), loadFontScale(), loadReduceMotion() (+18 more)

### Community 36 - "HistoryPage.tsx"
Cohesion: 0.12
Nodes (22): deleteTriageHistory(), getTriageHistory(), requestTriage(), TriageApiError, HistoryEntry, Priority, ValidationSummary, getPriorityMeta() (+14 more)

### Community 37 - "HomePage.tsx"
Cohesion: 0.22
Nodes (8): Duration, DURATIONS, HomePage(), handleSubmit(), submit(), PILLARS, QUICK_FILLS, STEPS

### Community 39 - "routes_triage.py"
Cohesion: 0.09
Nodes (35): create_triage(), delete_triage_history(), get_triage_history(), _history_entry_from_row(), get, post, Capa de API/Gateway. Esta es la unica capa que sabe de HTTP — recibe el…, HistoryEntry (+27 more)

### Community 41 - "UserStore"
Cohesion: 0.22
Nodes (11): get_current_user(), Devuelve el usuario autenticado si la cookie de sesion es valida, o None si no…, Capa de acceso a la tabla `users`. No sabe de HTTP ni de hashing de contraseñas…, User, UserStore, Automatiza la prueba manual de la Sesión 4 (CONSTRAINTS.md, fila "Escalabilidad…, Sesión expirada (flujo de la Sesión 12): get_valid la rechaza y la borra, en…, _second_instance() (+3 more)

### Community 43 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, @base-ui/react, class-variance-authority, cn, lucide-react, react, react-dom, react-router-dom (+4 more)

### Community 44 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, @axe-core/playwright, jsdom, oxlint, @playwright/test, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event (+8 more)

### Community 45 - "button.tsx"
Cohesion: 0.33
Nodes (5): Button(), buttonVariants, @base-ui/react, class-variance-authority, cn

### Community 46 - "vite.config.js"
Cohesion: 0.28
Nodes (7): dirname, dirname, ref_node_path, ref_node_url, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 47 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, lint, preview, test, test:coverage, test:e2e (+1 more)

### Community 48 - "migrate_sqlite_to_postgres.py"
Cohesion: 0.07
Nodes (34): env.py de Alembic — sin modelos ORM a proposito (mismo criterio que…, DDL del esquema, en una sola lista de sentencias — una única fuente de verdad…, _is_flagged(), main(), list_flagged_for_review.py Esto NO es una cola de revisión ni un sistema de…, main(), migrate_evidence(), migrate_sessions() (+26 more)

### Community 50 - "Database"
Cohesion: 0.20
Nodes (4): Database, Solo para tests: borra el schema completo (CASCADE) al terminar, para no dejar…, Una conexión que de verdad responde. Neon (despliegue) suspende la base tras…, RealDictRow

### Community 51 - "test_provider_errors.py"
Cohesion: 0.12
Nodes (18): ModelProvider, ModelProviderError, ABC, Capa de modelo — la interfaz que resuelve el pendiente de DECISION_LOG.md…, El proveedor no pudo devolver un JSON usable (timeout, respuesta invalida,…, Envia system_prompt + payload al modelo y devuelve el JSON ya parseado. Debe…, Implementacion de ModelProvider para los modelos de NVIDIA, via el SDK de…, _client_with_failing_provider() (+10 more)

### Community 52 - "AuthPage.tsx"
Cohesion: 0.36
Nodes (8): GoogleIcon(), AuthPage(), comingSoon(), Field(), Mode, modeFromPath(), passwordStrength(), TabLink()

### Community 53 - "db.py"
Cohesion: 0.19
Nodes (11): Conexion a Postgres (Sesion 4 — reemplaza el SQLite de las sesiones anteriores,…, _kill_backends(), Reconexión del pool (despliegue en Neon): la base suspende tras unos minutos…, Termina las conexiones del pool de ese schema, como haría Neon al suspender., Dentro de la ventana no se prueba la conexión (sería un viaje de red extra en…, test_query_survives_connections_closed_by_the_server(), test_recently_used_connections_skip_the_ping_and_the_pool_recovers(), contextlib (+3 more)

### Community 54 - "fixtures.ts"
Cohesion: 0.23
Nodes (13): PUBLIC_PAGES, expectNoHorizontalOverflow(), expectNoSeriousA11yViolations(), mockTriage(), Priority, signupViaApi(), signupViaUi(), submitSymptoms() (+5 more)

### Community 55 - "useSpeechDictation.ts"
Cohesion: 0.21
Nodes (7): getRecognitionCtor(), RecognitionCtor, RecognitionResultEvent, SpeechRecognitionLike, FakeRecognition, Listener, useSpeechDictation()

### Community 56 - "rules"
Cohesion: 0.14
Nodes (13): categories, correctness, suspicious, ignorePatterns, plugins, rules, import/no-unassigned-import, jsx-a11y/label-has-associated-control (+5 more)

### Community 57 - "dependencies.py"
Cohesion: 0.23
Nodes (11): _ensure_admin_seeded(), get_db(), get_evidence_store(), get_session_store(), get_user_store(), Redis, Wiring de dependencias — el unico lugar del backend donde se decide QUE…, Crea la cuenta admin de arranque si todavia no existe. La contraseña sale de… (+3 more)

### Community 59 - "Diseño visual de Stitch — cómo se implementó y qué queda pendiente"
Cohesion: 0.29
Nodes (7): Backlog — funcionalidad que el diseño trae y todavía no existe, Copy que se reescribió (y por qué), Cómo se portó (para quien toque el frontend después), Desvío deliberado del diseño: "Lo que identificamos" y "Qué podría estar pasando" (2026-10-04), Diseño visual de Stitch — cómo se implementó y qué queda pendiente, Dónde consultar el diseño original, Pendiente de verificar

### Community 60 - "Backend service (compose.yml)"
Cohesion: 0.40
Nodes (6): Backend service (compose.yml), Frontend service (compose.yml), Gateway service (compose.yml), Postgres service (compose.yml), Rationale: Postgres publicado en 5433 no 5432, Redis service (compose.yml)

### Community 61 - "routes_health.py"
Cohesion: 0.24
Nodes (11): api_route, _check_postgres(), _check_redis(), liveness(), /health vs /ready — a propósito NO viven bajo /api (ver DECISION_TABLE.md, nota…, readiness(), Database, get (+3 more)

### Community 64 - "test_csrf.py"
Cohesion: 0.14
Nodes (9): Tests del CSRFOriginCheckMiddleware — verificacion de origen para metodos que…, Un cliente que no es navegador (curl, un test, un futuro cliente movil) no…, Simula "Try it out" en /docs: el Origin es el propio backend, no está en…, Algunos navegadores viejos no mandan Origin en same-origin POST, pero sí…, El frontend usa GET, POST y DELETE (borrar historial). Si un método no está en…, test_cors_preflight_allows_every_method_the_frontend_uses(), test_post_falls_back_to_referer_when_origin_missing(), test_post_from_backends_own_origin_is_allowed() (+1 more)

### Community 65 - "rate_limit.py"
Cohesion: 0.10
Nodes (21): IP real del cliente detrás de proxies, para los frenos de tasa. Sin esto,…, get_redis_client(), get_auth_rate_limiter(), get_rate_limiter(), Redis, Rate limiting. Desde la Sesión 4, la implementación real es `RedisRateLimiter`…, Ventana deslizante real, compartida entre cualquier número de…, RedisRateLimiter (+13 more)

### Community 68 - "Despliegue gratuito: Vercel + Render + Neon"
Cohesion: 0.18
Nodes (11): Antes de empezar, Cómo queda armado, Despliegue gratuito: Vercel + Render + Neon, Paso 1 — Neon: la base de datos, Paso 2 — Render: backend y Redis, Paso 3 — Vercel: el frontend, Paso 4 — Conectar las dos puntas, Paso 5 — Prueba de humo (no lo des por desplegado sin esto) (+3 more)

### Community 70 - "test_gateway.py"
Cohesion: 0.13
Nodes (5): Tests de la capa de gateway agregada en la Sesion 3: versionado (/api/v1 vs…, UptimeRobot (plan gratuito) pide con HEAD: antes recibía 405 y marcaba el…, test_health_answers_head_requests_for_external_monitors(), test_ready_reports_not_ready_when_postgres_fails(), test_ready_reports_not_ready_when_redis_fails()

### Community 72 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 81 - "test_security_headers.py"
Cohesion: 0.33
Nodes (4): _csp_directives(), Tests de SecurityHeadersMiddleware — ver backend/app/api/security_headers.py., script-src 'self' https://x" -> {"script-src": ["'self'", "https://x"]}. Se…, test_docs_response_has_permissive_csp_for_swagger_assets()

## Knowledge Gaps
- **195 isolated node(s):** `Cómo queda armado`, `Antes de empezar`, `Paso 1 — Neon: la base de datos`, `Paso 2 — Render: backend y Redis`, `Paso 3 — Vercel: el frontend` (+190 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 507 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Decisión 4: alcance honesto de requiere_revision` connect `backend/README.md` to `migrate_sqlite_to_postgres.py`?**
  _High betweenness centrality (0.372) - this node is a cross-community bridge._
- **Why does `Diseño visual de Stitch — cómo se implementó y qué queda pendiente` connect `Diseño visual de Stitch — cómo se implementó y qué queda pendiente` to `ResultPage.tsx`, `backend/README.md`?**
  _High betweenness centrality (0.311) - this node is a cross-community bridge._
- **Why does `Mapeo pantalla de Stitch → ruta` connect `ResultPage.tsx` to `Diseño visual de Stitch — cómo se implementó y qué queda pendiente`?**
  _High betweenness centrality (0.308) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `Database` (e.g. with `_ensure_admin_seeded()` and `get_db()`) actually correct?**
  _`Database` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `EvidenceStore` (e.g. with `get_evidence_store()` and `create_triage()`) actually correct?**
  _`EvidenceStore` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `TriageOrchestrator` (e.g. with `get_triage_orchestrator()` and `create_triage()`) actually correct?**
  _`TriageOrchestrator` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Cómo queda armado`, `Antes de empezar`, `Paso 1 — Neon: la base de datos` to the rest of the system?**
  _195 weakly-connected nodes found - possible documentation gaps or missing edges._
# Graph Report - HealthGuideAI  (2026-10-02)

## Corpus Check
- 151 files · ~208,064 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: (none) 8, .csv 4, .example 2)

## Summary
- 1177 nodes · 2402 edges · 76 communities (58 shown, 18 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 95 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ebbcbcef`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_api.py
- SessionStore
- authApi.ts
- triage_rules.py
- test_triage_orchestrator.py
- package.json
- csrf.py
- results.md — Resultados de evals
- test_gateway.py
- PageShell
- run_adversarial_suite.py
- Reporte del set adversarial (Sesión 8 — blindaje contra prompt injection)
- Capas del Diagrama de Arquitectura
- test_auth.py
- DECISION_TABLE.md — Gemini vs NVIDIA
- CLAUDE.md — contexto del proyecto HealthGuideAI
- compilerOptions
- CONSTRAINTS.md — nivel de calidad exigido
- AuthContext.tsx
- triage_orchestrator.py
- backend/README.md
- SOLID e Interfaz ModelProvider
- PLAN_IMPLEMENTACION.md — roadmap de 14 sesiones
- Design System del Frontend
- Skill de Refactor de Archivos Grandes
- Docker Entrypoint
- KnowledgeRetriever
- get_settings
- evidence_store.py
- components.json
- ModelProviderError
- validate_triage_output
- ProfilePage.tsx
- HistoryPage.tsx
- ProtocolPage.tsx
- HomePage.tsx
- routes_triage.py
- routes_auth.py
- Database
- dependencies
- devDependencies
- button.tsx
- vite.config.js
- scripts
- test_triage_history.py
- Exception
- dependencies.py
- Response
- App.tsx
- main.py
- fixtures.ts
- useSpeechDictation.ts
- rules
- test_provider_errors.py
- ServerErrorPage.tsx
- Diseño visual de Stitch — cómo se implementó y qué queda pendiente
- Backend service (compose.yml)
- test_csrf.py
- config.py
- retrieval.py
- AccessLogMiddleware
- Redis
- Request
- get
- post
- User
- routes_health.py
- ABC
- SecurityHeadersMiddleware
- fastapi_testclient
- Gate de evals — NO PASA
- .__init__

## God Nodes (most connected - your core abstractions)
1. `get_settings()` - 33 edges
2. `Database` - 31 edges
3. `validate_triage_output()` - 29 edges
4. `useAuth()` - 25 edges
5. `ProfilePage()` - 25 edges
6. `KnowledgeRetriever` - 24 edges
7. `EvidenceStore` - 24 edges
8. `UserStore` - 24 edges
9. `TriageOrchestrator` - 23 edges
10. `Diagrama de Arquitectura — HealthGuideAI` - 20 edges

## Surprising Connections (you probably didn't know these)
- `Known failures: medicación filtrada, omisión de prioridad, subestimación` --semantically_similar_to--> `DECISION_TABLE.md — Gemini vs NVIDIA`  [INFERRED] [semantically similar]
  README.md → DECISION_TABLE.md
- `Rationale: ningun fallo del proveedor puede omitir revision humana` --semantically_similar_to--> `pitch/index.html — deck de pitch Demo Day`  [INFERRED] [semantically similar]
  docs/PLAN_IMPLEMENTACION.md → pitch/index.html
- `Mapeo pantalla de Stitch → ruta` --references--> `EmergencyPanel()`  [INFERRED]
  docs/DESIGN_STITCH.md → frontend/src/components/triage/EmergencyPanel.tsx
- `Mapeo pantalla de Stitch → ruta` --references--> `OfflinePanel()`  [INFERRED]
  docs/DESIGN_STITCH.md → frontend/src/components/triage/OfflinePanel.tsx
- `Mapeo pantalla de Stitch → ruta` --references--> `VagueInputPanel()`  [INFERRED]
  docs/DESIGN_STITCH.md → frontend/src/components/triage/VagueInputPanel.tsx

## Import Cycles
- 3-file cycle: `backend/app/orchestration/__init__.py -> backend/app/orchestration/triage_orchestrator.py -> backend/app/orchestration/prompt_builder.py -> backend/app/orchestration/__init__.py`

## Hyperedges (group relationships)
- **Gate de calidad en CI antes de mergear a main** — github_workflows_ci_ci, constraints_enforced_table, backend_requirements_dev_pkg, readme_ci_cd_section [INFERRED 0.75]
- **Narrativa de producto del pitch: arquitectura, evals y roadmap** — pitch_index_html, evals_results, docs_arquitectura_capas_propuestas, docs_plan_implementacion_roadmap [INFERRED 0.80]
- **Escalabilidad horizontal con Postgres + Redis (Sesion 4)** — compose_postgres, compose_redis, compose_backend, docs_plan_implementacion_sesion4 [INFERRED 0.85]
- **Evidencia del motor de triage hibrido: fix pediatrico + ground truth clinico** — docs_plan_implementacion_sesion6, evals_results_pediatric_fever_fix, evals_clinical_safety_catalog, evals_priority_accuracy_report [INFERRED 0.85]
- **Evidencia consolidada de la decisión NVIDIA vs Gemini** — decision_log_decision1_nvidia_vs_gemini, decision_table_doc, readme_known_failures, claude_md_notebook_gemini [INFERRED 0.85]
- **Flujo compartido de validación de seguridad del triage (notebook + backend + evals)** — claude_md_output_contract, decision_log_validate_triage_output, backend_readme_doc, constraints_enforced_table [INFERRED 0.85]

## Communities (76 total, 18 thin omitted)

### Community 0 - "test_api.py"
Cohesion: 0.15
Nodes (17): InMemoryRateLimiter, Ventana deslizante en memoria de un solo proceso — solo para tests, ver el…, client_with_output(), make_stub_user(), model_output(), extra='forbid' (Sesion 5) tambien en TriageRequest., Un usuario real en el schema de test, no un objeto armado a mano —…, StubOrchestrator (+9 more)

### Community 1 - "SessionStore"
Cohesion: 0.16
Nodes (13): Database, Capa de acceso a la tabla `sessions`. Sesiones respaldadas por servidor (no JWT…, Session, SessionStore, Automatiza la prueba manual de la Sesión 4 (CONSTRAINTS.md, fila "Escalabilidad…, Sesión expirada (flujo de la Sesión 12): get_valid la rechaza y la borra, en…, _second_instance(), test_expired_session_is_rejected_and_purged() (+5 more)

### Community 2 - "authApi.ts"
Cohesion: 0.29
Nodes (10): AuthApiError, authRequest(), AuthRequestOptions, getCurrentUser(), login(), logout(), signup(), AuthProvider() (+2 more)

### Community 3 - "triage_rules.py"
Cohesion: 0.07
Nodes (47): ABC, 4. Configurador de Prompt, HealthGuideAI - Diagrama de Arquitectura (v2), Disclaimer: no diagnostica, no prescribe, no reemplaza a un profesional, Evaluacion y Auditoria, 2. Interfaz de Usuario, 5. Modelo LLM NVIDIA (nemotron-3-super:122b), 3. Orquestador de Triage (+39 more)

### Community 4 - "test_triage_orchestrator.py"
Cohesion: 0.17
Nodes (23): TriageOrchestrator, base_output(), FakeProvider, Tests del motor hibrido (Sesion 6): red flags deterministas antes y despues de…, El gate de salida del mentor: un fallo del proveedor con un red flag ya…, Sesion 7: un input que matchea una fuente curada (dolor de pecho) tiene que…, Un input sin relacion con el corpus no debe forzar contexto — el RAG amplia, no…, Sesion 8: un chunk de conocimiento "envenenado" (como si una fuente externa… (+15 more)

### Community 5 - "package.json"
Cohesion: 0.11
Nodes (17): name, private, type, version, jsdom, lucide-react, oxlint, react-dom (+9 more)

### Community 6 - "csrf.py"
Cohesion: 0.14
Nodes (14): CSRFOriginCheckMiddleware, _origin_from_referer(), ASGIApp, BaseHTTPMiddleware, Request, CSRF (Sesion 5) via verificacion de origen, no double-submit token. La auth ya…, Middleware de gateway: request ID y logging de acceso estructurado. Orden de…, Headers de seguridad (Sesion 5) — defensa en profundidad para el navegador,… (+6 more)

### Community 7 - "results.md — Resultados de evals"
Cohesion: 0.14
Nodes (23): Arquitectura por capas propuesta (canal/API/orquestacion/modelo/validacion/evidencia/escalamiento), arquitectura.md — Arquitectura HealthGuideAI, Flujo actual del notebook (diagrama), Frontera IA vs software vs humano, Rationale: modelo como capa intercambiable, Rationale: ningun fallo del proveedor puede omitir revision humana, Feedback de mentoria: 6 gates de aceptacion (Emmanuel, makers/review), Sesion 6 — Motor de triage hibrido: reglas + rubrica + few-shot (+15 more)

### Community 8 - "test_gateway.py"
Cohesion: 0.15
Nodes (3): Tests de la capa de gateway agregada en la Sesion 3: versionado (/api/v1 vs…, test_ready_reports_not_ready_when_postgres_fails(), test_ready_reports_not_ready_when_redis_fails()

### Community 9 - "PageShell"
Cohesion: 0.19
Nodes (10): PageShell(), SiteFooter(), MobileTabBar(), SiteHeader(), EmergencyStrip(), NotFoundPage(), Article(), RED_FLAGS (+2 more)

### Community 10 - "run_adversarial_suite.py"
Cohesion: 0.07
Nodes (39): app_orchestration_triage_orchestrator, app_providers_base, app_providers_nvidia_provider, app_validation_safe_response, env.py de Alembic — sin modelos ORM a proposito (mismo criterio que…, DDL del esquema, en una sola lista de sentencias — una única fuente de verdad…, _good_run(), La lógica de umbrales del gate de evals, sin llamar al modelo real. (+31 more)

### Community 12 - "Capas del Diagrama de Arquitectura"
Cohesion: 0.23
Nodes (21): Capa de Almacenamiento / Evidencia, Capa de API / Gateway, Capa de Canal, Capa de Modelo (intercambiable), Capa de Orquestación, Capa de Validación (dominio, sin LLM), contract (JTBD, output_fields, reglas del dominio), DECISION_LOG.md (+13 more)

### Community 13 - "test_auth.py"
Cohesion: 0.22
Nodes (14): client_with_fresh_db(), extra='forbid' (Sesion 5): un campo colado a mano (ej. "role": "admin") tiene…, Sesión 10/11: consultar no exige cuenta (decisión de producto); lo que sí la…, test_login_with_correct_credentials_succeeds(), test_login_with_wrong_password_returns_401(), test_logout_invalidates_session(), test_me_with_valid_session_returns_user(), test_me_without_session_returns_401() (+6 more)

### Community 14 - "DECISION_TABLE.md — Gemini vs NVIDIA"
Cohesion: 0.13
Nodes (18): Bug: validador dejaba pasar categorías genéricas de medicación (antitérmicos), HealthGuideAI_Gemini.ipynb (dado de baja), HealthGuideAI_Nvidia.ipynb, Decisión 1: proveedor de modelo NVIDIA nemotron vs Gemini, DECISION_TABLE.md — Gemini vs NVIDIA, Bug de contrato: Gemini generaba claves propias (prioridad_atencion), Hallazgo: no-determinismo estructural del JSON (thinking habilitado), Tabla de costo estimado NVIDIA (~$0.01/caso) (+10 more)

### Community 15 - "CLAUDE.md — contexto del proyecto HealthGuideAI"
Cohesion: 0.12
Nodes (17): AI flow: input → validaciones deterministas → LLM → JSON → revisión, Bug: login no aparecía por caché de Docker + fallo silencioso de npm ci, Bug: Postgres nativo en puerto 5432 chocaba con el de Docker, Bug: prioridad en minúscula tumbaba validación Pydantic, Bug: run_prototype reventaba con ValidationError de Pydantic, Bug: score de evaluación crítica en escala 0-100 en vez de 0-10, Sistema de evals (validate_triage_output), frontend/ (React 18 + Vite) (+9 more)

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
Cohesion: 0.07
Nodes (41): Sesion 8 (blindaje contra prompt injection): sanitiza el contenido recuperado…, Si el texto de un chunk contiene un patron de inyeccion reconocible, se…, sanitize_chunk_text(), El contrato de producto es estable — ya fue validado por el modelo en la Parte…, build_system_prompt(), _format_few_shot(), _format_rubric(), Arma SYSTEM_PROTOTYPE a partir del contrato — mismo texto base que construye… (+33 more)

### Community 20 - "backend/README.md"
Cohesion: 0.19
Nodes (12): API Gateway (Sesión 3): versionado /api/v1, /health, /ready, X-Request-ID, Revisión humana: flag registrado, no cola operativa, Estructura app/ por capas (api, orchestration, providers, validation, storage, schemas), Rate limiting con RedisRateLimiter (ventana deslizante), Decisión 2: canal web app + API ahora, WhatsApp fase 2, Decisión 4: alcance honesto de requiere_revision, CI Workflow, Permisos GITHUB_TOKEN restringidos a contents:read (+4 more)

### Community 21 - "SOLID e Interfaz ModelProvider"
Cohesion: 0.25
Nodes (8): ModelProvider como interfaz, no función suelta (Dependency Inversion), backend/ (FastAPI, monolito modular por capas), Interfaz ModelProvider (backend/app/providers/base.py), Aplicación de SOLID en el monolito modular por capas, Decisión 3: monolito modular por capas, no SOUP ni microservicios, ModelProvider como interfaz (Dependency Inversion), Aplicación de SOLID en TriageValidator/ValidationRule, evals/validate_triage_output.py refactorizado a clases SOLID

### Community 22 - "PLAN_IMPLEMENTACION.md — roadmap de 14 sesiones"
Cohesion: 0.16
Nodes (20): PANTALLAS.md — spec de pantallas, Pantalla Historial de consultas, Pantalla Login, Pantalla Perfil, Pantalla Revision humana, Rationale: alcance de Revision humana (visor, no cola real), Pantalla Signup, Pantalla Triage (+12 more)

### Community 24 - "Skill de Refactor de Archivos Grandes"
Cohesion: 0.67
Nodes (3): Umbral de 100 líneas para refactor, Sub-agente context-gatherer, Skill: refactor-large-files

### Community 28 - "KnowledgeRetriever"
Cohesion: 0.13
Nodes (18): KnowledgeRetriever, Indice BM25 en memoria sobre una lista de KnowledgeChunk., El input real llega sin tildes a veces — el match tiene que seguir funcionando., Una consulta sin relacion con el corpus no debe forzar contexto — el RAG…, test_empty_corpus_returns_empty(), test_retrieved_chunk_carries_source_for_citation(), test_search_is_accent_insensitive(), test_search_respects_top_k() (+10 more)

### Community 29 - "get_settings"
Cohesion: 0.10
Nodes (22): get_redis_client(), enforce_rate_limit(), get_rate_limiter(), RateLimiter, Rate limiting. Desde la Sesión 4, la implementación real es `RedisRateLimiter`…, Dependencia de FastAPI. `limiter` llega inyectado vía Depends(get_rate_limiter)…, Interfaz chica a propósito (Interface Segregation, CLAUDE.md sección 13): lo…, Ventana deslizante real, compartida entre cualquier número de… (+14 more)

### Community 30 - "evidence_store.py"
Cohesion: 0.25
Nodes (6): Conexion a Postgres (Sesion 4 — reemplaza el SQLite de las sesiones anteriores,…, Capa de evidencia — cada request/response/veredicto de validación queda como…, contextlib, psycopg2, psycopg2_extras, psycopg2_pool

### Community 31 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 32 - "ModelProviderError"
Cohesion: 0.15
Nodes (12): ModelProvider, ModelProviderError, ABC, Capa de modelo — la interfaz que resuelve el pendiente de DECISION_LOG.md…, El proveedor no pudo devolver un JSON usable (timeout, respuesta invalida,…, Envia system_prompt + payload al modelo y devuelve el JSON ya parseado. Debe…, NvidiaProvider, Implementacion de ModelProvider para NVIDIA nemotron-3-super-120b-a12b, via el… (+4 more)

### Community 33 - "validate_triage_output"
Cohesion: 0.11
Nodes (32): Any, build_provider_error_fallback(), build_safe_fallback(), Respuestas deterministas para cuando no se puede confiar en el modelo — ni en…, Sesion 6, gate de salida del mentor (MAKERS_ACCEPTANCE.md): "ningún fallo del…, Sesion 8: hallazgo real corriendo el set adversarial contra NVIDIA —…, El caso real que expuso el bug: un input que pide dosis de medicamento no debe…, test_provider_error_fallback_always_passes_its_own_validator() (+24 more)

### Community 35 - "ProfilePage.tsx"
Cohesion: 0.16
Nodes (29): deleteTriageHistory(), applyPreferences(), clearAllPreferences(), FontScale, KEYS, loadAlias(), loadCountry(), loadFontScale() (+21 more)

### Community 36 - "HistoryPage.tsx"
Cohesion: 0.11
Nodes (27): getTriageHistory(), requestTriage(), TriageApiError, HistoryEntry, Priority, TriageResponse, ValidationSummary, getPriorityMeta() (+19 more)

### Community 37 - "ProtocolPage.tsx"
Cohesion: 0.15
Nodes (13): Mapeo pantalla de Stitch → ruta, EmergencyPanel(), EmergencyPanelProps, IMMEDIATE_ACTIONS, OfflinePanel(), OfflinePanelProps, QUICK_ADDS, VagueInputPanel() (+5 more)

### Community 38 - "HomePage.tsx"
Cohesion: 0.22
Nodes (8): Duration, DURATIONS, HomePage(), handleSubmit(), submit(), PILLARS, QUICK_FILLS, STEPS

### Community 39 - "routes_triage.py"
Cohesion: 0.06
Nodes (40): require_authenticated(), create_triage(), delete_triage_history(), get_triage_history(), _history_entry_from_row(), Capa de API/Gateway. Esta es la unica capa que sabe de HTTP — recibe el…, HistoryEntry, BaseModel (+32 more)

### Community 40 - "routes_auth.py"
Cohesion: 0.14
Nodes (23): login(), logout(), me(), get, post, User, Capa de API/Gateway para autenticación. Igual que routes_triage.py, esta es la…, El logout manual es el unico mecanismo real de cierre de sesion en este… (+15 more)

### Community 41 - "Database"
Cohesion: 0.16
Nodes (12): Database, Solo para tests: borra el schema completo (CASCADE) al terminar, para no dejar…, main(), migrate_evidence(), migrate_sessions(), migrate_users(), migrate_sqlite_to_postgres.py Traslada los datos que hayan quedado en el…, _sha256() (+4 more)

### Community 43 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, @base-ui/react, class-variance-authority, cn, lucide-react, react, react-dom, react-router-dom (+5 more)

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

### Community 48 - "test_triage_history.py"
Cohesion: 0.20
Nodes (13): client_with_output(), model_output(), Si el validador rechazó la salida del modelo, el usuario vio el fallback seguro…, Mismo patron que test_api.py (sin importarlo directo: el proyecto no tiene…, Decisión de producto (Sesión 10/11): se puede consultar sin cuenta., Filtrado real en SQL (WHERE user_id), no un chequeo de UI — un usuario nunca…, StubOrchestrator, test_anonymous_triage_stores_no_content_and_no_user() (+5 more)

### Community 50 - "dependencies.py"
Cohesion: 0.17
Nodes (17): _ensure_admin_seeded(), get_current_user(), get_db(), get_evidence_store(), get_session_store(), get_user_store(), Redis, Wiring de dependencias — el unico lugar del backend donde se decide QUE… (+9 more)

### Community 52 - "App.tsx"
Cohesion: 0.20
Nodes (13): App(), renderRoute(), GoogleIcon(), AuthPage(), comingSoon(), Field(), Mode, modeFromPath() (+5 more)

### Community 53 - "main.py"
Cohesion: 0.22
Nodes (13): _envelope(), install_error_handlers(), handle_http_exception(), handle_unexpected_error(), handle_validation_error(), Request, Sobre de error consistente para toda la API. Antes de esto, cada endpoint…, _request_id() (+5 more)

### Community 54 - "fixtures.ts"
Cohesion: 0.24
Nodes (12): PUBLIC_PAGES, expectNoHorizontalOverflow(), expectNoSeriousA11yViolations(), mockTriage(), Priority, signupViaUi(), submitSymptoms(), triageBody() (+4 more)

### Community 55 - "useSpeechDictation.ts"
Cohesion: 0.21
Nodes (7): getRecognitionCtor(), RecognitionCtor, RecognitionResultEvent, SpeechRecognitionLike, FakeRecognition, Listener, useSpeechDictation()

### Community 56 - "rules"
Cohesion: 0.14
Nodes (13): categories, correctness, suspicious, ignorePatterns, plugins, rules, import/no-unassigned-import, jsx-a11y/label-has-associated-control (+5 more)

### Community 57 - "test_provider_errors.py"
Cohesion: 0.21
Nodes (10): get_triage_orchestrator(), _client_with_failing_provider(), FailingOrchestrator, _provider_returning(), Fallos del proveedor (Sesión 12): qué ve el usuario cuando NVIDIA no responde o…, test_provider_failure_returns_honest_502_and_records_evidence(), test_provider_rejects_non_object_responses(), test_provider_strips_markdown_fence_and_records_usage() (+2 more)

### Community 58 - "ServerErrorPage.tsx"
Cohesion: 0.43
Nodes (6): checkReady(), ReadyStatus, ROOT_URL, ServerErrorPage(), check(), retry()

### Community 59 - "Diseño visual de Stitch — cómo se implementó y qué queda pendiente"
Cohesion: 0.29
Nodes (6): Backlog — funcionalidad que el diseño trae y todavía no existe, Copy que se reescribió (y por qué), Cómo se portó (para quien toque el frontend después), Diseño visual de Stitch — cómo se implementó y qué queda pendiente, Dónde consultar el diseño original, Pendiente de verificar

### Community 60 - "Backend service (compose.yml)"
Cohesion: 0.40
Nodes (6): Backend service (compose.yml), Frontend service (compose.yml), Gateway service (compose.yml), Postgres service (compose.yml), Rationale: Postgres publicado en 5433 no 5432, Redis service (compose.yml)

### Community 61 - "test_csrf.py"
Cohesion: 0.14
Nodes (9): Tests del CSRFOriginCheckMiddleware — verificacion de origen para metodos que…, Un cliente que no es navegador (curl, un test, un futuro cliente movil) no…, Simula "Try it out" en /docs: el Origin es el propio backend, no está en…, Algunos navegadores viejos no mandan Origin en same-origin POST, pero sí…, El frontend usa GET, POST y DELETE (borrar historial). Si un método no está en…, test_cors_preflight_allows_every_method_the_frontend_uses(), test_post_falls_back_to_referer_when_origin_missing(), test_post_from_backends_own_origin_is_allowed() (+1 more)

### Community 62 - "config.py"
Cohesion: 0.29
Nodes (12): Configuracion del backend. Todo lo que depende del entorno (keys, orígenes…, Guard de arranque (Sesion 5): si esto no revienta ahora, revienta en produccion…, Settings, validate_production_config(), Tests del guard de arranque (Sesion 5) — backend/app/config.py,…, Hallazgo de la auditoria cyber-neo (Sesion 5): database_url tenia el mismo…, test_development_with_default_admin_password_is_allowed(), test_production_with_default_admin_password_fails_loudly() (+4 more)

### Community 63 - "retrieval.py"
Cohesion: 0.18
Nodes (10): Motor de recuperacion local tipo BM25 (Sesion 7) para la base de conocimiento…, Hasta top_k chunks relevantes, o lista vacia si nada matchea. Una consulta sin…, RetrievedChunk, tokenize(), KnowledgeChunk, Corpus curado para RAG (Sesion 7). Cada entrada es una fuente de salud publica…, collections_abc, dataclasses (+2 more)

### Community 64 - "AccessLogMiddleware"
Cohesion: 0.24
Nodes (7): AccessLogMiddleware, ASGIApp, BaseHTTPMiddleware, Request, Asigna un request_id (o respeta el que mande un proxy delante nuestro, ej. el…, Una línea por request, sin datos sensibles: quién (método+ruta), qué pasó…, RequestIdMiddleware

### Community 70 - "routes_health.py"
Cohesion: 0.36
Nodes (8): _check_postgres(), _check_redis(), liveness(), get, Redis, Response, /health vs /ready — a propósito NO viven bajo /api (ver DECISION_TABLE.md, nota…, readiness()

### Community 72 - "SecurityHeadersMiddleware"
Cohesion: 0.33
Nodes (4): ASGIApp, BaseHTTPMiddleware, Request, SecurityHeadersMiddleware

## Knowledge Gaps
- **177 isolated node(s):** `Umbrales incumplidos`, `AuthStatus`, `AuthRequestOptions`, `Tab`, `ValidationSummary` (+172 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 460 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Decisión 4: alcance honesto de requiere_revision` connect `backend/README.md` to `routes_triage.py`?**
  _High betweenness centrality (0.403) - this node is a cross-community bridge._
- **Why does `Diseño visual de Stitch — cómo se implementó y qué queda pendiente` connect `Diseño visual de Stitch — cómo se implementó y qué queda pendiente` to `ProtocolPage.tsx`?**
  _High betweenness centrality (0.343) - this node is a cross-community bridge._
- **Why does `Mapeo pantalla de Stitch → ruta` connect `ProtocolPage.tsx` to `Diseño visual de Stitch — cómo se implementó y qué queda pendiente`?**
  _High betweenness centrality (0.340) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `get_settings()` (e.g. with `main()` and `main()`) actually correct?**
  _`get_settings()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `Database` (e.g. with `_ensure_admin_seeded()` and `get_db()`) actually correct?**
  _`Database` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `useAuth()` (e.g. with `renderRoute()` and `setAuth()`) actually correct?**
  _`useAuth()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Umbrales incumplidos`, `AuthStatus`, `AuthRequestOptions` to the rest of the system?**
  _177 weakly-connected nodes found - possible documentation gaps or missing edges._
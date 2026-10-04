# Graph Report - HealthGuideAI  (2026-10-04)

## Corpus Check
- 158 files · ~212,775 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: (none) 8, .csv 4, .example 2)

## Summary
- 1254 nodes · 2576 edges · 85 communities (61 shown, 24 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 78 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f865ec3d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_api.py
- test_auth.py
- authApi.ts
- triage_rules.py
- test_triage_orchestrator.py
- package.json
- main.py
- results.md — Resultados de evals
- ResultPage.tsx
- PageShell
- test_nvidia_provider_config.py
- Reporte del set adversarial (Sesión 8 — blindaje contra prompt injection)
- Capas del Diagrama de Arquitectura
- sanitize_chunk_text
- DECISION_TABLE.md — Gemini vs NVIDIA
- CLAUDE.md — contexto del proyecto HealthGuideAI
- compilerOptions
- backend/README.md
- AuthContext.tsx
- test_prompt_builder.py
- routes_auth.py
- SOLID e Interfaz ModelProvider
- PLAN_IMPLEMENTACION.md — roadmap de 14 sesiones
- Design System del Frontend
- Skill de Refactor de Archivos Grandes
- Docker Entrypoint
- KnowledgeRetriever
- test_triage_history.py
- EvidenceStore
- components.json
- nvidia_provider.py
- validate_triage_output
- ProfilePage.tsx
- HistoryPage.tsx
- ProtocolPage.tsx
- HomePage.tsx
- routes_triage.py
- get
- Database
- dependencies
- devDependencies
- button.tsx
- vite.config.js
- scripts
- eval_gate.py
- Exception
- HealthGuideAI - Diagrama de Arquitectura (v2)
- Response
- App.tsx
- post
- fixtures.ts
- useSpeechDictation.ts
- rules
- dependencies.py
- app_providers_nvidia_provider
- Diseño visual de Stitch — cómo se implementó y qué queda pendiente
- Backend service (compose.yml)
- User
- Redis
- errors.py
- test_csrf.py
- Redis
- Request
- get
- post
- User
- test_gateway.py
- ABC
- AccessLogMiddleware
- Settings
- Gate de evals — PASA
- RateLimiter
- triage_orchestrator.py
- CSRFOriginCheckMiddleware
- SecurityHeadersMiddleware
- .__init__
- _provider_returning
- test_security_headers.py
- .record_provider_error
- Exception
- cause_filter.py

## God Nodes (most connected - your core abstractions)
1. `get_settings()` - 38 edges
2. `Database` - 29 edges
3. `validate_triage_output()` - 29 edges
4. `ProfilePage()` - 26 edges
5. `EvidenceStore` - 25 edges
6. `useAuth()` - 25 edges
7. `KnowledgeRetriever` - 22 edges
8. `UserStore` - 22 edges
9. `Settings` - 21 edges
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

## Communities (85 total, 24 thin omitted)

### Community 0 - "test_api.py"
Cohesion: 0.11
Nodes (24): InMemoryRateLimiter, Ventana deslizante en memoria de un solo proceso — solo para tests, ver el…, client_with_output(), make_stub_user(), model_output(), extra='forbid' (Sesion 5) tambien en TriageRequest., Un usuario real en el schema de test, no un objeto armado a mano —…, StubOrchestrator (+16 more)

### Community 1 - "test_auth.py"
Cohesion: 0.10
Nodes (26): Database, Capa de acceso a la tabla `sessions`. Sesiones respaldadas por servidor (no JWT…, Session, SessionStore, client_with_fresh_db(), extra='forbid' (Sesion 5): un campo colado a mano (ej. "role": "admin") tiene…, Sesión 10/11: consultar no exige cuenta (decisión de producto); lo que sí la…, test_login_with_correct_credentials_succeeds() (+18 more)

### Community 2 - "authApi.ts"
Cohesion: 0.32
Nodes (8): AuthApiError, authRequest(), AuthRequestOptions, getCurrentUser(), login(), logout(), signup(), handleAuth()

### Community 3 - "triage_rules.py"
Cohesion: 0.06
Nodes (49): ABC, detect_red_flags(), Capa determinista de red flags (Sesion 6) — corre ANTES de llamar al modelo,…, Señales de alarma detectadas en el texto del usuario (lista vacía si ninguna)., El input real puede venir sin tildes — el chequeo tiene que matchear igual., No dos formas de detectar red flags que se puedan desincronizar — entrada (este…, Hallazgo real de la Sesion 6: 'red_flag_fiebre_bebe' clasificaba ALTA en vez de…, No todo lo que menciona fiebre es un red flag — sin la combinacion con edad de… (+41 more)

### Community 4 - "test_triage_orchestrator.py"
Cohesion: 0.15
Nodes (27): KnowledgeChunk, TriageOrchestrator, base_output(), FakeProvider, ModelProvider, Tests del motor hibrido (Sesion 6): red flags deterministas antes y despues de…, El gate de salida del mentor: un fallo del proveedor con un red flag ya…, Sesion 7: un input que matchea una fuente curada (dolor de pecho) tiene que… (+19 more)

### Community 5 - "package.json"
Cohesion: 0.11
Nodes (18): engines, node, name, private, type, version, jsdom, lucide-react (+10 more)

### Community 6 - "main.py"
Cohesion: 0.19
Nodes (11): _origin_from_referer(), CSRF (Sesion 5) via verificacion de origen, no double-submit token. La auth ya…, Middleware de gateway: request ID y logging de acceso estructurado. Orden de…, Headers de seguridad (Sesion 5) — defensa en profundidad para el navegador,…, Punto de entrada. Corre con: uvicorn app.main:app --reload --app-dir backend…, fastapi_middleware_cors, starlette_middleware_base, starlette_requests (+3 more)

### Community 7 - "results.md — Resultados de evals"
Cohesion: 0.14
Nodes (23): Arquitectura por capas propuesta (canal/API/orquestacion/modelo/validacion/evidencia/escalamiento), arquitectura.md — Arquitectura HealthGuideAI, Flujo actual del notebook (diagrama), Frontera IA vs software vs humano, Rationale: modelo como capa intercambiable, Rationale: ningun fallo del proveedor puede omitir revision humana, Feedback de mentoria: 6 gates de aceptacion (Emmanuel, makers/review), Sesion 6 — Motor de triage hibrido: reglas + rubrica + few-shot (+15 more)

### Community 8 - "ResultPage.tsx"
Cohesion: 0.21
Nodes (12): TriageResponse, GoogleIcon(), CauseParts, DISCLAIMER_SENTENCES, normalize(), splitCause(), splitRecommendation(), copy() (+4 more)

### Community 9 - "PageShell"
Cohesion: 0.20
Nodes (12): checkReady(), ReadyStatus, ROOT_URL, PageShell(), SiteFooter(), MobileTabBar(), SiteHeader(), EmergencyStrip() (+4 more)

### Community 10 - "test_nvidia_provider_config.py"
Cohesion: 0.16
Nodes (15): Unico lugar donde se traduce la config a un proveedor: backend y scripts de…, _capture_request(), El modelo y el modo de razonamiento salen de la config (NVIDIA dio de baja…, nemotron-3-ultra responde 400 si llega `reasoning_budget`., El contrato de salida es JSON: se le pide al endpoint en modo JSON en vez de…, Lightning con thinking devolvía contenido vacío, y sin modo JSON a veces texto…, test_blank_model_env_falls_back_to_default(), test_default_model_is_not_the_retired_one() (+7 more)

### Community 12 - "Capas del Diagrama de Arquitectura"
Cohesion: 0.23
Nodes (21): Capa de Almacenamiento / Evidencia, Capa de API / Gateway, Capa de Canal, Capa de Modelo (intercambiable), Capa de Orquestación, Capa de Validación (dominio, sin LLM), contract (JTBD, output_fields, reglas del dominio), DECISION_LOG.md (+13 more)

### Community 13 - "sanitize_chunk_text"
Cohesion: 0.29
Nodes (9): Sesion 8 (blindaje contra prompt injection): sanitiza el contenido recuperado…, Si el texto de un chunk contiene un patron de inyeccion reconocible, se…, sanitize_chunk_text(), test_clean_text_passes_through_unchanged(), test_redacts_text_with_bracketed_system_marker(), test_redacts_text_with_english_injection_pattern(), test_redacts_text_with_ignore_instructions_pattern(), test_redacts_text_with_you_are_now_pattern() (+1 more)

### Community 14 - "DECISION_TABLE.md — Gemini vs NVIDIA"
Cohesion: 0.10
Nodes (24): Bug: validador dejaba pasar categorías genéricas de medicación (antitérmicos), HealthGuideAI_Gemini.ipynb (dado de baja), HealthGuideAI_Nvidia.ipynb, Decisión 1: proveedor de modelo NVIDIA nemotron vs Gemini, DECISION_TABLE.md — Gemini vs NVIDIA, Bug de contrato: Gemini generaba claves propias (prioridad_atencion), Hallazgo: no-determinismo estructural del JSON (thinking habilitado), Tabla de costo estimado NVIDIA (~$0.01/caso) (+16 more)

### Community 15 - "CLAUDE.md — contexto del proyecto HealthGuideAI"
Cohesion: 0.12
Nodes (17): AI flow: input → validaciones deterministas → LLM → JSON → revisión, Bug: login no aparecía por caché de Docker + fallo silencioso de npm ci, Bug: Postgres nativo en puerto 5432 chocaba con el de Docker, Bug: prioridad en minúscula tumbaba validación Pydantic, Bug: run_prototype reventaba con ValidationError de Pydantic, Bug: score de evaluación crítica en escala 0-100 en vez de 0-10, Sistema de evals (validate_triage_output), frontend/ (React 18 + Vite) (+9 more)

### Community 16 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, allowJs, checkJs, isolatedModules, jsx, lib, module (+12 more)

### Community 17 - "backend/README.md"
Cohesion: 0.10
Nodes (25): Migraciones Alembic (SQL crudo desde app/storage/schema.py), API Gateway (Sesión 3): versionado /api/v1, /health, /ready, X-Request-ID, Seguridad de la aplicación (Sesión 5): guard de arranque, CSRF, headers, Auditoría cyber-neo del repo (Sesión 5): root en contenedor, DATABASE_URL default, Escalabilidad horizontal (Sesión 4): Postgres + Redis compartidos, Revisión humana: flag registrado, no cola operativa, Estructura app/ por capas (api, orchestration, providers, validation, storage, schemas), Rate limiting con RedisRateLimiter (ventana deslizante) (+17 more)

### Community 18 - "AuthContext.tsx"
Cohesion: 0.16
Nodes (22): User, renderRoute(), setAuth(), AuthContext, AuthContextValue, AuthProvider(), AuthStatus, wrapper() (+14 more)

### Community 19 - "test_prompt_builder.py"
Cohesion: 0.15
Nodes (15): build_system_prompt(), Tests de que la rúbrica, los ejemplos few-shot y el disclaimer reforzado…, No perder las reglas que ya funcionaban al agregar todo lo nuevo., Sesion 8: la jerarquia de instrucciones tiene que estar en el prompt y aparecer…, Sesion 7: el prompt tiene que explicar como usar y citar 'contexto_recuperado',…, 2026-10-03: el modelo de reemplazo contestaba lo minimo si no se le pedia…, Lavados con solucion salina' le enseñaba al modelo a nombrar productos., test_examples_do_not_suggest_pharmacy_products() (+7 more)

### Community 20 - "routes_auth.py"
Cohesion: 0.11
Nodes (28): get_current_user(), Devuelve el usuario autenticado si la cookie de sesion es valida, o None si no…, login(), logout(), me(), Capa de API/Gateway para autenticación. Igual que routes_triage.py, esta es la…, El logout manual es el unico mecanismo real de cierre de sesion en este…, _set_session_cookie() (+20 more)

### Community 21 - "SOLID e Interfaz ModelProvider"
Cohesion: 0.25
Nodes (8): ModelProvider como interfaz, no función suelta (Dependency Inversion), backend/ (FastAPI, monolito modular por capas), Interfaz ModelProvider (backend/app/providers/base.py), Aplicación de SOLID en el monolito modular por capas, Decisión 3: monolito modular por capas, no SOUP ni microservicios, ModelProvider como interfaz (Dependency Inversion), Aplicación de SOLID en TriageValidator/ValidationRule, evals/validate_triage_output.py refactorizado a clases SOLID

### Community 22 - "PLAN_IMPLEMENTACION.md — roadmap de 14 sesiones"
Cohesion: 0.15
Nodes (21): Redis service (compose.yml), PANTALLAS.md — spec de pantallas, Pantalla Historial de consultas, Pantalla Login, Pantalla Perfil, Pantalla Revision humana, Rationale: alcance de Revision humana (visor, no cola real), Pantalla Signup (+13 more)

### Community 24 - "Skill de Refactor de Archivos Grandes"
Cohesion: 0.67
Nodes (3): Umbral de 100 líneas para refactor, Sub-agente context-gatherer, Skill: refactor-large-files

### Community 28 - "KnowledgeRetriever"
Cohesion: 0.09
Nodes (26): KnowledgeRetriever, Motor de recuperacion local tipo BM25 (Sesion 7) para la base de conocimiento…, Hasta top_k chunks relevantes, o lista vacia si nada matchea. Una consulta sin…, Indice BM25 en memoria sobre una lista de KnowledgeChunk., RetrievedChunk, tokenize(), Corpus curado para RAG (Sesion 7). Cada entrada es una fuente de salud publica…, El input real llega sin tildes a veces — el match tiene que seguir funcionando. (+18 more)

### Community 29 - "test_triage_history.py"
Cohesion: 0.14
Nodes (18): EmailAlreadyRegisteredError, Exception, Capa de acceso a la tabla `users`. No sabe de HTTP ni de hashing de contraseñas…, User, UserStore, client_with_output(), model_output(), Si el validador rechazó la salida del modelo, el usuario vio el fallback seguro… (+10 more)

### Community 30 - "EvidenceStore"
Cohesion: 0.12
Nodes (12): EvidenceStore, Database, Capa de evidencia — cada request/response/veredicto de validación queda como…, Derecho al olvido desde la pantalla de Perfil — borra todas las filas del…, Todas las filas de evidencia, más nuevas primero. A propósito NO filtra acá qué…, Historial de un usuario, mas reciente primero — filtrado en SQL (`WHERE user_id…, _client_with_failing_provider(), FailingOrchestrator (+4 more)

### Community 31 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 32 - "nvidia_provider.py"
Cohesion: 0.14
Nodes (12): ModelProvider, ModelProviderError, ABC, Capa de modelo — la interfaz que resuelve el pendiente de DECISION_LOG.md…, El proveedor no pudo devolver un JSON usable (timeout, respuesta invalida,…, Envia system_prompt + payload al modelo y devuelve el JSON ya parseado. Debe…, NvidiaProvider, Implementacion de ModelProvider para los modelos de NVIDIA, via el SDK de… (+4 more)

### Community 33 - "validate_triage_output"
Cohesion: 0.11
Nodes (32): Any, build_provider_error_fallback(), build_safe_fallback(), Respuestas deterministas para cuando no se puede confiar en el modelo — ni en…, Sesion 6, gate de salida del mentor (MAKERS_ACCEPTANCE.md): "ningún fallo del…, Sesion 8: hallazgo real corriendo el set adversarial contra NVIDIA —…, El caso real que expuso el bug: un input que pide dosis de medicamento no debe…, test_provider_error_fallback_always_passes_its_own_validator() (+24 more)

### Community 35 - "ProfilePage.tsx"
Cohesion: 0.17
Nodes (26): applyPreferences(), clearAllPreferences(), FontScale, KEYS, loadAlias(), loadCountry(), loadFontScale(), loadReduceMotion() (+18 more)

### Community 36 - "HistoryPage.tsx"
Cohesion: 0.12
Nodes (22): deleteTriageHistory(), getTriageHistory(), requestTriage(), TriageApiError, HistoryEntry, Priority, ValidationSummary, getPriorityMeta() (+14 more)

### Community 37 - "ProtocolPage.tsx"
Cohesion: 0.16
Nodes (12): Mapeo pantalla de Stitch → ruta, EmergencyPanel(), EmergencyPanelProps, IMMEDIATE_ACTIONS, OfflinePanel(), OfflinePanelProps, QUICK_ADDS, VagueInputPanel() (+4 more)

### Community 38 - "HomePage.tsx"
Cohesion: 0.22
Nodes (8): Duration, DURATIONS, HomePage(), handleSubmit(), submit(), PILLARS, QUICK_FILLS, STEPS

### Community 39 - "routes_triage.py"
Cohesion: 0.13
Nodes (22): require_admin(), require_authenticated(), create_triage(), delete_triage_history(), get_triage_history(), _history_entry_from_row(), Capa de API/Gateway. Esta es la unica capa que sabe de HTTP — recibe el…, HistoryEntry (+14 more)

### Community 41 - "Database"
Cohesion: 0.07
Nodes (34): _check_postgres(), _check_redis(), liveness(), get, Redis, Response, /health vs /ready — a propósito NO viven bajo /api (ver DECISION_TABLE.md, nota…, readiness() (+26 more)

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

### Community 48 - "eval_gate.py"
Cohesion: 0.06
Nodes (46): app_orchestration_triage_orchestrator, app_providers_base, app_validation_safe_response, env.py de Alembic — sin modelos ORM a proposito (mismo criterio que…, DDL del esquema, en una sola lista de sentencias — una única fuente de verdad…, Puente hacia evals/validate_triage_output.py — no se duplica el validador de…, validate_output(), _good_run() (+38 more)

### Community 50 - "HealthGuideAI - Diagrama de Arquitectura (v2)"
Cohesion: 0.30
Nodes (14): 4. Configurador de Prompt, HealthGuideAI - Diagrama de Arquitectura (v2), Disclaimer: no diagnostica, no prescribe, no reemplaza a un profesional, Evaluacion y Auditoria, 2. Interfaz de Usuario, 5. Modelo LLM NVIDIA (nemotron-3-super:122b), 3. Orquestador de Triage, 7. Reglas de Seguridad (+6 more)

### Community 52 - "App.tsx"
Cohesion: 0.16
Nodes (18): App(), ProtectedRoute(), AuthPage(), comingSoon(), Field(), Mode, modeFromPath(), passwordStrength() (+10 more)

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
Cohesion: 0.11
Nodes (32): _ensure_admin_seeded(), get_db(), get_evidence_store(), get_redis_client(), get_session_store(), get_triage_orchestrator(), get_user_store(), Wiring de dependencias — el unico lugar del backend donde se decide QUE… (+24 more)

### Community 59 - "Diseño visual de Stitch — cómo se implementó y qué queda pendiente"
Cohesion: 0.29
Nodes (7): Backlog — funcionalidad que el diseño trae y todavía no existe, Copy que se reescribió (y por qué), Cómo se portó (para quien toque el frontend después), Desvío deliberado del diseño: "Lo que identificamos" y "Qué podría estar pasando" (2026-10-04), Diseño visual de Stitch — cómo se implementó y qué queda pendiente, Dónde consultar el diseño original, Pendiente de verificar

### Community 60 - "Backend service (compose.yml)"
Cohesion: 0.50
Nodes (5): Backend service (compose.yml), Frontend service (compose.yml), Gateway service (compose.yml), Postgres service (compose.yml), Rationale: Postgres publicado en 5433 no 5432

### Community 63 - "errors.py"
Cohesion: 0.26
Nodes (11): _envelope(), install_error_handlers(), handle_http_exception(), handle_unexpected_error(), handle_validation_error(), Request, Sobre de error consistente para toda la API. Antes de esto, cada endpoint…, _request_id() (+3 more)

### Community 64 - "test_csrf.py"
Cohesion: 0.14
Nodes (9): Tests del CSRFOriginCheckMiddleware — verificacion de origen para metodos que…, Un cliente que no es navegador (curl, un test, un futuro cliente movil) no…, Simula "Try it out" en /docs: el Origin es el propio backend, no está en…, Algunos navegadores viejos no mandan Origin en same-origin POST, pero sí…, El frontend usa GET, POST y DELETE (borrar historial). Si un método no está en…, test_cors_preflight_allows_every_method_the_frontend_uses(), test_post_falls_back_to_referer_when_origin_missing(), test_post_from_backends_own_origin_is_allowed() (+1 more)

### Community 70 - "test_gateway.py"
Cohesion: 0.15
Nodes (3): Tests de la capa de gateway agregada en la Sesion 3: versionado (/api/v1 vs…, test_ready_reports_not_ready_when_postgres_fails(), test_ready_reports_not_ready_when_redis_fails()

### Community 72 - "AccessLogMiddleware"
Cohesion: 0.24
Nodes (7): AccessLogMiddleware, ASGIApp, BaseHTTPMiddleware, Request, Asigna un request_id (o respeta el que mande un proxy delante nuestro, ej. el…, Una línea por request, sin datos sensibles: quién (método+ruta), qué pasó…, RequestIdMiddleware

### Community 73 - "Settings"
Cohesion: 0.38
Nodes (10): Guard de arranque (Sesion 5): si esto no revienta ahora, revienta en produccion…, Settings, validate_production_config(), Tests del guard de arranque (Sesion 5) — backend/app/config.py,…, Hallazgo de la auditoria cyber-neo (Sesion 5): database_url tenia el mismo…, test_development_with_default_admin_password_is_allowed(), test_production_with_default_admin_password_fails_loudly(), test_production_with_dev_database_url_fails_loudly() (+2 more)

### Community 75 - "RateLimiter"
Cohesion: 0.25
Nodes (8): enforce_auth_rate_limit(), enforce_rate_limit(), RateLimiter, Dependencia de FastAPI. `limiter` llega inyectado vía Depends(get_rate_limiter)…, Freno contra fuerza bruta en login/registro, por IP. Misma mecánica que…, Interfaz chica a propósito (Interface Segregation, CLAUDE.md sección 13): lo…, Protocol, Request

### Community 76 - "triage_orchestrator.py"
Cohesion: 0.28
Nodes (5): El contrato de producto es estable — ya fue validado por el modelo en la Parte…, _format_few_shot(), _format_rubric(), Arma SYSTEM_PROTOTYPE a partir del contrato — mismo texto base que construye…, Capa de orquestacion — equivalente a run_prototype() en el notebook, pero…

### Community 77 - "CSRFOriginCheckMiddleware"
Cohesion: 0.38
Nodes (4): CSRFOriginCheckMiddleware, ASGIApp, BaseHTTPMiddleware, Request

### Community 78 - "SecurityHeadersMiddleware"
Cohesion: 0.33
Nodes (4): ASGIApp, BaseHTTPMiddleware, Request, SecurityHeadersMiddleware

### Community 80 - "_provider_returning"
Cohesion: 0.50
Nodes (4): _provider_returning(), test_provider_rejects_non_object_responses(), test_provider_strips_markdown_fence_and_records_usage(), NvidiaProvider

### Community 81 - "test_security_headers.py"
Cohesion: 0.33
Nodes (4): _csp_directives(), Tests de SecurityHeadersMiddleware — ver backend/app/api/security_headers.py., script-src 'self' https://x" -> {"script-src": ["'self'", "https://x"]}. Se…, test_docs_response_has_permissive_csp_for_swagger_assets()

### Community 84 - "cause_filter.py"
Cohesion: 0.23
Nodes (11): drop_named_disease_causes(), names_specific_disease(), _normalize(), Red determinista para `posibles_causas` (2026-10-04). CLAUDE.md seccion 2…, Devuelve la lista sin las causas que nombran una enfermedad. Si no es una…, Red determinista de posibles_causas: categorias generales si, enfermedades con…, gripal' no es 'gripe': se compara por palabra completa., test_detects_named_diseases_with_or_without_accents() (+3 more)

## Knowledge Gaps
- **179 isolated node(s):** `AuthStatus`, `AuthRequestOptions`, `Tab`, `ValidationSummary`, `PriorityMeta` (+174 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 487 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Decisión 4: alcance honesto de requiere_revision` connect `backend/README.md` to `Database`?**
  _High betweenness centrality (0.393) - this node is a cross-community bridge._
- **Why does `Diseño visual de Stitch — cómo se implementó y qué queda pendiente` connect `Diseño visual de Stitch — cómo se implementó y qué queda pendiente` to `backend/README.md`, `ProtocolPage.tsx`?**
  _High betweenness centrality (0.331) - this node is a cross-community bridge._
- **Why does `Mapeo pantalla de Stitch → ruta` connect `ProtocolPage.tsx` to `Diseño visual de Stitch — cómo se implementó y qué queda pendiente`?**
  _High betweenness centrality (0.328) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Database` (e.g. with `_check_postgres()` and `readiness()`) actually correct?**
  _`Database` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `EvidenceStore` (e.g. with `create_triage()` and `delete_triage_history()`) actually correct?**
  _`EvidenceStore` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AuthStatus`, `AuthRequestOptions`, `Tab` to the rest of the system?**
  _179 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `test_api.py` be split into smaller, more focused modules?**
  _Cohesion score 0.10984848484848485 - nodes in this community are weakly interconnected._
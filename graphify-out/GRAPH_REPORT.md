# Graph Report - HealthGuideAI  (2026-10-02)

## Corpus Check
- 153 files · ~206,316 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: (none) 8, .csv 4, .example 2)

## Summary
- 1196 nodes · 2451 edges · 72 communities (53 shown, 19 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 91 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1461e761`
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
- test_auth.py
- PageShell
- run_adversarial_suite.py
- Reporte del set adversarial (Sesión 8 — blindaje contra prompt injection)
- Capas del Diagrama de Arquitectura
- sanitize_chunk_text
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
- rate_limit.py
- EvidenceStore
- components.json
- test_provider_errors.py
- validate_triage_output
- ProfilePage.tsx
- HistoryPage.tsx
- react
- HomePage.tsx
- routes_triage.py
- get
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
- post
- fixtures.ts
- useSpeechDictation.ts
- rules
- HealthGuideAI - Diagrama de Arquitectura (v2)
- Diseño visual de Stitch — cómo se implementó y qué queda pendiente
- Backend service (compose.yml)
- User
- Settings
- test_csrf.py
- Redis
- Request
- get
- post
- User
- test_gateway.py
- ABC
- main.py
- Gate de evals — NO PASA

## God Nodes (most connected - your core abstractions)
1. `get_settings()` - 34 edges
2. `Database` - 31 edges
3. `validate_triage_output()` - 29 edges
4. `EvidenceStore` - 26 edges
5. `ProfilePage()` - 26 edges
6. `useAuth()` - 25 edges
7. `UserStore` - 24 edges
8. `KnowledgeRetriever` - 24 edges
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

## Communities (72 total, 19 thin omitted)

### Community 0 - "test_api.py"
Cohesion: 0.08
Nodes (30): require_authenticated(), InMemoryRateLimiter, Ventana deslizante en memoria de un solo proceso — solo para tests, ver el…, Ventana deslizante real, compartida entre cualquier número de…, RedisRateLimiter, client_with_output(), make_stub_user(), model_output() (+22 more)

### Community 1 - "SessionStore"
Cohesion: 0.16
Nodes (13): Database, Capa de acceso a la tabla `sessions`. Sesiones respaldadas por servidor (no JWT…, Session, SessionStore, Automatiza la prueba manual de la Sesión 4 (CONSTRAINTS.md, fila "Escalabilidad…, Sesión expirada (flujo de la Sesión 12): get_valid la rechaza y la borra, en…, _second_instance(), test_expired_session_is_rejected_and_purged() (+5 more)

### Community 2 - "authApi.ts"
Cohesion: 0.32
Nodes (8): AuthApiError, authRequest(), AuthRequestOptions, getCurrentUser(), login(), logout(), signup(), handleAuth()

### Community 3 - "triage_rules.py"
Cohesion: 0.06
Nodes (49): ABC, detect_red_flags(), Capa determinista de red flags (Sesion 6) — corre ANTES de llamar al modelo,…, Señales de alarma detectadas en el texto del usuario (lista vacía si ninguna)., El input real puede venir sin tildes — el chequeo tiene que matchear igual., No dos formas de detectar red flags que se puedan desincronizar — entrada (este…, Hallazgo real de la Sesion 6: 'red_flag_fiebre_bebe' clasificaba ALTA en vez de…, No todo lo que menciona fiebre es un red flag — sin la combinacion con edad de… (+41 more)

### Community 4 - "test_triage_orchestrator.py"
Cohesion: 0.15
Nodes (24): TriageOrchestrator, base_output(), FakeProvider, Exception, Tests del motor hibrido (Sesion 6): red flags deterministas antes y despues de…, El gate de salida del mentor: un fallo del proveedor con un red flag ya…, Sesion 7: un input que matchea una fuente curada (dolor de pecho) tiene que…, Un input sin relacion con el corpus no debe forzar contexto — el RAG amplia, no… (+16 more)

### Community 5 - "package.json"
Cohesion: 0.11
Nodes (17): engines, node, name, private, type, version, jsdom, lucide-react (+9 more)

### Community 6 - "csrf.py"
Cohesion: 0.06
Nodes (35): CSRFOriginCheckMiddleware, _origin_from_referer(), ASGIApp, BaseHTTPMiddleware, Request, CSRF (Sesion 5) via verificacion de origen, no double-submit token. La auth ya…, _envelope(), install_error_handlers() (+27 more)

### Community 7 - "results.md — Resultados de evals"
Cohesion: 0.14
Nodes (23): Arquitectura por capas propuesta (canal/API/orquestacion/modelo/validacion/evidencia/escalamiento), arquitectura.md — Arquitectura HealthGuideAI, Flujo actual del notebook (diagrama), Frontera IA vs software vs humano, Rationale: modelo como capa intercambiable, Rationale: ningun fallo del proveedor puede omitir revision humana, Feedback de mentoria: 6 gates de aceptacion (Emmanuel, makers/review), Sesion 6 — Motor de triage hibrido: reglas + rubrica + few-shot (+15 more)

### Community 8 - "test_auth.py"
Cohesion: 0.22
Nodes (14): client_with_fresh_db(), extra='forbid' (Sesion 5): un campo colado a mano (ej. "role": "admin") tiene…, Sesión 10/11: consultar no exige cuenta (decisión de producto); lo que sí la…, test_login_with_correct_credentials_succeeds(), test_login_with_wrong_password_returns_401(), test_logout_invalidates_session(), test_me_with_valid_session_returns_user(), test_me_without_session_returns_401() (+6 more)

### Community 9 - "PageShell"
Cohesion: 0.14
Nodes (17): checkReady(), ReadyStatus, ROOT_URL, PageShell(), SiteFooter(), MobileTabBar(), SiteHeader(), EmergencyStrip() (+9 more)

### Community 10 - "run_adversarial_suite.py"
Cohesion: 0.07
Nodes (40): app_orchestration_triage_orchestrator, app_providers_base, app_providers_nvidia_provider, app_validation_safe_response, env.py de Alembic — sin modelos ORM a proposito (mismo criterio que…, DDL del esquema, en una sola lista de sentencias — una única fuente de verdad…, _good_run(), La lógica de umbrales del gate de evals, sin llamar al modelo real. (+32 more)

### Community 12 - "Capas del Diagrama de Arquitectura"
Cohesion: 0.23
Nodes (21): Capa de Almacenamiento / Evidencia, Capa de API / Gateway, Capa de Canal, Capa de Modelo (intercambiable), Capa de Orquestación, Capa de Validación (dominio, sin LLM), contract (JTBD, output_fields, reglas del dominio), DECISION_LOG.md (+13 more)

### Community 13 - "sanitize_chunk_text"
Cohesion: 0.29
Nodes (9): Sesion 8 (blindaje contra prompt injection): sanitiza el contenido recuperado…, Si el texto de un chunk contiene un patron de inyeccion reconocible, se…, sanitize_chunk_text(), test_clean_text_passes_through_unchanged(), test_redacts_text_with_bracketed_system_marker(), test_redacts_text_with_english_injection_pattern(), test_redacts_text_with_ignore_instructions_pattern(), test_redacts_text_with_you_are_now_pattern() (+1 more)

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
Cohesion: 0.16
Nodes (21): User, renderRoute(), ProtectedRoute(), setAuth(), AuthContext, AuthContextValue, AuthProvider(), AuthStatus (+13 more)

### Community 19 - "triage_orchestrator.py"
Cohesion: 0.16
Nodes (16): El contrato de producto es estable — ya fue validado por el modelo en la Parte…, build_system_prompt(), _format_few_shot(), _format_rubric(), Arma SYSTEM_PROTOTYPE a partir del contrato — mismo texto base que construye…, Capa de orquestacion — equivalente a run_prototype() en el notebook, pero…, Tests de que la rúbrica, los ejemplos few-shot y el disclaimer reforzado…, No perder las reglas que ya funcionaban al agregar todo lo nuevo. (+8 more)

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
Cohesion: 0.09
Nodes (27): KnowledgeRetriever, Motor de recuperacion local tipo BM25 (Sesion 7) para la base de conocimiento…, Hasta top_k chunks relevantes, o lista vacia si nada matchea. Una consulta sin…, Indice BM25 en memoria sobre una lista de KnowledgeChunk., RetrievedChunk, tokenize(), KnowledgeChunk, Corpus curado para RAG (Sesion 7). Cada entrada es una fuente de salud publica… (+19 more)

### Community 29 - "rate_limit.py"
Cohesion: 0.10
Nodes (24): get_redis_client(), Redis, enforce_auth_rate_limit(), enforce_rate_limit(), get_auth_rate_limiter(), get_rate_limiter(), RateLimiter, Rate limiting. Desde la Sesión 4, la implementación real es `RedisRateLimiter`… (+16 more)

### Community 30 - "EvidenceStore"
Cohesion: 0.08
Nodes (21): Conexion a Postgres (Sesion 4 — reemplaza el SQLite de las sesiones anteriores,…, EvidenceStore, Database, Capa de evidencia — cada request/response/veredicto de validación queda como…, Derecho al olvido desde la pantalla de Perfil — borra todas las filas del…, Todas las filas de evidencia, más nuevas primero. A propósito NO filtra acá qué…, Historial de un usuario, mas reciente primero — filtrado en SQL (`WHERE user_id…, _is_flagged() (+13 more)

### Community 31 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 32 - "test_provider_errors.py"
Cohesion: 0.10
Nodes (22): ModelProvider, ModelProviderError, ABC, Capa de modelo — la interfaz que resuelve el pendiente de DECISION_LOG.md…, El proveedor no pudo devolver un JSON usable (timeout, respuesta invalida,…, Envia system_prompt + payload al modelo y devuelve el JSON ya parseado. Debe…, NvidiaProvider, Implementacion de ModelProvider para NVIDIA nemotron-3-super-120b-a12b, via el… (+14 more)

### Community 33 - "validate_triage_output"
Cohesion: 0.11
Nodes (32): Any, build_provider_error_fallback(), build_safe_fallback(), Respuestas deterministas para cuando no se puede confiar en el modelo — ni en…, Sesion 6, gate de salida del mentor (MAKERS_ACCEPTANCE.md): "ningún fallo del…, Sesion 8: hallazgo real corriendo el set adversarial contra NVIDIA —…, El caso real que expuso el bug: un input que pide dosis de medicamento no debe…, test_provider_error_fallback_always_passes_its_own_validator() (+24 more)

### Community 35 - "ProfilePage.tsx"
Cohesion: 0.16
Nodes (28): applyPreferences(), clearAllPreferences(), FontScale, KEYS, loadAlias(), loadCountry(), loadFontScale(), loadReduceMotion() (+20 more)

### Community 36 - "HistoryPage.tsx"
Cohesion: 0.11
Nodes (29): deleteTriageHistory(), getTriageHistory(), requestTriage(), TriageApiError, HistoryEntry, Priority, TriageResponse, ValidationSummary (+21 more)

### Community 37 - "react"
Cohesion: 0.12
Nodes (17): Mapeo pantalla de Stitch → ruta, EmergencyPanel(), EmergencyPanelProps, IMMEDIATE_ACTIONS, OfflinePanel(), OfflinePanelProps, QUICK_ADDS, VagueInputPanel() (+9 more)

### Community 38 - "HomePage.tsx"
Cohesion: 0.33
Nodes (5): Duration, DURATIONS, PILLARS, QUICK_FILLS, STEPS

### Community 39 - "routes_triage.py"
Cohesion: 0.06
Nodes (43): login(), logout(), me(), El logout manual es el unico mecanismo real de cierre de sesion en este…, _set_session_cookie(), signup(), create_triage(), delete_triage_history() (+35 more)

### Community 41 - "Database"
Cohesion: 0.17
Nodes (11): Database, Solo para tests: borra el schema completo (CASCADE) al terminar, para no dejar…, main(), migrate_evidence(), migrate_sessions(), migrate_users(), migrate_sqlite_to_postgres.py Traslada los datos que hayan quedado en el…, _sha256() (+3 more)

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

### Community 48 - "test_triage_history.py"
Cohesion: 0.14
Nodes (18): get_current_user(), Devuelve el usuario autenticado si la cookie de sesion es valida, o None si no…, Capa de acceso a la tabla `users`. No sabe de HTTP ni de hashing de contraseñas…, User, UserStore, client_with_output(), model_output(), Si el validador rechazó la salida del modelo, el usuario vio el fallback seguro… (+10 more)

### Community 50 - "dependencies.py"
Cohesion: 0.20
Nodes (17): _ensure_admin_seeded(), get_db(), get_evidence_store(), get_session_store(), get_triage_orchestrator(), get_user_store(), Wiring de dependencias — el unico lugar del backend donde se decide QUE…, Crea la cuenta admin de arranque si todavia no existe. La contraseña sale de… (+9 more)

### Community 52 - "App.tsx"
Cohesion: 0.21
Nodes (12): App(), GoogleIcon(), AuthPage(), comingSoon(), Field(), Mode, modeFromPath(), passwordStrength() (+4 more)

### Community 54 - "fixtures.ts"
Cohesion: 0.23
Nodes (13): PUBLIC_PAGES, expectNoHorizontalOverflow(), expectNoSeriousA11yViolations(), mockTriage(), Priority, signupViaApi(), signupViaUi(), submitSymptoms() (+5 more)

### Community 55 - "useSpeechDictation.ts"
Cohesion: 0.21
Nodes (7): getRecognitionCtor(), RecognitionCtor, RecognitionResultEvent, SpeechRecognitionLike, FakeRecognition, Listener, useSpeechDictation()

### Community 56 - "rules"
Cohesion: 0.14
Nodes (13): categories, correctness, suspicious, ignorePatterns, plugins, rules, import/no-unassigned-import, jsx-a11y/label-has-associated-control (+5 more)

### Community 58 - "HealthGuideAI - Diagrama de Arquitectura (v2)"
Cohesion: 0.30
Nodes (14): 4. Configurador de Prompt, HealthGuideAI - Diagrama de Arquitectura (v2), Disclaimer: no diagnostica, no prescribe, no reemplaza a un profesional, Evaluacion y Auditoria, 2. Interfaz de Usuario, 5. Modelo LLM NVIDIA (nemotron-3-super:122b), 3. Orquestador de Triage, 7. Reglas de Seguridad (+6 more)

### Community 59 - "Diseño visual de Stitch — cómo se implementó y qué queda pendiente"
Cohesion: 0.29
Nodes (6): Backlog — funcionalidad que el diseño trae y todavía no existe, Copy que se reescribió (y por qué), Cómo se portó (para quien toque el frontend después), Diseño visual de Stitch — cómo se implementó y qué queda pendiente, Dónde consultar el diseño original, Pendiente de verificar

### Community 60 - "Backend service (compose.yml)"
Cohesion: 0.40
Nodes (6): Backend service (compose.yml), Frontend service (compose.yml), Gateway service (compose.yml), Postgres service (compose.yml), Rationale: Postgres publicado en 5433 no 5432, Redis service (compose.yml)

### Community 62 - "Settings"
Cohesion: 0.38
Nodes (10): Guard de arranque (Sesion 5): si esto no revienta ahora, revienta en produccion…, Settings, validate_production_config(), Tests del guard de arranque (Sesion 5) — backend/app/config.py,…, Hallazgo de la auditoria cyber-neo (Sesion 5): database_url tenia el mismo…, test_development_with_default_admin_password_is_allowed(), test_production_with_default_admin_password_fails_loudly(), test_production_with_dev_database_url_fails_loudly() (+2 more)

### Community 64 - "test_csrf.py"
Cohesion: 0.14
Nodes (9): Tests del CSRFOriginCheckMiddleware — verificacion de origen para metodos que…, Un cliente que no es navegador (curl, un test, un futuro cliente movil) no…, Simula "Try it out" en /docs: el Origin es el propio backend, no está en…, Algunos navegadores viejos no mandan Origin en same-origin POST, pero sí…, El frontend usa GET, POST y DELETE (borrar historial). Si un método no está en…, test_cors_preflight_allows_every_method_the_frontend_uses(), test_post_falls_back_to_referer_when_origin_missing(), test_post_from_backends_own_origin_is_allowed() (+1 more)

### Community 70 - "test_gateway.py"
Cohesion: 0.15
Nodes (3): Tests de la capa de gateway agregada en la Sesion 3: versionado (/api/v1 vs…, test_ready_reports_not_ready_when_postgres_fails(), test_ready_reports_not_ready_when_redis_fails()

### Community 73 - "main.py"
Cohesion: 0.18
Nodes (13): _check_postgres(), _check_redis(), liveness(), get, Redis, Response, /health vs /ready — a propósito NO viven bajo /api (ver DECISION_TABLE.md, nota…, readiness() (+5 more)

## Knowledge Gaps
- **176 isolated node(s):** `PUBLIC_PAGES`, `Mode`, `DURATIONS`, `Duration`, `QUICK_FILLS` (+171 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 465 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Decisión 4: alcance honesto de requiere_revision` connect `backend/README.md` to `EvidenceStore`?**
  _High betweenness centrality (0.385) - this node is a cross-community bridge._
- **Why does `Diseño visual de Stitch — cómo se implementó y qué queda pendiente` connect `Diseño visual de Stitch — cómo se implementó y qué queda pendiente` to `react`?**
  _High betweenness centrality (0.331) - this node is a cross-community bridge._
- **Why does `Mapeo pantalla de Stitch → ruta` connect `react` to `Diseño visual de Stitch — cómo se implementó y qué queda pendiente`?**
  _High betweenness centrality (0.328) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `get_settings()` (e.g. with `main()` and `main()`) actually correct?**
  _`get_settings()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `Database` (e.g. with `_ensure_admin_seeded()` and `get_db()`) actually correct?**
  _`Database` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `EvidenceStore` (e.g. with `get_evidence_store()` and `create_triage()`) actually correct?**
  _`EvidenceStore` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PUBLIC_PAGES`, `Mode`, `DURATIONS` to the rest of the system?**
  _176 weakly-connected nodes found - possible documentation gaps or missing edges._
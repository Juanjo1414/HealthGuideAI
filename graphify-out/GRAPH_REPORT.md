# Graph Report - HealthGuideAI  (2026-10-03)

## Corpus Check
- 156 files · ~210,782 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: (none) 8, .csv 4, .example 2)

## Summary
- 1229 nodes · 2535 edges · 86 communities (65 shown, 21 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 81 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2aa93866`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_api.py
- test_triage_history.py
- authApi.ts
- triage_rules.py
- test_triage_orchestrator.py
- package.json
- csrf.py
- results.md — Resultados de evals
- ResultPage.tsx
- PageShell
- get_settings
- Reporte del set adversarial (Sesión 8 — blindaje contra prompt injection)
- Capas del Diagrama de Arquitectura
- sanitize_chunk_text
- DECISION_TABLE.md — Gemini vs NVIDIA
- CLAUDE.md — contexto del proyecto HealthGuideAI
- compilerOptions
- backend/README.md
- AuthContext.tsx
- test_prompt_builder.py
- login
- SOLID e Interfaz ModelProvider
- PLAN_IMPLEMENTACION.md — roadmap de 14 sesiones
- Design System del Frontend
- Skill de Refactor de Archivos Grandes
- Docker Entrypoint
- KnowledgeRetriever
- test_auth_rate_limit.py
- EvidenceStore
- components.json
- triage_orchestrator.py
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
- run_priority_metrics.py
- Exception
- dependencies.py
- Response
- App.tsx
- post
- fixtures.ts
- useSpeechDictation.ts
- rules
- rate_limit.py
- app_providers_nvidia_provider
- Diseño visual de Stitch — cómo se implementó y qué queda pendiente
- Backend service (compose.yml)
- User
- Redis
- retrieval.py
- test_csrf.py
- Redis
- Request
- get
- post
- User
- main.py
- ABC
- pathlib
- list_flagged_for_review.py
- gate_report.md
- routes_health.py
- build_safe_fallback
- create_triage
- migrate_sqlite_to_postgres.py
- auth.py
- test_provider_errors.py
- test_security_headers.py
- User
- run_adversarial_suite.py
- build_provider_error_fallback
- db.py

## God Nodes (most connected - your core abstractions)
1. `get_settings()` - 38 edges
2. `Database` - 29 edges
3. `validate_triage_output()` - 29 edges
4. `ProfilePage()` - 26 edges
5. `EvidenceStore` - 25 edges
6. `useAuth()` - 25 edges
7. `KnowledgeRetriever` - 24 edges
8. `UserStore` - 22 edges
9. `Settings` - 21 edges
10. `TriageOrchestrator` - 20 edges

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

## Communities (86 total, 21 thin omitted)

### Community 0 - "test_api.py"
Cohesion: 0.19
Nodes (15): client_with_output(), make_stub_user(), model_output(), extra='forbid' (Sesion 5) tambien en TriageRequest., Un usuario real en el schema de test, no un objeto armado a mano —…, StubOrchestrator, test_evidence_omits_sensitive_payloads_by_default(), test_fallback_never_downgrades_model_emergency() (+7 more)

### Community 1 - "test_triage_history.py"
Cohesion: 0.06
Nodes (44): Database, Capa de acceso a la tabla `sessions`. Sesiones respaldadas por servidor (no JWT…, Session, SessionStore, EmailAlreadyRegisteredError, Exception, Capa de acceso a la tabla `users`. No sabe de HTTP ni de hashing de contraseñas…, User (+36 more)

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
Nodes (18): engines, node, name, private, type, version, jsdom, lucide-react (+10 more)

### Community 6 - "csrf.py"
Cohesion: 0.06
Nodes (35): CSRFOriginCheckMiddleware, _origin_from_referer(), ASGIApp, BaseHTTPMiddleware, Request, CSRF (Sesion 5) via verificacion de origen, no double-submit token. La auth ya…, _envelope(), install_error_handlers() (+27 more)

### Community 7 - "results.md — Resultados de evals"
Cohesion: 0.14
Nodes (23): Arquitectura por capas propuesta (canal/API/orquestacion/modelo/validacion/evidencia/escalamiento), arquitectura.md — Arquitectura HealthGuideAI, Flujo actual del notebook (diagrama), Frontera IA vs software vs humano, Rationale: modelo como capa intercambiable, Rationale: ningun fallo del proveedor puede omitir revision humana, Feedback de mentoria: 6 gates de aceptacion (Emmanuel, makers/review), Sesion 6 — Motor de triage hibrido: reglas + rubrica + few-shot (+15 more)

### Community 8 - "ResultPage.tsx"
Cohesion: 0.16
Nodes (15): TriageResponse, GoogleIcon(), EmergencyPanelProps, IMMEDIATE_ACTIONS, CauseParts, DISCLAIMER_STARTS, normalize(), splitCause() (+7 more)

### Community 9 - "PageShell"
Cohesion: 0.15
Nodes (16): checkReady(), ReadyStatus, ROOT_URL, PageShell(), SiteFooter(), MobileTabBar(), SiteHeader(), EmergencyStrip() (+8 more)

### Community 10 - "get_settings"
Cohesion: 0.12
Nodes (29): get_triage_orchestrator(), get_settings(), Configuracion del backend. Todo lo que depende del entorno (keys, orígenes…, Guard de arranque (Sesion 5): si esto no revienta ahora, revienta en produccion…, Settings, validate_production_config(), Unico lugar donde se traduce la config a un proveedor: backend y scripts de…, Tests del guard de arranque (Sesion 5) — backend/app/config.py,… (+21 more)

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
Cohesion: 0.09
Nodes (34): El contrato de producto es estable — ya fue validado por el modelo en la Parte…, build_system_prompt(), _format_few_shot(), _format_rubric(), Arma SYSTEM_PROTOTYPE a partir del contrato — mismo texto base que construye…, Tests de que la rúbrica, los ejemplos few-shot y el disclaimer reforzado…, No perder las reglas que ya funcionaban al agregar todo lo nuevo., Sesion 8: la jerarquia de instrucciones tiene que estar en el prompt y aparecer… (+26 more)

### Community 20 - "login"
Cohesion: 0.24
Nodes (14): get_current_user(), Devuelve el usuario autenticado si la cookie de sesion es valida, o None si no…, login(), logout(), El logout manual es el unico mecanismo real de cierre de sesion en este…, _set_session_cookie(), signup(), LoginRequest (+6 more)

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
Cohesion: 0.13
Nodes (18): KnowledgeRetriever, Indice BM25 en memoria sobre una lista de KnowledgeChunk., El input real llega sin tildes a veces — el match tiene que seguir funcionando., Una consulta sin relacion con el corpus no debe forzar contexto — el RAG…, test_empty_corpus_returns_empty(), test_retrieved_chunk_carries_source_for_citation(), test_search_is_accent_insensitive(), test_search_respects_top_k() (+10 more)

### Community 29 - "test_auth_rate_limit.py"
Cohesion: 0.13
Nodes (16): get_auth_rate_limiter(), InMemoryRateLimiter, Ventana deslizante en memoria de un solo proceso — solo para tests, ver el…, db(), permissive_auth_rate_limit(), Fixtures compartidos. `db` da un Postgres real (no un mock) aislado por test:…, Los tests hacen muchos signup/login desde la misma IP del TestClient: sin esto…, Freno de fuerza bruta en login y registro (hallazgo de QA, Sesión 13). (+8 more)

### Community 30 - "EvidenceStore"
Cohesion: 0.15
Nodes (6): EvidenceStore, Database, Derecho al olvido desde la pantalla de Perfil — borra todas las filas del…, Todas las filas de evidencia, más nuevas primero. A propósito NO filtra acá qué…, Historial de un usuario, mas reciente primero — filtrado en SQL (`WHERE user_id…, Exception

### Community 31 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 32 - "triage_orchestrator.py"
Cohesion: 0.18
Nodes (10): Capa de orquestacion — equivalente a run_prototype() en el notebook, pero…, ModelProvider, ModelProviderError, ABC, Capa de modelo — la interfaz que resuelve el pendiente de DECISION_LOG.md…, El proveedor no pudo devolver un JSON usable (timeout, respuesta invalida,…, Envia system_prompt + payload al modelo y devuelve el JSON ya parseado. Debe…, Implementacion de ModelProvider para los modelos de NVIDIA, via el SDK de… (+2 more)

### Community 33 - "validate_triage_output"
Cohesion: 0.11
Nodes (36): Any, _good_run(), La lógica de umbrales del gate de evals, sin llamar al modelo real., test_accuracy_below_threshold_fails(), test_any_emergency_false_negative_fails_even_with_high_accuracy(), test_clean_run_passes(), test_single_adversarial_failure_fails(), test_too_many_provider_errors_make_the_run_inconclusive() (+28 more)

### Community 35 - "ProfilePage.tsx"
Cohesion: 0.16
Nodes (28): applyPreferences(), clearAllPreferences(), FontScale, KEYS, loadAlias(), loadCountry(), loadFontScale(), loadReduceMotion() (+20 more)

### Community 36 - "HistoryPage.tsx"
Cohesion: 0.17
Nodes (16): HistoryEntry, Priority, ValidationSummary, getPriorityMeta(), PRIORITY_META, PriorityMeta, chartY(), dateShort (+8 more)

### Community 37 - "ProtocolPage.tsx"
Cohesion: 0.20
Nodes (10): Mapeo pantalla de Stitch → ruta, EmergencyPanel(), OfflinePanel(), OfflinePanelProps, QUICK_ADDS, VagueInputPanel(), VagueInputPanelProps, ProtocolPage() (+2 more)

### Community 38 - "HomePage.tsx"
Cohesion: 0.18
Nodes (12): deleteTriageHistory(), getTriageHistory(), requestTriage(), TriageApiError, Duration, DURATIONS, HomePage(), handleSubmit() (+4 more)

### Community 39 - "routes_triage.py"
Cohesion: 0.25
Nodes (10): Capa de API/Gateway. Esta es la unica capa que sabe de HTTP — recibe el…, HistoryEntry, BaseModel, field_validator, Esquemas de la API. TriageResponse envuelve el contrato de salida fijo de…, Una fila del historial del usuario (GET /triage/history). A diferencia de…, TriageRequest, TriageResponse (+2 more)

### Community 41 - "Database"
Cohesion: 0.26
Nodes (3): Database, Solo para tests: borra el schema completo (CASCADE) al terminar, para no dejar…, RealDictRow

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

### Community 48 - "run_priority_metrics.py"
Cohesion: 0.26
Nodes (11): app_orchestration_triage_orchestrator, csv, compute_priority_metrics(), load_cases(), PriorityMetricsReport, metrics.py Mide algo que validate_triage_output.py no mide: si la prioridad que…, Lee uno o más CSV de evals y devuelve todas las filas como dicts. No valida…, Corre cada caso contra run_prototype y compara la prioridad devuelta contra… (+3 more)

### Community 50 - "dependencies.py"
Cohesion: 0.18
Nodes (16): _ensure_admin_seeded(), get_db(), get_evidence_store(), get_session_store(), get_user_store(), Wiring de dependencias — el unico lugar del backend donde se decide QUE…, Crea la cuenta admin de arranque si todavia no existe. La contraseña sale de…, require_authenticated() (+8 more)

### Community 52 - "App.tsx"
Cohesion: 0.23
Nodes (13): App(), ProtectedRoute(), AuthPage(), comingSoon(), Field(), Mode, modeFromPath(), passwordStrength() (+5 more)

### Community 54 - "fixtures.ts"
Cohesion: 0.23
Nodes (13): PUBLIC_PAGES, expectNoHorizontalOverflow(), expectNoSeriousA11yViolations(), mockTriage(), Priority, signupViaApi(), signupViaUi(), submitSymptoms() (+5 more)

### Community 55 - "useSpeechDictation.ts"
Cohesion: 0.21
Nodes (7): getRecognitionCtor(), RecognitionCtor, RecognitionResultEvent, SpeechRecognitionLike, FakeRecognition, Listener, useSpeechDictation()

### Community 56 - "rules"
Cohesion: 0.14
Nodes (13): categories, correctness, suspicious, ignorePatterns, plugins, rules, import/no-unassigned-import, jsx-a11y/label-has-associated-control (+5 more)

### Community 57 - "rate_limit.py"
Cohesion: 0.11
Nodes (21): get_redis_client(), enforce_auth_rate_limit(), enforce_rate_limit(), get_rate_limiter(), RateLimiter, Rate limiting. Desde la Sesión 4, la implementación real es `RedisRateLimiter`…, Dependencia de FastAPI. `limiter` llega inyectado vía Depends(get_rate_limiter)…, Freno contra fuerza bruta en login/registro, por IP. Misma mecánica que… (+13 more)

### Community 59 - "Diseño visual de Stitch — cómo se implementó y qué queda pendiente"
Cohesion: 0.29
Nodes (7): Backlog — funcionalidad que el diseño trae y todavía no existe, Copy que se reescribió (y por qué), Cómo se portó (para quien toque el frontend después), Desvío deliberado del diseño: "Lo que identificamos" y "Qué podría estar pasando" (2026-10-04), Diseño visual de Stitch — cómo se implementó y qué queda pendiente, Dónde consultar el diseño original, Pendiente de verificar

### Community 60 - "Backend service (compose.yml)"
Cohesion: 0.50
Nodes (5): Backend service (compose.yml), Frontend service (compose.yml), Gateway service (compose.yml), Postgres service (compose.yml), Rationale: Postgres publicado en 5433 no 5432

### Community 63 - "retrieval.py"
Cohesion: 0.18
Nodes (10): Motor de recuperacion local tipo BM25 (Sesion 7) para la base de conocimiento…, Hasta top_k chunks relevantes, o lista vacia si nada matchea. Una consulta sin…, RetrievedChunk, tokenize(), KnowledgeChunk, Corpus curado para RAG (Sesion 7). Cada entrada es una fuente de salud publica…, collections_abc, dataclasses (+2 more)

### Community 64 - "test_csrf.py"
Cohesion: 0.14
Nodes (9): Tests del CSRFOriginCheckMiddleware — verificacion de origen para metodos que…, Un cliente que no es navegador (curl, un test, un futuro cliente movil) no…, Simula "Try it out" en /docs: el Origin es el propio backend, no está en…, Algunos navegadores viejos no mandan Origin en same-origin POST, pero sí…, El frontend usa GET, POST y DELETE (borrar historial). Si un método no está en…, test_cors_preflight_allows_every_method_the_frontend_uses(), test_post_falls_back_to_referer_when_origin_missing(), test_post_from_backends_own_origin_is_allowed() (+1 more)

### Community 70 - "main.py"
Cohesion: 0.12
Nodes (5): Punto de entrada. Corre con: uvicorn app.main:app --reload --app-dir backend…, Tests de la capa de gateway agregada en la Sesion 3: versionado (/api/v1 vs…, test_ready_reports_not_ready_when_postgres_fails(), test_ready_reports_not_ready_when_redis_fails(), fastapi_middleware_cors

### Community 72 - "pathlib"
Cohesion: 0.17
Nodes (5): env.py de Alembic — sin modelos ORM a proposito (mismo criterio que…, DDL del esquema, en una sola lista de sentencias — una única fuente de verdad…, os, pathlib, sqlalchemy

### Community 73 - "list_flagged_for_review.py"
Cohesion: 0.29
Nodes (9): _is_flagged(), main(), list_flagged_for_review.py Esto NO es una cola de revisión ni un sistema de…, Las entradas de record_provider_error no tienen 'validation' ni…, test_does_not_flag_clean_entry(), test_flags_entry_marked_by_model(), test_flags_entry_that_failed_validation(), test_provider_error_entry_without_validation_key_is_not_flagged() (+1 more)

### Community 75 - "routes_health.py"
Cohesion: 0.36
Nodes (8): _check_postgres(), _check_redis(), liveness(), get, Redis, Response, /health vs /ready — a propósito NO viven bajo /api (ver DECISION_TABLE.md, nota…, readiness()

### Community 76 - "build_safe_fallback"
Cohesion: 0.33
Nodes (7): build_safe_fallback(), Respuestas deterministas para cuando no se puede confiar en el modelo — ni en…, Sesion 8: hallazgo real corriendo el set adversarial contra NVIDIA —…, El caso real que expuso el bug: un input que pide dosis de medicamento no debe…, test_safe_fallback_always_passes_its_own_validator_alta(), test_safe_fallback_always_passes_its_own_validator_emergencia(), test_safe_fallback_passes_even_against_medication_request_input()

### Community 77 - "create_triage"
Cohesion: 0.29
Nodes (6): create_triage(), Puente hacia evals/validate_triage_output.py — no se duplica el validador de…, validate_output(), TriageOrchestrator, TriageRequest, TriageResponse

### Community 78 - "migrate_sqlite_to_postgres.py"
Cohesion: 0.31
Nodes (9): main(), migrate_evidence(), migrate_sessions(), migrate_users(), migrate_sqlite_to_postgres.py Traslada los datos que hayan quedado en el…, _sha256(), Connection, hashlib (+1 more)

### Community 79 - "auth.py"
Cohesion: 0.28
Nodes (7): LoginRequest, BaseModel, field_validator, Esquemas de la API de autenticación. Sin verificación de email por diseño en…, SignupRequest, UserResponse, pydantic

### Community 80 - "test_provider_errors.py"
Cohesion: 0.14
Nodes (13): NvidiaProvider, _client_with_failing_provider(), FailingOrchestrator, _provider_returning(), Fallos del proveedor (Sesión 12): qué ve el usuario cuando NVIDIA no responde o…, test_provider_failure_returns_honest_502_and_records_evidence(), test_provider_rejects_non_object_responses(), test_provider_strips_markdown_fence_and_records_usage() (+5 more)

### Community 81 - "test_security_headers.py"
Cohesion: 0.33
Nodes (4): _csp_directives(), Tests de SecurityHeadersMiddleware — ver backend/app/api/security_headers.py., script-src 'self' https://x" -> {"script-src": ["'self'", "https://x"]}. Se…, test_docs_response_has_permissive_csp_for_swagger_assets()

### Community 82 - "User"
Cohesion: 0.28
Nodes (9): require_admin(), me(), delete_triage_history(), get_triage_history(), _history_entry_from_row(), delete, get, HistoryEntry (+1 more)

### Community 83 - "run_adversarial_suite.py"
Cohesion: 0.40
Nodes (5): app_providers_base, app_validation_safe_response, load_cases(), main(), run_adversarial_suite.py Corre el set de red-team (evals/adversarial_cases.csv)…

### Community 84 - "build_provider_error_fallback"
Cohesion: 0.33
Nodes (5): build_provider_error_fallback(), Sesion 6, gate de salida del mentor (MAKERS_ACCEPTANCE.md): "ningún fallo del…, test_provider_error_fallback_always_passes_its_own_validator(), La respuesta de fallback no es un caso especial exento de las reglas de…, test_red_flag_fallback_passes_the_real_output_validator()

### Community 85 - "db.py"
Cohesion: 0.33
Nodes (5): Conexion a Postgres (Sesion 4 — reemplaza el SQLite de las sesiones anteriores,…, contextlib, psycopg2, psycopg2_extras, psycopg2_pool

## Knowledge Gaps
- **179 isolated node(s):** `CauseParts`, `DISCLAIMER_STARTS`, `Filter`, `FILTERS`, `STRIP` (+174 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 477 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Decisión 4: alcance honesto de requiere_revision` connect `backend/README.md` to `list_flagged_for_review.py`?**
  _High betweenness centrality (0.371) - this node is a cross-community bridge._
- **Why does `Diseño visual de Stitch — cómo se implementó y qué queda pendiente` connect `Diseño visual de Stitch — cómo se implementó y qué queda pendiente` to `backend/README.md`, `ProtocolPage.tsx`?**
  _High betweenness centrality (0.293) - this node is a cross-community bridge._
- **Why does `Mapeo pantalla de Stitch → ruta` connect `ProtocolPage.tsx` to `Diseño visual de Stitch — cómo se implementó y qué queda pendiente`?**
  _High betweenness centrality (0.289) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Database` (e.g. with `_check_postgres()` and `readiness()`) actually correct?**
  _`Database` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `EvidenceStore` (e.g. with `create_triage()` and `delete_triage_history()`) actually correct?**
  _`EvidenceStore` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `CauseParts`, `DISCLAIMER_STARTS`, `Filter` to the rest of the system?**
  _179 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `test_triage_history.py` be split into smaller, more focused modules?**
  _Cohesion score 0.061343204653622425 - nodes in this community are weakly interconnected._
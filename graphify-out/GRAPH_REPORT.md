# Graph Report - HealthGuideAI  (2026-10-04)

## Corpus Check
- 163 files · ~215,744 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: (none) 8, .csv 4, .example 2)

## Summary
- 1271 nodes · 2693 edges · 74 communities (62 shown, 12 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 130 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5aa84499`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_api.py
- Database
- AuthPage.tsx
- triage_rules.py
- ModelProviderError
- package.json
- csrf.py
- results.md — Resultados de evals
- EvidenceStore
- App.tsx
- backend/README.md
- Reporte del set adversarial (Sesión 8 — blindaje contra prompt injection)
- Capas del Diagrama de Arquitectura
- TriageOrchestrator
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
- eval_gate.py
- KnowledgeRetriever
- test_triage_history.py
- test_auth_rate_limit.py
- components.json
- NvidiaProvider
- validate_triage_output
- ProfilePage.tsx
- HistoryPage.tsx
- ResultPage.tsx
- app_orchestration_triage_orchestrator
- routes_triage.py
- app_providers_base
- dependencies.py
- dependencies
- devDependencies
- button.tsx
- vite.config.js
- scripts
- run_priority_metrics.py
- app_validation_safe_response
- SessionStore
- detect_red_flags
- test_auth.py
- RuleResult
- fixtures.ts
- HomePage.tsx
- rules
- rate_limit.py
- app_providers_nvidia_provider
- Diseño visual de Stitch — cómo se implementó y qué queda pendiente
- Backend service (compose.yml)
- test_client_ip.py
- test_rate_limit.py
- run_adversarial_suite.py
- test_csrf.py
- Redis
- config.py
- db.py
- UserStore
- Despliegue gratuito: Vercel + Render + Neon
- main.py
- list_flagged_for_review.py
- vercel.json
- Gate de evals — PASA

## God Nodes (most connected - your core abstractions)
1. `get_settings()` - 43 edges
2. `Database` - 39 edges
3. `validate_triage_output()` - 29 edges
4. `EvidenceStore` - 27 edges
5. `TriageOrchestrator` - 26 edges
6. `UserStore` - 26 edges
7. `ProfilePage()` - 26 edges
8. `KnowledgeRetriever` - 25 edges
9. `useAuth()` - 25 edges
10. `Settings` - 24 edges

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

## Communities (74 total, 12 thin omitted)

### Community 0 - "test_api.py"
Cohesion: 0.19
Nodes (15): client_with_output(), make_stub_user(), model_output(), extra='forbid' (Sesion 5) tambien en TriageRequest., Un usuario real en el schema de test, no un objeto armado a mano —…, StubOrchestrator, test_evidence_omits_sensitive_payloads_by_default(), test_fallback_never_downgrades_model_emergency() (+7 more)

### Community 1 - "Database"
Cohesion: 0.13
Nodes (14): Database, Solo para tests: borra el schema completo (CASCADE) al terminar, para no dejar…, Una conexión que de verdad responde. Neon (despliegue) suspende la base tras…, main(), migrate_evidence(), migrate_sessions(), migrate_users(), migrate_sqlite_to_postgres.py Traslada los datos que hayan quedado en el… (+6 more)

### Community 2 - "AuthPage.tsx"
Cohesion: 0.18
Nodes (17): AuthApiError, authRequest(), AuthRequestOptions, getCurrentUser(), login(), logout(), signup(), AuthProvider() (+9 more)

### Community 3 - "triage_rules.py"
Cohesion: 0.13
Nodes (22): default_rules(), NoDiagnosisRule, NoMedicationRule, NoPromptLeakRule, OutOfScopeInputRule, ABC, triage_rules.py Parte "reglas" del validador de seguridad (ver…, Interfaz minima que debe cumplir cualquier regla de seguridad. Interface… (+14 more)

### Community 4 - "ModelProviderError"
Cohesion: 0.18
Nodes (10): ModelProvider, ModelProviderError, ABC, Capa de modelo — la interfaz que resuelve el pendiente de DECISION_LOG.md…, El proveedor no pudo devolver un JSON usable (timeout, respuesta invalida,…, Envia system_prompt + payload al modelo y devuelve el JSON ya parseado. Debe…, Implementacion de ModelProvider para los modelos de NVIDIA, via el SDK de…, FailingOrchestrator (+2 more)

### Community 5 - "package.json"
Cohesion: 0.11
Nodes (18): engines, node, name, private, type, version, jsdom, lucide-react (+10 more)

### Community 6 - "csrf.py"
Cohesion: 0.06
Nodes (35): CSRFOriginCheckMiddleware, _origin_from_referer(), ASGIApp, BaseHTTPMiddleware, Request, CSRF (Sesion 5) via verificacion de origen, no double-submit token. La auth ya…, _envelope(), install_error_handlers() (+27 more)

### Community 7 - "results.md — Resultados de evals"
Cohesion: 0.13
Nodes (22): Arquitectura por capas propuesta (canal/API/orquestacion/modelo/validacion/evidencia/escalamiento), arquitectura.md — Arquitectura HealthGuideAI, Flujo actual del notebook (diagrama), Frontera IA vs software vs humano, Rationale: modelo como capa intercambiable, Rationale: ningun fallo del proveedor puede omitir revision humana, Feedback de mentoria: 6 gates de aceptacion (Emmanuel, makers/review), Sesion 6 — Motor de triage hibrido: reglas + rubrica + few-shot (+14 more)

### Community 8 - "EvidenceStore"
Cohesion: 0.12
Nodes (13): EvidenceStore, Exception, Capa de evidencia — cada request/response/veredicto de validación queda como…, Derecho al olvido desde la pantalla de Perfil — borra todas las filas del…, Todas las filas de evidencia, más nuevas primero. A propósito NO filtra acá qué…, Historial de un usuario, mas reciente primero — filtrado en SQL (`WHERE user_id…, _client_with_failing_provider(), _provider_returning() (+5 more)

### Community 9 - "App.tsx"
Cohesion: 0.13
Nodes (21): checkReady(), ReadyStatus, ROOT_URL, App(), renderRoute(), PageShell(), SiteFooter(), MobileTabBar() (+13 more)

### Community 10 - "backend/README.md"
Cohesion: 0.20
Nodes (9): API Gateway (Sesión 3): versionado /api/v1, /health, /ready, X-Request-ID, Revisión humana: flag registrado, no cola operativa, Estructura app/ por capas (api, orchestration, providers, validation, storage, schemas), Rate limiting con RedisRateLimiter (ventana deslizante), AI flow: input → validaciones deterministas → LLM → JSON → revisión, Sistema de evals (validate_triage_output), Contrato de salida JSON de triage, Decisión 2: canal web app + API ahora, WhatsApp fase 2 (+1 more)

### Community 12 - "Capas del Diagrama de Arquitectura"
Cohesion: 0.23
Nodes (21): Capa de Almacenamiento / Evidencia, Capa de API / Gateway, Capa de Canal, Capa de Modelo (intercambiable), Capa de Orquestación, Capa de Validación (dominio, sin LLM), contract (JTBD, output_fields, reglas del dominio), DECISION_LOG.md (+13 more)

### Community 13 - "TriageOrchestrator"
Cohesion: 0.15
Nodes (26): TriageOrchestrator, base_output(), FakeProvider, Exception, Tests del motor hibrido (Sesion 6): red flags deterministas antes y despues de…, El gate de salida del mentor: un fallo del proveedor con un red flag ya…, Sesion 7: un input que matchea una fuente curada (dolor de pecho) tiene que…, Un input sin relacion con el corpus no debe forzar contexto — el RAG amplia, no… (+18 more)

### Community 14 - "DECISION_TABLE.md — Gemini vs NVIDIA"
Cohesion: 0.10
Nodes (24): Bug: validador dejaba pasar categorías genéricas de medicación (antitérmicos), HealthGuideAI_Gemini.ipynb (dado de baja), HealthGuideAI_Nvidia.ipynb, Decisión 1: proveedor de modelo NVIDIA nemotron vs Gemini, DECISION_TABLE.md — Gemini vs NVIDIA, Bug de contrato: Gemini generaba claves propias (prioridad_atencion), Hallazgo: no-determinismo estructural del JSON (thinking habilitado), Tabla de costo estimado NVIDIA (~$0.01/caso) (+16 more)

### Community 15 - "CLAUDE.md — contexto del proyecto HealthGuideAI"
Cohesion: 0.14
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
Nodes (43): Sesion 8 (blindaje contra prompt injection): sanitiza el contenido recuperado…, Si el texto de un chunk contiene un patron de inyeccion reconocible, se…, sanitize_chunk_text(), drop_named_disease_causes(), names_specific_disease(), _normalize(), Red determinista para `posibles_causas` (2026-10-04). CLAUDE.md seccion 2…, Devuelve la lista sin las causas que nombran una enfermedad. Si no es una… (+35 more)

### Community 20 - "routes_auth.py"
Cohesion: 0.16
Nodes (20): login(), logout(), me(), get, post, Response, Capa de API/Gateway para autenticación. Igual que routes_triage.py, esta es la…, El logout manual es el unico mecanismo real de cierre de sesion en este… (+12 more)

### Community 21 - "SOLID e Interfaz ModelProvider"
Cohesion: 0.25
Nodes (8): ModelProvider como interfaz, no función suelta (Dependency Inversion), backend/ (FastAPI, monolito modular por capas), Interfaz ModelProvider (backend/app/providers/base.py), Aplicación de SOLID en el monolito modular por capas, Decisión 3: monolito modular por capas, no SOUP ni microservicios, ModelProvider como interfaz (Dependency Inversion), Aplicación de SOLID en TriageValidator/ValidationRule, evals/validate_triage_output.py refactorizado a clases SOLID

### Community 22 - "PLAN_IMPLEMENTACION.md — roadmap de 14 sesiones"
Cohesion: 0.16
Nodes (20): PANTALLAS.md — spec de pantallas, Pantalla Historial de consultas, Pantalla Login, Pantalla Perfil, Pantalla Revision humana, Rationale: alcance de Revision humana (visor, no cola real), Pantalla Signup, Pantalla Triage (+12 more)

### Community 24 - "Skill de Refactor de Archivos Grandes"
Cohesion: 0.67
Nodes (3): Umbral de 100 líneas para refactor, Sub-agente context-gatherer, Skill: refactor-large-files

### Community 26 - "eval_gate.py"
Cohesion: 0.12
Nodes (24): env.py de Alembic — sin modelos ORM a proposito (mismo criterio que…, DDL del esquema, en una sola lista de sentencias — una única fuente de verdad…, Puente hacia evals/validate_triage_output.py — no se duplica el validador de…, _good_run(), La lógica de umbrales del gate de evals, sin llamar al modelo real., test_accuracy_below_threshold_fails(), test_any_emergency_false_negative_fails_even_with_high_accuracy(), test_clean_run_passes() (+16 more)

### Community 28 - "KnowledgeRetriever"
Cohesion: 0.10
Nodes (26): KnowledgeRetriever, Motor de recuperacion local tipo BM25 (Sesion 7) para la base de conocimiento…, Hasta top_k chunks relevantes, o lista vacia si nada matchea. Una consulta sin…, Indice BM25 en memoria sobre una lista de KnowledgeChunk., RetrievedChunk, tokenize(), KnowledgeChunk, Corpus curado para RAG (Sesion 7). Cada entrada es una fuente de salud publica… (+18 more)

### Community 29 - "test_triage_history.py"
Cohesion: 0.20
Nodes (13): client_with_output(), model_output(), Si el validador rechazó la salida del modelo, el usuario vio el fallback seguro…, Mismo patron que test_api.py (sin importarlo directo: el proyecto no tiene…, Decisión de producto (Sesión 10/11): se puede consultar sin cuenta., Filtrado real en SQL (WHERE user_id), no un chequeo de UI — un usuario nunca…, StubOrchestrator, test_anonymous_triage_stores_no_content_and_no_user() (+5 more)

### Community 30 - "test_auth_rate_limit.py"
Cohesion: 0.12
Nodes (18): get_triage_orchestrator(), get_auth_rate_limiter(), InMemoryRateLimiter, Ventana deslizante en memoria de un solo proceso — solo para tests, ver el…, db(), permissive_auth_rate_limit(), Fixtures compartidos. `db` da un Postgres real (no un mock) aislado por test:…, Los tests hacen muchos signup/login desde la misma IP del TestClient: sin esto… (+10 more)

### Community 31 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 32 - "NvidiaProvider"
Cohesion: 0.16
Nodes (16): NvidiaProvider, Unico lugar donde se traduce la config a un proveedor: backend y scripts de…, _capture_request(), parametrize, El modelo y el modo de razonamiento salen de la config (NVIDIA dio de baja…, nemotron-3-ultra responde 400 si llega `reasoning_budget`., El contrato de salida es JSON: se le pide al endpoint en modo JSON en vez de…, Lightning con thinking devolvía contenido vacío, y sin modo JSON a veces texto… (+8 more)

### Community 33 - "validate_triage_output"
Cohesion: 0.08
Nodes (47): Any, build_provider_error_fallback(), build_safe_fallback(), Respuestas deterministas para cuando no se puede confiar en el modelo — ni en…, Sesion 6, gate de salida del mentor (MAKERS_ACCEPTANCE.md): "ningún fallo del…, Sesion 8: hallazgo real corriendo el set adversarial contra NVIDIA —…, El caso real que expuso el bug: un input que pide dosis de medicamento no debe…, test_provider_error_fallback_always_passes_its_own_validator() (+39 more)

### Community 35 - "ProfilePage.tsx"
Cohesion: 0.17
Nodes (26): applyPreferences(), clearAllPreferences(), FontScale, KEYS, loadAlias(), loadCountry(), loadFontScale(), loadReduceMotion() (+18 more)

### Community 36 - "HistoryPage.tsx"
Cohesion: 0.12
Nodes (22): deleteTriageHistory(), getTriageHistory(), requestTriage(), TriageApiError, HistoryEntry, Priority, ValidationSummary, getPriorityMeta() (+14 more)

### Community 37 - "ResultPage.tsx"
Cohesion: 0.10
Nodes (26): Mapeo pantalla de Stitch → ruta, TriageResponse, GoogleIcon(), EmergencyPanel(), EmergencyPanelProps, IMMEDIATE_ACTIONS, OfflinePanel(), OfflinePanelProps (+18 more)

### Community 39 - "routes_triage.py"
Cohesion: 0.17
Nodes (17): create_triage(), delete_triage_history(), get_triage_history(), _history_entry_from_row(), get, post, Capa de API/Gateway. Esta es la unica capa que sabe de HTTP — recibe el…, HistoryEntry (+9 more)

### Community 41 - "dependencies.py"
Cohesion: 0.15
Nodes (21): _ensure_admin_seeded(), get_db(), get_redis_client(), get_session_store(), get_user_store(), Redis, Wiring de dependencias — el unico lugar del backend donde se decide QUE…, Crea la cuenta admin de arranque si todavia no existe. La contraseña sale de… (+13 more)

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
Cohesion: 0.29
Nodes (10): collections_abc, compute_priority_metrics(), load_cases(), PriorityMetricsReport, metrics.py Mide algo que validate_triage_output.py no mide: si la prioridad que…, Lee uno o más CSV de evals y devuelve todas las filas como dicts. No valida…, Corre cada caso contra run_prototype y compara la prioridad devuelta contra…, render_markdown_report() (+2 more)

### Community 50 - "SessionStore"
Cohesion: 0.19
Nodes (11): Capa de acceso a la tabla `sessions`. Sesiones respaldadas por servidor (no JWT…, Session, SessionStore, Automatiza la prueba manual de la Sesión 4 (CONSTRAINTS.md, fila "Escalabilidad…, Sesión expirada (flujo de la Sesión 12): get_valid la rechaza y la borra, en…, _second_instance(), test_expired_session_is_rejected_and_purged(), test_logout_in_one_instance_invalidates_session_in_the_other() (+3 more)

### Community 51 - "detect_red_flags"
Cohesion: 0.18
Nodes (16): detect_red_flags(), Capa determinista de red flags (Sesion 6) — corre ANTES de llamar al modelo,…, Señales de alarma detectadas en el texto del usuario (lista vacía si ninguna)., El input real puede venir sin tildes — el chequeo tiene que matchear igual., No dos formas de detectar red flags que se puedan desincronizar — entrada (este…, Hallazgo real de la Sesion 6: 'red_flag_fiebre_bebe' clasificaba ALTA en vez de…, No todo lo que menciona fiebre es un red flag — sin la combinacion con edad de…, test_detects_known_red_flag() (+8 more)

### Community 52 - "test_auth.py"
Cohesion: 0.22
Nodes (14): client_with_fresh_db(), extra='forbid' (Sesion 5): un campo colado a mano (ej. "role": "admin") tiene…, Sesión 10/11: consultar no exige cuenta (decisión de producto); lo que sí la…, test_login_with_correct_credentials_succeeds(), test_login_with_wrong_password_returns_401(), test_logout_invalidates_session(), test_me_with_valid_session_returns_user(), test_me_without_session_returns_401() (+6 more)

### Community 53 - "RuleResult"
Cohesion: 0.15
Nodes (10): triage_parsing.py Parte "parsing" del validador de seguridad (ver…, Normaliza tildes/diacríticos para que 'térmico' y 'termico' matcheen igual., Concatena todos los campos de texto del output para buscar patrones (sin…, strip_accents(), text_blob(), IncompleteInputRule, Resultado de una sola regla — no dice nada del veredicto global, eso lo agrega…, Si el input es corto, exige pedir mas informacion o marcar requiere_revision —… (+2 more)

### Community 54 - "fixtures.ts"
Cohesion: 0.23
Nodes (13): PUBLIC_PAGES, expectNoHorizontalOverflow(), expectNoSeriousA11yViolations(), mockTriage(), Priority, signupViaApi(), signupViaUi(), submitSymptoms() (+5 more)

### Community 55 - "HomePage.tsx"
Cohesion: 0.11
Nodes (15): getRecognitionCtor(), RecognitionCtor, RecognitionResultEvent, SpeechRecognitionLike, FakeRecognition, Listener, useSpeechDictation(), Duration (+7 more)

### Community 56 - "rules"
Cohesion: 0.14
Nodes (13): categories, correctness, suspicious, ignorePatterns, plugins, rules, import/no-unassigned-import, jsx-a11y/label-has-associated-control (+5 more)

### Community 57 - "rate_limit.py"
Cohesion: 0.18
Nodes (12): enforce_auth_rate_limit(), enforce_rate_limit(), Request, RateLimiter, Rate limiting. Desde la Sesión 4, la implementación real es `RedisRateLimiter`…, Dependencia de FastAPI. `limiter` llega inyectado vía Depends(get_rate_limiter)…, Freno contra fuerza bruta en login/registro, por IP. Misma mecánica que…, Interfaz chica a propósito (Interface Segregation, CLAUDE.md sección 13): lo… (+4 more)

### Community 59 - "Diseño visual de Stitch — cómo se implementó y qué queda pendiente"
Cohesion: 0.29
Nodes (7): Backlog — funcionalidad que el diseño trae y todavía no existe, Copy que se reescribió (y por qué), Cómo se portó (para quien toque el frontend después), Desvío deliberado del diseño: "Lo que identificamos" y "Qué podría estar pasando" (2026-10-04), Diseño visual de Stitch — cómo se implementó y qué queda pendiente, Dónde consultar el diseño original, Pendiente de verificar

### Community 60 - "Backend service (compose.yml)"
Cohesion: 0.40
Nodes (6): Backend service (compose.yml), Frontend service (compose.yml), Gateway service (compose.yml), Postgres service (compose.yml), Rationale: Postgres publicado en 5433 no 5432, Redis service (compose.yml)

### Community 61 - "test_client_ip.py"
Cohesion: 0.25
Nodes (12): client_ip(), Request, IP real del cliente detrás de proxies, para los frenos de tasa. Sin esto,…, hops(), set_hops(), IP real del cliente detrás de proxies (api/client_ip.py)., El cliente manda su propio X-Forwarded-For: queda a la izquierda y se ignora., _request() (+4 more)

### Community 62 - "test_rate_limit.py"
Cohesion: 0.18
Nodes (10): get_evidence_store(), require_authenticated(), get_rate_limiter(), Ventana deslizante real, compartida entre cualquier número de…, RedisRateLimiter, El limitador cuenta por clave (IP), no globalmente para todo el proceso — una…, La prueba que justifica la Sesión 4: dos objetos RedisRateLimiter *distintos*…, test_limit_is_per_client_key() (+2 more)

### Community 63 - "run_adversarial_suite.py"
Cohesion: 0.38
Nodes (6): csv, evaluate_case(), load_cases(), main(), run_adversarial_suite.py Corre el set de red-team (evals/adversarial_cases.csv)…, Un caso adversarial por el mismo pipeline que routes_triage.py (modelo ->…

### Community 64 - "test_csrf.py"
Cohesion: 0.14
Nodes (9): Tests del CSRFOriginCheckMiddleware — verificacion de origen para metodos que…, Un cliente que no es navegador (curl, un test, un futuro cliente movil) no…, Simula "Try it out" en /docs: el Origin es el propio backend, no está en…, Algunos navegadores viejos no mandan Origin en same-origin POST, pero sí…, El frontend usa GET, POST y DELETE (borrar historial). Si un método no está en…, test_cors_preflight_allows_every_method_the_frontend_uses(), test_post_falls_back_to_referer_when_origin_missing(), test_post_from_backends_own_origin_is_allowed() (+1 more)

### Community 66 - "config.py"
Cohesion: 0.29
Nodes (12): Configuracion del backend. Todo lo que depende del entorno (keys, orígenes…, Guard de arranque (Sesion 5): si esto no revienta ahora, revienta en produccion…, Settings, validate_production_config(), Tests del guard de arranque (Sesion 5) — backend/app/config.py,…, Hallazgo de la auditoria cyber-neo (Sesion 5): database_url tenia el mismo…, test_development_with_default_admin_password_is_allowed(), test_production_with_default_admin_password_fails_loudly() (+4 more)

### Community 67 - "db.py"
Cohesion: 0.19
Nodes (11): Conexion a Postgres (Sesion 4 — reemplaza el SQLite de las sesiones anteriores,…, _kill_backends(), Reconexión del pool (despliegue en Neon): la base suspende tras unos minutos…, Termina las conexiones del pool de ese schema, como haría Neon al suspender., Dentro de la ventana no se prueba la conexión (sería un viaje de red extra en…, test_query_survives_connections_closed_by_the_server(), test_recently_used_connections_skip_the_ping_and_the_pool_recovers(), contextlib (+3 more)

### Community 68 - "UserStore"
Cohesion: 0.30
Nodes (7): get_current_user(), Devuelve el usuario autenticado si la cookie de sesion es valida, o None si no…, EmailAlreadyRegisteredError, Exception, Capa de acceso a la tabla `users`. No sabe de HTTP ni de hashing de contraseñas…, User, UserStore

### Community 69 - "Despliegue gratuito: Vercel + Render + Neon"
Cohesion: 0.17
Nodes (11): Antes de empezar, Cómo queda armado, Despliegue gratuito: Vercel + Render + Neon, Paso 1 — Neon: la base de datos, Paso 2 — Render: backend y Redis, Paso 3 — Vercel: el frontend, Paso 4 — Conectar las dos puntas, Paso 5 — Prueba de humo (no lo des por desplegado sin esto) (+3 more)

### Community 70 - "main.py"
Cohesion: 0.09
Nodes (11): Punto de entrada. Corre con: uvicorn app.main:app --reload --app-dir backend…, Tests de la capa de gateway agregada en la Sesion 3: versionado (/api/v1 vs…, test_ready_reports_not_ready_when_postgres_fails(), test_ready_reports_not_ready_when_redis_fails(), _csp_directives(), Tests de SecurityHeadersMiddleware — ver backend/app/api/security_headers.py., script-src 'self' https://x" -> {"script-src": ["'self'", "https://x"]}. Se…, test_docs_response_has_permissive_csp_for_swagger_assets() (+3 more)

### Community 71 - "list_flagged_for_review.py"
Cohesion: 0.33
Nodes (8): _is_flagged(), main(), list_flagged_for_review.py Esto NO es una cola de revisión ni un sistema de…, Las entradas de record_provider_error no tienen 'validation' ni…, test_does_not_flag_clean_entry(), test_flags_entry_marked_by_model(), test_flags_entry_that_failed_validation(), test_provider_error_entry_without_validation_key_is_not_flagged()

### Community 72 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

## Knowledge Gaps
- **195 isolated node(s):** `docker-entrypoint.sh script`, `$schema`, `framework`, `buildCommand`, `outputDirectory` (+190 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 497 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Decisión 4: alcance honesto de requiere_revision` connect `backend/README.md` to `list_flagged_for_review.py`?**
  _High betweenness centrality (0.414) - this node is a cross-community bridge._
- **Why does `Diseño visual de Stitch — cómo se implementó y qué queda pendiente` connect `Diseño visual de Stitch — cómo se implementó y qué queda pendiente` to `backend/README.md`, `ResultPage.tsx`?**
  _High betweenness centrality (0.346) - this node is a cross-community bridge._
- **Why does `Mapeo pantalla de Stitch → ruta` connect `ResultPage.tsx` to `Diseño visual de Stitch — cómo se implementó y qué queda pendiente`?**
  _High betweenness centrality (0.342) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `Database` (e.g. with `_ensure_admin_seeded()` and `get_db()`) actually correct?**
  _`Database` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `EvidenceStore` (e.g. with `get_evidence_store()` and `create_triage()`) actually correct?**
  _`EvidenceStore` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `TriageOrchestrator` (e.g. with `get_triage_orchestrator()` and `create_triage()`) actually correct?**
  _`TriageOrchestrator` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `docker-entrypoint.sh script`, `$schema`, `framework` to the rest of the system?**
  _195 weakly-connected nodes found - possible documentation gaps or missing edges._
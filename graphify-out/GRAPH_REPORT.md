# Graph Report - HealthGuideAI  (2026-10-30)

## Corpus Check
- 186 files · ~299,265 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 25 file(s) not represented in the graph (top: (none) 8, .csv 4, .example 2)

## Summary
- 1412 nodes · 2950 edges · 74 communities (61 shown, 13 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 155 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d7a0ec99`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- EvidenceStore
- SessionStore
- AuthContext.tsx
- triage_rules.py
- HomePage.test.tsx
- package.json
- csrf.py
- results.md — Resultados de evals
- triageText.ts
- App.tsx
- backend/README.md
- Reporte del set adversarial (Sesión 8 — blindaje contra prompt injection)
- Capas del Diagrama de Arquitectura
- react
- DECISION_TABLE.md — Gemini vs NVIDIA
- CLAUDE.md — contexto del proyecto HealthGuideAI
- compilerOptions
- CONSTRAINTS.md — nivel de calidad exigido
- ProfilePage.test.tsx
- test_prompt_builder.py
- signup
- SOLID e Interfaz ModelProvider
- PLAN_IMPLEMENTACION.md — roadmap de 14 sesiones
- Design System del Frontend
- Skill de Refactor de Archivos Grandes
- Docker Entrypoint
- test_client_ip.py
- TriageOrchestrator
- test_triage_history.py
- test_chat_api.py
- components.json
- 3. Qué falta — lista exacta, en orden
- validate_triage_output
- ProfilePage.tsx
- types.ts
- HomePage.tsx
- app_orchestration_triage_orchestrator
- routes_chat.py
- app_providers_base
- dependencies.py
- dependencies
- devDependencies
- button.tsx
- vite.config.js
- scripts
- routes_health.py
- app_validation_safe_response
- Database
- ModelProviderError
- AuthPage.tsx
- detect_red_flags
- fixtures.ts
- useSpeechDictation.ts
- rules
- triage_orchestrator.py
- app_providers_nvidia_provider
- Diseño visual de Stitch — cómo se implementó y qué queda pendiente
- Backend service (compose.yml)
- get_settings
- HomePage
- eval_gate.py
- FakeRecognition
- pipeline.py
- Despliegue gratuito: Vercel + Render + Neon
- test_gateway.py
- _is_flagged
- vercel.json
- sanitize_chunk_text
- Gate de evals — PASA
- cause_filter.py
- ABC

## God Nodes (most connected - your core abstractions)
1. `get_settings()` - 43 edges
2. `Database` - 39 edges
3. `validate_triage_output()` - 33 edges
4. `EvidenceStore` - 31 edges
5. `build()` - 31 edges
6. `TriageOrchestrator` - 29 edges
7. `UserStore` - 28 edges
8. `ModelProviderError` - 28 edges
9. `KnowledgeRetriever` - 26 edges
10. `ProfilePage()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `3.5 Gate de evals contra NVIDIA real (bloqueante, gasta cuota)` --references--> `test_content_rules_also_read_respuesta()`  [INFERRED]
  plan.md → backend/tests/test_security_validator.py
- `2. Qué ya está hecho (backend: completo y en verde)` --references--> `run_pipeline()`  [INFERRED]
  plan.md → backend/app/orchestration/pipeline.py
- `2. Qué ya está hecho (backend: completo y en verde)` --references--> `build_provider_error_fallback()`  [INFERRED]
  plan.md → backend/app/validation/safe_response.py
- `2. Qué ya está hecho (backend: completo y en verde)` --references--> `build_safe_fallback()`  [INFERRED]
  plan.md → backend/app/validation/safe_response.py
- `2. Qué ya está hecho (backend: completo y en verde)` --references--> `text_blob()`  [INFERRED]
  plan.md → evals/triage_parsing.py

## Import Cycles
- 3-file cycle: `backend/app/orchestration/__init__.py -> backend/app/orchestration/triage_orchestrator.py -> backend/app/orchestration/prompt_builder.py -> backend/app/orchestration/__init__.py`

## Hyperedges (group relationships)
- **Gate de calidad en CI antes de mergear a main** — github_workflows_ci_ci, constraints_enforced_table, backend_requirements_dev_pkg, readme_ci_cd_section [INFERRED 0.75]
- **Escalabilidad horizontal con Postgres + Redis (Sesion 4)** — compose_postgres, compose_redis, compose_backend, docs_plan_implementacion_sesion4 [INFERRED 0.85]
- **Evidencia del motor de triage hibrido: fix pediatrico + ground truth clinico** — docs_plan_implementacion_sesion6, evals_results_pediatric_fever_fix, evals_clinical_safety_catalog, evals_priority_accuracy_report [INFERRED 0.85]
- **Evidencia consolidada de la decisión NVIDIA vs Gemini** — decision_log_decision1_nvidia_vs_gemini, decision_table_doc, readme_known_failures, claude_md_notebook_gemini [INFERRED 0.85]
- **Flujo compartido de validación de seguridad del triage (notebook + backend + evals)** — claude_md_output_contract, decision_log_validate_triage_output, backend_readme_doc, constraints_enforced_table [INFERRED 0.85]

## Communities (74 total, 13 thin omitted)

### Community 0 - "EvidenceStore"
Cohesion: 0.07
Nodes (35): get_evidence_store(), InMemoryRateLimiter, Ventana deslizante en memoria de un solo proceso — solo para tests, ver el…, EvidenceStore, Exception, Capa de evidencia — cada request/response/veredicto de validación queda como…, Derecho al olvido desde la pantalla de Perfil — borra todas las filas del…, Todas las filas de evidencia, más nuevas primero. A propósito NO filtra acá qué… (+27 more)

### Community 1 - "SessionStore"
Cohesion: 0.27
Nodes (8): Session, SessionStore, Automatiza la prueba manual de la Sesión 4 (CONSTRAINTS.md, fila "Escalabilidad…, Sesión expirada (flujo de la Sesión 12): get_valid la rechaza y la borra, en…, _second_instance(), test_expired_session_is_rejected_and_purged(), test_logout_in_one_instance_invalidates_session_in_the_other(), test_session_created_in_one_instance_is_valid_in_another()

### Community 2 - "AuthContext.tsx"
Cohesion: 0.22
Nodes (13): AuthApiError, authRequest(), AuthRequestOptions, getCurrentUser(), login(), logout(), signup(), User (+5 more)

### Community 3 - "triage_rules.py"
Cohesion: 0.07
Nodes (47): ABC, 4. Configurador de Prompt, HealthGuideAI - Diagrama de Arquitectura (v2), Disclaimer: no diagnostica, no prescribe, no reemplaza a un profesional, Evaluacion y Auditoria, 2. Interfaz de Usuario, 5. Modelo LLM NVIDIA (nemotron-3-super:122b), 3. Orquestador de Triage (+39 more)

### Community 4 - "HomePage.test.tsx"
Cohesion: 0.15
Nodes (15): frontend_src_api_chatapi, frontend_src_api_chatapi_chatapierror, frontend_src_api_chatapi_createconversation, frontend_src_api_chatapi_getconversation, frontend_src_api_chatapi_sendanonymousmessage, frontend_src_api_chatapi_sendmessage, anonymousResult(), mockedCreateConversation (+7 more)

### Community 5 - "package.json"
Cohesion: 0.11
Nodes (18): engines, node, name, private, type, version, jsdom, lucide-react (+10 more)

### Community 6 - "csrf.py"
Cohesion: 0.06
Nodes (34): CSRFOriginCheckMiddleware, _origin_from_referer(), ASGIApp, BaseHTTPMiddleware, Request, CSRF (Sesion 5) via verificacion de origen, no double-submit token. La auth ya…, _envelope(), install_error_handlers() (+26 more)

### Community 7 - "results.md — Resultados de evals"
Cohesion: 0.13
Nodes (22): Arquitectura por capas propuesta (canal/API/orquestacion/modelo/validacion/evidencia/escalamiento), arquitectura.md — Arquitectura HealthGuideAI, Flujo actual del notebook (diagrama), Frontera IA vs software vs humano, Rationale: modelo como capa intercambiable, Rationale: ningun fallo del proveedor puede omitir revision humana, Feedback de mentoria: 6 gates de aceptacion (Emmanuel, makers/review), Sesion 6 — Motor de triage hibrido: reglas + rubrica + few-shot (+14 more)

### Community 8 - "triageText.ts"
Cohesion: 0.43
Nodes (5): CauseParts, DISCLAIMER_SENTENCES, normalize(), splitCause(), splitRecommendation()

### Community 9 - "App.tsx"
Cohesion: 0.13
Nodes (23): checkReady(), ReadyStatus, ROOT_URL, App(), renderRoute(), PageShell(), SiteFooter(), MobileTabBar() (+15 more)

### Community 10 - "backend/README.md"
Cohesion: 0.20
Nodes (9): API Gateway (Sesión 3): versionado /api/v1, /health, /ready, X-Request-ID, Revisión humana: flag registrado, no cola operativa, Estructura app/ por capas (api, orchestration, providers, validation, storage, schemas), Rate limiting con RedisRateLimiter (ventana deslizante), AI flow: input → validaciones deterministas → LLM → JSON → revisión, Sistema de evals (validate_triage_output), Contrato de salida JSON de triage, Decisión 2: canal web app + API ahora, WhatsApp fase 2 (+1 more)

### Community 12 - "Capas del Diagrama de Arquitectura"
Cohesion: 0.23
Nodes (21): Capa de Almacenamiento / Evidencia, Capa de API / Gateway, Capa de Canal, Capa de Modelo (intercambiable), Capa de Orquestación, Capa de Validación (dominio, sin LLM), contract (JTBD, output_fields, reglas del dominio), DECISION_LOG.md (+13 more)

### Community 13 - "react"
Cohesion: 0.12
Nodes (15): Mapeo pantalla de Stitch → ruta, EmergencyPanel(), EmergencyPanelProps, IMMEDIATE_ACTIONS, OfflinePanel(), OfflinePanelProps, QUICK_ADDS, VagueInputPanel() (+7 more)

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

### Community 18 - "ProfilePage.test.tsx"
Cohesion: 0.15
Nodes (16): deleteTriageHistory(), getTriageHistory(), requestTriage(), TriageApiError, TriageResponse, wrapper(), login, signup (+8 more)

### Community 19 - "test_prompt_builder.py"
Cohesion: 0.11
Nodes (19): build_system_prompt(), _format_few_shot(), _format_rubric(), Tests de que la rúbrica, los ejemplos few-shot y el disclaimer reforzado…, No perder las reglas que ya funcionaban al agregar todo lo nuevo., Sesion 8: la jerarquia de instrucciones tiene que estar en el prompt y aparecer…, Sesion 7: el prompt tiene que explicar como usar y citar 'contexto_recuperado',…, 2026-10-03: el modelo de reemplazo contestaba lo minimo si no se le pedia… (+11 more)

### Community 20 - "signup"
Cohesion: 0.15
Nodes (17): login(), logout(), post, Response, El logout manual es el unico mecanismo real de cierre de sesion en este…, _set_session_cookie(), signup(), hash_password() (+9 more)

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
Nodes (57): KnowledgeRetriever, Motor de recuperacion local tipo BM25 (Sesion 7) para la base de conocimiento…, Hasta top_k chunks relevantes, o lista vacia si nada matchea. Una consulta sin…, Indice BM25 en memoria sobre una lista de KnowledgeChunk., RetrievedChunk, tokenize(), KnowledgeChunk, Corpus curado para RAG (Sesion 7). Cada entrada es una fuente de salud publica… (+49 more)

### Community 29 - "test_triage_history.py"
Cohesion: 0.17
Nodes (15): get_current_user(), Devuelve el usuario autenticado si la cookie de sesion es valida, o None si no…, client_with_output(), model_output(), Si el validador rechazó la salida del modelo, el usuario vio el fallback seguro…, Mismo patron que test_api.py (sin importarlo directo: el proyecto no tiene…, Decisión de producto (Sesión 10/11): se puede consultar sin cuenta., Filtrado real en SQL (WHERE user_id), no un chequeo de UI — un usuario nunca… (+7 more)

### Community 30 - "test_chat_api.py"
Cohesion: 0.09
Nodes (39): backend_app_orchestration_chat_orchestrator, backend_app_storage_conversation_store, build(), model_output(), new_conversation(), Exception, API del chat conversacional (routes_chat.py) contra Postgres real y un…, 404 genérico, igual que si no existiera: no se filtra que existe. (+31 more)

### Community 31 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 32 - "3. Qué falta — lista exacta, en orden"
Cohesion: 0.17
Nodes (11): 1. Por qué existe este cambio, 3.4 Correr la suite E2E completa contra Docker reconstruido (bloqueante), 3.5 Gate de evals contra NVIDIA real (bloqueante, gasta cuota), 3.6 Documentación — `DECISION_LOG.md` (bloqueante), 3.7 Documentación — `CLAUDE.md` sección 4 (bloqueante), 3.8 Documentación — opcional, no bloqueante, 3. Qué falta — lista exacta, en orden, 4. Checklist de salida antes de abrir PR a `main` (+3 more)

### Community 33 - "validate_triage_output"
Cohesion: 0.10
Nodes (35): Any, Sesion 8: hallazgo real corriendo el set adversarial contra NVIDIA —…, El caso real que expuso el bug: un input que pide dosis de medicamento no debe…, En el chat lo que se lee primero es `respuesta`: los fallbacks también la traen., test_fallbacks_carry_a_chat_respuesta_that_passes_the_validator(), test_provider_error_fallback_always_passes_its_own_validator(), test_safe_fallback_always_passes_its_own_validator_alta(), test_safe_fallback_always_passes_its_own_validator_emergencia() (+27 more)

### Community 35 - "ProfilePage.tsx"
Cohesion: 0.17
Nodes (26): applyPreferences(), clearAllPreferences(), FontScale, KEYS, loadAlias(), loadCountry(), loadFontScale(), loadReduceMotion() (+18 more)

### Community 36 - "types.ts"
Cohesion: 0.15
Nodes (13): AnonymousChatMessageResponse, AnonymousChatTurn, AssistantEvaluation, ChatMessageOut, ChatMessageResponse, ConversationDetail, ConversationSummary, HistoryEntry (+5 more)

### Community 37 - "HomePage.tsx"
Cohesion: 0.14
Nodes (15): frontend_src_components_home_faqsection, AssistantMessage(), AssistantMessageProps, frontend_src_components_triage_chatcomposer, frontend_src_components_triage_triageresultcard, frontend_src_components_triage_triageresultcard_triageresultcarddata, frontend_src_constants_emergency, frontend_src_constants_emergency_emergency_number (+7 more)

### Community 39 - "routes_chat.py"
Cohesion: 0.07
Nodes (54): _AnonymousTurn, create_conversation(), delete_conversation(), _evaluation_from(), get_conversation(), list_conversations(), _message_to_schema(), Capa de API/Gateway para el chat conversacional de triage. Mismo criterio que… (+46 more)

### Community 41 - "dependencies.py"
Cohesion: 0.09
Nodes (35): _ensure_admin_seeded(), get_db(), get_session_store(), get_user_store(), Wiring de dependencias — el unico lugar del backend donde se decide QUE…, Crea la cuenta admin de arranque si todavia no existe. La contraseña sale de…, require_admin(), require_authenticated() (+27 more)

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

### Community 48 - "routes_health.py"
Cohesion: 0.29
Nodes (9): api_route, _check_postgres(), _check_redis(), liveness(), get, Redis, Response, /health vs /ready — a propósito NO viven bajo /api (ver DECISION_TABLE.md, nota… (+1 more)

### Community 50 - "Database"
Cohesion: 0.13
Nodes (14): Database, Solo para tests: borra el schema completo (CASCADE) al terminar, para no dejar…, Una conexión que de verdad responde. Neon (despliegue) suspende la base tras…, main(), migrate_evidence(), migrate_sessions(), migrate_users(), migrate_sqlite_to_postgres.py Traslada los datos que hayan quedado en el… (+6 more)

### Community 51 - "ModelProviderError"
Cohesion: 0.06
Nodes (57): get_triage_orchestrator(), Guard de arranque (Sesion 5): si esto no revienta ahora, revienta en produccion…, Settings, validate_production_config(), ModelProvider, ModelProviderError, ABC, Capa de modelo — la interfaz que resuelve el pendiente de DECISION_LOG.md… (+49 more)

### Community 52 - "AuthPage.tsx"
Cohesion: 0.36
Nodes (8): GoogleIcon(), AuthPage(), comingSoon(), Field(), Mode, modeFromPath(), passwordStrength(), TabLink()

### Community 53 - "detect_red_flags"
Cohesion: 0.18
Nodes (16): detect_red_flags(), Capa determinista de red flags (Sesion 6) — corre ANTES de llamar al modelo,…, Señales de alarma detectadas en el texto del usuario (lista vacía si ninguna)., El input real puede venir sin tildes — el chequeo tiene que matchear igual., No dos formas de detectar red flags que se puedan desincronizar — entrada (este…, Hallazgo real de la Sesion 6: 'red_flag_fiebre_bebe' clasificaba ALTA en vez de…, No todo lo que menciona fiebre es un red flag — sin la combinacion con edad de…, test_detects_known_red_flag() (+8 more)

### Community 54 - "fixtures.ts"
Cohesion: 0.17
Nodes (13): PUBLIC_PAGES, expectNoHorizontalOverflow(), expectNoSeriousA11yViolations(), Priority, signupViaApi(), signupViaUi(), submitSymptoms(), triageBody() (+5 more)

### Community 55 - "useSpeechDictation.ts"
Cohesion: 0.21
Nodes (7): getRecognitionCtor(), RecognitionCtor, RecognitionResultEvent, SpeechRecognitionLike, FakeRecognition, Listener, useSpeechDictation()

### Community 56 - "rules"
Cohesion: 0.14
Nodes (13): categories, correctness, suspicious, ignorePatterns, plugins, rules, import/no-unassigned-import, jsx-a11y/label-has-associated-control (+5 more)

### Community 57 - "triage_orchestrator.py"
Cohesion: 0.38
Nodes (3): El contrato de producto es estable — ya fue validado por el modelo en la Parte…, Arma SYSTEM_PROTOTYPE a partir del contrato — mismo texto base que construye…, Capa de orquestacion — equivalente a run_prototype() en el notebook, pero…

### Community 59 - "Diseño visual de Stitch — cómo se implementó y qué queda pendiente"
Cohesion: 0.29
Nodes (7): Backlog — funcionalidad que el diseño trae y todavía no existe, Copy que se reescribió (y por qué), Cómo se portó (para quien toque el frontend después), Desvío deliberado del diseño: "Lo que identificamos" y "Qué podría estar pasando" (2026-10-04), Diseño visual de Stitch — cómo se implementó y qué queda pendiente, Dónde consultar el diseño original, Pendiente de verificar

### Community 60 - "Backend service (compose.yml)"
Cohesion: 0.40
Nodes (6): Backend service (compose.yml), Frontend service (compose.yml), Gateway service (compose.yml), Postgres service (compose.yml), Rationale: Postgres publicado en 5433 no 5432, Redis service (compose.yml)

### Community 61 - "get_settings"
Cohesion: 0.07
Nodes (40): IP real del cliente detrás de proxies, para los frenos de tasa. Sin esto,…, get_redis_client(), Redis, get_auth_rate_limiter(), get_rate_limiter(), Redis, Rate limiting. Desde la Sesión 4, la implementación real es `RedisRateLimiter`…, Ventana deslizante real, compartida entre cualquier número de… (+32 more)

### Community 62 - "HomePage"
Cohesion: 0.47
Nodes (4): HomePage(), handleSubmit(), retryLastAttempt(), submit()

### Community 63 - "eval_gate.py"
Cohesion: 0.09
Nodes (30): env.py de Alembic — sin modelos ORM a proposito (mismo criterio que…, DDL del esquema, en una sola lista de sentencias — una única fuente de verdad…, Puente hacia evals/validate_triage_output.py — no se duplica el validador de…, _good_run(), La lógica de umbrales del gate de evals, sin llamar al modelo real., test_accuracy_below_threshold_fails(), test_any_emergency_false_negative_fails_even_with_high_accuracy(), test_clean_run_passes() (+22 more)

### Community 66 - "pipeline.py"
Cohesion: 0.22
Nodes (8): ModelProvider, Pipeline compartido de triaje — extraido de TriageOrchestrator.run() (ver…, historial: lista opcional de turnos previos ({"rol", "texto"}), usada por…, run_pipeline(), build_provider_error_fallback(), Respuestas deterministas para cuando no se puede confiar en el modelo — ni en…, Sesion 6, gate de salida del mentor (MAKERS_ACCEPTANCE.md): "ningún fallo del…, KnowledgeRetriever

### Community 68 - "Despliegue gratuito: Vercel + Render + Neon"
Cohesion: 0.18
Nodes (11): Antes de empezar, Cómo queda armado, Despliegue gratuito: Vercel + Render + Neon, Paso 1 — Neon: la base de datos, Paso 2 — Render: backend y Redis, Paso 3 — Vercel: el frontend, Paso 4 — Conectar las dos puntas, Paso 5 — Prueba de humo (no lo des por desplegado sin esto) (+3 more)

### Community 70 - "test_gateway.py"
Cohesion: 0.06
Nodes (19): Tests del CSRFOriginCheckMiddleware — verificacion de origen para metodos que…, Un cliente que no es navegador (curl, un test, un futuro cliente movil) no…, Simula "Try it out" en /docs: el Origin es el propio backend, no está en…, Algunos navegadores viejos no mandan Origin en same-origin POST, pero sí…, El frontend usa GET, POST y DELETE (borrar historial). Si un método no está en…, test_cors_preflight_allows_every_method_the_frontend_uses(), test_post_falls_back_to_referer_when_origin_missing(), test_post_from_backends_own_origin_is_allowed() (+11 more)

### Community 71 - "_is_flagged"
Cohesion: 0.48
Nodes (6): _is_flagged(), Las entradas de record_provider_error no tienen 'validation' ni…, test_does_not_flag_clean_entry(), test_flags_entry_marked_by_model(), test_flags_entry_that_failed_validation(), test_provider_error_entry_without_validation_key_is_not_flagged()

### Community 72 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 73 - "sanitize_chunk_text"
Cohesion: 0.29
Nodes (9): Sesion 8 (blindaje contra prompt injection): sanitiza el contenido recuperado…, Si el texto de un chunk contiene un patron de inyeccion reconocible, se…, sanitize_chunk_text(), test_clean_text_passes_through_unchanged(), test_redacts_text_with_bracketed_system_marker(), test_redacts_text_with_english_injection_pattern(), test_redacts_text_with_ignore_instructions_pattern(), test_redacts_text_with_you_are_now_pattern() (+1 more)

### Community 75 - "cause_filter.py"
Cohesion: 0.26
Nodes (11): drop_named_disease_causes(), names_specific_disease(), _normalize(), Red determinista para `posibles_causas` (2026-10-04). CLAUDE.md seccion 2…, Devuelve la lista sin las causas que nombran una enfermedad. Si no es una…, parametrize, Red determinista de posibles_causas: categorias generales si, enfermedades con…, gripal' no es 'gripe': se compara por palabra completa. (+3 more)

## Knowledge Gaps
- **206 isolated node(s):** `1. Por qué existe este cambio`, `3.4 Correr la suite E2E completa contra Docker reconstruido (bloqueante)`, `3.6 Documentación — `DECISION_LOG.md` (bloqueante)`, `3.7 Documentación — `CLAUDE.md` sección 4 (bloqueante)`, `3.8 Documentación — opcional, no bloqueante` (+201 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 554 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3.2 Frontend — tests para el componente nuevo `AssistantMessage` (bloqueante)` connect `HomePage.tsx` to `3. Qué falta — lista exacta, en orden`, `ProfilePage.test.tsx`, `react`, `eval_gate.py`?**
  _High betweenness centrality (0.259) - this node is a cross-community bridge._
- **Why does `render()` connect `eval_gate.py` to `HomePage.tsx`?**
  _High betweenness centrality (0.246) - this node is a cross-community bridge._
- **Why does `main()` connect `eval_gate.py` to `validate_triage_output`, `routes_chat.py`, `ModelProviderError`, `TriageOrchestrator`, `get_settings`?**
  _High betweenness centrality (0.206) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `Database` (e.g. with `_ensure_admin_seeded()` and `get_db()`) actually correct?**
  _`Database` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `EvidenceStore` (e.g. with `get_evidence_store()` and `create_triage()`) actually correct?**
  _`EvidenceStore` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `1. Por qué existe este cambio`, `3.4 Correr la suite E2E completa contra Docker reconstruido (bloqueante)`, `3.6 Documentación — `DECISION_LOG.md` (bloqueante)` to the rest of the system?**
  _206 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `EvidenceStore` be split into smaller, more focused modules?**
  _Cohesion score 0.07127882599580712 - nodes in this community are weakly interconnected._
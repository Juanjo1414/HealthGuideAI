# Graph Report - HealthGuideAI  (2026-10-01)

## Corpus Check
- 100 files · ~156,122 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: (none) 8, .csv 3, .example 2)

## Summary
- 761 nodes · 1496 edges · 35 communities (29 shown, 6 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 86 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3a2b0dea`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_api.py
- routes_auth.py
- Frontend React App
- triage_rules.py
- triage_orchestrator.py
- Database
- main.py
- PLAN_IMPLEMENTACION.md — roadmap de 14 sesiones
- test_gateway.py
- validate_triage_output
- config.py
- routes_triage.py
- Capas del Diagrama de Arquitectura
- Config de Build del Frontend
- Decision NVIDIA vs Gemini y Revision de Mentores
- Bugs Documentados en CLAUDE.md
- dependencies.py
- CI y Requisitos de Escalabilidad
- Bug de Palabras Clave de Medicacion y Gaps de CI
- CONSTRAINTS.md — nivel de calidad exigido
- backend/README.md
- SOLID e Interfaz ModelProvider
- Ownership del Equipo
- Design System del Frontend
- Skill de Refactor de Archivos Grandes
- Docker Entrypoint
- KnowledgeRetriever
- test_auth.py
- UserStore
- SessionStore
- RedisRateLimiter
- Exception

## God Nodes (most connected - your core abstractions)
1. `Database` - 33 edges
2. `get_settings()` - 29 edges
3. `KnowledgeRetriever` - 22 edges
4. `Diagrama de Arquitectura — HealthGuideAI` - 20 edges
5. `TriageOrchestrator` - 18 edges
6. `UserStore` - 18 edges
7. `EvidenceStore` - 17 edges
8. `SessionStore` - 15 edges
9. `ValidationRule` - 14 edges
10. `client_with_fresh_db()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Known failures: medicación filtrada, omisión de prioridad, subestimación` --semantically_similar_to--> `DECISION_TABLE.md — Gemini vs NVIDIA`  [INFERRED] [semantically similar]
  README.md → DECISION_TABLE.md
- `Rationale: ningun fallo del proveedor puede omitir revision humana` --semantically_similar_to--> `pitch/index.html — deck de pitch Demo Day`  [INFERRED] [semantically similar]
  docs/PLAN_IMPLEMENTACION.md → pitch/index.html
- `Bug de contrato: Gemini generaba claves propias (prioridad_atencion)` --semantically_similar_to--> `Qué cambió Codex en makers/review`  [INFERRED] [semantically similar]
  DECISION_TABLE.md → REFLEXION_MAKERS_REVIEW.md
- `Riesgo: modelo se sale del esquema sin que se note (casing, escala score)` --semantically_similar_to--> `Bug: prioridad en minúscula tumbaba validación Pydantic`  [INFERRED] [semantically similar]
  REFLEXION_MAKERS_REVIEW.md → CLAUDE.md
- `Riesgo: modelo se sale del esquema sin que se note (casing, escala score)` --semantically_similar_to--> `Bug: score de evaluación crítica en escala 0-100 en vez de 0-10`  [INFERRED] [semantically similar]
  REFLEXION_MAKERS_REVIEW.md → CLAUDE.md

## Import Cycles
- 3-file cycle: `backend/app/orchestration/__init__.py -> backend/app/orchestration/triage_orchestrator.py -> backend/app/orchestration/prompt_builder.py -> backend/app/orchestration/__init__.py`

## Hyperedges (group relationships)
- **Gate de calidad en CI antes de mergear a main** — github_workflows_ci_ci, constraints_enforced_table, backend_requirements_dev_pkg, readme_ci_cd_section [INFERRED 0.75]
- **Narrativa de producto del pitch: arquitectura, evals y roadmap** — pitch_index_html, evals_results, docs_arquitectura_capas_propuestas, docs_plan_implementacion_roadmap [INFERRED 0.80]
- **Escalabilidad horizontal con Postgres + Redis (Sesion 4)** — compose_postgres, compose_redis, compose_backend, docs_plan_implementacion_sesion4 [INFERRED 0.85]
- **Evidencia del motor de triage hibrido: fix pediatrico + ground truth clinico** — docs_plan_implementacion_sesion6, evals_results_pediatric_fever_fix, evals_clinical_safety_catalog, evals_priority_accuracy_report [INFERRED 0.85]
- **Evidencia consolidada de la decisión NVIDIA vs Gemini** — decision_log_decision1_nvidia_vs_gemini, decision_table_doc, readme_known_failures, claude_md_notebook_gemini [INFERRED 0.85]
- **Flujo compartido de validación de seguridad del triage (notebook + backend + evals)** — claude_md_output_contract, decision_log_validate_triage_output, backend_readme_doc, constraints_enforced_table [INFERRED 0.85]

## Communities (35 total, 6 thin omitted)

### Community 0 - "test_api.py"
Cohesion: 0.15
Nodes (17): InMemoryRateLimiter, Ventana deslizante en memoria de un solo proceso — solo para tests, ver el…, client_with_output(), make_stub_user(), model_output(), extra='forbid' (Sesion 5) tambien en TriageRequest., Un usuario real en el schema de test, no un objeto armado a mano —…, StubOrchestrator (+9 more)

### Community 1 - "routes_auth.py"
Cohesion: 0.16
Nodes (20): login(), logout(), me(), get, post, Response, Capa de API/Gateway para autenticación. Igual que routes_triage.py, esta es la…, El logout manual es el unico mecanismo real de cierre de sesion en este… (+12 more)

### Community 2 - "Frontend React App"
Cohesion: 0.08
Nodes (40): AuthApiError, authRequest(), getCurrentUser(), login(), logout(), signup(), requestTriage(), TriageApiError (+32 more)

### Community 3 - "triage_rules.py"
Cohesion: 0.06
Nodes (45): detect_red_flags(), Capa determinista de red flags (Sesion 6) — corre ANTES de llamar al modelo,…, Señales de alarma detectadas en el texto del usuario (lista vacía si ninguna)., El input real puede venir sin tildes — el chequeo tiene que matchear igual., No dos formas de detectar red flags que se puedan desincronizar — entrada (este…, Hallazgo real de la Sesion 6: 'red_flag_fiebre_bebe' clasificaba ALTA en vez de…, No todo lo que menciona fiebre es un red flag — sin la combinacion con edad de…, test_detects_known_red_flag() (+37 more)

### Community 4 - "triage_orchestrator.py"
Cohesion: 0.06
Nodes (50): El contrato de producto es estable — ya fue validado por el modelo en la Parte…, build_system_prompt(), _format_few_shot(), _format_rubric(), Arma SYSTEM_PROTOTYPE a partir del contrato — mismo texto base que construye…, ModelProvider, Capa de orquestacion — equivalente a run_prototype() en el notebook, pero…, TriageOrchestrator (+42 more)

### Community 5 - "Database"
Cohesion: 0.07
Nodes (30): Database, Conexion a Postgres (Sesion 4 — reemplaza el SQLite de las sesiones anteriores,…, Solo para tests: borra el schema completo (CASCADE) al terminar, para no dejar…, EvidenceStore, Exception, Capa de evidencia — cada request/response/veredicto de validación queda como…, Todas las filas de evidencia, más nuevas primero. A propósito NO filtra acá qué…, _is_flagged() (+22 more)

### Community 6 - "main.py"
Cohesion: 0.06
Nodes (37): CSRFOriginCheckMiddleware, _origin_from_referer(), ASGIApp, BaseHTTPMiddleware, Request, CSRF (Sesion 5) via verificacion de origen, no double-submit token. La auth ya…, _envelope(), install_error_handlers() (+29 more)

### Community 7 - "PLAN_IMPLEMENTACION.md — roadmap de 14 sesiones"
Cohesion: 0.07
Nodes (49): Backend service (compose.yml), Frontend service (compose.yml), Gateway service (compose.yml), Postgres service (compose.yml), Rationale: Postgres publicado en 5433 no 5432, Redis service (compose.yml), Arquitectura por capas propuesta (canal/API/orquestacion/modelo/validacion/evidencia/escalamiento), arquitectura.md — Arquitectura HealthGuideAI (+41 more)

### Community 8 - "test_gateway.py"
Cohesion: 0.06
Nodes (12): Tests del CSRFOriginCheckMiddleware — verificacion de origen para metodos que…, Un cliente que no es navegador (curl, un test, un futuro cliente movil) no…, Simula "Try it out" en /docs: el Origin es el propio backend, no está en…, Algunos navegadores viejos no mandan Origin en same-origin POST, pero sí…, test_post_falls_back_to_referer_when_origin_missing(), test_post_from_backends_own_origin_is_allowed(), test_post_without_origin_or_referer_is_allowed(), Tests de la capa de gateway agregada en la Sesion 3: versionado (/api/v1 vs… (+4 more)

### Community 9 - "validate_triage_output"
Cohesion: 0.14
Nodes (26): Any, me duele' no debe confundirse con reporte de tercero solo porque comparte la…, test_own_symptoms_do_not_trigger_third_party_rule(), test_rejects_boolean_confidence(), test_rejects_extra_fields_and_non_string_list_items(), test_rejects_non_object_json(), test_third_party_report_with_review_flag_passes(), test_third_party_report_without_review_flag_fails() (+18 more)

### Community 10 - "config.py"
Cohesion: 0.06
Nodes (41): env.py de Alembic — sin modelos ORM a proposito (mismo criterio que…, _check_postgres(), _check_redis(), liveness(), get, Redis, Response, /health vs /ready — a propósito NO viven bajo /api (ver DECISION_TABLE.md, nota… (+33 more)

### Community 11 - "routes_triage.py"
Cohesion: 0.11
Nodes (20): enforce_rate_limit(), Request, RateLimiter, Dependencia de FastAPI. `limiter` llega inyectado vía Depends(get_rate_limiter)…, Interfaz chica a propósito (Interface Segregation, CLAUDE.md sección 13): lo…, create_triage(), post, Capa de API/Gateway. Esta es la unica capa que sabe de HTTP — recibe el… (+12 more)

### Community 12 - "Capas del Diagrama de Arquitectura"
Cohesion: 0.23
Nodes (21): Capa de Almacenamiento / Evidencia, Capa de API / Gateway, Capa de Canal, Capa de Modelo (intercambiable), Capa de Orquestación, Capa de Validación (dominio, sin LLM), contract (JTBD, output_fields, reglas del dominio), DECISION_LOG.md (+13 more)

### Community 13 - "Config de Build del Frontend"
Cohesion: 0.11
Nodes (18): dependencies, react, react-dom, react-router-dom, devDependencies, vite, @vitejs/plugin-react, name (+10 more)

### Community 14 - "Decision NVIDIA vs Gemini y Revision de Mentores"
Cohesion: 0.17
Nodes (14): HealthGuideAI_Gemini.ipynb (dado de baja), HealthGuideAI_Nvidia.ipynb, Decisión 1: proveedor de modelo NVIDIA nemotron vs Gemini, DECISION_TABLE.md — Gemini vs NVIDIA, Bug de contrato: Gemini generaba claves propias (prioridad_atencion), Hallazgo: no-determinismo estructural del JSON (thinking habilitado), Tabla de costo estimado NVIDIA (~$0.01/caso), Referencia a validate_triage_output.py (5 reglas core) (+6 more)

### Community 15 - "Bugs Documentados en CLAUDE.md"
Cohesion: 0.17
Nodes (13): AI flow: input → validaciones deterministas → LLM → JSON → revisión, Bug: login no aparecía por caché de Docker + fallo silencioso de npm ci, Bug: Postgres nativo en puerto 5432 chocaba con el de Docker, Bug: prioridad en minúscula tumbaba validación Pydantic, Bug: run_prototype reventaba con ValidationError de Pydantic, Bug: score de evaluación crítica en escala 0-100 en vez de 0-10, Sistema de evals (validate_triage_output), frontend/ (React 18 + Vite) (+5 more)

### Community 16 - "dependencies.py"
Cohesion: 0.16
Nodes (21): _ensure_admin_seeded(), get_db(), get_evidence_store(), get_redis_client(), get_session_store(), get_triage_orchestrator(), get_user_store(), Redis (+13 more)

### Community 17 - "CI y Requisitos de Escalabilidad"
Cohesion: 0.24
Nodes (10): Migraciones Alembic (SQL crudo desde app/storage/schema.py), Escalabilidad horizontal (Sesión 4): Postgres + Redis compartidos, alembic como versionador de esquema (sin ORM), backend/requirements-dev.txt (pytest, httpx, pytest-cov), backend/requirements.txt (fastapi, uvicorn, pydantic, psycopg2, redis, alembic), Elección psycopg2 síncrono (evitar mezclar modelos de concurrencia), backend-tests job, docker-build job (+2 more)

### Community 18 - "Bug de Palabras Clave de Medicacion y Gaps de CI"
Cohesion: 0.20
Nodes (10): Bug: validador dejaba pasar categorías genéricas de medicación (antitérmicos), CI Workflow, Permisos GITHUB_TOKEN restringidos a contents:read, Sección CI/CD del README, Current score: safety pass rate y accuracy de prioridad, README.md — HealthGuide AI, Next hypothesis: few-shot explícito contra medicación adversarial, Sección Pendiente (roadmap corto) (+2 more)

### Community 19 - "CONSTRAINTS.md — nivel de calidad exigido"
Cohesion: 0.22
Nodes (9): Seguridad de la aplicación (Sesión 5): guard de arranque, CSRF, headers, Auditoría cyber-neo del repo (Sesión 5): root en contenedor, DATABASE_URL default, Cobertura backend ≥80% ratchet (hoy 91%), Tabla de dimensiones enforced con número y comando, Política de excepciones (owner + fecha de vencimiento, máx 90 días), Floor: reglas siempre enforced (sin supresiones, sin stubs, sin secretos), Gaps conocidos (accesibilidad, prompt injection set, linter frontend), CONSTRAINTS.md — nivel de calidad exigido (+1 more)

### Community 20 - "backend/README.md"
Cohesion: 0.32
Nodes (6): API Gateway (Sesión 3): versionado /api/v1, /health, /ready, X-Request-ID, Revisión humana: flag registrado, no cola operativa, Estructura app/ por capas (api, orchestration, providers, validation, storage, schemas), Rate limiting con RedisRateLimiter (ventana deslizante), Decisión 2: canal web app + API ahora, WhatsApp fase 2, Decisión 4: alcance honesto de requiere_revision

### Community 21 - "SOLID e Interfaz ModelProvider"
Cohesion: 0.25
Nodes (8): ModelProvider como interfaz, no función suelta (Dependency Inversion), backend/ (FastAPI, monolito modular por capas), Interfaz ModelProvider (backend/app/providers/base.py), Aplicación de SOLID en el monolito modular por capas, Decisión 3: monolito modular por capas, no SOUP ni microservicios, ModelProvider como interfaz (Dependency Inversion), Aplicación de SOLID en TriageValidator/ValidationRule, evals/validate_triage_output.py refactorizado a clases SOLID

### Community 22 - "Ownership del Equipo"
Cohesion: 0.40
Nodes (4): Build owner: Juan José, Evaluate owner: Cristian (ground truth clínico), Explain owner: Juan José (README, decisiones, demo), Tabla de ownership real (Build/Evaluate/Explain owner)

### Community 24 - "Skill de Refactor de Archivos Grandes"
Cohesion: 0.67
Nodes (3): Umbral de 100 líneas para refactor, Sub-agente context-gatherer, Skill: refactor-large-files

### Community 28 - "KnowledgeRetriever"
Cohesion: 0.10
Nodes (26): KnowledgeRetriever, Motor de recuperacion local tipo BM25 (Sesion 7) para la base de conocimiento…, Hasta top_k chunks relevantes, o lista vacia si nada matchea. Una consulta sin…, Indice BM25 en memoria sobre una lista de KnowledgeChunk., RetrievedChunk, tokenize(), KnowledgeChunk, Corpus curado para RAG (Sesion 7). Cada entrada es una fuente de salud publica… (+18 more)

### Community 29 - "test_auth.py"
Cohesion: 0.24
Nodes (13): client_with_fresh_db(), extra='forbid' (Sesion 5): un campo colado a mano (ej. "role": "admin") tiene…, test_login_with_correct_credentials_succeeds(), test_login_with_wrong_password_returns_401(), test_logout_invalidates_session(), test_me_with_valid_session_returns_user(), test_me_without_session_returns_401(), test_session_cookie_is_not_secure_in_development() (+5 more)

### Community 30 - "UserStore"
Cohesion: 0.30
Nodes (7): get_current_user(), Devuelve el usuario autenticado si la cookie de sesion es valida, o None si no…, EmailAlreadyRegisteredError, Exception, Capa de acceso a la tabla `users`. No sabe de HTTP ni de hashing de contraseñas…, User, UserStore

### Community 31 - "SessionStore"
Cohesion: 0.31
Nodes (5): Capa de acceso a la tabla `sessions`. Sesiones respaldadas por servidor (no JWT…, Session, SessionStore, datetime, secrets

### Community 32 - "RedisRateLimiter"
Cohesion: 0.29
Nodes (5): Redis, Ventana deslizante real, compartida entre cualquier número de…, RedisRateLimiter, La prueba que justifica la Sesión 4: dos objetos RedisRateLimiter *distintos*…, test_redis_rate_limiter_shares_state_across_instances()

## Knowledge Gaps
- **44 isolated node(s):** `react`, `react-dom`, `react-router-dom`, `vite`, `@vitejs/plugin-react` (+39 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 261 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Decisión 4: alcance honesto de requiere_revision` connect `backend/README.md` to `Database`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Why does `get_settings()` connect `dependencies.py` to `RedisRateLimiter`, `routes_auth.py`, `Database`, `main.py`, `config.py`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `Database` connect `Database` to `dependencies.py`, `config.py`, `UserStore`, `SessionStore`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `Database` (e.g. with `_ensure_admin_seeded()` and `get_db()`) actually correct?**
  _`Database` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `TriageOrchestrator` (e.g. with `get_triage_orchestrator()` and `create_triage()`) actually correct?**
  _`TriageOrchestrator` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `react`, `react-dom`, `react-router-dom` to the rest of the system?**
  _44 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `test_api.py` be split into smaller, more focused modules?**
  _Cohesion score 0.14855072463768115 - nodes in this community are weakly interconnected._
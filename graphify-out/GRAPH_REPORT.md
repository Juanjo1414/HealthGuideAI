# Graph Report - HealthGuideAI  (2026-10-01)

## Corpus Check
- 100 files · ~156,122 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: (none) 8, .csv 3, .example 2)

## Summary
- 759 nodes · 1492 edges · 36 communities (30 shown, 6 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 87 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ade52db4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_api.py
- dependencies.py
- Frontend React App
- triage_rules.py
- triage_orchestrator.py
- Database
- main.py
- PLAN_IMPLEMENTACION.md — roadmap de 14 sesiones
- test_gateway.py
- validate_triage_output
- run_priority_metrics.py
- routes_triage.py
- Capas del Diagrama de Arquitectura
- Config de Build del Frontend
- Decision NVIDIA vs Gemini y Revision de Mentores
- Bugs Documentados en CLAUDE.md
- Manejo del Sobre de Error
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
- config.py
- test_csrf.py
- AccessLogMiddleware
- CSRFOriginCheckMiddleware
- SecurityHeadersMiddleware
- Exception

## God Nodes (most connected - your core abstractions)
1. `Database` - 33 edges
2. `get_settings()` - 29 edges
3. `KnowledgeRetriever` - 23 edges
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

## Communities (36 total, 6 thin omitted)

### Community 0 - "test_api.py"
Cohesion: 0.06
Nodes (37): enforce_rate_limit(), get_rate_limiter(), InMemoryRateLimiter, Redis, Request, RateLimiter, Rate limiting. Desde la Sesión 4, la implementación real es `RedisRateLimiter`…, Dependencia de FastAPI. `limiter` llega inyectado vía Depends(get_rate_limiter)… (+29 more)

### Community 1 - "dependencies.py"
Cohesion: 0.06
Nodes (60): _ensure_admin_seeded(), get_current_user(), get_db(), get_evidence_store(), get_redis_client(), get_session_store(), get_triage_orchestrator(), get_user_store() (+52 more)

### Community 2 - "Frontend React App"
Cohesion: 0.08
Nodes (40): AuthApiError, authRequest(), getCurrentUser(), login(), logout(), signup(), requestTriage(), TriageApiError (+32 more)

### Community 3 - "triage_rules.py"
Cohesion: 0.07
Nodes (42): detect_red_flags(), Capa determinista de red flags (Sesion 6) — corre ANTES de llamar al modelo,…, Señales de alarma detectadas en el texto del usuario (lista vacía si ninguna)., El input real puede venir sin tildes — el chequeo tiene que matchear igual., No dos formas de detectar red flags que se puedan desincronizar — entrada (este…, Hallazgo real de la Sesion 6: 'red_flag_fiebre_bebe' clasificaba ALTA en vez de…, No todo lo que menciona fiebre es un red flag — sin la combinacion con edad de…, test_detects_known_red_flag() (+34 more)

### Community 4 - "triage_orchestrator.py"
Cohesion: 0.06
Nodes (50): El contrato de producto es estable — ya fue validado por el modelo en la Parte…, build_system_prompt(), _format_few_shot(), _format_rubric(), Arma SYSTEM_PROTOTYPE a partir del contrato — mismo texto base que construye…, ModelProvider, Capa de orquestacion — equivalente a run_prototype() en el notebook, pero…, TriageOrchestrator (+42 more)

### Community 5 - "Database"
Cohesion: 0.06
Nodes (34): Database, Conexion a Postgres (Sesion 4 — reemplaza el SQLite de las sesiones anteriores,…, Solo para tests: borra el schema completo (CASCADE) al terminar, para no dejar…, EvidenceStore, Exception, Capa de evidencia — cada request/response/veredicto de validación queda como…, Todas las filas de evidencia, más nuevas primero. A propósito NO filtra acá qué…, _is_flagged() (+26 more)

### Community 6 - "main.py"
Cohesion: 0.19
Nodes (11): _origin_from_referer(), CSRF (Sesion 5) via verificacion de origen, no double-submit token. La auth ya…, Middleware de gateway: request ID y logging de acceso estructurado. Orden de…, Headers de seguridad (Sesion 5) — defensa en profundidad para el navegador,…, Punto de entrada. Corre con: uvicorn app.main:app --reload --app-dir backend…, fastapi_middleware_cors, starlette_middleware_base, starlette_requests (+3 more)

### Community 7 - "PLAN_IMPLEMENTACION.md — roadmap de 14 sesiones"
Cohesion: 0.07
Nodes (49): Backend service (compose.yml), Frontend service (compose.yml), Gateway service (compose.yml), Postgres service (compose.yml), Rationale: Postgres publicado en 5433 no 5432, Redis service (compose.yml), Arquitectura por capas propuesta (canal/API/orquestacion/modelo/validacion/evidencia/escalamiento), arquitectura.md — Arquitectura HealthGuideAI (+41 more)

### Community 8 - "test_gateway.py"
Cohesion: 0.15
Nodes (3): Tests de la capa de gateway agregada en la Sesion 3: versionado (/api/v1 vs…, test_ready_reports_not_ready_when_postgres_fails(), test_ready_reports_not_ready_when_redis_fails()

### Community 9 - "validate_triage_output"
Cohesion: 0.13
Nodes (28): Any, me duele' no debe confundirse con reporte de tercero solo porque comparte la…, test_own_symptoms_do_not_trigger_third_party_rule(), test_rejects_boolean_confidence(), test_rejects_extra_fields_and_non_string_list_items(), test_rejects_non_object_json(), test_third_party_report_with_review_flag_passes(), test_third_party_report_without_review_flag_fails() (+20 more)

### Community 10 - "run_priority_metrics.py"
Cohesion: 0.12
Nodes (16): env.py de Alembic — sin modelos ORM a proposito (mismo criterio que…, DDL del esquema, en una sola lista de sentencias — una única fuente de verdad…, csv, compute_priority_metrics(), load_cases(), PriorityMetricsReport, metrics.py Mide algo que validate_triage_output.py no mide: si la prioridad que…, Lee uno o más CSV de evals y devuelve todas las filas como dicts. No valida… (+8 more)

### Community 11 - "routes_triage.py"
Cohesion: 0.18
Nodes (13): create_triage(), post, Capa de API/Gateway. Esta es la unica capa que sabe de HTTP — recibe el…, BaseModel, field_validator, Esquemas de la API. TriageResponse envuelve el contrato de salida fijo de…, TriageRequest, TriageResponse (+5 more)

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

### Community 16 - "Manejo del Sobre de Error"
Cohesion: 0.26
Nodes (11): _envelope(), install_error_handlers(), handle_http_exception(), handle_unexpected_error(), handle_validation_error(), Request, Sobre de error consistente para toda la API. Antes de esto, cada endpoint…, _request_id() (+3 more)

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

### Community 29 - "config.py"
Cohesion: 0.17
Nodes (20): _check_postgres(), _check_redis(), liveness(), get, Redis, Response, /health vs /ready — a propósito NO viven bajo /api (ver DECISION_TABLE.md, nota…, readiness() (+12 more)

### Community 30 - "test_csrf.py"
Cohesion: 0.17
Nodes (7): Tests del CSRFOriginCheckMiddleware — verificacion de origen para metodos que…, Un cliente que no es navegador (curl, un test, un futuro cliente movil) no…, Simula "Try it out" en /docs: el Origin es el propio backend, no está en…, Algunos navegadores viejos no mandan Origin en same-origin POST, pero sí…, test_post_falls_back_to_referer_when_origin_missing(), test_post_from_backends_own_origin_is_allowed(), test_post_without_origin_or_referer_is_allowed()

### Community 31 - "AccessLogMiddleware"
Cohesion: 0.24
Nodes (7): AccessLogMiddleware, ASGIApp, BaseHTTPMiddleware, Request, Asigna un request_id (o respeta el que mande un proxy delante nuestro, ej. el…, Una línea por request, sin datos sensibles: quién (método+ruta), qué pasó…, RequestIdMiddleware

### Community 32 - "CSRFOriginCheckMiddleware"
Cohesion: 0.38
Nodes (4): CSRFOriginCheckMiddleware, ASGIApp, BaseHTTPMiddleware, Request

### Community 33 - "SecurityHeadersMiddleware"
Cohesion: 0.33
Nodes (4): ASGIApp, BaseHTTPMiddleware, Request, SecurityHeadersMiddleware

## Knowledge Gaps
- **44 isolated node(s):** `react`, `react-dom`, `react-router-dom`, `vite`, `@vitejs/plugin-react` (+39 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 260 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Decisión 4: alcance honesto de requiere_revision` connect `backend/README.md` to `Database`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Why does `get_settings()` connect `dependencies.py` to `CSRFOriginCheckMiddleware`, `test_api.py`, `SecurityHeadersMiddleware`, `Database`, `main.py`, `run_priority_metrics.py`, `config.py`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `TriageOrchestrator` connect `triage_orchestrator.py` to `dependencies.py`, `run_priority_metrics.py`, `routes_triage.py`, `KnowledgeRetriever`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `Database` (e.g. with `_ensure_admin_seeded()` and `get_db()`) actually correct?**
  _`Database` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `KnowledgeRetriever` (e.g. with `KnowledgeChunk` and `TriageOrchestrator`) actually correct?**
  _`KnowledgeRetriever` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `TriageOrchestrator` (e.g. with `get_triage_orchestrator()` and `create_triage()`) actually correct?**
  _`TriageOrchestrator` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `react`, `react-dom`, `react-router-dom` to the rest of the system?**
  _44 weakly-connected nodes found - possible documentation gaps or missing edges._
# Constraints

Last reviewed: 2026-10-02 — Sesiones 12-13 de [`docs/PLAN_IMPLEMENTACION.md`](docs/PLAN_IMPLEMENTACION.md)

Este es el nivel de calidad que HealthGuideAI tiene que cumplir para considerarse "listo", con
números concretos y el comando que los verifica — no una intención en prosa. Ninguna sesión del
roadmap se da por terminada si algo de acá queda en rojo.

**Política de bloqueo: todo bloquea, sin excepciones y sin período de gracia.** No hay checks en
modo "warning" ni siquiera al principio. Es una decisión explícita del equipo: ya hubo un bug
real (el login que no aparecía) que llegó a "andar en la máquina de alguien" sin que nadie lo
viera fallar formalmente, y el dominio es salud — un falso negativo en EMERGENCIA o un secreto
filtrado no son el tipo de cosas que uno quiere descubrir después.

## Floor (siempre enforced, sin instalar nada nuevo)

- Sin comentarios de supresión nuevos: `# type: ignore`, `# noqa`, `eslint-disable` (cuando el
  frontend: el linter es oxlint, Sesión 12).
- Sin stubs sin implementar: `raise NotImplementedError` dejado a propósito, `except: pass`
  vacío, `TODO` parado donde debería ir la implementación real.
- Sin tests saltados (`@pytest.mark.skip`) o borrados sin razón explícita en el mensaje de commit.
- Sin secretos en el código fuente (`NVIDIA_API_KEY`, `ADMIN_PASSWORD`, cadenas de conexión).
- Sin credenciales por defecto llegando a producción en silencio — `admin/12345` solo existe como
  fallback de desarrollo; `validate_production_config()` (`backend/app/config.py`) hace fallar el
  arranque si `ENVIRONMENT=production` y la contraseña sigue siendo esa. **Ya implementado**, no
  es una regla aspiracional.
- Este archivo no se debilita para que un cambio pase. Si un número acá arriba molesta,
  se discute y se cambia en su propio commit — nunca junto con el cambio que lo estaba violando.

## Enforced con número

| Dimensión | Regla | Verificado por | Corre en |
|---|---|---|---|
| Tests backend | Toda la suite pasa | `python -m pytest backend/tests -q` | cada edit, CI |
| Cobertura backend | ≥ 92% de líneas (ratchet desde la Sesión 8; medido 97% en la Sesión 12) | `python -m pytest backend/tests --cov=backend/app --cov-fail-under=92` | cada edit, CI |
| Tests frontend | Toda la suite de Vitest pasa | `npm run test` en `frontend/` | cada edit, CI |
| Cobertura frontend | ≥ 88% líneas / 86% sentencias / 80% ramas / 78% funciones (piso de la Sesión 12, medido 91/89/82/81) | `npm run test:coverage` (umbrales en `vitest.config.ts`) | cada edit, CI |
| Lint | Cero hallazgos | `ruff check backend evals` (config en `ruff.toml`) y `npm run lint` (oxlint, `.oxlintrc.json`) | cada edit, CI |
| Typecheck | Cero errores, incluye tests y e2e | `npm run typecheck` | cada edit, CI |
| Flujos E2E | Signup/login/logout, triaje en las 4 prioridades, sesión expirada, 429, 502, sin red, borrar historial — en escritorio y móvil | `npm run test:e2e` (Playwright) contra el stack de compose | CI (`e2e.yml`) |
| Readiness real | `/ready` en 503 si falta `NVIDIA_API_KEY`, Postgres o Redis no responden | `curl -f http://localhost:8000/ready` | cada edit, CI |
| Sobre de error | Toda respuesta de error trae `detail` + `error.code` + `error.request_id` | `backend/tests/test_gateway.py` | cada edit, CI |
| Escalabilidad horizontal | 2 instancias del backend comparten sesión y rate limit (no las inventa cada una por su cuenta) | `backend/tests/test_horizontal_scaling.py` (sesión compartida entre dos pools) + `test_rate_limit.py::test_redis_rate_limiter_shares_state_across_instances` | cada edit, CI |
| Migraciones | El esquema se aplica solo, `alembic upgrade head` es idempotente | `backend/docker-entrypoint.sh` corre en cada arranque del contenedor | cada `docker compose up`, CI |
| Seguridad de salida (8 reglas) | Ningún caso viola esquema / diagnóstico / medicación / input incompleto / red flags / reporte de tercero / fuga de prompt / dominio | `evals/validate_triage_output.py` vía `run_eval_suite()` | cada sesión que toque el prompt o el proveedor |
| Accuracy clínico | ≥ 90% PASS en los 25 casos, accuracy de prioridad ≥ 80% — **2026-10-03, con `nemotron-3.5-lightning`: 80% (12/15), cumple justo** (87% en otra corrida del mismo día; ver `evals/results.md`). Sesión 12, con el modelo que NVIDIA dio de baja: 60% (9/15); antes 67% (10/15), subió desde 75% (6/8) de la Sesión 6 pero sobre una muestra mayor (15 vs 8) y sin errores de proveedor por primera vez; todavía no cumple el umbral | `python evals/eval_gate.py` (sale con código 1 si se incumple cualquier umbral de esta tabla) | `evals.yml` programado (Sesión 13) |
| Red flags de EMERGENCIA | **Cero** falsos negativos — ninguna EMERGENCIA real clasificada por debajo | mismo run de evals, columna `expected_priority` vs `prioridad` en casos con `red_flag=true` — **cumplido en la corrida 2 de la Sesión 7** (4/4 EMERGENCIA correctos) tras corregir un bug real encontrado en la corrida 1 (ver `evals/results.md`, Sesión 7: el escalado toleraba que el modelo dijera ALTA sin corregir, violando el gate) | bloqueante duro; repetir con muestra mayor cuando NVIDIA esté más estable |
| Análisis estático de seguridad | Sin alertas nuevas de CodeQL en el PR | CodeQL Python + JavaScript/TypeScript (`security.yml`). El job sube las alertas; **lo que bloquea el merge es el check `CodeQL` de code scanning exigido por la protección de rama** (`docs/branch-protection-main.json`) — pendiente de aplicar, ver Sesión 13 | cada push/PR + semanal, CI |
| Seguridad del modelo | 100% del set adversarial de prompt injection resuelto de forma segura para el usuario | `evals/run_adversarial_suite.py` sobre `evals/adversarial_cases.csv` — **cumplido: 12/12 (100%)**, corrida real contra NVIDIA del 2026-10-01 (ver `evals/results.md`, Sesión 8). Medido sobre la respuesta final (modelo + validador + fallback), no solo la respuesta cruda — el modelo solo resistió 8/12 (67%) sin ayuda del validador, métrica aparte, informativa | manual hoy, luego `evals.yml` (Sesión 13) |
| Secretos | Ninguno en el código fuente ni en el historial de git | `gitleaks` (`security.yml`): en cada push/PR escanea los commits nuevos; la corrida semanal programada recorre **todo** el historial. Única excepción, por texto exacto en `.gitleaks.toml`: la contraseña de ejemplo de OpenAPI y de los tests E2E | cada push/PR + semanal, CI |
| Dependencias (Python) | Nada en `high` o superior | `pip-audit -r backend/requirements.txt` (`security.yml`) | cada push/PR + semanal, CI |
| Dependencias (Node) | Nada en `high` o superior | `npm audit --audit-level=high` en `frontend/` (`security.yml`) | cada push/PR + semanal, CI |
| Accesibilidad | Cero violaciones `critical`/`serious`, contraste ≥ 4.5:1, navegación 100% por teclado | `e2e/a11y-responsive.spec.ts` (axe WCAG 2.1 AA en todas las pantallas) + `e2e/desktop-only.spec.ts` (triaje solo con teclado) | CI (`e2e.yml`) |
| Responsive | Sin scroll horizontal en 375px / 768px / 1024px / 1440px y en móvil emulado (Pixel 7) | `e2e/desktop-only.spec.ts` (anchos fijos) + proyecto `mobile` de Playwright | CI (`e2e.yml`) |
| Cookies de sesión | `Secure` ligado a `ENVIRONMENT`, `HttpOnly` + `SameSite=Lax` siempre | `backend/tests/test_auth.py` (`test_session_cookie_is_secure_in_production` y su contraparte) | cada edit, CI |
| Fuerza bruta en login/registro | Máximo 10 intentos por minuto por IP (`AUTH_RATE_LIMIT_MAX_REQUESTS`), en un bucket aparte del de triage | `backend/tests/test_auth_rate_limit.py` | cada edit, CI |
| CSRF | Todo POST/PUT/PATCH/DELETE exige un `Origin`/`Referer` confiable si trae alguno | `backend/tests/test_csrf.py` | cada edit, CI |
| Headers de seguridad | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, CSP en toda respuesta | `backend/tests/test_security_headers.py` | cada edit, CI |
| Validación de entrada | `SignupRequest`/`LoginRequest`/`TriageRequest` rechazan campos inesperados (422) | `test_signup_rejects_unexpected_field`, `test_triage_rejects_unexpected_field` | cada edit, CI |
| Guard de arranque | El proceso no levanta en `ENVIRONMENT=production` con config insegura | `backend/tests/test_config_guard.py` | cada edit, CI |

Cada fila nombra el comando que produce el veredicto. Una fila con número y sin comando en
"Verificado por" es una aspiración, no un constraint — por eso el estado real de cada una
(¿corre hoy o hace falta instalar/crear algo primero?) queda explícito en la tabla, no escondido.

## Medido, no enforced todavía

| Métrica | Hoy | Dirección |
|---|---|---|
| Cobertura backend | 97% (medido 2026-10-02, Sesión 13 — corre contra Postgres/Redis reales, no mocks) | no debe bajar del piso de 92% |
| Bundle JS frontend | ~410 KB / ~109 KB gzip tras el diseño de Stitch (Sesión 11; antes ~197 KB / ~64 KB) | se fija presupuesto duro (Lighthouse/`size-limit`) después de la migración a Tailwind+shadcn (Sesiones 9-11) — poner un número ahora quedaría obsoleto de inmediato |
| Bundle CSS frontend | ~83 KB / ~13 KB gzip (antes ~13 KB / ~3.5 KB) | igual que arriba |
| Latencia `/api/triage` | hasta 35s observados (timeout de `frontend/src/api/triageApi.ts`, ligado a la latencia de NVIDIA, no del código propio) | separar "overhead de orquestación" vs. latencia del proveedor cuando se instrumente (Sesión 3, `/ready` y logging) |

## Gaps conocidos (por qué no todo tiene comando todavía)

Ser honesto en vez de aparentar que esto ya está completo:

- **Checks externos reales, en CI desde la Sesión 13:** `pip-audit`/`npm audit` (CVEs de PyPI/OSV y
  npm), gitleaks, CodeQL y axe (WCAG 2.1 AA en las E2E). Lo que todavía no está activo es la
  **protección de rama de `main`** que convierte esos checks en obligatorios para mergear: necesita
  `gh` autenticado (`docs/branch-protection-main.json`). Hasta entonces, "bloquea" depende de
  respetar el proceso de PR, no de que GitHub lo impida.
- **Detrás de un proxy, los frenos de tasa no son "por IP".** Login, registro y triage usan
  `request.client.host`, y uvicorn no confía en `X-Forwarded-For`: entrando por el gateway o por el
  proxy de un hosting, todos los clientes comparten un bucket (10 logins fallidos por minuto dejarían
  a todos sin entrar). Directo al backend, como corre hoy, sí es por IP. Se arregla con
  `--proxy-headers --forwarded-allow-ips=<subred del proxy>` y un test — **requisito de la Sesión 14
  antes de desplegar**.
- **Detrás del gateway, CSRF rechaza los POST del propio sitio (403 `forbidden_origin`).**
  `backend/app/api/csrf.py` arma el origen propio con `request.url`, pero el gateway manda
  `Host $host` (sin puerto) y uvicorn ignora `X-Forwarded-Proto`, así que no coincide con el `Origin`
  del navegador (puerto o `https` distintos). Hoy solo se evita poniendo el origen público en
  `CORS_ALLOWED_ORIGINS`. Arreglo, junto con el anterior (es el mismo flag de uvicorn): `Host
  $http_host` en `gateway/nginx.conf`, `--proxy-headers` y un test en `test_csrf.py`. También es
  **requisito de la Sesión 14**.
- **El gate de accuracy está en verde pero justo en el umbral** (80%, 2026-10-03, con el modelo de
  reemplazo; la Decisión 6 explica el cambio). Con 15 casos, un caso de diferencia mueve 7 puntos:
  si la corrida semanal de `evals.yml` cae debajo de 80%, vuelve a ser un gap bloqueante. La mejora
  vino del modelo, no de un ajuste de la rúbrica clínica (MEDIA vs. BAJA), que sigue pendiente.
- **El set adversarial (Sesión 8) tiene 12 casos, 2 por categoría de ataque** — cubre lo que pide
  el plan, pero 12 casos no agota el espacio de ataques posibles contra un LLM. Correrlo
  periódicamente (y ampliarlo cuando se encuentre un caso nuevo) sigue siendo trabajo activo, no
  algo que se cierra una vez y se olvida.
- **La detección de patrones de uso anómalo (ítem 7 de la Sesión 8) no está implementada.**
  Tamaño máximo de input (4000 caracteres, `TriageRequest`) y rate limiting distribuido (Sesión 4)
  ya existían; la detección de anomalías (ej. un mismo IP mandando muchos intentos de jailbreak
  seguidos) necesitaría infraestructura de monitoreo que no existe todavía — no se improvisó algo
  a medias solo para marcar la casilla.
- **Los 4 ejemplos few-shot del prompt (`contract.FEW_SHOT_EXAMPLES`, Sesión 6) no están
  validados clínicamente por Cristian todavía** — son un punto de partida razonable, escritos
  deliberadamente fuera del catálogo de evals para no contaminar el accuracy, pero no tienen el
  mismo nivel de revisión que `evals/CLINICAL_SAFETY_CATALOG.md`. Pendiente, sin dueño asignado.
- **`PEDIATRIC_FEVER_PATTERN` (Sesión 6) es un regex acotado a un solo caso evidenciado**
  (fiebre combinada con bebé/lactante), no detección clínica general de riesgo pediátrico —
  mismo límite honesto que ya declara `CLAUDE.md` sección 9 sobre el validador completo.
- **Las 4 fuentes del corpus RAG (`backend/app/knowledge/sources.py`, Sesión 7) no están
  validadas clínicamente por Cristian todavía** — mismo tratamiento que los ejemplos few-shot de
  la Sesión 6. Además, las citas en `source_quote_en` se obtuvieron vía una herramienta de fetch
  que procesa el HTML con un modelo intermedio, no un volcado verificado byte-a-byte contra la
  página real (el acceso directo con `curl` fue bloqueado por el firewall del entorno de
  desarrollo) — las URLs son reales y públicas, pero alguien del equipo debería confirmar la
  redacción exacta antes de tratarlas como verbatim "congeladas" para auditoría formal.
- **BM25 sobre un corpus de 4 fuentes no siempre ordena la más específica en primer lugar**
  cuando dos fuentes comparten vocabulario clínico (ej. "respirar" aparece tanto en la fuente de
  infarto como en la de emergencia general) — el contrato real de `KnowledgeRetriever.search()`
  es "la fuente relevante aparece en el top_k", no "siempre gana el primer puesto". Documentado
  con test (`test_breathing_difficulty_query_retrieves_medlineplus_source`), no es una suposición.
- **El modelo solo resiste el 67% (8/12) de los intentos adversariales sin ayuda del validador**
  (Sesión 8) — el sistema es seguro igual (el validador+fallback atrapa el 100% antes de que
  llegue al usuario), pero la jerarquía de instrucciones del prompt (`contract.
  INSTRUCTION_HIERARCHY`) todavía no logra que el modelo se resista solo en todos los casos. No
  se maquilla el número: la defensa en profundidad funciona, el prompt por sí solo no alcanza
  todavía. Mejorarlo es trabajo futuro, no bloqueante hoy porque la capa de validación ya cubre
  el hueco.
- **`PROMPT_LEAK_PATTERNS` y `OUT_OF_DOMAIN_PATTERNS` (Sesión 8) son listas heurísticas de
  palabras clave**, mismo límite honesto que `MEDICATION_KEYWORDS`: detectan violaciones obvias,
  no garantizan cobertura completa si el modelo dice lo mismo con otras palabras.

## Exceptions

| ID | Regla | Ruta | Razón | Owner | Vence |
|---|---|---|---|---|---|
| — | — | — | Sin excepciones activas hoy | — | — |

Una excepción nueva necesita owner y fecha de vencimiento (máximo 90 días) — sin eso, no se
agrega a esta tabla ni se hace por fuera de ella.

# Constraints

Last reviewed: 2026-10-01 — Sesión 7 de [`docs/PLAN_IMPLEMENTACION.md`](docs/PLAN_IMPLEMENTACION.md)

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
  frontend tenga linter, sesión 9+).
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
| Cobertura backend | ≥ 80% de líneas (hoy en 92%, no puede bajar de ahí — ratchet) | `python -m pytest backend/tests --cov=backend/app --cov-report=term-missing` | fin de sesión, CI |
| Readiness real | `/ready` en 503 si falta `NVIDIA_API_KEY`, Postgres o Redis no responden | `curl -f http://localhost:8000/ready` | cada edit, CI |
| Sobre de error | Toda respuesta de error trae `detail` + `error.code` + `error.request_id` | `backend/tests/test_gateway.py` | cada edit, CI |
| Escalabilidad horizontal | 2 instancias del backend comparten sesión y rate limit (no las inventa cada una por su cuenta) | Prueba manual documentada en la Sesión 4 del plan (`docker run` de 2 instancias + curl cruzado) | verificado una vez; automatizar como test de integración en la Sesión 12 |
| Migraciones | El esquema se aplica solo, `alembic upgrade head` es idempotente | `backend/docker-entrypoint.sh` corre en cada arranque del contenedor | cada `docker compose up`, CI |
| Seguridad de salida (5 reglas) | Ningún caso viola esquema / diagnóstico / medicación / input incompleto / red flags | `evals/validate_triage_output.py` vía `run_eval_suite()` | cada sesión que toque el prompt o el proveedor |
| Accuracy clínico | ≥ 90% PASS en los 25 casos, accuracy de prioridad ≥ 80% — hoy en 67% (10/15), subió desde 75% (6/8) de la Sesión 6 pero sobre una muestra mayor (15 vs 8) y sin errores de proveedor por primera vez; todavía no cumple el umbral | `evals/run_priority_metrics.py` sobre `evals/triage_eval_cases*.csv` | Sesión 7, luego `evals.yml` (Sesión 13) |
| Red flags de EMERGENCIA | **Cero** falsos negativos — ninguna EMERGENCIA real clasificada por debajo | mismo run de evals, columna `expected_priority` vs `prioridad` en casos con `red_flag=true` — **cumplido en la corrida 2 de la Sesión 7** (4/4 EMERGENCIA correctos) tras corregir un bug real encontrado en la corrida 1 (ver `evals/results.md`, Sesión 7: el escalado toleraba que el modelo dijera ALTA sin corregir, violando el gate) | bloqueante duro; repetir con muestra mayor cuando NVIDIA esté más estable |
| Seguridad del modelo | 100% del set adversarial de prompt injection rechazado | set adversarial de la Sesión 8 (aún no existe — ver Gaps) | desde que exista, luego `evals.yml` |
| Secretos | Ninguno en el código fuente | grep de patrones de secretos (Sesión 5); `gitleaks` real queda pendiente para CI (Sesión 13) | manual hoy, CI en Sesión 13 |
| Dependencias (Python) | Nada en `high` o superior | `pip-audit -r backend/requirements.txt` — corrido en Sesión 5, limpio | manual hoy, CI en Sesión 13 |
| Dependencias (Node) | Nada en `high` o superior | `npm audit` en `frontend/` — corrido en Sesión 5, limpio | manual hoy, CI en Sesión 13 |
| Accesibilidad | Cero violaciones `critical`/`serious`, contraste ≥ 4.5:1, navegación 100% por teclado | `axe` contra preview local (a instalar, Sesión 10/12) | Sesión 10 en adelante, CI |
| Responsive | Funcional en 375px / 768px / 1024px / 1440px | revisión manual hoy; Playwright con viewports fijos en Sesión 12 | Sesión 11 (QA visual), Sesión 12 (automatizado) |
| Cookies de sesión | `Secure` ligado a `ENVIRONMENT`, `HttpOnly` + `SameSite=Lax` siempre | `backend/tests/test_auth.py` (`test_session_cookie_is_secure_in_production` y su contraparte) | cada edit, CI |
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
| Cobertura backend | 92% (87 tests, medido 2026-10-01, Sesión 7 — corre contra Postgres/Redis reales, no mocks) | no debe bajar |
| Bundle JS frontend | ~197 KB / ~64 KB gzip | se fija presupuesto duro (Lighthouse/`size-limit`) después de la migración a Tailwind+shadcn (Sesiones 9-11) — poner un número ahora quedaría obsoleto de inmediato |
| Bundle CSS frontend | ~13 KB / ~3.5 KB gzip | igual que arriba |
| Cobertura frontend | 0% (no hay test runner instalado — Vitest llega en la Sesión 12) | se establece un piso cuando exista |
| Latencia `/api/triage` | hasta 35s observados (timeout de `frontend/src/api/triageApi.js:19`, ligado a la latencia de NVIDIA, no del código propio) | separar "overhead de orquestación" vs. latencia del proveedor cuando se instrumente (Sesión 3, `/ready` y logging) |

## Gaps conocidos (por qué no todo tiene comando todavía)

Ser honesto en vez de aparentar que esto ya está completo:

- **Ya hay un check externo real** (Sesión 5): `pip-audit`/`npm audit` consultan bases de CVEs de
  verdad (PyPI/OSV, npm advisory database), no una regla propia del proyecto. Sigue faltando el
  equivalente para accesibilidad (WCAG vía `axe`, Sesión 10) y el escaneo de secretos/CVEs
  automatizado en CI (`gitleaks`/`osv-scanner`, Sesión 13) — hoy `pip-audit`/`npm audit` se
  corrieron a mano, no en cada push.
- **El set adversarial de prompt injection todavía no existe** — es el entregable de la Sesión 8.
  La fila de la tabla de arriba queda con la regla y el "cuándo debería correr", no con un
  comando real todavía.
- **El frontend no tiene linter ni type-checker instalado.** Llega con la migración a TypeScript
  (Sesión 9): `tsc --noEmit` se vuelve parte del floor en cuanto exista `tsconfig.json`.
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

## Exceptions

| ID | Regla | Ruta | Razón | Owner | Vence |
|---|---|---|---|---|---|
| — | — | — | Sin excepciones activas hoy | — | — |

Una excepción nueva necesita owner y fecha de vencimiento (máximo 90 días) — sin eso, no se
agrega a esta tabla ni se hace por fuera de ella.

# Constraints

Last reviewed: 2026-09-22 — Sesión 2 de [`docs/PLAN_IMPLEMENTACION.md`](docs/PLAN_IMPLEMENTACION.md)

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
- Sin credenciales por defecto llegando a producción en silencio — ver la regla de la Sesión 5
  del plan sobre `backend/app/config.py:89-90` (`admin/12345` solo puede existir como fallback
  de desarrollo, nunca sin un guard que falle en `ENVIRONMENT=production`).
- Este archivo no se debilita para que un cambio pase. Si un número acá arriba molesta,
  se discute y se cambia en su propio commit — nunca junto con el cambio que lo estaba violando.

## Enforced con número

| Dimensión | Regla | Verificado por | Corre en |
|---|---|---|---|
| Tests backend | Toda la suite pasa | `python -m pytest backend/tests -q` | cada edit, CI |
| Cobertura backend | ≥ 80% de líneas (hoy ya en 85%, no puede bajar de ahí — ratchet) | `python -m pytest backend/tests --cov=backend/app --cov-report=term-missing` | fin de sesión, CI |
| Seguridad de salida (5 reglas) | Ningún caso viola esquema / diagnóstico / medicación / input incompleto / red flags | `evals/validate_triage_output.py` vía `run_eval_suite()` | cada sesión que toque el prompt o el proveedor |
| Accuracy clínico | ≥ 90% PASS en los 25 casos, accuracy de prioridad ≥ 80% | `evals/run_priority_metrics.py` sobre `evals/triage_eval_cases*.csv` | Sesiones 6-7, luego `evals.yml` (Sesión 13) |
| Red flags de EMERGENCIA | **Cero** falsos negativos — ninguna EMERGENCIA real clasificada por debajo | mismo run de evals, columna `expected_priority` vs `prioridad` en casos con `red_flag=true` | igual que arriba — bloqueante duro, no es negociable como estadística |
| Seguridad del modelo | 100% del set adversarial de prompt injection rechazado | set adversarial de la Sesión 8 (aún no existe — ver Gaps) | desde que exista, luego `evals.yml` |
| Secretos | Ninguno en el código fuente | `gitleaks detect --redact --no-banner` (a instalar, Sesión 5) | CI |
| Dependencias | Nada en `high` o superior | `osv-scanner scan source -r .` (a instalar, Sesión 5/13) | CI |
| Accesibilidad | Cero violaciones `critical`/`serious`, contraste ≥ 4.5:1, navegación 100% por teclado | `axe` contra preview local (a instalar, Sesión 10/12) | Sesión 10 en adelante, CI |
| Responsive | Funcional en 375px / 768px / 1024px / 1440px | revisión manual hoy; Playwright con viewports fijos en Sesión 12 | Sesión 11 (QA visual), Sesión 12 (automatizado) |
| Cookies de sesión | `Secure` + `HttpOnly` + `SameSite` correctos | test de integración de auth (Sesión 5) | CI |
| CSRF | Todo POST/PUT/DELETE con sesión exige token válido | test de integración (Sesión 5) | CI |

Cada fila nombra el comando que produce el veredicto. Una fila con número y sin comando en
"Verificado por" es una aspiración, no un constraint — por eso el estado real de cada una
(¿corre hoy o hace falta instalar/crear algo primero?) queda explícito en la tabla, no escondido.

## Medido, no enforced todavía

| Métrica | Hoy | Dirección |
|---|---|---|
| Cobertura backend | 85% (26 tests, medido 2026-09-22) | no debe bajar |
| Bundle JS frontend | ~197 KB / ~64 KB gzip | se fija presupuesto duro (Lighthouse/`size-limit`) después de la migración a Tailwind+shadcn (Sesiones 9-11) — poner un número ahora quedaría obsoleto de inmediato |
| Bundle CSS frontend | ~13 KB / ~3.5 KB gzip | igual que arriba |
| Cobertura frontend | 0% (no hay test runner instalado — Vitest llega en la Sesión 12) | se establece un piso cuando exista |
| Latencia `/api/triage` | hasta 35s observados (timeout de `frontend/src/api/triageApi.js:19`, ligado a la latencia de NVIDIA, no del código propio) | separar "overhead de orquestación" vs. latencia del proveedor cuando se instrumente (Sesión 3, `/ready` y logging) |

## Gaps conocidos (por qué no todo tiene comando todavía)

Ser honesto en vez de aparentar que esto ya está completo:

- **Ningún check hoy es 100% externo.** `evals/validate_triage_output.py` es un validador propio
  del proyecto, no una autoridad externa como WCAG (axe) o una base de CVEs (osv-scanner) — esas
  dos llegan en la Sesión 5/10/13. Hasta entonces, la única línea de defensa real es la Sesión 8
  (blindaje del modelo) más este archivo, no un escáner independiente.
- **El set adversarial de prompt injection todavía no existe** — es el entregable de la Sesión 8.
  La fila de la tabla de arriba queda con la regla y el "cuándo debería correr", no con un
  comando real todavía.
- **El frontend no tiene linter ni type-checker instalado.** Llega con la migración a TypeScript
  (Sesión 9): `tsc --noEmit` se vuelve parte del floor en cuanto exista `tsconfig.json`.

## Exceptions

| ID | Regla | Ruta | Razón | Owner | Vence |
|---|---|---|---|---|---|
| — | — | — | Sin excepciones activas hoy | — | — |

Una excepción nueva necesita owner y fecha de vencimiento (máximo 90 días) — sin eso, no se
agrega a esta tabla ni se hace por fuera de ella.

# Plan de implementación — De prototipo a producto confiable

Roadmap de HealthGuideAI dividido en sesiones de trabajo independientes. Cada sesión es un
bloque de trabajo completo (código + tests + verificación) que se puede ejecutar por separado,
en el orden indicado por sus dependencias. Se actualiza la columna **Estado** a medida que se
avanza — este documento es un tablero vivo, no un archivo que se escribe una vez y se olvida.

Ver también [`CLAUDE.md`](../CLAUDE.md) para el contexto de producto y las reglas de negocio que
no se negocian, y `DECISION_LOG.md` / `DECISION_TABLE.md` para las decisiones de arquitectura ya
tomadas.

## Estado general

| # | Sesión | Fase | Estado |
|---|---|---|---|
| 1 | Higiene: login + contexto real | Fundamentos | ✅ Hecha |
| 2 | Estándar de calidad (`/constraints` + `/spec`) | Fundamentos | ✅ Hecha |
| 3 | API Gateway + consolidación en NVIDIA | Backend | ✅ Hecha |
| 4 | Escalabilidad horizontal (Postgres + Redis) | Backend | ✅ Hecha |
| 5 | Seguridad de la aplicación | Backend | ✅ Hecha |
| 6 | Motor de triage híbrido (reglas + few-shot) | Clínico | ✅ Hecha |
| 7 | Base de conocimiento (RAG) | Clínico | ✅ Hecha |
| 8 | Blindaje del modelo (prompt injection) | Clínico | ✅ Hecha |
| 9 | Setup TypeScript + Tailwind + shadcn/ui | Frontend | ✅ Hecha |
| 10 | Componentes base (accesibilidad preservada) | Frontend | ✅ Hecha (con 11, diseño de Stitch) |
| 11 | Pantallas completas + responsive | Frontend | 🟡 Hecha — falta QA visual en dispositivos |
| 12 | Suite de tests completa | Verificación | ✅ Hecha |
| 13 | GitHub Actions completos | Verificación | ⬜ Pendiente |
| 14 | Despliegue público + merge a `main` | Verificación | ⬜ Pendiente |
| 15 | Funcionalidad nueva del diseño de Stitch | Producto | ⬜ Plan a futuro |

---

## Feedback de mentoría (`MAKERS_ACCEPTANCE.md`, rama `makers/review`, 2026-09-23)

Emmanuel (mentor) dejó 6 gates de aceptación en `makers/review`, revisando la integración de
`dev/Juanjo` + `dev/Cristian` a esa fecha. Quedan mapeados acá para que no se pierdan como un
archivo aparte que nadie vuelve a mirar — cada uno con dónde se atiende en este roadmap.

| Gate | Estado del mentor | Dónde se atiende |
|---|---|---|
| Arquitectura atribuible | PASS — falta el PR | Sesión 14 pasa a hacerse vía PR (ver nota de proceso abajo) |
| Uso de IA + evals | PARCIAL — 5/9 accuracy, 6 errores de proveedor | Sesiones 6-7, con el detalle nuevo de abajo sobre fallos de proveedor |
| Jailbreak y safety | PARCIAL — falta cero falsos negativos + fallback ante timeout/503 | Sesión 6, requisito explícito agregado |
| Mantenibilidad | PARCIAL — `validate_triage_output.py` pasa 300 líneas | Sesión 6, paso 0 (refactor antes de agregar red flags) |
| Producto ejecutable | PASS — probar con usuarios, sin más infraestructura | Ver nota de prioridad abajo |
| Git profesional | PARCIAL — PRs chicos, consolidar ramas, docs contradictoria | Ver nota de proceso abajo |

**Lo que cambia en sesiones concretas:**

- **Sesión 6** gana un paso 0: partir `evals/validate_triage_output.py` (364 líneas hoy,
  confirmado) en parsing / reglas / reporting **antes** de agregarle la capa de red flags
  determinista — agregar más lógica a un archivo que el mentor ya marcó como difícil de mantener
  sería ignorar el gate en vez de cerrarlo.
- **Sesión 6** gana un requisito explícito de diseño: hoy, si NVIDIA responde 503/timeout,
  `routes_triage.py` devuelve un 502 genérico sin haber corrido ningún chequeo — el usuario se
  queda sin nada. Con los red flags corriendo **antes** de llamar al modelo (ya era el diseño
  planeado), un fallo del proveedor con un red flag ya detectado no puede terminar en un 502
  mudo: tiene que devolver igual una prioridad ALTA/EMERGENCIA con `requiere_revision=true`,
  aunque la elaboración del LLM nunca haya llegado. Eso es literalmente el "gate de salida" que
  escribió el mentor: *"ningún fallo del proveedor puede convertirse en una recomendación
  tranquilizadora ni omitir revisión humana"* — un 502 sin respuesta no es tranquilizador, pero
  tampoco es seguro si había un red flag real y nadie se entera.
- **Sesiones 6-7**: la cifra "5/9, 6 errores de proveedor" es un dato nuevo — la mayoría de los
  fallos de la corrida que vio el mentor no fueron de calidad de clasificación sino de
  disponibilidad de NVIDIA. Reforzar esto en la Sesión 7: además de RAG/few-shot, revisar
  `NVIDIA_MAX_RETRIES` (hoy en 0 por defecto) y si conviene subirlo antes de gastar esfuerzo en
  el prompt — una corrida "inestable" por 503s no dice nada confiable sobre el prompt en sí.

**Nota de proceso — decidido (2026-09-28):** se sigue mergeando `dev/Juanjo` → `main` directo,
como hasta ahora, mientras trabaja una sola persona a la vez en el backend. El flujo de PR real
(con review) se adopta recién en la Sesión 14, que ya estaba planeada así — no hace falta
agregar fricción a cada sesión antes de eso.

**Sobre "consolidar ramas":** revisado — `dev/Cristian` (remota) no tiene trabajo en conflicto,
está exactamente en el commit `545d272`, el mismo punto donde arrancó este plan en la Sesión 1.
No hay nada que "resolver" en el sentido de choques de código; simplemente no tiene las Sesiones
1-4 todavía. Lo que sí hace falta es que Cristian actualice su rama (`git merge dev/Juanjo` o
`main`) antes de seguir trabajando ahí, para no divergir más de lo necesario. También existe
`codex/revision-healthguide-confiabilidad` (remota), sin revisar en esta pasada — si nadie sabe
para qué es, es candidata a limpiar.

**Nota de prioridad — decidido (2026-09-28):** se sigue con la Sesión 5 ahora. Seguridad de la
app es corta y endurece lo que ya existe (no es "más infraestructura" en el sentido que marca el
mentor). Probar con usuarios reales queda pendiente de planificar, en paralelo o después, sin
bloquear esta sesión.

---

## Contexto

El proyecto migró de notebooks a una web app real (FastAPI + React), pero quedó a medio camino
entre "prototipo de curso" y "producto que alguien puede usar". Tres problemas concretos lo
evidenciaron al arrancar este plan:

1. **El login no aparecía al correr la app.** Causa raíz confirmada: las imágenes Docker se
   construyeron el 17-sep-2026 y el commit que agrega auth (`545d272`) es del 19-sep-2026.
   `docker compose up` sin `--build` reutiliza las imágenes viejas. El código estaba bien — solo
   faltaba reconstruir. Resuelto en la Sesión 1.

2. **La arquitectura no soporta escalar.** Sesiones de auth en SQLite en disco, rate limiting en
   memoria por proceso, evidencia en un `.jsonl` local. Nada de eso sobrevive a correr 2+
   instancias.

3. **La calidad clínica no está donde debe.** Los evals dan 18/25 PASS (72%) y accuracy de
   prioridad de 36-57%. Para un producto que clasifica urgencia médica, eso no alcanza.

**Resultado esperado:** una app con backend escalable horizontalmente, triage clínicamente
confiable y blindado contra manipulación, frontend responsive y accesible en TypeScript, y todo
verificado por tests reales — no por suposiciones.

---

## Decisiones tomadas (cierran alternativas, no volver a abrirlas sin motivo)

| Decisión | Elegido | Implicación |
| --- | --- | --- |
| Proveedor de modelo | **Solo NVIDIA** | Se elimina Gemini del código. `ModelProvider` se queda como ABC (buena práctica), pero con una sola implementación |
| Persistencia | **PostgreSQL + Redis** | Postgres: usuarios, sesiones, evidencia. Redis: rate limiting distribuido y cache. Adiós SQLite |
| Calidad del triage | **Híbrido + RAG** | Reglas deterministas de red flags → few-shot del catálogo clínico validado → RAG sobre guías curadas |
| Frontend | **TypeScript + Tailwind + shadcn/ui** | Migración completa desde `.jsx` + CSS plano |
| Rama de trabajo | **`dev/Juanjo`** | Todo se prueba ahí; a `main` solo cuando esté funcional y testeado |

**Design system — actualizado (2026-10-02):** el diseño visual es el que el equipo armó en Google
Stitch ("Serene Clinical Intelligence"), y reemplaza la paleta "Accessible & Ethical" de la Sesión 9.
Superficie `#F9F9FF`, primary `#00392E` / primary-container `#0F5144`, secondary `#006C49`, Plus
Jakarta Sans, íconos Material Symbols. Tokens portados 1:1 a `frontend/src/styles/tailwind.css`;
escala de prioridad propia (4 niveles, ≥4.5:1). Todo el detalle — mapeo de pantallas, copy
reescrito y backlog — en [`DESIGN_STITCH.md`](DESIGN_STITCH.md). **Prohibido igual que antes:**
neón, animaciones pesadas, y además cualquier texto que afirme algo que el producto no hace
(certificaciones, métricas o médicos inventados).

| Decisión (2026-10-02) | Elegido | Implicación |
| --- | --- | --- |
| Acceso al triage | **Sin cuenta** | La cuenta solo sirve para guardar historial (`DECISION_LOG.md`, Decisión 5) |

---

## Reglas que aplican a TODAS las sesiones

- **Nada se da por funcional sin probarlo.** Si algo falla, se arregla antes de seguir con lo
  siguiente.
- **Tests en la misma sesión que el código**, no "después".
- **Seguridad por defecto, no como parche final.** Toda entrada se valida en la frontera, nada
  de secretos en el repo, sin `except` genéricos que se traguen errores, principio de menor
  privilegio, dependencias al día. Cada sesión que agregue una superficie nueva (endpoint,
  formulario, storage) cierra su propia seguridad antes de darse por terminada.
- **Buenas prácticas sostenidas:** SOLID como ya lo define `CLAUDE.md` sección 13, type hints en
  backend, tipado en frontend, funciones con una sola razón para cambiar, sin lógica duplicada
  entre capas.
- **Documentación en español natural**, explicando el *porqué*. Si alguien lee el código y tiene
  que preguntar qué hace, la documentación falló.
- **Un slice a la vez**, commiteado individualmente.
- **Todo en `dev/Juanjo`.** Merge a `main` solo en la sesión final.
- **Los commits van solo a nombre de Juan José** (autor y committer), sin línea `Co-Authored-By`
  ni ningún otro rastro de que el agente participó — el historial de GitHub debe mostrar
  autoría individual real, como pide el estándar del curso (sección 10 de `CLAUDE.md`), no
  autoría compartida con la IA.
- **El disclaimer de IA es obligatorio** en toda respuesta: el sistema puede equivocarse y la
  recomendación es consultar a un médico.

---

# FASE 0 — Fundamentos

## Sesión 1 — Higiene: recuperar el login y decir la verdad en el contexto ✅

**Objetivo:** ver la app real corriendo con login, y dejar de arrastrar contexto falso.

1. `docker compose build --no-cache && docker compose up -d`.
2. Mover `.claude/CLAUDE.md` → `CLAUDE.md` en la raíz y sacarlo del `.gitignore`, para que todo
   el equipo lo vea (antes era puramente local).
3. Reescribir su contenido: documentar `backend/` y `frontend/` (que antes no aparecían en
   absoluto), corregir nombres de notebooks, marcar como hechos los 25 casos de evals y la
   validación clínica, corregir el estado de `ModelProvider` (ya resuelto en backend), registrar
   que Gemini se elimina.
4. Publicar este plan como `docs/PLAN_IMPLEMENTACION.md`, enlazado desde `README.md` y
   `CLAUDE.md`.
5. Cerrar pendientes de curso: `TEAM_ROTATION.md` con ownership real en vez de `TBD`.

**Verificación:** login visible tras el rebuild; `CLAUDE.md` contrastado contra la estructura
real del repo; `git status` confirma `CLAUDE.md` y este plan trackeados.

---

## Sesión 2 — Definir el estándar antes de construir ✅

**Objetivo:** escribir el nivel de calidad exigido, para que ninguna sesión posterior lo baje en
silencio.

1. [`CONSTRAINTS.md`](../CONSTRAINTS.md) con umbrales concretos y verificables — política de
   bloqueo sin excepciones, floor, tabla de dimensiones con comando de verificación, línea base
   medida (backend: 26 tests, 85% cobertura; bundle frontend: ~197KB JS / ~13KB CSS antes de la
   migración), y gaps honestos (todavía no hay ningún check 100% externo, eso llega en las
   Sesiones 5/10/13).
2. [`docs/PANTALLAS.md`](PANTALLAS.md): inventario de las 6 pantallas (login, signup, triage,
   historial, perfil, revisión humana) con criterio de aceptación por una. Encontró dos bloqueos
   reales de backend que no estaban en el radar: **Historial** y **Revisión humana** necesitan
   endpoints que no existen todavía (`GET /api/v1/triage/history` filtrado por usuario, y
   `GET /api/v1/admin/flagged`) — se agregan como tarea explícita de la Sesión 11 más abajo, en
   vez de descubrirse a mitad de esa sesión. **Corrección de la Sesión 3:** la autorización por
   rol admin (`require_admin`) ya existía en `backend/app/api/dependencies.py`, no hacía falta
   agregarla — el bloqueo real es solo el endpoint en sí.

**Verificación:** cada constraint tiene una forma automática de medirse; si no se puede medir, no
es un constraint — confirmado corriendo `pytest backend/tests --cov` de verdad en vez de inventar
un número.
**Riesgo evitado:** el plan original iba a inventar un umbral de cobertura; se midió primero
(85% real) y se fijó el número sano de la skill (80%) con ratchet a lo ya logrado.

---

# FASE 1 — Backend sólido

## Sesión 3 — API Gateway estructurado + consolidación en NVIDIA ✅

**Objetivo:** que la capa de API sea una frontera real, no un conjunto de rutas sueltas.

1. **Gemini:** confirmado que el backend nunca implementó `GeminiProvider` — no había nada que
   eliminar en código. Se dejó constancia formal en `DECISION_TABLE.md` y se limpió el
   comentario duplicado de `.env.example`.
2. **Versionado:** `/api/v1/*` es la ruta canónica; `/api/*` sigue funcionando idéntico, marcado
   `deprecated` en OpenAPI (`include_router(..., deprecated=True)`). Política de deprecación
   escrita en `backend/app/main.py`: se retira cuando el frontend migre (Sesiones 9-11), no antes.
3. **Middleware:** `RequestIdMiddleware` y `AccessLogMiddleware` (nuevos,
   `backend/app/api/middleware.py`) junto a `CORSMiddleware` (ya existía). Orden documentado
   explícitamente en el código (Starlette monta el stack en reversa — el último agregado queda
   más afuera).
4. **Sobre de error consistente** (`backend/app/api/errors.py`): `{"detail", "error": {"code",
   "request_id"}}` en todo error, sin romper `frontend/src/api/*.js` que ya lee `detail`. El
   catch-all nunca expone un stack trace — loguea server-side con el `request_id`, responde
   genérico al cliente.
5. **`/health` y `/ready`** (`backend/app/api/routes_health.py`), sin prefijo `/api`. `/ready`
   chequea lo que hoy es real (`NVIDIA_API_KEY` + base de auth) — los checks de Postgres/Redis se
   agregan en la Sesión 4, no antes (un check contra un servicio que no existe sería falso).
6. **Gateway reverse proxy** (`gateway/nginx.conf` + servicio `gateway` en `compose.yml`, puerto
   `8888`): aditivo, probado end-to-end (health/ready/api/frontend enrutan bien). Honesto en el
   propio comentario del archivo: el bundle del frontend todavía no pasa por él (sigue llamando
   a `:8000` directo vía `VITE_API_BASE_URL`) — el cableado de origen único es de la Sesión 14.
7. **OpenAPI con ejemplos reales**: `json_schema_extra` en los schemas de auth/triage, `summary`
   y `responses` con casos de error en cada ruta.

**Verificación real (no solo "los tests pasan"):** 33 tests backend en verde (89% cobertura, subió
de 85%), suite completa corrida tras reconstruir la imagen Docker del backend — el mismo error de
"contenedor con imagen vieja" que causó el bug de login de la Sesión 1 se volvió a chequear acá a
propósito. Probado en vivo contra contenedores reales: `/health`, `/ready`, `/api/v1/auth/me` y el
frontend, los cuatro a través del gateway en `:8888` y también directo en `:8000`/`:8080`.

**Deuda que queda anotada, no escondida:** si el tráfico entra por el gateway, el rate limiter
(`rate_limit.py`) cuenta por la IP del contenedor del gateway, no la del cliente real —
documentado en el propio archivo, se resuelve cuando el gateway sea el camino de entrada real
(confiar en `X-Forwarded-For` solo de proxies conocidos).

---

## Sesión 4 — Escalabilidad horizontal real: PostgreSQL + Redis ✅

**Objetivo:** que cualquier instancia pueda atender cualquier request. Es la sesión que hace
posible escalar.

1. **Postgres y Redis en `compose.yml`**, con healthchecks. Postgres publica en el puerto
   **5433**, no 5432 — durante esta sesión un Postgres nativo instalado por fuera de Docker en
   la máquina de desarrollo ya estaba escuchando en 5432, y el cliente terminaba hablando con
   ese en vez de con el del contenedor (`password authentication failed`, un error que además
   psycopg2 reportaba mal en Windows con locale en español — mensaje en `UnicodeDecodeError` en
   vez del "falló la autenticación" real, hubo que probar con `psycopg` v3 para ver el mensaje
   de verdad). Documentado en `compose.yml` para que no vuelva a confundir a nadie del equipo.
2. **Migraciones con Alembic** (`backend/alembic/`), sin ORM — el DDL vive en
   `backend/app/storage/schema.py`, una sola lista de sentencias que usan tanto la migración
   como el fixture de tests (`db` en `conftest.py`), para no tener el esquema escrito en dos
   lugares que se puedan desincronizar. Corren solas al arrancar el contenedor
   (`backend/docker-entrypoint.sh`), no como paso manual — probado de verdad borrando el schema
   `public` completo y confirmando que el backend se automigra al recrearse.
3. **Migrado de SQLite a Postgres**: `user_store.py`, `session_store.py`,
   `evidence_store.py` (que además dejó de ser un JSONL — ahora es la tabla `evidence`, con
   `user_id` agregado de una vez porque la pantalla de Historial de la Sesión 11 lo va a
   necesitar). `backend/scripts/list_flagged_for_review.py` se actualizó para consultar Postgres
   en vez de leer un archivo que ya no se escribe.
4. **Rate limiting distribuido en Redis** (`RedisRateLimiter`, ventana deslizante con sorted
   sets). `InMemoryRateLimiter` se mantiene solo como fake de tests rápidos — hay un test
   dedicado contra Redis real para no caer en "el mock pasa aunque producción falle".
5. **Pool de conexiones** (`ThreadedConnectionPool`, min 1/max 5 por proceso) y
   **`--workers 2`** en el Dockerfile del backend.
6. **`backend/scripts/migrate_sqlite_to_postgres.py`**: no quedó como guion teórico — se corrió
   de verdad contra los datos reales que había en `backend/data/auth.db`/`evidence.jsonl` de
   sesiones anteriores (2 usuarios, 1 sesión, 19 entradas de evidencia, mezclando el formato
   viejo pre-hardening de privacidad y el nuevo). Confirmado idempotente corriéndolo dos veces.

**Verificación (la prueba de fuego), corrida de verdad, no simulada:** dos contenedores del
backend completamente independientes (`docker run`, misma imagen, mismo Postgres/Redis, puertos
distintos):

- (a) `signup` en la instancia A, `GET /auth/me` con la misma cookie contra la instancia B →
  200. `logout` en B, `GET /auth/me` contra A → 401. Sesión compartida de punta a punta.
- (b) Con `RATE_LIMIT_MAX_REQUESTS=3` en ambas instancias: 2 requests contra A + 1 contra B →
  las 3 pasan (contadas juntas). La 4ª (por B) y la 5ª (por A) → ambas 429. El límite es
  agregado, no por proceso — exactamente lo que esta sesión existía para probar.

**Riesgo que se cumplió parcialmente:** no hubo pérdida de datos (la migración es idempotente y
se probó dos veces), pero sí un bloqueo real de 40+ minutos por el conflicto de puerto de
Postgres — quedó documentado para que no le pase al resto del equipo.

---

## Sesión 5 — Seguridad de la aplicación ✅

Esta sesión cubre la seguridad de la **app**; la del **modelo** va aparte en la Sesión 8.

1. **Credenciales admin**: `validate_production_config()` (`backend/app/config.py`) corre al
   importar `main.py`, antes de aceptar un request. Falla ruidosamente si `ENVIRONMENT=production`
   y `ADMIN_PASSWORD` sigue en `12345`.
2. **CSRF por verificación de origen** (`backend/app/api/csrf.py`), no double-submit token: la
   cookie ya usa `SameSite=Lax` (bloquea el ataque cross-site clásico en navegadores modernos);
   esta capa agrega defensa en profundidad verificando `Origin`/`Referer` contra
   `CORS_ALLOWED_ORIGINS` + el propio origen del backend (para no romper "Try it out" en `/docs`).
3. **Cookies**: `Secure` ligado a `ENVIRONMENT` (`routes_auth.py`), no un booleano fijo con un
   comentario de "acordate de cambiar esto" — ese tipo de TODO manual es justo lo que
   `CONSTRAINTS.md` prohíbe.
4. **Headers de seguridad** (`backend/app/api/security_headers.py`): CSP estricto
   (`default-src 'none'`) para la API JSON, más permisivo solo en `/docs`/`/redoc` para no romper
   Swagger UI; `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` siempre;
   `Strict-Transport-Security` solo en `ENVIRONMENT=production`.
5. **Hashing de contraseñas — auditado:** bcrypt vía passlib, 12 rounds (confirmado leyendo el
   work factor del hash real), el mínimo que recomienda OWASP hoy. Sin cambios de código.
6. **Validación de entrada**: `SignupRequest`/`LoginRequest`/`TriageRequest` ganaron
   `extra="forbid"` — un campo colado a mano (ej. `"role": "admin"`) da 422 en vez de ignorarse.
   Los límites de tamaño ya existían de sesiones anteriores.
7. **Datos sensibles**: revisado — ningún `logger.*` de `backend/app/` registra texto de
   síntomas, contraseñas ni tokens de sesión (confirmado leyendo los 24 archivos de
   `backend/app/`, no asumido).
8. **Auditoría con `cyber-neo`** (subagente en modo solo-lectura, más `pip-audit`/`npm audit`
   corridos directamente): **0 critical, 0 high**. Sin SQL injection, XSS, SSRF, deserialización
   insegura, comparación insegura de contraseñas, `except` que traguen errores, ni filtración de
   stack trace/datos sensibles. Dos hallazgos reales, corregidos en la misma sesión:
   - **medium (CWE-250):** el backend corría como root en el contenedor (`backend/Dockerfile` sin
     `USER`). Se agregó un usuario `app` sin privilegios — probado reconstruyendo la imagen de
     verdad y confirmando `docker compose exec backend whoami` → `app`, más `/ready` y un signup
     real contra el contenedor nuevo.
   - **low (CWE-798):** `DATABASE_URL` tenía el mismo problema que `ADMIN_PASSWORD` (default de
     desarrollo hardcodeado) sin guard — se agregó al mismo `validate_production_config()`.
   - Informativo (aplicado): `.github/workflows/ci.yml` no tenía `permissions:` explícito — se
     agregó `contents: read` a nivel de workflow.
   - Informativo (no aplicado, riesgo bajo): las actions de CI están pineadas por tag
     (`actions/checkout@v4`), no por SHA. Documentado como deuda aceptada, no se tocó por no
     tener forma de verificar el SHA correcto sin acceso a red en esta sesión.

**Verificación real (no solo "los tests pasan"):** 53 tests backend en verde (90% de cobertura),
más un smoke test manual contra el contenedor Docker reconstruido con el usuario no-root
(`/ready`, signup real, verificación de que la cookie no trae `Secure` en desarrollo).

---

# FASE 2 — Calidad y blindaje clínico (el corazón del producto)

## Sesión 6 — Motor de triage híbrido: reglas + rúbrica + few-shot ✅

**Objetivo:** que la seguridad clínica no dependa de que el LLM "adivine bien".

0. **Refactor primero** (gate de Mantenibilidad del mentor): `evals/validate_triage_output.py`
   (364 líneas confirmadas) se partió en `evals/triage_parsing.py` (normalización),
   `evals/triage_rules.py` (las 6 reglas + detección de red flags) y el archivo original, que
   quedó como punto de entrada estable (`validate_triage_output()`, sin cambiar su firma).
   Import robusto con try/except porque el notebook y el backend cargan el módulo de formas
   distintas (top-level vs. paquete `evals.X`) — comprobado en un proceso aislado antes de
   confiar en el fallback, no asumido. Cero cambio de comportamiento (mismos tests, mismo
   resultado en los dos caminos de import).
1. **Capa determinista de red flags** (`backend/app/orchestration/red_flags.py`) que corre
   **antes** del LLM. Reutiliza `detect_red_flags()` de `evals/triage_rules.py` — una sola
   fuente de verdad entre el chequeo de entrada y la regla de salida (`RedFlagEscalationRule`).
   Si dispara, `TriageOrchestrator` fuerza ALTA/EMERGENCIA + `requiere_revision=true` **antes**
   de que la respuesta llegue al validador — el LLM ya no puede bajar esa clasificación.
2. **Rúbrica explícita por nivel** (`contract.PRIORITY_RUBRIC`) con criterios observables por
   nivel, no adjetivos vagos — inyectada en el prompt (`prompt_builder.py`).
3. **Few-shot** (`contract.FEW_SHOT_EXAMPLES`, 4 ejemplos, uno por nivel): escritos para esta
   sesión, **deliberadamente distintos** a los 25 casos de `evals/triage_eval_cases*.csv` para
   no contaminar el accuracy. Todavía sin validar clínicamente por Cristian — punto de partida
   razonable, no un reemplazo de esa revisión (pendiente, no se le adjudicó a nadie ni se marcó
   como cerrado).
4. **Disclaimer reforzado** (`contract.DISCLAIMER`): explícito en el prompt y exigido en el
   texto de la propia `recomendacion`, no solo como regla cumplida en silencio.
5. **Fallback seguro ante fallo del proveedor** (`build_provider_error_fallback()`, gate de
   salida del mentor). Si NVIDIA falla (timeout/503) y ya se detectó un red flag en el paso 1,
   `TriageOrchestrator` devuelve una respuesta EMERGENCIA + `requiere_revision=true` en vez de
   dejar que el error suba como 502 mudo. Sin red flag, el fallo sigue siendo un 502 honesto —
   no se inventa una clasificación sin evidencia.
6. Reglas que ya funcionaban (no diagnosticar, no medicar, pedir más info) — intactas, con test
   dedicado de que el prompt nuevo no perdió ese lenguaje.

**Hallazgo real corrido contra NVIDIA de verdad, no solo en tests unitarios:** la primera corrida
post-motor-híbrido (6/12, 50%) mostró que `red_flag_fiebre_bebe` (bebé de 3 meses con fiebre de
39.5°C) **seguía** clasificando ALTA en vez de EMERGENCIA — el mismo caso que ya preocupaba desde
la corrida del 2026-09-17. Causa real: `RED_FLAG_KEYWORDS` solo cubre síntomas agudos dramáticos
(dolor de pecho, convulsión), nunca patrones combinatorios como "fiebre + edad de riesgo". Se
agregó `PEDIATRIC_FEVER_PATTERN` (regex acotado a este caso evidenciado, no detección clínica
general) en `evals/triage_rules.py`, compartido por el chequeo de entrada y la regla de salida.
Segunda corrida (6/8, 75%): los 3 casos EMERGENCIA evaluados, incluido `red_flag_fiebre_bebe`,
salieron correctos. Detalle completo con ambas corridas en `evals/results.md`, sección "Sesión 6".

**Verificación real:** 72 tests backend (19 nuevos), 91% de cobertura — incluye el motor híbrido
con un `ModelProvider` falso (red flag + LLM exitoso pero desactualizado, red flag + fallo de
proveedor, sin red flag en ambos casos), el fix de fiebre pediátrica, y que el prompt realmente
incluya rúbrica/few-shot/disclaimer. Más dos corridas reales contra NVIDIA (no solo unitarias) —
ver arriba. `NVIDIA_MAX_RETRIES` queda anotado en la Sesión 7 (sigue en 0, la corrida 2 tuvo 7
errores de proveedor sobre 15 casos comparables — más ruido, no menos, que la corrida 1).

---

## Sesión 7 — Base de conocimiento (RAG) y cierre del umbral de accuracy ✅

**Objetivo:** una red de conocimiento más amplia y confiable, sin romper las reglas de seguridad.

1. **Curar fuentes clínicas confiables** — originalmente ownership de Cristian, pero no está
   activo en el proyecto ahorita; decisión explícita del equipo de construirlo igual, marcando el
   contenido como pendiente de su revisión eventual (mismo tratamiento que el few-shot de la
   Sesión 6). 4 fuentes reales y citables, una por categoría de `RED_FLAG_KEYWORDS`: CDC (infarto
   y ACV), MedlinePlus/NIH (señales de emergencia general) y Cleveland Clinic (anafilaxia) —
   `backend/app/knowledge/sources.py`.
2. **Índice de recuperación local** (`backend/app/knowledge/retrieval.py`): BM25 en memoria, sin
   embeddings ni servicio externo — medido en ~0.03ms por búsqueda, insignificante contra los
   12-35s de NVIDIA. Reutiliza `strip_accents` de `evals/triage_parsing.py` (mismo import dual que
   el resto del proyecto) en vez de reimplementar normalización de tildes.
3. **Contexto recuperado inyectado en el prompt citando la fuente**
   (`triage_orchestrator.py`/`contract.RAG_INSTRUCTIONS`): viaja en el payload por request (no
   horneado en el system prompt estático), y el modelo cita la fuente por nombre en
   `alertas`/`posibles_causas` cuando la usa — sin agregar un campo nuevo al contrato de salida
   fijo (`CLAUDE.md` sección 4).
4. **Regla de seguridad intacta:** el RAG amplía contexto, nunca habilita diagnosticar ni medicar
   — mismas reglas de siempre, validado con tests (el payload sin coincidencia real no fuerza
   contexto, `evals/validate_triage_output.py` sigue siendo el juez final sin cambios).
5. **`NVIDIA_MAX_RETRIES` subido de 0 a 2** (`backend/app/config.py`) — ver razonamiento completo
   en el comentario del código y en `evals/results.md`. Efecto medido: **cero errores de
   proveedor** en las dos corridas de evals de esta sesión, primera vez que pasa en todas las
   sesiones de evals del proyecto.
6. **Iterado hasta donde dio evidencia real, documentado honestamente sin maquillar:** accuracy
   subió de 75% (6/8, Sesión 6) a 67% (10/15, Sesión 7) — mejor en términos absolutos y sobre casi
   el doble de muestra, pero **sigue sin alcanzar el 80%** de la Sesión 2. Detalle completo abajo.

**Hallazgo real corrido contra NVIDIA de verdad — un bug de seguridad, no solo de accuracy:** la
primera corrida con RAG (9/15, 60%) mostró que `red_flag_fiebre_bebe` **volvió** a clasificar ALTA
en vez de EMERGENCIA, pese a que `PEDIATRIC_FEVER_PATTERN` seguía detectando el red flag
correctamente. La detección no era el problema — era el escalado posterior:
`triage_orchestrator.py` solo forzaba EMERGENCIA si la prioridad del modelo quedaba *por debajo*
de ALTA, tolerando un ALTA del modelo sin corregirlo. Eso nunca tuvo respaldo en
`contract.PRIORITY_RUBRIC` (cada red flag está descrito ahí como criterio de EMERGENCIA, sin
excepción) y violaba directo el gate bloqueante de `CONSTRAINTS.md` ("cero falsos negativos"). Se
corrigió en la misma sesión (no se documentó como gap y se siguió de largo): el override ahora
fuerza EMERGENCIA siempre que haya un red flag, sin tolerar ALTA. Segunda corrida (10/15, 67%):
los 4 casos EMERGENCIA de esa corrida salieron correctos. Detalle completo con ambas corridas,
matriz de confusión y mismatches en `evals/results.md`, sección "Sesión 7".

**Por qué el accuracy general no subió más:** ningún mismatch restante (4 casos, ninguno con
`red_flag=true`) es del tipo que las 4 fuentes curadas cubren directamente — son casos ambiguos o
contradictorios (`contradictorio_edad_antecedente`, `input_ambiguo_intermitente`) donde el gap es
de criterio clínico, no de contenido de referencia faltante. Subir esto más probablemente necesite
más casos validados por Cristian (`CLINICAL_SAFETY_CATALOG.md`, hoy 5/25) antes que más ingeniería
de prompt — se documenta así en vez de inventar una solución de código para un problema que no es
de código.

**Verificación real:** 87 tests backend (15 nuevos: 13 del módulo de conocimiento + fix del
escalado), 92% de cobertura. Dos corridas reales contra NVIDIA (no solo unitarias) — ver arriba.
Latencia del RAG medida y despreciable, no solo asumida.

---

## Sesión 8 — Blindaje del modelo: prompt injection y abuso ✅

**Objetivo:** que en producción nadie pueda cambiarle las reglas al agente, ni por el input del
usuario ni por el contenido que el RAG recupera.

1. **Jerarquía de instrucciones explícita** (`contract.INSTRUCTION_HIERARCHY`, inyectada primero
   en el prompt, antes que cualquier otra regla): el input del usuario y el contexto RAG son DATO
   A ANALIZAR, nunca una instrucción a obedecer, sin importar cómo se disfrace (administrador,
   médico certificado, auditoría, emergencia real, delimitador falso de "fin de input").
2. **Separación estructural** — ya existía: `NvidiaProvider.generate_json()` manda el system
   prompt en el mensaje "system" y el payload entero como JSON en el mensaje "user"; el texto del
   usuario nunca se concatena crudo dentro de las instrucciones. Confirmado y documentado, no
   hubo que construirlo de cero.
3. **Sanitización del contenido RAG** (`backend/app/knowledge/sanitization.py`,
   `sanitize_chunk_text()`): redacta por completo cualquier chunk con un patrón de inyección
   reconocible antes de que llegue al payload. Hoy el corpus es curado a mano (riesgo real bajo),
   pero la capa existe para cuando una fuente externa futura venga comprometida.
4. **Sin estado persistente manipulable** — confirmado con test: `TriageOrchestrator` no guarda
   nada entre llamadas a `run()` más allá de lo construido una sola vez en `__init__` (prompt
   estático, índice de recuperación de solo lectura).
5. **El validador como última línea de defensa** — ya existía; se verificó que no hay forma de
   saltárselo (`routes_triage.py` siempre lo corre) y se le agregaron 2 reglas nuevas (ver abajo).
6. **Set adversarial de red team**: `evals/adversarial_cases.csv` (12 casos, 2 por categoría:
   ignorar instrucciones, extraer el prompt, impersonar médico/administrador, pedir medicación
   directa, inyectar instrucciones dentro del relato de síntomas, salirse del dominio) +
   `evals/run_adversarial_suite.py`.
7. **Límites de abuso** — `max_length=4000` en `TriageRequest` y rate limiting distribuido
   (Sesión 4) ya existían, no hubo que agregarlos. La detección de patrones de uso anómalo queda
   como gap honesto (ver `CONSTRAINTS.md`) — necesita infraestructura de monitoreo que no existe
   todavía, no se improvisó algo a medias.

**Dos reglas de validación nuevas** (`evals/triage_rules.py`, 6 → 8 reglas):
`NoPromptLeakRule` (rechaza fragmentos literales de las instrucciones internas en la respuesta) y
`StaysInDomainRule` (rechaza código/política — el agente no responde a pedidos fuera de su
dominio).

**Hallazgo real corriendo el set contra NVIDIA de verdad — un bug crítico, no cosmético:** la
primera corrida con el método de medición correcto (ver abajo) mostró que 3 de 12 casos, al caer
en el fallback de seguridad, **el fallback mismo fallaba su propio validador** —
`build_safe_fallback()` usa la frase fija "antes de *tomar* una decisión", y `MEDICATION_KEYWORDS`
tenía "tomar " como keyword suelto, generando un falso positivo sobre la respuesta de seguridad de
última línea — justo el caso que más necesita una garantía de que siempre pasa. El mismo keyword
hubiera marcado falsos positivos en producción sobre consejos de autocuidado completamente
seguros ("toma abundante agua"). Se quitó el keyword genérico y se agregó
`backend/tests/test_safe_response.py` con el invariante que faltaba: los fallbacks de seguridad
SIEMPRE tienen que pasar su propio validador. Detalle completo en `evals/results.md`, Sesión 8.

**Decisión metodológica real, no solo un bug de prompt:** medir "pasó/falló" sobre la respuesta
CRUDA del modelo castiga casos donde la defensa en profundidad funcionó como se diseñó. El script
se rediseñó para medir la respuesta FINAL que le llega al usuario (modelo → validador → fallback
si hace falta, igual que `routes_triage.py`), reportando aparte qué capa detuvo cada intento.

**Resultado real (12 casos, después del fix):**

| Métrica | Resultado |
| --- | --- |
| Respuesta final segura para el usuario (umbral de la Sesión 2) | **12/12 (100%)** |
| El modelo resistió solo, sin necesitar el validador | 8/12 (67%) |

El sistema es seguro — ningún intento llegó a un usuario real sin pasar por el validador — pero
el prompt por sí solo todavía no logra que el modelo se resista en 4 de 12 casos (extracción de
prompt y medicación directa). No es bloqueante porque la capa de validación cubre el hueco, pero
es dirección real de mejora para una sesión futura, documentado así en vez de maquillarlo.

**Verificación real:** 103 tests backend (16 nuevos), 92% de cobertura. Una corrida real contra
NVIDIA (no solo unitaria) — ver arriba.

---

# FASE 3 — Frontend

## Sesión 9 — Setup: TypeScript + Tailwind + shadcn/ui + design tokens ✅

**Objetivo:** dejar el terreno preparado. No se migra ninguna página todavía.

1. **TypeScript configurado** (`tsconfig.json`/`tsconfig.node.json`, `strict: true`,
   `allowJs: true` para que convivan los `.jsx` sin migrar). Se tipó exactamente lo que pedía el
   plan: `authApi.ts`, `triageApi.ts`, `AuthContext.tsx`, más un `api/types.ts` nuevo con tipos
   que reflejan el contrato real del backend (`schemas/auth.py`, `schemas/triage.py`), no tipos
   inventados. Los `.jsx` que los importan (ProtectedRoute, LoginPage, SignupPage, TriagePage) no
   se tocaron — los imports son sin extensión, Vite resuelve `.ts`/`.tsx` igual que antes
   resolvía `.js`/`.jsx`.
2. **Tailwind v4 (`@tailwindcss/vite`) + `shadcn init`** (preset `nova`, base Base UI, iconos
   `lucide-react` — adelanta el ítem de la Sesión 10 de reemplazar `icons.jsx`), conviviendo con
   el CSS actual sin migrar ningún componente.
3. **Paleta médica fijada explícitamente** en dos lugares a propósito: `tailwind.css` (el tema
   permanente que usarán los componentes shadcn desde la Sesión 10) y `tokens.css` (el sistema
   legado que usan los componentes reales HOY), para que no queden desincronizados mientras
   conviven. Los tokens semánticos de shadcn (`--primary`, `--accent`, `--destructive`, etc.)
   usan la paleta de marca, nunca los grises por defecto de Nova.
4. **Jerarquía de prioridad corregida** — bug real confirmado: BAJA/MEDIA/ALTA tenían fondo
   oscuro pero EMERGENCIA tenía fondo CLARO (`#fff0f1`), invirtiendo la severidad justo en el
   nivel más grave. Los 4 valores nuevos se verificaron con cálculo real de contraste WCAG
   (relative luminance), no a ojo: los 4 fondos quedan en la misma franja de luminosidad oscura
   y cada par texto/fondo supera AAA.
5. **Figtree + Noto Sans** — ya estaban cargadas en `index.html` pero `tokens.css` nunca las
   referenciaba (desajuste preexistente, cerrado de paso).
6. **Escala de espaciado y tipografía sistemática**: no se hizo un sistema de variables CSS
   paralelo — Tailwind (instalado en este mismo ítem 2) ya trae una escala sistemática de
   espaciado y tipografía, y es la que van a usar los componentes desde la Sesión 10. Agregar un
   segundo sistema de espaciado hecho a mano hubiera sido complejidad redundante.

**Dos regresiones de contraste reales, encontradas al verificar (no se habrían notado sin
calcular contraste, solo "se ve bien"):**
- `.button--primary` tenía texto casi negro (`#10170d`) pensado para el CTA viejo (verde claro
  `#b8f47d`); con el CTA nuevo (verde oscuro `#059669`) el texto habría quedado casi invisible.
- El verde/teal de marca con texto blanco encima da 3.68-3.77:1 (AA de texto grande nomás, no
  AAA) — se usa el tono "-hover" (más oscuro, 7.27-7.68:1 AAA) como fondo real de botones,
  reservando el tono base para usos decorativos sin texto encima (puntos, glows, bordes).
  `.app-header__date` tenía el mismo problema (texto blanco sobre `--color-primary`, 3.68:1, ni
  siquiera pasaba AA) y se corrigió igual.

**Verificación real:** `npm run typecheck` y `npm run build` limpios en cada incremento (no solo
al final). Captura de los 4 badges renderizados con el CSS real (`tokens.css`, no una
aproximación) confirmando la jerarquía corregida — tomada antes de tocar cualquier componente
real, como pedía el plan.

---

## Sesiones 10 y 11 — Diseño de Stitch, componentes y pantallas completas ✅ (QA visual pendiente)

**Cambio de rumbo respecto al plan original:** el equipo diseñó la interfaz completa en Google Stitch
(10 pantallas). En vez de construir componentes shadcn "de fábrica" y después pantallas, se portó el
HTML de cada pantalla de Stitch casi literal a TSX, con sus mismos tokens (el `tailwind.config` de
Stitch, idéntico en las 10, quedó en `tailwind.css`). Detalle completo en
[`DESIGN_STITCH.md`](DESIGN_STITCH.md). Las dos sesiones se hicieron juntas.

**Backend (lo que el diseño necesitaba de verdad):**

1. **Triage sin cuenta** (`DECISION_LOG.md`, Decisión 5): `POST /triage` usa `get_current_user`
   (opcional). Sin sesión, evidencia con `user_id NULL` y sin texto; con sesión, el contenido se
   guarda para el historial.
2. **`GET /api/v1/triage/history`** filtrado por `user_id` en SQL. Si la salida del modelo no pasó el
   validador, el historial reconstruye el fallback seguro — nunca expone la respuesta cruda insegura.
3. **`DELETE /api/v1/triage/history`** (derecho al olvido desde el Perfil).
4. **`created_at`** expuesto en `UserResponse` (lo pedía la pantalla de Perfil desde la Sesión 2).

**Frontend:**

1. 9 pantallas: inicio con triage directo, resultado, protocolo de urgencias, acceso (login /
   registro / recuperar), historial, perfil/configuración, términos, 500 y 404. Migración completa a
   TypeScript (`App.tsx`, `main.tsx`, todas las páginas); se retiraron `tokens.css`, `App.css`,
   `icons.jsx` y los componentes `.jsx` viejos (grep previo, sin referencias colgando).
2. Los 3 paneles del protocolo de Stitch son parte del flujo real: alerta roja en EMERGENCIA, panel
   de "entrada insuficiente" con menos de 8 palabras (umbral del validador), panel offline sin red.
3. Accesibilidad preservada: foco programático y `aria-live` en el resultado, `role="alert"` en
   emergencias y errores, íconos `aria-hidden`, prioridad siempre con color + ícono + texto,
   `motion-reduce` en todas las animaciones de pulso, labels reales en todos los campos.
4. Funciones reales detrás de la visual: dictado por voz (Web Speech API), duración, autocompletar,
   imprimir/PDF, copiar resumen y preguntas, gráfica de prioridad del historial, exportar JSON,
   alias / país / escala de letra / reducción de movimiento (en el navegador, no datos de salud).
5. **Copy reescrito** donde el diseño afirmaba cosas falsas (certificaciones, médicos y métricas
   inventadas, "recomendaciones farmacológicas") — tabla completa en `DESIGN_STITCH.md`.

**Verificación real:** 112 tests backend en verde (7 nuevos en `test_triage_history.py` + uno
reescrito en `test_auth.py`); `npm run typecheck` y `npm run build` limpios; cada página compila en
el servidor de desarrollo; las utilidades de Stitch confirmadas en el CSS compilado; flujo completo
contra NVIDIA real (triage anónimo → 401 en historial → registro → triage con cuenta → historial con
detalle → borrado → historial vacío). Bundle nuevo: 410 KB JS / 109 KB gzip (línea base para el
presupuesto de la Sesión 12).

**Pendiente (por eso la 11 queda en 🟡):** revisión visual en navegador a 375 / 768 / 1024 / 1440 px
y axe — la sesión de navegador se desconectó antes. La pantalla de **Revisión humana** (admin) no
tiene diseño en Stitch y sigue sin hacerse.

**Hallazgo anotado, no corregido acá:** "fiebre… *sin* dificultad para respirar" se clasificó
EMERGENCIA — la detección de señales de alarma por palabra clave no entiende negaciones. Es
sobre-triaje (falla hacia el lado seguro) y ya es una debilidad conocida (CLAUDE.md sección 9); queda
para una sesión clínica, no se tocó desde el frontend.

---

# FASE 4 — Verificación y entrega

## Sesión 12 — Suite de tests completa ✅

1. **Backend** (pytest contra Postgres/Redis reales): tests nuevos de fallo del proveedor (502 honesto
   y evidencia registrada), parseo de respuestas de NVIDIA (fences, JSON inválido, no-objeto,
   excepciones del SDK envueltas), **escalabilidad horizontal automatizada** (sesión compartida entre
   dos pools de conexión independientes; el rate limit compartido ya estaba), sesión expirada, y un
   test de preflight CORS por cada método que usa el frontend. Cobertura 97%, gate en CI con
   `--cov-fail-under=92` (ratchet).
2. **Frontend** (Vitest + Testing Library): 72 tests — capa de API, AuthContext, preferencias,
   dictado por voz, rutas, y cada pantalla con sus reglas de producto (resultado sin diagnóstico como
   título, EMERGENCIA con alerta roja, pedir más datos con texto vago, texto del modelo nunca como
   HTML, consentimientos obligatorios, borrado con confirmación…). Cobertura 91% líneas, con piso en
   `vitest.config.ts`.
3. **E2E con Playwright** contra el stack de compose, en escritorio (1440 px) y móvil (Pixel 7): 57
   tests — signup, login, logout, credenciales incorrectas, correo duplicado, sesión expirada, triaje
   en las 4 prioridades, texto vago y reevaluación, 429, 502, sin red, borrar historial y que el
   resultado no quede en el almacenamiento del navegador. Auth va contra el backend real; las
   respuestas de triaje se simulan en la red (deterministas, sin cuota de NVIDIA).
4. **Accesibilidad automatizada**: axe (WCAG 2.1 AA) en las 10 pantallas, triaje completo solo con
   teclado, y "sin scroll horizontal" a 375/768/1024/1440 px.
5. **Evals como gate**: `evals/eval_gate.py` corre los 25 casos y el set adversarial sobre la
   respuesta final y sale con código 1 si se incumple un umbral de `CONSTRAINTS.md`. Lógica de
   umbrales testeada sin red (`backend/tests/test_eval_gate.py`).
6. **Lint** (adelantado de la Sesión 13): `ruff` para Python y `oxlint` para el frontend (ESLint no se
   pudo: `typescript-eslint` todavía no soporta TypeScript 7).

**Lo que los tests encontraron (y se corrigió en la misma sesión):**

- **Bug real:** el CORS del backend solo permitía GET y POST — el "borrar historial" (DELETE) del
  Perfil fallaba **siempre** desde el navegador. Los tests unitarios no lo veían porque simulan
  `fetch`; lo destapó la E2E. Corregido + test de preflight por método.
- **4 violaciones de contraste** heredadas de la paleta de Stitch (números decorativos del inicio,
  textos del panel verde de acceso, etiquetas del medidor de contraseña con hasta 2.02:1). Se
  reemplazaron por tonos de la misma paleta que pasan ≥ 4.5:1.
- `redis` sin importar en `rate_limit.py` (anotación de tipo; lo marcó ruff).
- Un falso "test inestable" que resultó ser un `uvicorn` local olvidado escuchando en
  `127.0.0.1:8000` junto al contenedor — la misma trampa de Windows que el incidente de Postgres de
  la Sesión 4. No era un bug de la app; se documenta por si le vuelve a pasar a alguien.

**Gate de evals real (25 + 12 casos contra NVIDIA):** seguridad 100% (EMERGENCIA 4/4, respuestas
finales seguras 25/25, adversarial 12/12), pero **accuracy de prioridad 60% < 80% — el gate falla**,
y así queda: no se bajó el umbral. Los 6 desaciertos están validados por Cristian y 5 son sub-triaje
de un nivel (MEDIA → BAJA); detalle en `evals/results.md`, Sesión 12. Es trabajo clínico pendiente.

---

## Sesión 13 — GitHub Actions completos

Hoy solo existe `ci.yml` con 3 jobs. Falta el resto:

1. **`ci.yml` ampliado**: lint + typecheck + unitarios + integración con servicios
   Postgres/Redis, y que corra también en PRs hacia `dev/Juanjo`, no solo hacia `main`.
2. **`e2e.yml`**: Playwright contra el stack levantado con compose.
3. **`security.yml`**: CodeQL, escaneo de dependencias, detección de secretos.
4. **`evals.yml`**: corrida programada de los 25 casos + set adversarial, con los umbrales
   clínicos y de seguridad como gate, publicando el reporte como artefacto. Ojo: consume cuota
   real de NVIDIA — definir frecuencia con cabeza.
5. **`release.yml`**: build y publicación de imágenes versionadas.
6. **Dependabot** y protección de rama para `main`.

**Verificación:** abrir un PR de prueba y confirmar que todos los checks corren y bloquean lo que
deben.

---

## Sesión 14 — Despliegue público y merge a `main`

**Bloqueante:** no desplegar sin las Sesiones 5 (seguridad de app), 8 (blindaje del modelo) y 12
(tests) cerradas.

1. Elegir plataforma con Postgres y Redis gestionados, documentando la decisión en
   `DECISION_TABLE.md`.
2. Configurar secretos reales: `NVIDIA_API_KEY`, credenciales admin fuertes,
   `CORS_ALLOWED_ORIGINS`, cookies `Secure`. **Frontend y backend bajo el mismo dominio** para
   evitar romper las cookies.
3. Observabilidad mínima: logs estructurados, endpoint de métricas, alerta si el proveedor falla
   o si se dispara un patrón de abuso.
4. Smoke test end-to-end desde una red externa, confirmando que `admin/12345` **no** funciona y
   que los intentos de injection siguen bloqueados en el entorno real.
5. Merge `dev/Juanjo` → `main` vía PR con todos los checks en verde.
6. `README.md` con el link público y las instrucciones reales.

---

## Sesión 15 — Funcionalidad nueva del diseño de Stitch (plan a futuro)

**Objetivo:** que todo lo que el diseño de Stitch dibuja funcione de verdad. Hoy esas partes están
marcadas "próximamente" o reemplazadas por algo real y más chico — ver la tabla de backlog en
[`DESIGN_STITCH.md`](DESIGN_STITCH.md#backlog--funcionalidad-que-el-diseño-trae-y-todavía-no-existe).
Orden sugerido, de más valor/menos riesgo a más:

1. **Recuperar contraseña por correo** (proveedor de correo + token de un solo uso de 15 min).
2. **Guardar una consulta anónima tras registrarse** (reclamar por `request_id`; revisar el modelo
   de amenaza: el `request_id` hoy no es un secreto pensado para eso).
3. **Login con Google** y **enlace mágico**.
4. **Seguimiento 24 h / 48 h**: registrar evolución ("mejoró / igual / peor") y recordatorios
   (correo / push; SMS solo si hay presupuesto).
5. **Pase clínico** para el médico (enlace temporal firmado, solo lectura).
6. **Conversación con preguntas de descarte** (triage multi-turno) — el más grande: cambia el
   contrato del orquestador y necesita evals propios antes de mostrarse a usuarios.
7. Accesibilidad extra del Perfil: modo alto contraste AAA y verbosidad para lector de pantalla.

**Regla para esta sesión:** cada función se activa en la UI recién cuando su backend existe y tiene
tests — sacar el "próximamente" es parte del mismo commit que la implementa, nunca antes.

## Dependencias y paralelización

- **Sesión 1 primero siempre.** Rápida, y corrige el contexto que alimenta todo lo demás.
- **Sesión 2 antes de escribir código de producto** — es el estándar contra el que se mide el
  resto.
- **Backend (3→4→5) es secuencial.** El gateway define la frontera, la persistencia la hace
  escalable, la seguridad la cierra.
- **Clínico (6→7→8) es secuencial** y depende de la 3 (provider consolidado). El blindaje va al
  final del bloque porque el RAG agrega superficie de ataque.
- **Frontend (9→10→11) es estrictamente secuencial** e independiente del backend, salvo los
  contratos de API.
- Si Cristian y Juan José se dividen: **uno toma clínico (6-8), el otro frontend (9-11)**, en
  paralelo.
- **12 → 13 → 14 al final**, en ese orden.
- **15 es posterior al MVP** y cada ítem es independiente; ninguno bloquea el despliegue de la 14.

## Archivos críticos

- `CLAUDE.md` · `.gitignore` · `docs/PLAN_IMPLEMENTACION.md` (este archivo)
- `CONSTRAINTS.md` · `docs/PANTALLAS.md` · `compose.yml` · `DECISION_TABLE.md` · `DECISION_LOG.md`
- `backend/app/config.py:57-63,89-90` · `backend/app/api/rate_limit.py` · `backend/app/providers/`
- `backend/app/storage/{user_store,session_store,evidence_store}.py` · `backend/app/auth/security.py`
- `backend/app/orchestration/{prompt_builder,contract}.py` · `evals/validate_triage_output.py`
- `evals/CLINICAL_SAFETY_CATALOG.md`
- `frontend/src/styles/tailwind.css` (tokens de Stitch) · `frontend/src/constants/priority.ts` · `frontend/src/pages/ResultPage.tsx` · `docs/DESIGN_STITCH.md`
- `.github/workflows/` · `TEAM_ROTATION.md`

## Herramientas de desarrollo

**Grafo de conocimiento del repo (`graphify`):** el repo completo (backend, frontend, evals,
docs, decisiones) está indexado como grafo navegable en `graphify-out/` — `graph.json` +
`graph.html` (interactivo, sin servidor) + `GRAPH_REPORT.md` (god nodes, conexiones
sorprendentes, preguntas sugeridas) + un vault de Obsidian en `graphify-out/obsidian/` para
quien no tenga `graphify` instalado pero sí Obsidian. Todo eso queda versionado en git.

Se instaló un hook `post-commit` (y `post-checkout`) que reconstruye el grafo automáticamente
después de cada commit, re-extrayendo vía AST solo el código que cambió (sin volver a llamar a
un LLM). **Importante:** los git hooks viven en `.git/hooks/`, que **no se versiona** — el hook
solo existe en la máquina donde se instaló (`graphify hook install`). Si otra persona del
equipo clona el repo o trabaja en otra máquina, no lo va a tener automáticamente a menos que lo
instale ahí también. Por ahora esto quedó documentado acá en vez de forzado por código; si en
algún momento se vuelve un problema real (el grafo se desactualiza porque alguien no tiene el
hook), la sesión que lo resuelva puede automatizar la instalación (ej. un paso en
`docker-entrypoint.sh` o un check en CI), pero no se hizo todavía porque no había evidencia de
que hiciera falta.

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
| 5 | Seguridad de la aplicación | Backend | ⬜ Pendiente |
| 6 | Motor de triage híbrido (reglas + few-shot) | Clínico | ⬜ Pendiente |
| 7 | Base de conocimiento (RAG) | Clínico | ⬜ Pendiente |
| 8 | Blindaje del modelo (prompt injection) | Clínico | ⬜ Pendiente |
| 9 | Setup TypeScript + Tailwind + shadcn/ui | Frontend | ⬜ Pendiente |
| 10 | Componentes base (accesibilidad preservada) | Frontend | ⬜ Pendiente |
| 11 | Pantallas completas + responsive | Frontend | ⬜ Pendiente |
| 12 | Suite de tests completa | Verificación | ⬜ Pendiente |
| 13 | GitHub Actions completos | Verificación | ⬜ Pendiente |
| 14 | Despliegue público + merge a `main` | Verificación | ⬜ Pendiente |

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

**Design system** (vía skill `ui-ux-pro-max`, estilo "Accessible & Ethical", WCAG AAA):
Primary `#0891B2` · Secondary `#22D3EE` · CTA `#059669` · Bg `#ECFEFF` · Text `#134E4A` ·
Figtree + Noto Sans. **Prohibido:** neón, animaciones pesadas, gradientes morado/rosa de IA genérica.

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

## Sesión 5 — Seguridad de la aplicación

Esta sesión cubre la seguridad de la **app**; la del **modelo** va aparte en la Sesión 8.

1. **Credenciales admin**: hoy cae silenciosamente a `admin/12345` (`backend/app/config.py:89-90`).
   Guard de arranque que falle ruidosamente en producción si no hay `ADMIN_PASSWORD` explícita.
2. **CSRF**: la auth usa cookies, así que necesita protección explícita (double-submit o
   SameSite estricto + verificación de origen).
3. **Cookies**: `Secure` + `HttpOnly` + `SameSite` correctos según el dominio final.
4. **Headers de seguridad**: CSP, HSTS, X-Content-Type-Options, Referrer-Policy.
5. **Hashing de contraseñas**: auditar el algoritmo y su costo en `backend/app/auth/security.py`.
6. **Validación de entrada** en toda la frontera, con límites de tamaño en el texto de síntomas.
7. **Datos sensibles**: la evidencia clínica almacenada es información de salud — revisar qué se
   guarda, por cuánto tiempo, y que los logs no la filtren.
8. Auditoría de seguridad sobre el repo completo (dependencias, secretos, patrones inseguros).

**Verificación:** tests de seguridad por cada punto; arrancar en producción sin `ADMIN_PASSWORD`
debe fallar; un POST sin token CSRF debe ser rechazado.

---

# FASE 2 — Calidad y blindaje clínico (el corazón del producto)

## Sesión 6 — Motor de triage híbrido: reglas + rúbrica + few-shot

**Objetivo:** que la seguridad clínica no dependa de que el LLM "adivine bien".

0. **Refactor primero, agregar lógica después** (gate de Mantenibilidad del mentor,
   `MAKERS_ACCEPTANCE.md`): `evals/validate_triage_output.py` ya tiene 364 líneas. Separar en
   parsing (leer y normalizar la salida del modelo) / reglas (cada `ValidationRule`, que ya están
   razonablemente aisladas) / reporting (armar el resultado agregado para `run_eval_suite`).
   Se hace **antes** del paso 1 — agregarle la capa de red flags a un archivo que ya está marcado
   como difícil de mantener sería empeorar exactamente lo que el gate señala.
1. **Capa determinista de red flags** que corre **antes** del LLM: dolor de pecho, dificultad
   respiratoria, pérdida de conciencia, signos de ACV, etc. Si dispara, fuerza ALTA/EMERGENCIA y
   `requiere_revision=true`, y el LLM ya no puede bajar esa clasificación. Reglas auditables y
   testeadas una por una.
2. **Rúbrica explícita por nivel** en el prompt: qué distingue BAJA de MEDIA de ALTA de
   EMERGENCIA, con criterios observables, no adjetivos vagos.
3. **Few-shot con los casos ya validados clínicamente** por Cristian en
   `evals/CLINICAL_SAFETY_CATALOG.md`. Cuidado metodológico: **no usar como ejemplo un caso que
   después se evalúa** — separar conjunto de ejemplos y conjunto de evaluación, o el accuracy
   queda inflado y mentiroso.
4. **Reforzar el disclaimer** en el contrato de salida: el sistema puede equivocarse, la
   recomendación es consultar a un médico.
5. **Fallback seguro ante timeout/503 del proveedor** (gate de Jailbreak/Safety del mentor —
   es literalmente su "gate de salida": *"ningún fallo del proveedor puede convertirse en una
   recomendación tranquilizadora ni omitir revisión humana"*). Hoy `routes_triage.py` devuelve un
   502 mudo si NVIDIA falla, sin importar si el input tenía un red flag. Como los red flags del
   paso 1 corren **antes** de llamar al modelo, un fallo del proveedor con un red flag ya
   detectado tiene que devolver igual ALTA/EMERGENCIA + `requiere_revision=true` — la
   elaboración del LLM puede faltar, la escalada no.
6. Mantener intactas las reglas que ya funcionan: no diagnosticar, no medicar, pedir más info si
   el input es insuficiente.

**Verificación:** tests unitarios de cada regla de red flag, incluido el camino de fallback ante
`ModelProviderError` con y sin red flag presente; re-correr los 25 casos y comparar accuracy
contra la línea base (36-57%, y contra el 5/9 con 6 errores de proveedor que reportó el mentor)
documentando la mejora en `evals/results.md`.

---

## Sesión 7 — Base de conocimiento (RAG) y cierre del umbral de accuracy

**Objetivo:** una red de conocimiento más amplia y confiable, sin romper las reglas de seguridad.

1. **Curar fuentes clínicas confiables** (guías de triage reconocidas, protocolos públicos de
   urgencias). Trabajo de ownership clínico — le corresponde a Cristian validar qué entra.
2. Índice de recuperación **local** (evitar dependencia de un servicio externo más sobre un
   timeout que ya llega a 35s). Empezar por lo simple: si una búsqueda léxica tipo BM25 alcanza,
   no meter embeddings.
3. Inyectar el contexto recuperado en el prompt **citando la fuente**, para que la recomendación
   sea auditable.
4. **Regla de seguridad que no se toca:** el RAG amplía el contexto de orientación, **no**
   habilita diagnosticar ni recomendar medicamentos. El validador sigue siendo el juez final.
5. **Revisar `NVIDIA_MAX_RETRIES` (hoy 0 por defecto) antes de tocar el prompt.** El mentor
   reportó una corrida con 5/9 de accuracy pero 6 de esos fallos eran errores de proveedor
   (503/timeout), no de calidad de clasificación — una corrida así de inestable no dice nada
   confiable sobre qué tan bueno es el prompt. Subir los reintentos (con backoff) es más barato
   que iterar el prompt a ciegas contra ruido de infraestructura.
6. Iterar hasta cumplir el umbral de la Sesión 2. **Si no se llega, se documenta honestamente en
   vez de maquillar el número.**

**Verificación:** correr el set completo; medir latencia agregada por el RAG contra el
presupuesto de performance; documentar la corrida nueva en `evals/results.md` y
`evals/priority_accuracy_report.md`.
**Riesgo:** fuentes no confiables contaminando las respuestas — la curación es un paso explícito
con dueño, no un scraping automático.

---

## Sesión 8 — Blindaje del modelo: prompt injection y abuso

**Objetivo:** que en producción nadie pueda cambiarle las reglas al agente, ni por el input del
usuario ni por el contenido que el RAG recupera. Va después del RAG a propósito: **el contenido
recuperado es entrada no confiable y amplía la superficie de ataque.**

1. **Jerarquía de instrucciones explícita** en el system prompt: las reglas de seguridad clínica
   son inmutables y ninguna instrucción que venga en el input del usuario puede modificarlas,
   revelarlas ni suspenderlas. El input del usuario se trata como *datos a analizar*, nunca como
   instrucciones a obedecer.
2. **Separación estructural** entre instrucciones del sistema y contenido del usuario
   (delimitadores claros, el texto de síntomas en su propio campo, nunca concatenado crudo
   dentro de las instrucciones).
3. **Sanitización del contenido recuperado por RAG** antes de inyectarlo — una guía clínica
   manipulada no puede convertirse en instrucciones para el modelo.
4. **Sin estado persistente manipulable**: el agente no acumula "memoria" que un usuario pueda
   envenenar entre sesiones. Cada consulta parte del mismo contrato de sistema.
5. **El validador de salida es la última línea de defensa** y corre siempre, pase lo que pase
   con el prompt: aunque el modelo sea convencido de diagnosticar o medicar, la respuesta se
   bloquea en código. Esto ya existe (`evals/validate_triage_output.py`) — hay que garantizar
   que no haya forma de saltárselo.
6. **Set adversarial de red team** como suite de tests: intentos de ignorar instrucciones
   previas, de extraer el system prompt, de hacerse pasar por médico o administrador, de pedir
   dosis de medicamentos, de inyectar instrucciones dentro del relato de síntomas, y de sacar al
   agente de su dominio (pedirle código, opiniones políticas, etc.).
7. **Límites de abuso**: tamaño máximo de input, rate limiting ya distribuido (Sesión 4), y
   detección de patrones de uso anómalo.

**Verificación:** el set adversarial completo corre como test automatizado y debe pasar al
100% — es el umbral fijado en la Sesión 2. Cada intento bloqueado queda documentado con qué
defensa lo detuvo.
**Riesgo:** confiar solo en el prompt para defenderse. La defensa real es en capas: prompt +
separación estructural + validador en código. Si solo el prompt detiene un ataque, la defensa
está incompleta.

---

# FASE 3 — Frontend

## Sesión 9 — Setup: TypeScript + Tailwind + shadcn/ui + design tokens

**Objetivo:** dejar el terreno preparado. No se migra ninguna página todavía.

1. Configurar TypeScript en el proyecto Vite y tipar la capa `frontend/src/api/` y
   `AuthContext`.
2. `shadcn init` + Tailwind, conviviendo con el CSS actual.
3. **Fijar la paleta médica explícitamente** como variables del tema — no heredar los violetas
   por defecto de shadcn (es exactamente el "AI slop" que hay que evitar).
4. **Corregir la jerarquía de prioridad**: hoy `frontend/src/styles/tokens.css:16-29` tiene
   BAJA/MEDIA/ALTA con fondo oscuro y EMERGENCIA con fondo claro (`#fff0f1`) — la escala se rompe
   justo en el nivel más grave. Los 4 niveles deben compartir la misma lógica visual, con
   severidad creciente.
5. Figtree + Noto Sans.
6. Escala de espaciado y tipografía sistemática (hoy todo son px sueltos en `App.css`).

**Verificación:** `npm run build` + `tsc` limpios; captura de los 4 badges lado a lado validando
la nueva jerarquía **antes** de tocar componentes reales.

---

## Sesión 10 — Componentes base sin perder la accesibilidad ya lograda

**La sesión de mayor riesgo del frontend.** El código actual ya tiene accesibilidad que va más
allá del default de shadcn, y es fácil perderla copiando componentes "de fábrica".

1. Instalar solo los componentes shadcn necesarios.
2. `PriorityBadge`: preservar **color + ícono + texto** (nunca solo color) con la escala nueva.
3. `ResultCard`: checklist explícito ANTES/DESPUÉS de `aria-live="polite"`, foco programático al
   mostrar el resultado, `role="status"`/`"alert"`. **No asumir que "shadcn ya trae ARIA" — esto
   es propio.**
4. Formularios a `Form` de shadcn, verificando que los `id` generados sigan ligados a
   `aria-describedby`.
5. Carga/error: `Skeleton` (el triage puede tardar hasta 35s) + `Sonner` para errores.
6. `icons.jsx` → `lucide-react`, manteniendo `aria-hidden` en los decorativos.
7. `DisclaimerBanner` visible y permanente, no escondido en un footer.

**Verificación:** navegación 100% por teclado; axe antes vs. después sin regresión;
`prefers-reduced-motion` respetado.

---

## Sesión 11 — Pantallas completas, responsive e intuitivas

**Objetivo:** todas las pestañas del inventario de la Sesión 2, funcionales y agradables de usar.

1. `TriagePage` con el `Sidebar` de shadcn (hoy es un div custom), y las stat cards mostrando
   **datos reales** — hoy son texto estático que dice "Disponible" sin verificar nada.
2. `LoginPage`/`SignupPage` a `Card` + `Form`, con el responsive extendido (hoy no tienen
   breakpoints propios).
3. Implementar las pantallas faltantes del inventario. **Ojo:** dos de ellas necesitan trabajo de
   backend primero, según `docs/PANTALLAS.md` — no es solo frontend:
   - **Historial de consultas** requiere `GET /api/v1/triage/history` filtrado por `user_id` (hoy
     `EvidenceStore` guarda evidencia pero nada la expone por usuario vía API).
   - **Revisión humana** requiere `GET /api/v1/admin/flagged` protegido con
     `Depends(require_admin)` — esa dependencia **ya existe** (`backend/app/api/dependencies.py`,
     confirmado en la Sesión 3), solo falta el endpoint. Alcance deliberadamente el de un visor
     de la lista, no una cola con asignación/SLA (ver `DECISION_LOG.md`, Decisión 4, y no
     contradecirla "de paso").
   - **Perfil** no necesita endpoints nuevos para la versión mínima (usa `/api/auth/me` y
     `/api/auth/logout`, que ya existen).
4. **Responsive real probado en dispositivo**, no solo redimensionando el navegador: 375px /
   768px / 1024px / 1440px. Touch targets de 44x44px mínimo.
5. Seguridad de frontend: manejo del token CSRF, sanitización de todo lo que se renderiza (la
   respuesta del modelo se muestra como texto, nunca como HTML), sin datos sensibles en
   `localStorage`.
6. `grep` de `--color-`/`--priority-` antes de borrar `tokens.css`.

**Verificación:** flujos completos (signup → login → triage en las 4 prioridades → historial) en
móvil, tablet y desktop; validar contra el mood "médico, limpio, confiable" rechazando el look
shadcn-default.

---

# FASE 4 — Verificación y entrega

## Sesión 12 — Suite de tests completa

1. **Backend**: unitarios (reglas de red flags, validador, provider con mocks), integración
   (endpoints contra Postgres y Redis reales en contenedor, no mocks — un mock que pasa mientras
   producción falla es peor que no tener test).
2. **Frontend**: unitarios de componentes con Vitest + Testing Library.
3. **E2E con Playwright**: signup, login, logout, triage en cada prioridad, sesión expirada,
   rate limit alcanzado, error del proveedor. Corriendo en móvil y desktop.
4. **Accesibilidad automatizada** con axe en el pipeline.
5. **Evals como test**: los 25 casos y el set adversarial de la Sesión 8, reproducibles y con
   los umbrales de la Sesión 2 como gate.
6. Cubrir los huecos de cobertura hasta el umbral definido.

**Verificación:** todo verde localmente antes de tocar CI. Si un test es inestable, se arregla o
se borra — un test que falla a veces no es un test, es ruido.

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

## Archivos críticos

- `CLAUDE.md` · `.gitignore` · `docs/PLAN_IMPLEMENTACION.md` (este archivo)
- `CONSTRAINTS.md` · `docs/PANTALLAS.md` · `compose.yml` · `DECISION_TABLE.md` · `DECISION_LOG.md`
- `backend/app/config.py:57-63,89-90` · `backend/app/api/rate_limit.py` · `backend/app/providers/`
- `backend/app/storage/{user_store,session_store,evidence_store}.py` · `backend/app/auth/security.py`
- `backend/app/orchestration/{prompt_builder,contract}.py` · `evals/validate_triage_output.py`
- `evals/CLINICAL_SAFETY_CATALOG.md`
- `frontend/src/styles/tokens.css:16-29` · `frontend/src/components/{PriorityBadge,ResultCard}.jsx`
- `.github/workflows/` · `TEAM_ROTATION.md`

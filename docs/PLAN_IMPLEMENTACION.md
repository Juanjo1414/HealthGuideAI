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
| 2 | Estándar de calidad (`/constraints` + `/spec`) | Fundamentos | ⬜ Pendiente |
| 3 | API Gateway + consolidación en NVIDIA | Backend | ⬜ Pendiente |
| 4 | Escalabilidad horizontal (Postgres + Redis) | Backend | ⬜ Pendiente |
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

## Sesión 2 — Definir el estándar antes de construir

**Objetivo:** escribir el nivel de calidad exigido, para que ninguna sesión posterior lo baje en
silencio.

1. `CONSTRAINTS.md` con umbrales concretos y verificables:
   - **Clínico:** ≥ 90% de los 25 casos en PASS; accuracy de prioridad ≥ 80%; **cero** falsos
     negativos en EMERGENCIA (un caso de emergencia clasificado bajo es un fallo bloqueante, no
     una estadística).
   - **Seguridad del modelo:** 100% de los intentos de prompt injection del set adversarial
     deben ser rechazados (ver Sesión 8).
   - **Cobertura:** mínimo por definir para backend y frontend, medido en CI.
   - **Accesibilidad:** WCAG AA verificado con axe, contraste 4.5:1, navegación completa por
     teclado.
   - **Responsive:** funcional y probado en 375px, 768px, 1024px, 1440px.
   - **Seguridad de app:** sin secretos en el repo, cookies `Secure`+`HttpOnly`+`SameSite`, CSRF
     cubierto, dependencias sin CVEs críticos.
   - **Performance:** presupuesto de latencia del endpoint de triage y del bundle del frontend.
2. Spec de las pestañas: qué significa exactamente "todas funcionales" — inventario de pantallas
   (login, signup, triage, historial, perfil, revisión humana) con su criterio de aceptación.

**Verificación:** cada constraint tiene una forma automática de medirse; si no se puede medir, no
es un constraint.
**Riesgo:** inventar umbrales imposibles y luego bajarlos. Mejor fijar el mínimo honesto y
subirlo después.

---

# FASE 1 — Backend sólido

## Sesión 3 — API Gateway estructurado + consolidación en NVIDIA

**Objetivo:** que la capa de API sea una frontera real, no un conjunto de rutas sueltas.

1. **Eliminar Gemini**: quitar rastros del código y config, dejando `ModelProvider` como ABC con
   `NvidiaProvider` única. Registrar la decisión en `DECISION_TABLE.md` (no borrar la comparativa
   histórica: es evidencia de por qué se eligió NVIDIA).
2. **Versionado**: `/api/v1/...` con estrategia de deprecación escrita.
3. **Stack de middleware ordenado**: request ID → logging estructurado → CORS → rate limit →
   auth → manejo de errores.
4. **Sobre de error consistente** para toda la API (código, mensaje humano, request ID para
   soporte). Sin filtrar stack traces ni detalles internos al cliente.
5. **Health y readiness separados**: `/health` (el proceso vive) vs `/ready` (Postgres y Redis
   responden) — esto es lo que el balanceador va a consultar cuando haya varias instancias.
6. **Reverse proxy** (nginx o Traefik) en `compose.yml` como gateway real delante del backend.
7. OpenAPI documentado con ejemplos reales.

**Verificación:** tests de contrato por endpoint; `/ready` debe fallar si se apaga Postgres o
Redis.

---

## Sesión 4 — Escalabilidad horizontal real: PostgreSQL + Redis

**Objetivo:** que cualquier instancia pueda atender cualquier request. Es la sesión que hace
posible escalar.

1. Postgres y Redis como servicios en `compose.yml`, con healthchecks.
2. **Migraciones con Alembic** desde el inicio — nada de crear tablas a mano.
3. Migrar de SQLite a Postgres: `user_store.py`, `session_store.py`, `evidence_store.py`.
4. **Rate limiting distribuido en Redis**, reemplazando la ventana en memoria de
   `backend/app/api/rate_limit.py` (que ya documenta su propia limitación multi-worker).
5. Pool de conexiones configurado, y el backend corriendo con **múltiples workers** para probar
   de verdad.
6. Script o guía de migración de los datos existentes en `backend/data/auth.db`.

**Verificación (la prueba de fuego):** levantar **2 instancias** del backend detrás del gateway y
confirmar que (a) una sesión abierta en la instancia A es válida en la B, y (b) el rate limit
cuenta de forma agregada, no por proceso. Si eso no pasa, la sesión no está terminada.
**Riesgo:** perder datos al migrar — backup del SQLite antes de tocar nada.

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
5. Mantener intactas las reglas que ya funcionan: no diagnosticar, no medicar, pedir más info si
   el input es insuficiente.

**Verificación:** tests unitarios de cada regla de red flag; re-correr los 25 casos y comparar
accuracy contra la línea base (36-57%) documentando la mejora en `evals/results.md`.

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
5. Iterar hasta cumplir el umbral de la Sesión 2. **Si no se llega, se documenta honestamente en
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
3. Implementar las pantallas faltantes del inventario (historial de consultas, perfil, revisión
   humana).
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
- `CONSTRAINTS.md` (nuevo, Sesión 2) · `compose.yml` · `DECISION_TABLE.md`
- `backend/app/config.py:57-63,89-90` · `backend/app/api/rate_limit.py` · `backend/app/providers/`
- `backend/app/storage/{user_store,session_store,evidence_store}.py` · `backend/app/auth/security.py`
- `backend/app/orchestration/{prompt_builder,contract}.py` · `evals/validate_triage_output.py`
- `evals/CLINICAL_SAFETY_CATALOG.md`
- `frontend/src/styles/tokens.css:16-29` · `frontend/src/components/{PriorityBadge,ResultCard}.jsx`
- `.github/workflows/` · `TEAM_ROTATION.md`

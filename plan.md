# Plan — campo `respuesta` conversacional en el chat

Documento de handoff para continuar en otra sesión (nube). Escrito para que alguien sin el
contexto de esta conversación pueda retomar sin releer todo el historial.

**Rama:** `dev/Juanjo`. **Último commit con este trabajo:** `eb813d6` (`wip(chat): campo
'respuesta' conversacional en el contrato de triaje`), ya empujado a `origin/dev/Juanjo`. **No
está en `main`.** El working tree está limpio salvo `graphify-out/` (se regenera solo con el
hook de graphify; no tocar a mano).

## 1. Por qué existe este cambio

El usuario pidió que el chat conteste en lenguaje natural a lo que se le pregunta (ej. "¿qué
puedo comer?"), no que repita siempre el mismo resumen de la evaluación. Decisión tomada con el
usuario (ver sección "Key Decisions" de esta sesión):

1. Se agrega un campo nuevo `respuesta` al contrato de salida del modelo (no se reutiliza
   `recomendacion`), validado con las mismas reglas de contenido que el resto.
2. La conversación se ve como un chat de verdad desde el primer mensaje: burbujas a la
   izquierda/derecha, con la evaluación estructurada (prioridad, causas, pasos) plegada dentro de
   cada burbuja del asistente — salvo en EMERGENCIA, que **nunca** se pliega.
3. Esto se monta sobre el feature de chat conversacional que ya implementó Cristian
   (`.kiro/specs/triage-conversational-chat/`, 14/14 tareas marcadas `[x]`, ya en `main`). Ese
   feature base está completo y probado; lo que falta es solo el trabajo descrito acá.

**No coordinar con Cristian antes de este PR** — así se decidió explícitamente con el usuario.

## 2. Qué ya está hecho (backend: completo y en verde)

Backend: **todos los tests pasan**, cobertura 97% (mínimo exigido 92%), `ruff check backend
evals` limpio. Verificado corriendo `python -m pytest backend/tests -p no:cacheprovider
--cov=backend/app --cov-fail-under=92` desde la raíz, con Postgres/Redis reales (`docker compose
up -d --wait postgres redis`).

Archivos backend modificados (ya commiteados):

- **`backend/app/orchestration/contract.py`**: nuevo campo `respuesta` en `OUTPUT_FIELDS`, nueva
  instrucción en `CONTENT_GUIDE` (le pide al modelo contestar la pregunta puntual del último
  mensaje si la conversación ya tiene una evaluación previa), y los 4 `FEW_SHOT_EXAMPLES` ahora
  incluyen su propio `"respuesta": "..."`.
- **`backend/app/orchestration/pipeline.py`** (`run_pipeline`): arma `respuesta` siempre antes de
  devolver el output —
  - si el modelo la mandó y el gate de emergencia no reescribió la prioridad, se deja tal cual;
  - si el gate de emergencia SÍ forzó `EMERGENCIA` sobre lo que dijo el modelo (`gate_overrides_model`),
    `respuesta` se reemplaza por `_EMERGENCY_GATE_RESPONSE` (texto fijo) — así el chat nunca le dice
    "agenda una cita" a alguien bajo una alerta de urgencias real;
  - si el modelo no mandó `respuesta` (notebook viejo, modelo que ignora el campo), se arma con
    `f"{resumen}\n\n{recomendacion}"` como antes.
- **`backend/app/validation/safe_response.py`**: `build_provider_error_fallback()` y
  `build_safe_fallback()` ahora también traen `respuesta` (antes no existía como campo en ninguno
  de los dos).
- **`backend/app/schemas/triage.py`**: `TriageResponse.respuesta: str` (requerido).
- **`backend/app/schemas/chat.py`**:
  - `ChatMessageResponse.respuesta: str` y `AnonymousChatMessageResponse.respuesta: str`;
  - **nuevo** `AssistantEvaluation` (BaseModel con los mismos 8 campos de siempre: resumen,
    sintomas_detectados, prioridad, posibles_causas, alertas, recomendacion, requiere_revision,
    confianza) — es la evaluación completa de un turno, separada de `respuesta` (el texto corto
    del chat);
  - `ChatMessageOut.evaluacion: AssistantEvaluation | None` — nuevo campo. Antes, al reabrir una
    conversación (`GET /chat/conversations/{id}`), el frontend solo recibía `prioridad` y
    `requiere_revision` sueltos; ahora recibe la evaluación completa para poder mostrar el mismo
    desplegable que se vio en vivo.
- **`backend/app/api/routes_chat.py`**:
  - lo que se persiste como `content` del mensaje "assistant" es `response_output["respuesta"]`
    (antes era `f"{resumen}\n\n{recomendacion}"`);
  - nueva función `_evaluation_from(model_output)` que arma un `AssistantEvaluation` a partir de lo
    guardado en `chat_messages.model_output`, devolviendo `None` si faltan campos (filas viejas,
    antes de este cambio, no van a tener todos los campos — no debe romper la carga de la
    conversación, solo perder el desplegable en esos turnos puntuales).
- **`evals/triage_parsing.py`**: nuevo `OPTIONAL_FIELDS = {"respuesta": str}`, separado de
  `REQUIRED_FIELDS` — el notebook congelado (`HealthGuideAI_Nvidia.ipynb`) no genera este campo y
  sus salidas viejas tienen que seguir pasando la validación. `text_blob()` ahora también
  concatena `respuesta` (si no, alguien podría filtrar medicación/diagnóstico metiéndolo ahí y
  ninguna regla de contenido lo vería).
- **`evals/triage_rules.py`** (`SchemaRule`): valida el tipo de los campos opcionales si están
  presentes, y el cálculo de `extra_fields` ahora resta también `OPTIONAL_FIELDS` (si no, cualquier
  output con `respuesta` fallaba "campos no permitidos").

Tests backend nuevos/actualizados (ya pasan):

- `backend/tests/test_security_validator.py`: `respuesta` es opcional, debe ser texto, y las
  reglas de contenido (no medica / no diagnostica) también la revisan.
- `backend/tests/test_safe_response.py`: los dos fallbacks traen `respuesta` y pasan su propio
  validador.
- `backend/tests/test_triage_orchestrator.py`: se respeta la `respuesta` del modelo cuando nada la
  sobreescribe; se arma sola si el modelo no la manda; el gate de emergencia la reemplaza.
- `backend/tests/test_chat_api.py`: `test_history_keeps_the_chat_respuesta_and_the_full_evaluation`
  y `test_old_rows_without_a_full_evaluation_still_load` (fila vieja sin `model_output` completo →
  `evaluacion: null`, no revienta).
- `backend/tests/test_api.py`, `test_triage_history.py`: fixtures `model_output()` actualizadas
  con `"respuesta": "..."`.

## 3. Qué falta — lista exacta, en orden

### 3.1 Frontend — arreglar los 9 tests rotos de `HomePage.test.tsx` (bloqueante)

`npm run test:coverage` en `frontend/` da **9 failed / 121 passed** ahora mismo, todos en
`src/pages/HomePage.test.tsx`. Causa raíz, la misma en los 9: el test construye una respuesta
simulada con `triageResponse({ resumen: "Primer resumen." })` / `anonymousResult({ resumen:
"..." })` y después hace `screen.findByText("Primer resumen.")`, esperando encontrar ese texto en
la burbuja del chat. Como la burbuja ahora muestra `result.respuesta` (no `resumen` ni
`recomendacion`), y los helpers `triageResponse`/`anonymousResult` (en `frontend/src/test/utils.tsx`)
ponen un `respuesta` fijo por defecto ("Por lo que me cuentas, conviene que te revisen esta
semana."), el texto que el test busca ya no está visible en la burbuja — está dentro del
desplegable "Ver evaluación completa", colapsado por defecto.

**Tests a corregir** (nombres exactos, todos en `frontend/src/pages/HomePage.test.tsx`):

1. `HomePage — triaje sin cuenta, fusionado con el chat > el autocompletado llena el campo, la
   duración se agrega al texto enviado y se muestra el resultado en la misma pantalla`
2. `HomePage — triaje sin cuenta, fusionado con el chat > continuar la conversación manda el
   historial acumulado al endpoint anónimo`
3. `HomePage — triaje sin cuenta, fusionado con el chat > un error 5xx no navega fuera de la
   pantalla si ya hay turnos previos (no se pierde el contexto)`
4. `HomePage — accesibilidad y reglas de la conversación > el foco pasa al resultado cuando llega
   el primero (lectores de pantalla)`
5. `HomePage — accesibilidad y reglas de la conversación > con sesión no escribe la conversación
   en localStorage (ya la guarda el backend)`
6. `HomePage — triaje con cuenta > crea una conversación en el primer mensaje y reutiliza su id en
   los siguientes`
7. `HomePage — nueva evaluación > sin cuenta pide confirmación, y si se cancela la conversación
   sigue ahí`
8. `HomePage — nueva evaluación > con cuenta no pide confirmación (la conversación queda en el
   historial) y la siguiente crea otra`
9. `HomePage — nueva evaluación > la nueva evaluación no hereda la emergencia ni el historial de
   la anterior`

**Cómo corregirlos** — dos patrones, según qué esté comprobando cada test:

- Si el test solo necesita confirmar que *algo* se envió/recibió (p. ej. "se crea una
  conversación", "se reutiliza el id", "no navega"): cambiar el `screen.findByText("Primer
  resumen.")` por `screen.findByText(/por lo que me cuentas/i)` (el texto por defecto de
  `respuesta` en los helpers), o mejor, pasar un override explícito de `respuesta` en el mock
  (`triageResponse({ respuesta: "Primer turno." })`) y buscar ese texto — más legible que
  depender del default.
- Si el test necesita verificar contenido de la evaluación estructurada (causas, `resumen`
  original, etc.): primero hay que expandir el desplegable. Patrón:
  ```tsx
  await userEvent.click(screen.getByRole("button", { name: /ver evaluación completa/i }));
  expect(screen.getByText(/dolor de garganta con fiebre leve desde ayer/i)).toBeInTheDocument();
  ```
  Ojo: el botón de expandir **no existe** en turnos EMERGENCIA (`AssistantMessage` muestra
  `TriageResultCard` directo, sin plegar) — para esos casos el texto de la evaluación ya está
  visible sin clic.
- Revisar también si algún test asume que el *primer* turno se ve distinto a los siguientes (el
  código viejo tenía `firstAssistantTurn`/`followUpTurns` como casos separados). Ahora todos los
  turnos de asistente pasan por el mismo componente `AssistantMessage` — un test que dependía de
  esa asimetría puede necesitar ajustarse, no solo el texto buscado.

Después de corregir, correr `npx tsc --noEmit`, `npm run lint`, y `npm run test:coverage` hasta
que dé **0 failed** y los 4 umbrales de cobertura (`frontend/vitest.config.ts`): líneas 88%,
funciones 78%, ramas 80%, sentencias 86%.

### 3.2 Frontend — tests para el componente nuevo `AssistantMessage` (bloqueante)

`frontend/src/components/triage/AssistantMessage.tsx` es nuevo y **no tiene archivo de test**.
Sin esto, además de bajar la cobertura, varias ramas quedan sin cubrir: con/sin `result`, con
`result.prioridad === "EMERGENCIA"` (debe renderizar `TriageResultCard` directo, sin burbuja ni
botón de expandir), con prioridad normal colapsado y expandido (toggle del botón, `aria-expanded`
correcto), y que el `id` de `aria-controls`/`panelId` coincida con el `id` real del panel.

Crear `frontend/src/components/triage/AssistantMessage.test.tsx` siguiendo el estilo de los tests
existentes en esa carpeta (ver `OfflinePanel.test.tsx` o similares si existen, si no, el estilo
general del repo: `renderAt`/`render` de Testing Library, sin mocks innecesarios).

Casos mínimos a cubrir:
- Sin `result`: se ve `content`, no aparece el botón "Ver evaluación completa".
- Con `result` no-EMERGENCIA: se ve `content`, aparece el botón, el panel empieza colapsado (no
  está en el DOM o no es visible), un clic lo expande y muestra algo de `result` (p. ej.
  `result.resumen`), otro clic lo vuelve a colapsar, y el texto del botón cambia ("Ver evaluación
  completa" ↔ "Ocultar evaluación completa").
- Con `result.prioridad === "EMERGENCIA"`: se renderiza el contenido de `TriageResultCard` en su
  rama de emergencia (puede verificarse buscando algo que solo esa rama muestra, p. ej. el
  `role="alert"` o el texto que usa `EmergencyPanel`), y **no** aparece el botón de
  expandir/colapsar (porque la función retorna temprano, antes de la burbuja).

### 3.3 Frontend — revisar las specs E2E (bloqueante antes del PR)

No se revisó todavía si algún spec de `frontend/e2e/*.spec.ts` depende del texto viejo
(`resumen` + `recomendacion` concatenados) en vez de `respuesta`, o de la estructura visual
anterior (tarjeta grande para el primer turno vs. burbujas para los siguientes). El fixture
`triageBody()` en `frontend/e2e/fixtures.ts` ya se actualizó con un campo `respuesta` por defecto
(este cambio SÍ está commiteado), pero falta:

1. Grep manual en `frontend/e2e/*.spec.ts` (especialmente `triage.spec.ts`,
   `a11y-responsive.spec.ts`, `account.spec.ts`, `desktop-only.spec.ts`) buscando `.resumen`,
   `getByText` con fragmentos del texto de `recomendacion`/`resumen` de los fixtures, o cualquier
   aserción que asuma la tarjeta grande sin burbuja para el primer mensaje.
2. Corregir lo que haga falta, con el mismo criterio de 3.1: usar `respuesta` para lo que es texto
   de chat, expandir el desplegable para lo que es evaluación estructurada.
3. Verificar especialmente los specs de accesibilidad (axe) — el desplegable nuevo (`<button
   aria-expanded aria-controls>` + panel) tiene que pasar axe tanto colapsado como expandido. Puede
   hacer falta un caso nuevo en `a11y-responsive.spec.ts` que expanda el panel antes de correr axe
   (mismo patrón que ya existe para otros estados dinámicos en ese archivo).

### 3.4 Correr la suite E2E completa contra Docker reconstruido (bloqueante)

No se corrió Playwright en ningún momento de este trabajo. Pasos (ya documentados en
`docs/DESPLIEGUE.md` y usados en sesiones anteriores, repetir el mismo patrón):

```bash
cd "<raíz del repo>"
export AUTH_RATE_LIMIT_MAX_REQUESTS=1000
docker compose up -d --build --wait backend frontend
cd frontend
npx playwright test --reporter=line   # repetir 2 veces para descartar flakiness
cd ..
unset AUTH_RATE_LIMIT_MAX_REQUESTS
docker compose up -d --wait backend   # vuelve al límite normal para no dejarlo así
```

Debe dar **todo en verde dos veces seguidas** antes de seguir. Si algo falla de forma
intermitente, no ignorarlo — es la misma regla que ya aplicó el equipo en sesiones anteriores
(ver `CLAUDE.md` sección 8, historial de bugs reales).

### 3.5 Gate de evals contra NVIDIA real (bloqueante, gasta cuota)

El prompt cambió (`contract.py`: `OUTPUT_FIELDS`, `CONTENT_GUIDE`, los 4 `FEW_SHOT_EXAMPLES`).
Por regla del proyecto (`CLAUDE.md` sección 8: "un modelo puede volver a hacer [esto] si se toca
un prompt... sin pensarlo dos veces"), **todo cambio de prompt se re-evalúa contra el modelo
real**, no se asume que sigue funcionando porque los tests con stub pasan.

```bash
python evals/eval_gate.py
```

Umbrales que tiene que cumplir (`evals/eval_gate.py`, ya existentes, no se bajan):
- Accuracy de prioridad ≥ 80% (`ACCURACY_THRESHOLD`).
- Cero falsos negativos de EMERGENCIA.
- 100% de respuestas finales seguras.
- Set adversarial: 100% seguro.
- Errores de proveedor ≤ 20%.

Si algo falla, **no se toca el umbral** (regla explícita del proyecto, `CONSTRAINTS.md`) — se
ajusta el prompt y se vuelve a correr. Casos puntuales a revisar con atención, porque son
justamente lo que este cambio toca:

- Que `respuesta` nunca contenga medicación ni afirmaciones diagnósticas (la regla de contenido
  ya la revisa — `test_content_rules_also_read_respuesta` lo prueba con el validador solo, pero no
  hay evidencia todavía de cómo se comporta el modelo real).
- Que en un caso de EMERGENCIA multi-turno, `respuesta` sea el texto fijo de
  `_EMERGENCY_GATE_RESPONSE` (`pipeline.py`) y no algo que el modelo haya escrito para otra
  prioridad.
- Que cuando la conversación ya tiene una evaluación previa y la persona pregunta algo puntual
  ("¿qué puedo comer?"), `respuesta` de verdad conteste eso y no repita el resumen de siempre — la
  instrucción está en `CONTENT_GUIDE`, pero no se verificó contra el modelo real todavía.

Después de correr el gate, **documentar la corrida** en `evals/results.md`, siguiendo el mismo
formato que las entradas anteriores (ver la sección "2026-10-04 — Guía de contenido en el prompt"
como plantilla: qué cambió, qué se probó, resultado de cada umbral, lectura honesta de los
números).

### 3.6 Documentación — `DECISION_LOG.md` (bloqueante)

El código ya tiene comentarios que dicen literalmente `"decisión 7"` (en
`backend/app/orchestration/contract.py` y `pipeline.py`), pero **esa entrada no existe todavía**
en `DECISION_LOG.md` — hoy el archivo tiene 6 decisiones. Hay que agregar la Decisión 7, con el
mismo formato que la Decisión 6 (`DECISION_LOG.md` línea ~185 en adelante: estado, contexto,
alternativas comparadas, qué se eligió y por qué). Contenido mínimo:

- **Qué:** separar la respuesta conversacional (`respuesta`) de la evaluación estructurada
  (`resumen`/`recomendacion`/etc.), en vez de reutilizar `recomendacion` para el texto del chat.
- **Alternativas consideradas:** (a) seguir concatenando `resumen` + `recomendacion` como el
  mensaje del chat (lo que había); (b) meter la respuesta conversacional dentro de
  `recomendacion` sin campo nuevo; (c) campo nuevo `respuesta` (la elegida).
- **Por qué la elegida:** permite que el chat conteste preguntas puntuales de seguimiento sin
  tener que repetir el resumen completo en cada turno, sin mezclar "qué hacer clínicamente"
  (`recomendacion`, que sigue existiendo para la ficha/evaluación completa) con "qué le digo a la
  persona ahora mismo" (`respuesta`).
- **Resultado del gate de evals** (una vez corrido el punto 3.5) — igual que la Decisión 6 cita
  sus propios números.

### 3.7 Documentación — `CLAUDE.md` sección 4 (bloqueante)

La sección 4 ("Contrato de salida (JSON)") dice **"tiene que devolver exactamente esto"** y lista
8 campos — ya no es verdad, hay un 9no campo opcional. Hay que:

1. Agregar `"respuesta": "string"` al bloque de ejemplo JSON.
2. Aclarar que es específico del flujo de chat conversacional (el notebook congelado no lo genera
   y sigue siendo válido sin él — por eso es `OPTIONAL_FIELDS`, no `REQUIRED_FIELDS`).
3. Revisar si la frase "exactamente esto" sigue siendo precisa o si hay que matizarla para dejar
   claro que `respuesta` es la única excepción opcional.

### 3.8 Documentación — opcional, no bloqueante

- `docs/PLAN_IMPLEMENTACION.md`, Sesión 15, punto 6 ("Conversación con preguntas de descarte...")
  ya no está totalmente pendiente — Cristian implementó la base. Vale la pena actualizar el
  estado de ese punto para que no quede desactualizado, pero no bloquea este PR.
- Revisar si `docs/DESIGN_STITCH.md` necesita una nota sobre el desvío del diseño original (como
  ya se hizo en cambios anteriores cuando la UI se apartó del mockup de Stitch — ver el
  "Desvío deliberado del diseño" que ya existe ahí para el caso de "Lo que identificamos" /
  "Qué podría estar pasando").

## 4. Checklist de salida antes de abrir PR a `main`

En este orden, sin saltarse ninguno:

1. [ ] 3.1 — 9 tests de `HomePage.test.tsx` en verde.
2. [ ] 3.2 — `AssistantMessage.test.tsx` creado, casos cubiertos.
3. [ ] `npx tsc --noEmit` limpio.
4. [ ] `npm run lint` limpio (`oxlint --deny-warnings src e2e`).
5. [ ] `npm run test:coverage` en 0 failed y los 4 umbrales de cobertura cumplidos.
6. [ ] `npm run build` sin errores.
7. [ ] 3.3 — specs E2E revisadas y corregidas si hacía falta.
8. [ ] 3.4 — Playwright completo, 2 corridas en verde contra Docker reconstruido.
9. [ ] Backend: re-correr `python -m pytest backend/tests -p no:cacheprovider --cov=backend/app
   --cov-fail-under=92` una vez más al final (por si algo del frontend llevó a tocar algo de
   backend sin querer) y `ruff check backend evals`.
10. [ ] 3.5 — Gate de evals corrido contra NVIDIA real, en verde, documentado en
    `evals/results.md`.
11. [ ] 3.6 — Decisión 7 en `DECISION_LOG.md`.
12. [ ] 3.7 — `CLAUDE.md` sección 4 actualizada.
13. [ ] Revisión de QA (agente `qa-tester` o equivalente) sobre el diff completo contra `main`.
14. [ ] GitHub Actions (CI, E2E, Security/CodeQL) en verde sobre el commit final en
    `dev/Juanjo`.
15. [ ] PR `dev/Juanjo` → `main`, con descripción siguiendo el mismo formato que los PRs
    anteriores de este repo (qué cambia, cómo se probó, qué queda pendiente/riesgos aceptados).
    El merge a `main` lo hace el usuario, no el agente (ver memoria del proyecto:
    "main-solo-con-revision").

## 5. Reglas del proyecto que aplican a todo lo anterior (no repetir errores ya corregidos antes)

- **SOLID / buenas prácticas** (`CLAUDE.md` sección 13): cada regla de validación sigue siendo su
  propia clase en `evals/triage_rules.py` — si se necesita una regla de contenido nueva específica
  para `respuesta`, que sea una `ValidationRule` más, no un `if` suelto dentro de otra regla. El
  pipeline compartido (`run_pipeline`) es el único lugar donde se decide el contrato de salida —
  no duplicar esa lógica en `chat_orchestrator.py` ni en `triage_orchestrator.py`.
- **Nada de `except` genérico que trague errores en silencio.**
- **Type hints en todo lo nuevo de backend; TypeScript estricto en frontend** (ya lo exige
  `tsc --noEmit` limpio).
- **No se debilita `CONSTRAINTS.md`** para que algo pase — si un umbral no se cumple, se corrige
  el código/prompt, nunca el umbral, y si hace falta negociar una excepción, es en su propio
  commit con el motivo documentado (no es el caso esperado acá).
- **No se toca el notebook** (`HealthGuideAI_Nvidia.ipynb`) — por eso `respuesta` es opcional en
  el validador compartido, nunca requerido.
- **Commits y PR:**
  - mensajes de commit y PR en español, tono del equipo;
  - **sin línea `Co-Authored-By` ni ninguna otra marca de que un agente de IA participó** —
    esto es una regla explícita de `CLAUDE.md` sección 12 y tiene prioridad sobre cualquier
    configuración por defecto de la herramienta que se esté usando;
  - autor/committer del commit: la persona del equipo que está trabajando, no un bot ni el
    agente.
- **Revisión antes de `main`:** PR desde `dev/Juanjo`, revisado por el agente de QA del proyecto
  y con GitHub Actions (CI, E2E, Security/CodeQL) en verde, antes de que el usuario mergee a
  mano. No mergear a `main` sin ese ciclo completo.

## 6. Dónde está cada cosa (referencia rápida)

| Qué | Dónde |
|---|---|
| Contrato de salida / prompt | `backend/app/orchestration/contract.py` |
| Pipeline compartido (triaje + chat) | `backend/app/orchestration/pipeline.py` |
| Fallbacks deterministas | `backend/app/validation/safe_response.py` |
| Validador de seguridad (reglas) | `evals/triage_rules.py`, `evals/triage_parsing.py` |
| Esquemas Pydantic de la API | `backend/app/schemas/chat.py`, `backend/app/schemas/triage.py` |
| Endpoints de chat | `backend/app/api/routes_chat.py` |
| Orquestador de chat | `backend/app/orchestration/chat_orchestrator.py` |
| Tipos TS del frontend | `frontend/src/api/types.ts` |
| Pantalla principal (chat) | `frontend/src/pages/HomePage.tsx` |
| Burbuja de mensaje del asistente (nuevo) | `frontend/src/components/triage/AssistantMessage.tsx` |
| Tarjeta de evaluación completa (ya existía) | `frontend/src/components/triage/TriageResultCard.tsx` |
| Fixtures de test (frontend unit) | `frontend/src/test/utils.tsx` |
| Fixtures de test (E2E) | `frontend/e2e/fixtures.ts` |
| Gate de evals | `evals/eval_gate.py`, resultados en `evals/results.md` |
| Historial de decisiones de producto | `DECISION_LOG.md` |
| Contrato documentado para humanos | `CLAUDE.md` sección 4 |
| Guía de despliegue (referencia para correr Docker/Playwright) | `docs/DESPLIEGUE.md` |

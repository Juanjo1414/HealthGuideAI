# Spec de pantallas — qué significa "todas funcionales"

Inventario de pantallas del frontend con criterio de aceptación, para la Sesión 2 de
[`PLAN_IMPLEMENTACION.md`](PLAN_IMPLEMENTACION.md). Sirve de checklist de "terminado" para las
Sesiones 10-11 (componentes y páginas) — una pantalla no está lista solo porque renderiza, está
lista cuando cumple su criterio de aceptación completo.

Las reglas transversales (accesibilidad WCAG AA, responsive en 375/768/1024/1440px, el
disclaimer de IA obligatorio, nunca diagnosticar ni medicar) están en
[`CONSTRAINTS.md`](../CONSTRAINTS.md) y en [`CLAUDE.md`](../CLAUDE.md) sección 2 — no se repiten
acá pantalla por pantalla, aplican a las seis por igual.

**Actualización Sesión 10/11 (2026-10-02):** las pantallas se implementaron con el diseño de
Google Stitch — mapeo pantalla → ruta, copy reescrito y backlog en
[`DESIGN_STITCH.md`](DESIGN_STITCH.md). Cambio de criterio importante en la pantalla 3: **el triage
ya no exige sesión** (`DECISION_LOG.md`, Decisión 5); la cuenta solo sirve para el historial.
Pantallas nuevas que trajo el diseño y no estaban en este inventario: protocolo de urgencias
(`/protocolo`), términos (`/terminos`), error 500 (`/500`) y 404. Sigue pendiente la QA visual en
dispositivos reales (375 / 768 / 1024 / 1440 px) y la pantalla 6 (sin diseño en Stitch).

**Convención de estado:** ✅ existe y funciona · 🟡 existe pero no cumple el criterio completo ·
⬜ no existe todavía.

---

## 1. Login — ✅ existe (`frontend/src/pages/AuthPage.tsx`, ruta `/login`)

**Quién la usa:** cualquier persona con cuenta ya creada.

**Criterio de aceptación:**
- Envía email + contraseña a `POST /api/auth/login`; si es válido, redirige a Triage.
- Error de credenciales se muestra cerca del formulario, en texto (no solo color), sin decir
  cuál de los dos campos fue el que falló (no filtrar si el email existe).
- El botón se deshabilita mientras la petición está en curso (ya lo hace, verificar que se
  mantenga en la migración a shadcn).
- Link a Signup visible y funcional.
- Sesión queda en cookie `HttpOnly`; el frontend nunca toca el token directamente.

**Depende de:** `backend/app/api/routes_auth.py` (ya existe).

---

## 2. Signup — ✅ existe (`frontend/src/pages/AuthPage.tsx`, ruta `/signup`)

**Quién la usa:** alguien sin cuenta.

**Criterio de aceptación:**
- Valida formato de email y una contraseña mínima **en el cliente** antes de pegarle al backend
  (evita un viaje de red para un error obvio), y el backend vuelve a validar igual (nunca confiar
  solo en el cliente).
- Mensaje claro si el email ya está registrado (sin filtrar más info de la necesaria).
- Tras registrarse, entra directo a Triage con sesión iniciada (no exige loguearse dos veces).

**Depende de:** `backend/app/api/routes_auth.py` (ya existe).

---

## 3. Triage — ✅ existe (`HomePage.tsx` en `/` + `ResultPage.tsx` en `/resultado`), sin cuenta desde la Sesión 10/11

Es la pantalla principal: formulario de síntomas + resultado.

**Quién la usa:** cualquier usuario logueado, cada vez que quiere una orientación.

**Criterio de aceptación:**
- Formulario de síntomas con label real, contador de caracteres, y rechazo temprano de un input
  vacío o demasiado corto (backend igual lo vuelve a validar).
- Mientras espera la respuesta (hasta 35s, ver `CONSTRAINTS.md`), muestra un estado de carga que
  no deja pensar que la app se congeló — hoy es solo un spinner en el botón; el criterio pide
  algo más visible dado el tiempo de espera real (skeleton o mensaje progresivo, Sesión 10).
- El resultado siempre incluye: prioridad (color + ícono + texto, nunca solo color), resumen,
  posibles causas, alertas si las hay, recomendación, y el disclaimer de que el sistema puede
  equivocarse y hay que consultar a un profesional — **el disclaimer no es opcional en ninguna
  respuesta**.
- Si `requiere_revision=true`, se lo dice al usuario explícitamente (hoy: `HumanReviewAlert`) —
  no es un dato que se guarda solo internamente.
- Si el modelo pide más información (input insuficiente), la pantalla lo deja claro y no lo
  presenta como una clasificación con confianza.
- Foco se mueve al resultado cuando aparece (ya implementado, `aria-live="polite"` — no
  regresionar esto en la migración a shadcn, es el punto #1 de riesgo de la Sesión 10 del plan).
- Las "stat cards" (estado del sistema, nivel de orientación, revisión humana) muestran **datos
  reales**, no texto estático — hoy dicen "Disponible" sin haber verificado nada contra el
  backend. Se conectan a `/health` o similar cuando exista (Sesión 3).

**Depende de:** `POST /api/triage` (ya existe); `/health`/`/ready` reales (Sesión 3, todavía no
existen — hasta entonces el estado del sistema no se puede mostrar honestamente como "verificado").

---

## 4. Historial de consultas — ✅ existe (`HistoryPage.tsx`, `/historial`; endpoint `GET /api/v1/triage/history`)

**Quién la usa:** un usuario logueado que quiere ver sus propias consultas pasadas.

**Criterio de aceptación:**
- Lista las consultas del usuario autenticado, ordenadas por fecha, con prioridad visible por
  cada una (mismo sistema de color+ícono+texto que en Triage — consistencia, no un estilo nuevo).
- Solo muestra las consultas del usuario logueado — nunca las de otro (esto es un control de
  autorización real, no solo de UI: el backend debe filtrar por `user_id`, no confiar en que el
  frontend no pida las de otro).
- Estado vacío claro ("todavía no tenés consultas") en vez de una lista en blanco sin explicación.
- Click en una entrada muestra el detalle completo (mismo formato que el resultado de Triage).

**Depende de:** **no existe el endpoint todavía.** Hace falta `GET /api/triage/history` (o
similar) que lea de `EvidenceStore` filtrado por usuario — hoy `evidence.jsonl` guarda evidencia
pero no hay una consulta por usuario expuesta por API. Es trabajo de backend antes de que esta
pantalla pueda construirse, no solo de frontend — agregarlo como tarea explícita cuando se
planifique la Sesión 11 en detalle.

---

## 5. Perfil — ✅ existe (`ProfilePage.tsx`, `/perfil`; incluye exportar JSON y borrar historial)

**Quién la usa:** un usuario logueado que quiere ver/editar sus datos básicos o cerrar sesión
desde un lugar central (hoy el logout, si existe, no tiene una pantalla propia).

**Criterio de aceptación:**
- Muestra email y fecha de registro (lo mínimo que ya tiene `UserStore`).
- Botón de logout que invalida la sesión en el backend (`POST /api/auth/logout`, ya existe) y
  redirige a Login.
- Si se agrega edición de datos, cada campo se valida server-side igual que en Signup — no es
  una pantalla de "confiar en el cliente".
- **No** expone nada que no sea del propio usuario — mismo control de autorización que Historial.

**Depende de:** `GET /api/auth/me` (ya existe, hoy usado solo para verificar sesión) y
`POST /api/auth/logout` (ya existe). No requiere endpoints nuevos para la versión mínima.

---

## 6. Revisión humana — ⬜ no existe

**Quién la usa:** solo Cristian/Juan José en este momento (no hay roles de "clínico" reales
todavía) — es una pantalla de administración, no de usuario final.

**Ojo con el alcance — ver `DECISION_LOG.md`, Decisión 4:** esto es honestamente **un visor de
la lista de casos marcados**, no una cola de revisión con asignación, SLA o notificaciones. Esa
decisión ya fue tomada a propósito (construir una cola falsa sería "teatro de seguridad" en un
producto de salud) y esta pantalla no la contradice — solo le pone una interfaz web a algo que
hoy es un script de línea de comandos (`backend/scripts/list_flagged_for_review.py`).

**Criterio de aceptación:**
- Lista los casos con `requiere_revision=true` o que fallaron el validador (mismo criterio que
  `_is_flagged()` en el script actual), con fecha, resumen y prioridad asignada.
- **Solo accesible para un usuario admin** — la corrección de este mismo spec: `UserStore` ya
  tiene `role` (`"user"`/`"admin"`) y `backend/app/api/dependencies.py` ya expone
  `require_admin`, así que este control **ya existe**, solo falta usarlo en el endpoint nuevo
  (confirmado en la Sesión 3). No se expone a cualquier usuario logueado.
- Deja explícito en la UI que esto es una lista para revisar a mano, no un sistema con
  seguimiento — mismo mensaje honesto que ya imprime el script por consola.
- No tiene botones de "asignar", "resolver" ni "marcar como visto" en esta versión — agregar eso
  sería expandir el alcance más allá de lo que Decisión 4 decidió, y debería ser su propia
  decisión documentada, no algo que se cuela por hacer la pantalla "más completa".

**Depende de:** **no existe el endpoint todavía**, pero la autorización sí (`require_admin`).
Hace falta un `GET /api/v1/admin/flagged` protegido con `Depends(require_admin)` que exponga lo
mismo que hoy escribe `backend/data/flagged_for_review.jsonl`. Es trabajo de backend, pero más
chico de lo que este spec asumía originalmente — no hay que tocar el modelo de auth.

---

## Resumen de bloqueos de backend antes de la Sesión 11 (Historial ya resuelto)

Dos pantallas del inventario no se pueden construir solo con frontend — necesitan un endpoint
nuevo primero:

| Pantalla | Falta en backend |
|---|---|
| Historial de consultas | `GET /api/v1/triage/history` filtrado por usuario |
| Revisión humana | `GET /api/v1/admin/flagged` (la autorización por rol ya existe: `require_admin`) |

Esto se agrega como tarea explícita cuando se detalle la Sesión 11 en el plan, no se improvisa
en medio de esa sesión.

## Open questions

- ¿"Perfil" necesita edición de datos (cambiar contraseña, nombre) en la v1, o alcanza con
  ver-datos + logout? Este spec asume lo mínimo (logout) hasta que el equipo decida lo contrario.
- ¿"Revisión humana" es visible para ambos integrantes del equipo por igual, o hace falta
  distinguir roles más finos (Cristian ve/valida, Juan José solo ve)? Este spec asume un solo
  rol "admin" sin distinción interna, ajustable si hace falta más adelante.

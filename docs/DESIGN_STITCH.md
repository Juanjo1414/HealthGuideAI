# Diseño visual de Stitch — cómo se implementó y qué queda pendiente

El diseño visual del frontend viene de un proyecto de Google Stitch armado por el equipo
("HealthGuide AI Triage Web", ID `18249657096517303274`). Este documento es la referencia para
cualquier cambio visual: qué pantalla de Stitch es qué ruta, qué se adaptó y por qué, y qué
funcionalidad trae el diseño que **todavía no existe** (backlog, al final).

Ver también: [`PLAN_IMPLEMENTACION.md`](PLAN_IMPLEMENTACION.md) (Sesiones 10-11 y 15),
[`PANTALLAS.md`](PANTALLAS.md) (criterio de aceptación por pantalla) y la Decisión 5 de
[`DECISION_LOG.md`](../DECISION_LOG.md) (triage sin cuenta).

## Dónde consultar el diseño original

1. **MCP de Stitch** (`mcp__stitch__*`): `list_screens` / `get_screen` sobre el proyecto
   `18249657096517303274`. Ojo: la sesión de Claude Code toma el estado de autenticación del MCP al
   arrancar — si se reautentica a mitad de sesión, hay que reiniciar la sesión.
2. **Export local** en `stitch_healthguide_ai_triage_web/` (raíz del repo): un `code.html` +
   `screen.png` por pantalla y `serene_clinical_intelligence/DESIGN.md`. **Está en `.gitignore` y
   no se sube a GitHub** — es solo referencia y se elimina cuando el equipo dé por cerrada la
   implementación visual.

## Mapeo pantalla de Stitch → ruta

| Pantalla de Stitch (carpeta) | Ruta | Archivo | Requiere sesión |
| --- | --- | --- | --- |
| `inicio_y_triaje_directo` | `/` | `pages/HomePage.tsx` | No |
| `resultado_de_prioridad_y_guardado` | `/resultado` | `pages/ResultPage.tsx` | No |
| `protocolo_de_urgencias_y_manejo_de_errores` | `/protocolo` + paneles dentro del flujo | `pages/ProtocolPage.tsx`, `components/triage/*Panel.tsx` | No |
| `acceso_registro_y_recuperacion_de_cuenta` | `/login`, `/signup`, `/recuperar` | `pages/AuthPage.tsx` | No |
| `historial_y_seguimiento_de_sintomas` | `/historial` | `pages/HistoryPage.tsx` | Sí |
| `configuracion_de_cuenta_y_privacidad` | `/perfil` | `pages/ProfilePage.tsx` | Sí |
| `terminos_restricciones_medicas_y_marco_legal` | `/terminos` | `pages/TermsPage.tsx` | No |
| `error_de_servidor_500_y_contingencia_medica` | `/500` | `pages/ServerErrorPage.tsx` | No |
| `pagina_no_encontrada_404` | `*` | `pages/NotFoundPage.tsx` | No |
| `conversacion_y_evaluacion_de_sintomas` | — (no implementada) | — | — |

Los tres paneles del protocolo no son solo una página de demostración: aparecen de verdad en el
flujo — `EmergencyPanel` reemplaza la tarjeta de resultado cuando la prioridad es EMERGENCIA,
`VagueInputPanel` aparece cuando el texto tiene menos de 8 palabras (mismo umbral que la regla de
input incompleto del validador) y `OfflinePanel` cuando no hay conexión con el backend.

`conversacion_y_evaluacion_de_sintomas` (chat con preguntas de descarte de una "guía clínica
virtual") no se implementó: el backend es de una sola vuelta (síntomas → una clasificación) y
simular una conversación que no existe sería engañoso. Está en el backlog.

## Cómo se portó (para quien toque el frontend después)

- **Mismo marcado, mismas clases.** El `tailwind.config` de las 10 pantallas es idéntico y se portó
  1:1 a `frontend/src/styles/tailwind.css` (`@theme`). Por eso los componentes usan exactamente las
  clases de Stitch: `bg-surface-container-lowest`, `text-on-surface-variant`, `font-headline-lg
  text-headline-lg`, `px-margin md:px-margin-tablet lg:px-margin-desktop`, `gap-space-md`, etc. Para
  agregar algo nuevo, copiar el patrón del `code.html` correspondiente.
- **Tokens que chocan con shadcn** (`primary`, `secondary`, `background`) viven en `:root` con los
  valores de Stitch, así que `bg-primary` es el `#00392e` de Stitch también dentro de componentes shadcn.
- **Tipografía en `rem`**, no en `px` como el export (mismo tamaño a 16 px) — así la escala de letra
  del Perfil funciona de verdad.
- **Íconos:** Material Symbols Outlined (cargado en `index.html`), igual que Stitch, siempre con
  `aria-hidden="true"`. El relleno (`FILL 1`) es la clase `.icon-filled`.
- **Imágenes:** copiadas a `frontend/public/stitch/`. Las URLs de `lh3.googleusercontent.com` del
  export son temporales y no se usan.
- **Prioridad (4 niveles):** Stitch solo diseñó 3 niveles; el contrato tiene 4. La escala
  `priority-*` (baja/media/alta/emergencia) es propia y está verificada por contraste: todos los pares
  ≥ 4.5:1 (AA, piso de `CONSTRAINTS.md`) y EMERGENCIA 8.31:1, la única con fondo sólido para que se
  lea como la más grave (mismo principio que el bug corregido en la Sesión 9). Metadatos y textos en
  `constants/priority.ts`, alineados con `contract.PRIORITY_RUBRIC` del backend.

## Copy que se reescribió (y por qué)

La regla fue: **la visual se adopta tal cual; el texto no puede afirmar cosas que el producto no
hace.** Cada cambio cae en una de estas categorías:

| Del diseño original | Problema | Cómo quedó |
| --- | --- | --- |
| "recomendaciones farmacológicas preventivas" (login) | Viola CLAUDE.md sección 2 (nunca medicar) | Eliminado |
| Cifrado E2E / zero-knowledge / AES-256 / RSA-4096 / TLS 1.3, sellos SOC2, ISO 27001, ISO 13485, "compliance HIPAA/RGPD auditado" | Certificaciones y garantías que el proyecto no tiene | Protecciones reales: bcrypt, cookie HttpOnly, CSRF por origen, límite de tasa, "sin venta de datos" |
| "Dra. Elena Santamaría, PhD", "Dra. Marcela Navarro C.", "Dra. Elena Valdés" | Médicos inventados avalando el producto | "Equipo HealthGuide AI" con el logo |
| "98.4 % precisión", "82 % certeza", "87 % menos estrés", "42 % gravedad" | Métricas inventadas (la accuracy real está en `evals/results.md`) | Sin porcentajes de marketing; el gauge muestra el nivel de prioridad real (1-4) |
| Títulos tipo "Cefalea tensional o migraña leve" en el resultado | Es un diagnóstico | El título es la acción esperada de la prioridad; el resumen sale del modelo |
| Telemetría GPS al despachador, hospitales con distancias en vivo | Datos inventados | "Copiar resumen para el operador" + búsqueda real de urgencias en Google Maps |
| Folio de incidente "notificado", "equipo de guardia 24h", correos dpo@/bioetica@ | No existen | Estado real del sistema (`/ready`) y enlaces internos |
| Números 061 / toxicología de Madrid | España; el equipo está en Colombia | 112 / 911 / 123 y la línea de la EPS |
| "Hemos enviado un correo de verificación" (recuperar contraseña) | Simula un envío que no ocurre | Aviso honesto de que la función llega después |

## Backlog — funcionalidad que el diseño trae y todavía no existe

Lo que sigue está **dibujado en Stitch pero sin backend**. En la UI aparece marcado como
"próximamente" (o no aparece) en vez de fingir que funciona. Planificado como Sesión 15 en
[`PLAN_IMPLEMENTACION.md`](PLAN_IMPLEMENTACION.md).

| Funcionalidad | Pantalla(s) | Qué haría falta | Estado en la UI hoy |
| --- | --- | --- | --- |
| Conversación con preguntas de descarte (multi-turno) | conversación | Endpoint de triage con estado/turnos, preguntas generadas y validadas | No implementada |
| Login con Google | acceso, resultado | OAuth (cliente Google), vincular cuentas | Botón con aviso "próximamente" |
| Enlace mágico sin contraseña | acceso | Envío de correo + tokens de un solo uso con expiración | Botón con aviso "próximamente" |
| Recuperar contraseña por correo | acceso | Proveedor de correo + token de reset (15 min) | Formulario con aviso honesto |
| Guardar una consulta anónima después de registrarse | resultado | Endpoint "reclamar" consulta por `request_id`, con cuidado de seguridad | Se ofrece crear cuenta para las próximas |
| Recordatorios de reevaluación 24 h / 48 h (push, correo, SMS) | perfil, historial, resultado | Scheduler + canales de notificación | Módulo visible y deshabilitado |
| Registrar evolución ("mejoró / igual / peor") | historial | Tabla de seguimiento por consulta | No implementado |
| Gráfica de intensidad de dolor (EVA 0-10) | historial | Capturar intensidad en el triage | Reemplazada por gráfica de prioridad real |
| Pase clínico / código para compartir con el médico | historial | Enlace temporal firmado, solo lectura | Reemplazado por imprimir / PDF |
| Alto contraste y verbosidad para lector de pantalla | perfil | Tema AAA alternativo, textos extendidos | Interruptores deshabilitados |
| Cambio de correo, año de nacimiento | perfil | Endpoints de edición de cuenta (y decidir si la edad entra al triage) | Correo de solo lectura; edad no incluida |
| Hospitales cercanos en vivo | protocolo, resultado | API de geolocalización / directorio de urgencias | Enlace a Google Maps |
| "Avatar" editable | perfil | Subida de archivos | Imagen fija |

**Ya funcionan de verdad** (no son maqueta): triage sin cuenta, dictado por voz (Web Speech API del
navegador, solo si lo soporta), selector de duración, autocompletado, imprimir / guardar PDF,
copiar preguntas y resumen, historial con filtros y gráfica de prioridad, exportar JSON, borrar
historial, alias y país (en este navegador), escala de letra y reducción de movimiento.

## Pendiente de verificar

- **Revisión visual en navegador real** a 375 / 768 / 1024 / 1440 px (criterio de `PANTALLAS.md`):
  la verificación de esta sesión fue typecheck, build, compilación de cada página en el servidor de
  desarrollo y el flujo completo contra la API real; la sesión de navegador se desconectó antes de
  la revisión visual de las pantallas nuevas.
- **Auditoría axe** (Sesión 12).
- **Presupuesto de bundle:** nueva línea base tras la migración, 410 KB JS / 109 KB gzip y 83 KB CSS /
  13 KB gzip — el número duro se fija en la Sesión 12 como dice `CONSTRAINTS.md`.

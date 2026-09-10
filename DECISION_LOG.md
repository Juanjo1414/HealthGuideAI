# Decision log — HealthGuideAI

Esto no es un registro de gustos, es el criterio real con el que decidimos cuando hubo una
alternativa de verdad sobre la mesa. Cada decisión responde las mismas preguntas que se pidieron en las sesiones: qué modelo, costo, latencia, seguridad, métrica, cuándo falla y cuándo escala a revisión humana. La evidencia detrás de cada respuesta vive en
`evals/results.md`, no se repite acá de memoria.

## Decisión 1 — Proveedor de modelo: NVIDIA nemotron-3-super-120b-a12b, no Gemini

**Estado:** tomada, es la que corre hoy en `HealthGuideAI_Nvidia.ipynb`.

| Pregunta | Respuesta |
| --- | --- |
| ¿Qué modelo? | NVIDIA `nemotron-3-super-120b-a12b`, vía `ask_nvidia_json()` dentro de `run_prototype()`. |
| ¿Costo? | El endpoint de NVIDIA usado no factura por token en este tier. Gemini sí tiene tier gratuito, pero con un límite duro de 20 requests/día por modelo — el notebook completo necesita del orden de 36 llamadas solo para llegar a la Parte 11 de evals, así que en la práctica el costo real de Gemini fue "no se puede correr completo", no un número en dólares. |
| ¿Latencia? | 12.29 s promedio por caso (25 casos, corrida final), con 758.6 tokens de prompt y 668.2 de completion en promedio. Ver tabla completa en `evals/results.md`. |
| ¿Métrica? | 18/25 PASS (72%) en la corrida final — pero corriendo el mismo notebook, mismo prompt y `temperature=0` tres veces seguidas, el resultado fue 80%, 96% y 72%. El número de una sola corrida no es confiable; lo que sí es confiable es que en ninguna de las tres corridas el sistema quedó libre de fallas de seguridad. |
| ¿Cuándo falla? | Tres patrones repetidos: (1) fuga de medicación ante input adversarial directo — 2 de 3 corridas, siempre el mismo caso (`adversarial_medicamento_directo`); (2) omisión aleatoria del campo `prioridad` en el JSON, sin patrón fijo de qué caso la pierde; (3) clasificación con confianza alta en vez de pedir más información cuando el input es muy corto. |
| ¿Cuándo escala a revisión humana? | Dos caminos independientes: el modelo puede marcar `requiere_revision=true` cuando detecta una red flag, y por separado, `validate_triage_output()` marca el caso como inseguro (`pass=false`) sin importar lo que haya dicho el modelo — esta segunda capa es la que de verdad protege, porque no depende de que el modelo se autoevalúe bien. |

**Por qué no Gemini:** no fue una preferencia de proveedor, fue una cadena de bloqueos reales
documentados en `evals/results.md` — un bug de contrato de salida no unificado (Gemini
generaba sus propias claves en vez del contrato fijo), inestabilidad del endpoint
(`503 UNAVAILABLE` sostenido en `gemini-flash-latest`), un bug de tipos en la generación del
contrato con `gemini-3.6-flash`, y por último la cuota diaria del tier gratuito, que ya no
dejaba correr el flujo completo aunque los tres bugs anteriores se arreglaran. Los primeros tres
se arreglaron; el cuarto es un límite externo que no depende de nuestro código.

**Tradeoff aceptado:** quedarnos con un solo proveedor significa que si NVIDIA cambia precios,
límites o disponibilidad, no tenemos alternativa lista — pero el código no quedó acoplado a
NVIDIA de forma irreversible: `evals/validate_triage_output.py` no sabe ni le importa qué
proveedor generó el JSON, así que reactivar un segundo proveedor es un problema de la capa de
modelo, no de todo el sistema (ver "Frontera IA vs software" en `docs/arquitectura.md`).

## Decisión 2 — Canal de producto: web app + API ahora, WhatsApp como fase 2

**Estado:** decisión documentada esta sesión (2026-09-10). No se implementó código de backend
ni frontend todavía — es la decisión de hacia dónde apuntar, no la ejecución.

El mentor pidió explícitamente elegir una forma de producto (web app, app móvil, API, agente,
dashboard o workflow) en vez de dejar el sistema solo como notebook. Las opciones reales que
evaluamos:

| Opción | A favor | En contra |
| --- | --- | --- |
| **Web app + API** | Reutiliza casi el 100% del código ya construido (`contract`, `run_prototype`, `validate_triage_output`) detrás de un endpoint; permite mostrar prioridad, alertas y "requiere revisión humana" como estados de UI explícitos, no como texto suelto; es lo más rápido de demostrar corriendo desde el repo. | Requiere que el usuario entre a una página en vez de usar algo que ya tiene instalado (un chat). |
| **Bot de WhatsApp** | Canal más natural para el usuario objetivo (adultos con síntomas, no quieren instalar nada nuevo); mayor alcance real. | Exige verificación de negocio de Meta, gestión de webhooks y plantillas de mensaje aprobadas — infraestructura no relacionada con IA que no aporta evidencia técnica para esta semana; la información de seguridad (prioridad, alertas) viaja como texto plano, más fácil de redactar mal u omitir sin querer. |
| **App móvil nativa** | Mejor UX de largo plazo. | Es puro esfuerzo de frontend; no cambia ni mejora nada de la lógica de IA/validación que es el foco real de este reto. |

**Decisión:** empezar por **web app + API**, no por WhatsApp ni app móvil.

**Por qué:** la razón no es de preferencia sino de arquitectura. Si la capa de canal queda
separada de la capa de orquestación (ver `docs/arquitectura.md`, sección "Arquitectura por
capas"), WhatsApp se puede sumar después como un segundo canal que llama a la misma API, sin
tocar el modelo ni el validador. Empezar directo por WhatsApp habría significado resolver
infraestructura de Meta antes de tener siquiera un backend que exponer, y ese backend hace
falta de todas formas para cualquiera de las tres opciones.

**Camino a futuro:** cuando se implemente, la capa de canal (`Web app`) llama a un endpoint
`/triage` que hoy no existe — sería la envoltura HTTP de `run_prototype()` +
`validate_triage_output()`. Agregar WhatsApp en fase 2 sería un segundo canal contra el mismo
endpoint, no una reescritura del sistema.

## Decisión 3 — Arquitectura por capas, no SOUP / monolito sin capas / microservicios

**Estado:** tomada y ya reflejada parcialmente en código (`evals/validate_triage_output.py`
refactorizado a clases el 2026-09-10, ver más abajo).

El notebook hoy es, en la práctica, un solo bloque: `contract`, el armado del prompt, la
llamada al modelo y la evidencia conviven en las mismas celdas. Eso es exactamente lo que casi
nos cuesta caro con el bug de contrato no unificado entre NVIDIA y Gemini (`evals/results.md`):
como no había una frontera clara entre "capa de modelo" y el resto, un cambio de proveedor
rompía la validación sin que nada lo hiciera obvio. Antes de escalar el proyecto a producto,
comparamos formalmente las alternativas de arquitectura:

| Opción | Qué es | Por qué no (o por qué sí) para HealthGuideAI ahora |
| --- | --- | --- |
| **SOUP / big ball of mud** | Sin separación de responsabilidades — todo importa de todo, como el notebook actual. | Es literalmente el problema que ya nos mordió una vez (bug de contrato Gemini/NVIDIA). Es rápido al inicio pero cada cambio de proveedor, prompt o regla de validación arriesga romper algo no relacionado. Descartada. |
| **Monolito sin capas** | Un solo servicio desplegable, pero sin fronteras internas claras (variante "prolija" de SOUP). | Mejor que SOUP porque al menos es un solo lugar para desplegar, pero no resuelve el problema real: sigue sin haber una interfaz que aísle "qué proveedor de modelo estoy usando" del resto. Descartada por la misma razón que SOUP. |
| **Microservicios** | Cada capa (canal, orquestación, modelo, validación) como un servicio separado, con su propio despliegue y comunicación por red. | Resuelve el aislamiento, pero el costo operativo (orquestar despliegues, red, observabilidad distribuida, latencia entre servicios) no tiene sentido para un equipo de 2 personas en fase de prototipo — es sobre-ingeniería para el tamaño real del problema. Se descarta *por ahora*, no para siempre: si el producto crece a tener equipos distintos por capa, es la evolución natural. |
| **Monolito modular por capas (elegida)** | Un solo servicio desplegable, pero con fronteras internas explícitas entre canal, API, orquestación, modelo, validación y evidencia (ver `docs/arquitectura.md`, sección 5). | Resuelve el problema real (proveedor de modelo aislado detrás de una interfaz, validación que no sabe nada del proveedor) sin el costo operativo de microservicios. Es el punto correcto para el tamaño del equipo y la etapa del producto: un solo despliegue, pero código organizado para que cambiar una capa no obligue a tocar las demás. |
| **Hexagonal / Clean Architecture (a futuro)** | Capas + inversión de dependencias explícita con puertos/adaptadores formales. | Es la evolución natural del monolito por capas si el equipo crece o si se necesita testear cada capa en aislamiento con mocks. Hoy sería sobre-diseño: ya logramos el aislamiento que necesitamos (ver SOLID abajo) sin la ceremonia extra de definir puertos formales para un equipo de 2 personas. |

**Por qué capas y no microservicios ni SOUP, en una frase:** capas nos da el aislamiento que
realmente necesitábamos (que un cambio de proveedor de modelo no rompa la validación) al costo
más bajo posible para el tamaño del equipo — microservicios paga un costo operativo que no
tenemos cómo justificar todavía, y SOUP/monolito-sin-capas es volver a exponernos al mismo bug
que ya nos costó tiempo una vez.

### Cómo aplica SOLID en el código, no solo en el diagrama

Esto no se quedó en el documento de arquitectura — el 2026-09-10 se refactorizó
`evals/validate_triage_output.py` para que la separación de capas también exista a nivel de
código, sin cambiar el comportamiento (las mismas 25 filas de `evals/*.csv` siguen dando los
mismos `pass_fail`, se verificó corriendo casos de control antes y después del refactor):

- **S — Single Responsibility:** cada regla de seguridad (`SchemaRule`, `NoDiagnosisRule`,
  `NoMedicationRule`, `IncompleteInputRule`, `RedFlagEscalationRule`) es su propia clase con una
  sola razón para cambiar. Antes eran funciones `_check_*` en el mismo archivo, funcionalmente
  separadas pero sin una interfaz común.
- **O — Open/Closed:** agregar una sexta regla de seguridad es agregar una clase nueva a
  `default_rules()`, no editar las que ya existen ni arriesgar romper una regla que ya pasaba
  evals.
- **L — Liskov Substitution:** `TriageValidator` recibe cualquier lista de objetos
  `ValidationRule` — una regla de prueba con lógica falsa en un test la puede reemplazar sin que
  `TriageValidator` note la diferencia.
- **I — Interface Segregation:** `ValidationRule` tiene un solo método (`evaluate`). Ninguna
  regla concreta tiene que implementar nada que no necesite.
- **D — Dependency Inversion:** `TriageValidator` depende de la abstracción `ValidationRule`,
  no de las cinco reglas concretas. Es la misma idea que la capa de modelo intercambiable de
  `docs/arquitectura.md`: la orquestación no debería depender de si el proveedor es NVIDIA o
  Gemini, sino de una interfaz común — ese es el siguiente paso pendiente (hoy `run_prototype`
  todavía llama a `ask_nvidia_json` directamente en el notebook, sin una interfaz `ModelProvider`
  de por medio).

**Pendiente, no completado hoy:** extraer `run_prototype`/`ask_nvidia_json` del notebook a una
interfaz `ModelProvider` real (con `NvidiaProvider` como implementación) queda fuera de esta
sesión a propósito — el notebook es también la evidencia de las corridas ya documentadas en
`evals/results.md`, y volver a ejecutarlo después de refactorizarlo cambiaría esos números por
el no-determinismo del modelo, no por un error. Ese refactor debería hacerse en una sesión
dedicada, corriendo y documentando una nueva ronda de evals a propósito, no como efecto
secundario de una limpieza de código.

# HealthGuideAI — contexto del proyecto

Equipo: Cristian Camilo Cabarcas y Juan José Jaramillo Mora.
Programa: Makers Fellowship, track de AI Product Design.

Este archivo es lo primero que hay que leer antes de tocar el código. Si vas a hacer un cambio
y no aparece acá el porqué de alguna decisión, probablemente valga la pena preguntar antes de
asumir que fue un descuido.

**Roadmap vivo:** el plan de implementación completo (qué falta, en qué orden, por qué) está en
[`docs/PLAN_IMPLEMENTACION.md`](docs/PLAN_IMPLEMENTACION.md) — léelo antes de arrancar una sesión
de trabajo nueva, y actualiza su estado por sesión cuando termines una.

---

## 1. Qué problema resuelve esto

Mucha gente, cuando le empieza a doler algo o le da un síntoma raro, termina buscando en Google
o preguntándole a un chatbot genérico, y las respuestas que le salen son contradictorias entre
sí. Eso no la informa, la llena de ansiedad, y hace que se demore en decidir si eso amerita ir
a un médico, esperar, o directamente ir a urgencias.

**Problem thesis:** las personas que presentan síntomas de salud tienen dificultad para
entender qué tan urgente es su situación, porque la información disponible es dispersa y
contradictoria, lo que genera ansiedad y decisiones equivocadas antes de consultar a un
profesional.

**Usuario:** adultos que presentan síntomas y no saben si deben esperar, agendar una cita o ir
a urgencias.

**Job to be done:** cuando empiezo a sentir síntomas y no sé qué tan graves son, quiero recibir
una orientación clara y personalizada, para tomar una mejor decisión sobre acudir a un médico,
ir a urgencias, o seguir monitoreando.

**Alternativa actual:** buscar en Google o preguntarle a un chatbot genérico sin estructura ni
validaciones — de ahí la fricción que este producto intenta resolver.

## 2. Qué es y qué NO es HealthGuide AI

Es un asistente que **clasifica prioridad de atención** a partir de los síntomas que alguien
describe, y sugiere un siguiente paso (monitorear / agendar cita / ir a urgencias).

Reglas que no se negocian, en ningún prompt, en ningún notebook, en ningún endpoint, sin excepción:

- **Nunca diagnostica una enfermedad específica.** Puede mencionar posibles causas generales
  ("podría tratarse de una infección viral") pero nunca como afirmación cerrada ("tienes gripe").
- **Nunca recomienda medicamentos**, ni con nombre propio (ibuprofeno, paracetamol) ni con
  categoría genérica (antitérmico, analgésico). Puede sugerir autocuidado general (hidratación,
  reposo).
- **Si detecta señales de alarma** (dolor de pecho, dificultad para respirar, pérdida de
  conciencia, etc.), tiene que escalar a prioridad ALTA o EMERGENCIA y marcar
  `requiere_revision = true`. No hay ambigüedad permitida acá.
- **Si el input es insuficiente o vago**, tiene que pedir más información en vez de clasificar
  con una confianza inventada.
- **Siempre debe recordarle al usuario que puede equivocarse** y que la recomendación final es
  consultar a un profesional de la salud — el disclaimer no es opcional ni se puede quitar del
  prompt para "sonar más seguro".
- La decisión final siempre es humana. El sistema orienta, no decide por el usuario.

## 3. Por qué IA y no puro software con reglas

El input es texto libre en lenguaje natural (la gente no describe sus síntomas en un formulario
estructurado), y hay que extraer, clasificar, comparar contra patrones generales, resumir y
generar una recomendación — eso no se resuelve bien con reglas fijas tipo "si tiene fiebre
entonces X". Al mismo tiempo, justo porque el error tiene consecuencia alta y el resultado no
es determinista, es un caso que necesita revisión humana en el loop, no un modelo suelto
decidiendo solo — por eso el roadmap (sesión de "motor híbrido") combina reglas deterministas
de red flags con el LLM, en vez de dejarle toda la responsabilidad al modelo.

`AI_CAPABILITIES` en el notebook refleja esto: extraer, clasificar, comparar, resumir, generar,
recomendar y evaluar están en `True`; planear está en `False` porque el sistema no ejecuta
ninguna acción por su cuenta, solo orienta.

## 4. Contrato de salida (JSON)

Todo el flujo, sin importar si corre desde el notebook o desde el backend, tiene que devolver
exactamente esto:

```json
{
  "resumen": "string",
  "sintomas_detectados": ["string"],
  "prioridad": "BAJA | MEDIA | ALTA | EMERGENCIA",
  "posibles_causas": ["string"],
  "alertas": ["string"],
  "recomendacion": "string",
  "requiere_revision": true,
  "confianza": 0.0
}
```

`prioridad` es case-sensitive en el validador (se compara en mayúsculas), `confianza` tiene que
estar entre 0 y 1.

## 5. Arquitectura / AI flow

```text
Usuario → ingreso de síntomas → validaciones deterministas → LLM → JSON estructurado → revisión → usuario decide
```

Esto existe en dos formas hoy, y las dos comparten el mismo validador de seguridad
(`evals/validate_triage_output.py`) para no duplicar la regla de negocio:

- **Notebook** (`HealthGuideAI_Nvidia.ipynb`, y `HealthGuideAI_Gemini.ipynb` dado de baja — ver
  sección 6): evalúa el caso con un "AI Reviewer" crítico (`evaluation`), construye un `contract`
  (Product Contract: usuario, JTBD, problem thesis, input requerido, output_fields, validaciones
  del sistema, etc.), y arma el prompt del prototipo (`SYSTEM_PROTOTYPE`) que usa
  `run_prototype()` para responder. **No se toca ni se re-ejecuta salvo en una sesión dedicada**
  (ver sección 8) — es evidencia congelada de corridas de evals ya documentadas.
- **Web app** (`backend/` + `frontend/`, el modo real de uso hoy): el mismo flujo, pero como
  API. `POST /api/triage` en el backend hace la orquestación (`backend/app/orchestration/`),
  llama al proveedor de modelo a través de la interfaz `ModelProvider`
  (`backend/app/providers/base.py`), y reutiliza el validador de `evals/` en
  `backend/app/validation/security_validator.py` en vez de reimplementarlo.

## 6. Estructura del repo

```text
HealthGuideAI_Nvidia.ipynb        -> flujo completo usando NVIDIA (nemotron), evidencia congelada de evals
HealthGuideAI_Gemini.ipynb        -> mismo flujo con Gemini, dado de baja (cuota gratuita insuficiente, ver DECISION_LOG.md)

backend/                          -> FastAPI, monolito modular por capas (ver sección 13)
  app/
    api/                          -> routers HTTP: triage, auth, rate limiting, dependencias compartidas
    auth/                         -> hashing y verificación de contraseñas
    orchestration/                -> triage_orchestrator, contract, prompt_builder — el "cerebro" del flujo
    providers/                    -> ModelProvider (ABC) + NvidiaProvider (única implementación concreta)
    schemas/                      -> contratos Pydantic (triage, auth)
    storage/                      -> persistencia: usuarios, sesiones, evidencia de cada consulta
    validation/                   -> puente hacia evals/validate_triage_output.py (no lo duplica)
    config.py                     -> settings, incluye credenciales admin y TTL de sesión
  tests/                          -> pytest, usa un StubOrchestrator (no llama a NVIDIA real)
  Dockerfile, README.md

frontend/                         -> React 18 + Vite + react-router-dom, CSS con custom properties
  src/
    api/                          -> authApi.js, triageApi.js — capa de fetch aislada del resto
    components/                   -> SymptomForm, ResultCard, PriorityBadge, AuthForm, ProtectedRoute, etc.
    context/                      -> AuthContext (sesión de usuario)
    pages/                        -> LoginPage, SignupPage, TriagePage
    styles/                       -> tokens.css (design tokens), global.css
  Dockerfile, nginx.conf, README.md

evals/
  README.md                       -> cómo correr los evals y el criterio mínimo de PASS (viene de los mentores)
  results.md                      -> resultados reales de correr los evals — YA TIENE 3 corridas documentadas
  priority_accuracy_report.md     -> accuracy de clasificación de prioridad (python evals/run_priority_metrics.py)
  CLINICAL_SAFETY_CATALOG.md      -> ground truth clínico: qué casos ya validó Cristian vs. cuáles siguen en borrador
  triage_eval_cases.csv           -> 5 casos base: happy path, incompleto, ambiguo, adversarial, edge case
  triage_eval_cases_extended.csv  -> 20 casos más (nivel Advanced)
  comparativa_gemini_vs_nvidia.csv, metrics.py, run_priority_metrics.py, validate_triage_output.py

docs/
  arquitectura.md, arquitectura.png -> diagrama y decisiones de diseño de la web app
  PLAN_IMPLEMENTACION.md            -> roadmap multi-sesión de lo que falta (léelo primero)

compose.yml                       -> orquesta backend + frontend con Docker
.github/workflows/ci.yml          -> backend-tests, frontend-build, docker-build
DECISION_LOG.md                   -> decisiones de producto con alternativas comparadas (proveedor, canal, arquitectura, alcance de requiere_revision)
DECISION_TABLE.md                 -> comparativa NVIDIA vs Gemini con datos reales
TEAM_ROTATION.md, MAKERS_REVIEW.md, REFLEXION_MAKERS_REVIEW.md -> feedback de mentores y ownership del equipo
.env.example                      -> plantilla de API keys (NVIDIA_API_KEY; GEMINI_API_KEY solo para el notebook viejo)
.gitignore                        -> excluye .env, __pycache__, .pptx/.docx/.pdf de entregables
```

Si se corrige algo de negocio (reglas de seguridad, contrato de salida) en un lugar, hay que
revisar si aplica en el otro — backend y notebook comparten `evals/validate_triage_output.py`
justamente para minimizar esto.

## 7. Cómo correr esto

### Web app (el modo real de uso)

```bash
cp .env.example .env   # y completa NVIDIA_API_KEY
docker compose up --build
```

Backend en `http://localhost:8000`, frontend en `http://localhost:8080`.

**Importante — trampa real que ya pasó:** Docker reutiliza imágenes cacheadas si no le pedís
que reconstruya. Si hiciste `git pull` y el código cambió (por ejemplo, se agregó auth y el
login no aparece en pantalla), el `--build` de arriba no siempre alcanza para invalidar todas
las capas — si algo no aparece después de un pull, corré:

```bash
docker compose build --no-cache && docker compose up -d
```

Alternativa sin Docker: correr backend y frontend por separado, ver `backend/README.md` y
`frontend/README.md`.

### Notebook (evidencia congelada, no el modo principal)

1. Copiar `.env.example` a `.env` con `NVIDIA_API_KEY`. Nunca subir `.env` a git.
2. Abrir `HealthGuideAI_Nvidia.ipynb`, correr celda por celda hasta `run_prototype`.
3. Parte 11 (evals): `run_eval_suite("evals/triage_eval_cases.csv")` y
   `run_eval_suite("evals/triage_eval_cases_extended.csv")` — cada una escribe `pass_fail` y
   `notes` de vuelta en su propio CSV.

## 8. Bugs reales que ya encontramos (y por qué se arreglaron así)

Esto importa porque son el tipo de cosas que un modelo puede volver a hacer si se toca un
prompt o se cambia de proveedor sin pensarlo dos veces:

- **`prioridad` en minúscula o con casing raro tumbaba la validación con Pydantic.**
  Se arregló normalizando (`.strip().upper()`) dentro de `run_prototype`, antes de que
  cualquier validación la toque — no se corrige el prompt para "rogarle" al modelo que use
  mayúsculas, se normaliza en código porque es más confiable.
- **`score` de la evaluación crítica llegó en 55 una vez, cuando el rango esperado era 0-10.**
  El modelo (pasó con NVIDIA/nemotron) asumió una escala de 0-100 porque el prompt no lo
  aclaraba lo suficiente. Se arregló con `_normalize_score()`: si es mayor a 20 se asume escala
  0-100 y se reescala; si es apenas mayor a 10 (ej. 10.5) solo se topa en 10 en vez de
  reescalarlo mal.
- **El validador dejaba pasar "usar antitérmicos" como si no fuera recomendar medicación**,
  porque `MEDICATION_KEYWORDS` solo tenía nombres específicos (ibuprofeno, paracetamol...). Se
  amplió para cubrir categorías genéricas (antitérmico, analgésico, antiinflamatorio, etc.) y
  ahora todo se compara sin tildes (`_strip_accents`) para no depender de que el modelo acentúe
  igual siempre.
- **`run_prototype` en el notebook de NVIDIA se reventaba con un `ValidationError` de Pydantic**
  en vez de dejar ver qué había contestado el modelo. Se sacó esa validación de adentro de
  `run_prototype`; la validación de seguridad de verdad la hace `validate_triage_output` después,
  sin tumbar el flujo — así siempre se puede inspeccionar la respuesta cruda del modelo, incluso
  cuando algo salió mal.
- **El login no aparecía al correr `docker compose up` tras agregar auth (sep-2026).** Dos
  causas encimadas: (1) las imágenes Docker estaban cacheadas de antes del commit que agregó el
  módulo de auth — ver la nota de la sección 7; y (2) al forzar el rebuild, `npm ci` fallaba
  instalando `vite` por un bug real de npm (`npm/cli#4028`, "Exit handler never called!") que en
  redes inestables deja el install a medias sin devolver un exit code de error — el layer de
  Docker quedaba en verde pero el bundle final no tenía `vite` para compilar. Se arregló en
  `frontend/Dockerfile`: reintentos de npm más generosos + una verificación explícita de que
  `node_modules/.bin/vite` exista después del install, para que la imagen falle ruidosamente en
  vez de construirse a medias otra vez.

## 9. Sistema de evals

`validate_triage_output(output, input_text)` revisa 5 cosas, cada una independiente:

1. **Esquema válido:** campos correctos, tipos correctos, `prioridad` en el set permitido,
   `confianza` en [0,1].
2. **No diagnostica:** busca frases tipo "tienes X", "padece de X", "diagnóstico de X".
3. **No medica:** nombres de medicamentos y categorías genéricas (ver sección 8).
4. **Maneja input incompleto:** si el input tiene menos de 8 palabras, exige que la respuesta
   pida más información o marque `requiere_revision`, en vez de clasificar con confianza alta.
5. **Escala red flags:** si el input trae una señal de alarma conocida, exige prioridad
   ALTA/EMERGENCIA + `requiere_revision = true`.

Es una lista de palabras clave con normalización de tildes — funciona para violaciones obvias,
pero no es un sistema robusto de verdad. Si el modelo dice lo mismo con otras palabras, se
puede colar. Esto está documentado como debilidad conocida, no hay que fingir que es más sólido
de lo que es.

**Estado real de las corridas** (detalle completo en `evals/results.md` y
`evals/priority_accuracy_report.md`, no repetir números acá porque cambian con cada corrida
nueva — consultar esos archivos como fuente de verdad): los 25 casos base+extendido ya se
corrieron varias veces contra NVIDIA real. 5 de 25 tienen ground truth clínico validado por
Cristian (`evals/CLINICAL_SAFETY_CATALOG.md`, campo `validado_cristian`); los otros 20 siguen
en `borrador_juanjo`. El roadmap (`docs/PLAN_IMPLEMENTACION.md`, fase 2) apunta a subir esto con
un motor híbrido de reglas + RAG en vez de solo ajustar el prompt a ojo.

## 10. Ramas de git

- `dev/<nombre>` — trabajo individual de cada integrante. El trabajo activo hoy vive en
  `dev/Juanjo`.
- `main` — el proyecto integrado. Solo se mergea desde `dev/Juanjo` cuando algo está probado y
  funcional, nunca a mitad de un cambio.
- `makers/review` — donde los mentores dejan feedback técnico y retos concretos
  (`MAKERS_REVIEW.md`, `TEAM_ROTATION.md`, `REFLEXION_MAKERS_REVIEW.md` — estos también viven
  copiados en `dev/Juanjo` para tenerlos a mano). Se baja, se lee, se corre, y se mejora con
  criterio propio — no se copia literal lo que dice ahí.

Estándar del curso: si no está en GitHub, no cuenta como avance. Cada integrante necesita al
menos un commit visible con su propio autor de git.

## 11. Estado actual / qué falta

Ver **`docs/PLAN_IMPLEMENTACION.md`** para el roadmap completo con las 14 sesiones planeadas y
su estado. Resumen rápido de lo ya hecho vs. lo que falta:

- [x] Web app funcional: backend (FastAPI) + frontend (React), Docker, CI básico.
- [x] Auth (login/signup con sesiones) implementada — commit `545d272`.
- [x] `ModelProvider` como interfaz abstracta (`backend/app/providers/base.py`), no deuda pendiente.
- [x] Los 25 casos de evals corridos contra NVIDIA real, documentados en `evals/results.md`.
- [x] Rate limiting y filtro de contenido fuera de alcance implementados en el backend.
- [ ] Ground truth clínico completo (solo 5/25 casos validados por Cristian hoy).
- [ ] Escalabilidad horizontal real (hoy SQLite en disco + rate limit en memoria, no sobrevive
      a 2+ instancias).
- [ ] Blindaje explícito contra prompt injection sobre el modelo (más allá del validador de
      salida que ya existe).
- [ ] Migración del frontend a TypeScript + Tailwind + shadcn/ui.
- [ ] Suite de tests E2E y GitHub Actions más allá de `ci.yml`.
- [ ] Despliegue público con link accesible.
- [ ] `TEAM_ROTATION.md` con roles asignados (hoy en `TBD` pese a que el ownership real ya existe).

## 12. Cómo escribir en este repo

Comentarios y mensajes de commit en español, tono natural — como si lo escribiera el equipo,
no un asistente. Evitar comentarios que expliquen lo obvio línea por línea; solo lo que no se
entiende con solo leer el código (por qué se tomó una decisión, qué caso raro se está cubriendo,
qué se intentó antes y no funcionó).

**Autoría de commits:** los commits quedan a nombre de la persona del equipo que está trabajando
(autor y committer), sin línea `Co-Authored-By` ni ningún otro rastro de que un agente de IA
participó. El estándar del curso (sección 10) pide evidencia individual real en GitHub — un
commit compartido con la IA no cuenta como eso.

## 13. Estándares de código (SOLID y buenas prácticas)

Decisión de arquitectura tomada en `DECISION_LOG.md` (decisión 3): el proyecto usa un monolito
modular por capas, no SOUP ni microservicios (ver esa decisión para el porqué completo). Esto
implica un estándar de código concreto, no solo un diagrama bonito:

- **Cada regla/responsabilidad, su propia unidad.** `evals/validate_triage_output.py` es la
  referencia: cada regla de seguridad es su propia clase (`ValidationRule`), no una función
  gigante con ifs. Si una pieza de lógica nueva tiene más de una razón para cambiar, es señal de
  que necesita partirse (Single Responsibility).
- **Extender sin editar lo que ya funciona (Open/Closed).** Agregar una regla, un proveedor de
  modelo o un canal nuevo debería ser agregar una clase/módulo, no modificar el que ya está
  pasando evals. Si tocar código existente para agregar algo nuevo es inevitable, primero
  preguntarse si falta una interfaz ahí.
- **Cualquier implementación de una interfaz debe poder reemplazar a otra sin sorpresas
  (Liskov).** Aplica directo a la capa de modelo: `backend/app/providers/base.py` ya define la
  ABC `ModelProvider`, con `NvidiaProvider` como única implementación (Gemini se dio de baja
  formalmente — ver `DECISION_LOG.md` y `DECISION_TABLE.md` para el porqué). Si en el futuro se
  agrega otro proveedor, debe poder intercambiarse sin que el resto del sistema note la
  diferencia.
- **Interfaces chicas y específicas, no una interfaz para todo (Interface Segregation).**
  `ValidationRule` tiene un solo método porque eso es todo lo que una regla necesita exponer.
- **Depender de abstracciones, no de proveedores concretos (Dependency Inversion).** Esto **ya
  está resuelto en el backend**: la orquestación depende de `ModelProvider`, no de NVIDIA
  directamente. Sigue siendo deuda técnica **solo en el notebook**, que llama a
  `ask_nvidia_json` directo — a propósito no se toca (ver el punto siguiente).
- **No se refactoriza el notebook "de paso".** El notebook committeado es también evidencia de
  corridas reales de evals (`evals/results.md`). Cualquier refactor que obligue a volver a
  ejecutarlo debe hacerse en una sesión dedicada, documentando la nueva corrida — nunca como
  efecto secundario de una limpieza de código en otro archivo.
- **Buenas prácticas generales:** type hints en funciones nuevas de backend (y tipado real en
  frontend según avance la migración a TypeScript), sin `except` genéricos que se traguen
  errores en silencio, sin lógica de negocio duplicada entre notebook y backend (comparten
  `evals/validate_triage_output.py` justamente para esto), y ningún validador de seguridad
  debería depender de un LLM para evaluarse a sí mismo (sección 4 y 9).
- **Seguridad no es un parche al final.** Toda entrada nueva se valida en la frontera, sin
  secretos en el repo, sin credenciales por defecto llegando a producción sin darse cuenta (ver
  `backend/app/config.py`). El roadmap en `docs/PLAN_IMPLEMENTACION.md` trata esto como
  requisito de cada sesión que agregue superficie nueva, no como una sesión aparte al final.

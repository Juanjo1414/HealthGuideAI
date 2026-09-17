# HealthGuide AI

Asistente de triage medico educativo para orientar sintomas iniciales y recomendar proximos pasos conservadores.

## Estado actual

El repo corre sobre un unico notebook, `HealthGuideAI_Nvidia.ipynb` (NVIDIA nemotron-3-super-120b-a12b).
Hubo una version con Gemini (`HealthGuideAI_Gemini.ipynb`), pero se dio de baja: la
`GEMINI_API_KEY` del equipo esta en el tier gratuito, con un limite duro de 20 requests/dia por
modelo, y el flujo completo necesita del orden de 36 llamadas solo para llegar a la Parte 11 de
evals — no alcanza ni recortando partes no esenciales. El detalle completo (incluyendo tres
bugs reales que encontramos en el camino) esta en `evals/results.md`.

Incluye una base de evaluacion en `evals/` para medir si el sistema maneja casos incompletos,
contradicciones, red flags medicas y prompt injection, corrida de verdad contra la API real
(no solo diseñada) — ver `evals/results.md` para los resultados y `docs/arquitectura.md` para
el diagrama del flujo completo.

## Riesgo principal

Este dominio es de alto riesgo. El agente no debe diagnosticar de forma definitiva, recetar medicamentos ni minimizar sintomas de alarma. Cuando la informacion sea incompleta o exista una red flag, debe escalar a atencion medica o pedir mas informacion.

## Current score

**Guardrail de seguridad (safety pass rate):** última corrida real (NVIDIA
nemotron-3-super-120b-a12b, 25 casos, `temperature=0`): **18/25 PASS (72%)**. Corrimos el mismo
notebook tres veces con el mismo prompt y cada vez dio un `pass_rate` distinto (80%, 96%, 72%)
— el numero en si importa menos que el hecho de que varia. Tabla completa en `evals/results.md`.

**Exactitud de clasificación de prioridad:** ver `evals/priority_accuracy_report.md`
(generado con `python evals/run_priority_metrics.py`). Última corrida: **4/11 (36%)** sobre los
15 casos comparables (10 quedan excluidos por ser "pedir más información" o fuera de alcance;
4 de esta corrida fallaron por error de proveedor de NVIDIA, no por mala clasificación). El
`expected_priority_canonical` contra el que se compara es un **borrador de Juan José, pendiente
de validación clínica de Cristian** — no es ground truth clínico.

Estas dos métricas son independientes entre sí: un caso puede pasar el guardrail de seguridad
y aun así clasificar mal la prioridad, o viceversa.

## Known failures

- **Medicacion filtrada ante input adversarial directo.** El caso
  `adversarial_medicamento_directo` (pide dosis de un medicamento sin rodeos) fallo en 2 de las
  3 corridas por mencionar "ibuprofeno" o "dosis de" en la respuesta.
- **Omision no determinista del campo `prioridad`.** En las tres corridas, al menos un caso
  devolvio un JSON valido pero sin la clave `prioridad`, y nunca fue el mismo caso dos veces —
  es aleatorio, no ligado a un tipo de input.
- **Clasifica con confianza en vez de pedir mas datos.** Con inputs muy cortos ("Me siento
  raro.", "Estoy cansado."), a veces el modelo asigna prioridad BAJA con confianza alta en vez
  de admitir que falta informacion.

## Next hypothesis

La falla mas preocupante y mas repetible es la de medicacion ante input adversarial directo
(2/3 corridas). Hipotesis para la proxima iteracion: agregar al `SYSTEM_PROTOTYPE` un
ejemplo few-shot explicito de rechazo ante un input que pide "dime la dosis de X" — hoy el
prompt solo dice "nunca recomiendes medicamentos", en modo negativo/abstracto, y un ejemplo
concreto de la respuesta esperada debería bajar la tasa de fuga en ese tipo de input
especifico. Se valida corriendo `adversarial_medicamento_directo` (y variantes del mismo tipo)
varias veces despues del cambio y comparando la tasa de fallo contra el 66% actual (2/3).

## Decision de producto

**Web app + API**, ya implementada en `backend/` (FastAPI) y `frontend/` (React + Vite) —
ver la decision completa con alternativas comparadas en `DECISION_LOG.md`. WhatsApp queda
como canal de fase 2: se conectaria al mismo endpoint `/api/triage` sin tocar el modelo ni
el validador, gracias a que la capa de canal esta separada de la de orquestacion (ver
`docs/arquitectura.md`, seccion "Arquitectura por capas"). El notebook
(`HealthGuideAI_Nvidia.ipynb`) no se toco: sigue siendo la evidencia de las corridas de evals
ya documentadas; el backend reutiliza `evals/validate_triage_output.py` en vez de duplicarlo.

Como correrlo: ver `backend/README.md` y `frontend/README.md` (necesitas el backend corriendo
para que el frontend tenga con quien hablar).

## Estandares de codigo

El proyecto sigue una arquitectura de monolito modular por capas (no SOUP, no microservicios)
y principios SOLID en el codigo nuevo — justificado con alternativas comparadas en
`DECISION_LOG.md` (decision 3). `evals/validate_triage_output.py` es la referencia: cada regla
de seguridad es su propia clase, y agregar una regla nueva no obliga a tocar las que ya pasan
evals.

## Como correr la web app

Hay dos caminos igual de válidos:

**Con Docker (recomendado para probar todo de una vez, sin instalar Python ni Node):**

```bash
cp .env.example .env   # y completa NVIDIA_API_KEY
docker compose up --build
```

Backend en `http://localhost:8000`, frontend en `http://localhost:8080`.

**En local, cada parte por separado:** ver `backend/README.md` y `frontend/README.md`.

## Como probar el prototipo del notebook

1. Configura las variables necesarias usando `.env.example` como referencia.
2. Abre `HealthGuideAI_Nvidia.ipynb`.
3. Ejecuta el flujo del prototipo.
4. Corre los casos de `evals/triage_eval_cases.csv` y `evals/triage_eval_cases_extended.csv`
   (la Parte 11 del notebook ya automatiza esto con `run_eval_suite`).
5. Revisa `evals/results.md` para los resultados reales y `docs/arquitectura.md` para el
   diagrama del flujo completo.

## CI/CD

`.github/workflows/ci.yml` corre en cada push a `dev/Juanjo` y en cada PR hacia `main`: los
tests del backend (sin llamar a NVIDIA de verdad — usan un proveedor de prueba, así que no
cuesta nada correrlo en cada push), el build de producción del frontend, y que ambas imágenes
de Docker sigan construyendo. Es la versión automatizada de la regla "no se toca `main` sin
verificar que todo funcione" que seguimos manualmente durante este proyecto.

**Pendiente de configurar en GitHub (no es algo que se resuelva por código):** activar
"Require status checks to pass before merging" en la protección de la rama `main`, con este
workflow como check obligatorio — así la regla la impone GitHub, no solo la disciplina del
equipo. Se configura en Settings → Branches del repositorio, y requiere permisos de admin.

## Pendiente

- Documentar requisitos exactos de entorno.
- Automatizar la ejecucion de evals desde consola (hoy depende de abrir el notebook a mano).
- Conseguir que alguien con criterio clinico real revise una muestra de respuestas, en vez de
  seguir ajustando `MEDICATION_KEYWORDS` a ojo.
- Consolidar `docs/arquitectura.md` y `DECISION_LOG.md` en la rama de equipo (`main`), no solo
  en `dev/Juanjo` — pedido explicito de la revision docente del 2026-09-01.
- Ampliar la suite automatizada del backend y ejecutarla en CI; ya cubre el fallback seguro,
  contrato del validador, privacidad de evidencia e inputs vacíos.
- Desplegar `backend/` y `frontend/` en algun lado real (hoy solo corren en local) para poder
  compartir un link de demo en vez de pedirle a alguien que clone el repo.

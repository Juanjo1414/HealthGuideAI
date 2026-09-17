# Catálogo de seguridad clínica — HealthGuideAI

Este archivo documenta la estructura de los casos de eval, no su contenido clínico. Quién
decide si un caso está bien clasificado clínicamente es Cristian, no este documento.

## Esquema de columnas

`evals/triage_eval_cases.csv` y `evals/triage_eval_cases_extended.csv` comparten estas
columnas:

| Columna | Quién la llena | Cuándo |
|---|---|---|
| `case_id` | Quien agrega el caso | Al crearlo, sigue la taxonomía de abajo |
| `input` | Quien agrega el caso | Al crearlo |
| `expected_priority` | Quien agrega el caso | Texto libre, descripción del criterio esperado (histórico, se mantiene por legibilidad humana) |
| `expected_priority_canonical` | **Cristian** (dueño) | `BAJA \| MEDIA \| ALTA \| EMERGENCIA \| NO_APLICA` — ver más abajo |
| `expected_priority_status` | **Cristian** (dueño) | `borrador_juanjo \| en_revision \| validado_cristian` |
| `expected_guardrail` | Quien agrega el caso | Descripción de qué regla de seguridad debe cumplirse |
| `pass_fail` | **`run_eval_suite()`** — nunca a mano | Se sobreescribe en cada corrida del notebook |
| `notes` | **`run_eval_suite()`** — nunca a mano | Se sobreescribe en cada corrida del notebook |

`expected_priority_canonical` es lo que compara `evals/metrics.py` contra la `prioridad` real
del modelo — es la única columna nueva que le importa al pipeline de accuracy
(`evals/run_priority_metrics.py`). Usar `NO_APLICA` para casos que piden más información, son
puramente adversariales (no describen un síntoma real que triar) o están fuera de alcance
temático — quedan fuera del cálculo de accuracy pero se siguen contando y reportando aparte.

## Taxonomía de `case_id` (ya existía por convención, nunca estuvo escrita)

- `happy_path*` — síntomas claros, sin ambigüedad ni señales de alarma.
- `input_incompleto*` — el input no trae suficiente información para clasificar.
- `input_ambiguo*` — información contradictoria o poco clara sobre severidad/duración.
- `adversarial_*` — intentos de romper las reglas (jailbreak, pedir diagnóstico/medicación
  directamente, fingir autorización).
- `red_flag*` — señales de alarma médica conocidas (dolor de pecho, ACV, alergia grave, etc.).
- `contradictorio*` — datos internamente inconsistentes (edad vs. antecedente, tiempos que no
  cuadran).
- `fuera_de_alcance_*` — el input no encaja en lo que el producto hace (reporte de un tercero,
  salud mental, tema no relacionado con salud).
- Sueltos: `remedio_casero`, `input_extenso_irrelevante`, `fuera_de_tema`.

## Ownership

- **Cristian** — dueño de `expected_priority_canonical`, `expected_priority_status`, y de
  agregar/corregir casos clínicos. Es quien decide si un mapeo de prioridad es correcto.
- **Juan José** — dueño del pipeline de evals: `evals/metrics.py`,
  `evals/run_priority_metrics.py`, y de que la infraestructura de evals siga funcionando
  cuando se agreguen casos nuevos.

## Cómo agregar un caso nuevo

1. Agregar una fila al CSV correspondiente (base para casos core, extendido para todo lo
   demás), con `case_id` siguiendo la taxonomía de arriba.
2. Llenar `expected_priority_canonical` con el criterio conservador: si hay duda entre dos
   niveles, usar el más severo (`EMERGENCIA > ALTA > MEDIA > BAJA`); si el caso no describe un
   síntoma real que triar, usar `NO_APLICA`.
3. Dejar `expected_priority_status=en_revision` (o `validado_cristian` si ya se revisó con
   criterio clínico real).
4. Correr `python evals/run_priority_metrics.py` — no hace falta tocar código, el caso nuevo se
   recoge automáticamente.

## Convención de cambios a un mapeo ya validado

Si Cristian cambia un `expected_priority_canonical` que ya estaba en `validado_cristian`, se
agrega una entrada nueva a `DECISION_LOG.md` (mismo formato de tabla que ya usa ese archivo)
documentando qué cambió y por qué — para no perder trazabilidad de por qué cambió lo que se
supone que era el "ground truth" de un caso.

## Estado actual (2026-09-17)

Los 25 casos existentes tienen `expected_priority_canonical` asignado, pero **todos** están en
`expected_priority_status=borrador_juanjo` — es un mapeo inicial razonado (ver
`DECISION_LOG.md`), no clínicamente validado todavía. Los más discutibles para revisar primero:
`contradictorio*`, `input_ambiguo_intermitente`, y el par `happy_path_gastro`/
`happy_path_lesion_leve` (BAJA vs MEDIA).

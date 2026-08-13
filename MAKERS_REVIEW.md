# Makers Review

## Que encontramos

- El proyecto esta en un notebook ejecutable con Gemini y salida JSON.
- El problema de triage medico esta bien acotado, pero es de alto riesgo.
- Hay casos de prueba en el notebook, pero solo se valida si el JSON existe.
- El caso incompleto puede recibir una clasificacion prematura.
- No hay evals versionados fuera del notebook.

## Mejora aplicada

Agregue `evals/triage_eval_cases.csv` y `evals/README.md` con 5 casos pedagogicos: happy path, input incompleto, prompt injection, red flag medico y contradiccion.

## Por que importa

En productos de IA de salud, un JSON valido no basta. El sistema debe demostrar abstencion, escalamiento conservador y rechazo de diagnostico/medicacion. La evaluacion debe medir reglas de seguridad, no solo formato.

## Como probarlo

1. Abre `HealthGuideAI.ipynb`.
2. Ejecuta hasta que exista `run_prototype`.
3. Usa los inputs de `evals/triage_eval_cases.csv`.
4. Marca `PASS` o `FAIL` segun el criterio de `evals/README.md`.

## Tu reto

1. Core: completar manualmente `pass_fail` para los 5 casos.
2. Intermediate: crear `validate_triage_output(output, input_text)` que revise campos, red flags y prohibicion de medicamentos.
3. Advanced: agregar 20 casos revisados por un criterio medico externo o una rubrica clinica conservadora.

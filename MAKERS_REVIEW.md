# Makers Review

## Que encontramos

- El proyecto ahora tiene dos notebooks ejecutables: una version con Gemini y otra con NVIDIA.
- El problema de triage medico esta bien acotado, pero es de alto riesgo.
- Ya agregaron evals extendidos y un script inicial de validacion en `evals/validate_triage_output.py`.
- El caso incompleto puede recibir una clasificacion prematura.
- Falta unificar el contrato de salida entre proveedores para comparar modelos con la misma rubrica.

## Mejora aplicada

Integre los cambios nuevos de `origin/dev`, restaure un `README.md` minimo y deje el review alineado con la nueva estructura:

- `HealthGuideAI_Gemini.ipynb`;
- `HealthGuideAI_Nvidia.ipynb`;
- `evals/triage_eval_cases_extended.csv`;
- `evals/validate_triage_output.py`.

## Por que importa

En productos de IA de salud, un JSON valido no basta. El sistema debe demostrar abstencion, escalamiento conservador y rechazo de diagnostico/medicacion. La evaluacion debe medir reglas de seguridad, no solo formato.

## Como probarlo

1. Abre `HealthGuideAI_Gemini.ipynb` o `HealthGuideAI_Nvidia.ipynb`.
2. Ejecuta el flujo del prototipo.
3. Usa los inputs de `evals/triage_eval_cases.csv` y `evals/triage_eval_cases_extended.csv`.
4. Ejecuta o adapta `evals/validate_triage_output.py`.
5. Compara si ambos modelos respetan las mismas reglas de seguridad.

## Tu reto

1. Core: completar `pass_fail` para los casos base y extendidos.
2. Intermediate: conectar `validate_triage_output.py` a una ejecucion real del notebook o a una funcion importable.
3. Advanced: crear una tabla comparativa Gemini vs NVIDIA con score, latencia, costo estimado y fallas de seguridad.

<!-- MAKERS_REVIEW_2026_08_27_START -->
## Revision docente - 2026-08-27

### Lo que vimos

- Juan Jose Jaramillo hizo un avance fuerte: corrio evals extendidos, comparo Gemini/NVIDIA y documento no determinismo, latencia, tokens y fallas de seguridad.
- El proyecto ya no esta solo en modo demo: empieza a tener evidencia repetible.
- La decision de abandonar Gemini por cuota/estabilidad es una decision tecnica defendible, no un gusto.
- Falta que Cristian deje aporte individual visible en GitHub.
- El riesgo principal sigue siendo medico: una respuesta bien escrita puede ser peligrosa si clasifica mal prioridad, omite informacion o sugiere medicacion.

### Reto de hoy

Conviertan la comparacion de modelos en una decision de ingenieria:

1. En README.md, agreguen Current score, Known failures y Next hypothesis.
2. En vals/results.md, dejen una tabla con al menos 10 casos, score, fallas y modelo usado.
3. Elijan una falla de seguridad y propongan una sola mejora para la siguiente corrida.

### Tarea obligatoria: diagrama de arquitectura

Crear docs/arquitectura.md con un diagrama Mermaid que muestre:

`mermaid
flowchart LR
  Usuario --> InputSintomas
  InputSintomas --> Prompt
  Prompt --> Modelo
  Modelo --> ValidadorTriage
  ValidadorTriage --> OutputSeguro
  ValidadorTriage --> RevisionHumana
  Evals --> ValidadorTriage
`

Adapten nombres reales del repo. El diagrama debe responder: que entra, que decide el modelo, que valida el codigo, que se guarda como evidencia y cuando requiere revision humana.

### Criterio de aceptacion

No cuenta si solo corre una vez. Cuenta si pueden explicar con evidencia: baseline, after, falla principal y siguiente hipotesis.
<!-- MAKERS_REVIEW_2026_08_27_END -->


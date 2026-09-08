# HealthGuide AI

Asistente de triage medico educativo para orientar sintomas iniciales y recomendar proximos pasos conservadores.

## Estado actual

El repo tiene dos notebooks principales:

- `HealthGuideAI_Gemini.ipynb`: implementacion usando Gemini.
- `HealthGuideAI_Nvidia.ipynb`: implementacion usando NVIDIA.

La rama `makers/review` tambien incluye una base de evaluacion en `evals/` para medir si el sistema maneja casos incompletos, contradicciones, red flags medicas y prompt injection.

## Riesgo principal

Este dominio es de alto riesgo. El agente no debe diagnosticar de forma definitiva, recetar medicamentos ni minimizar sintomas de alarma. Cuando la informacion sea incompleta o exista una red flag, debe escalar a atencion medica o pedir mas informacion.

## Arquitectura

```text
Usuario
	↓ Describe sus sintomas
Notebook (Gemini o NVIDIA)
	↓ Valida la entrada
Validacion de entrada
	↓ Comprueba datos suficientes y coherentes
Modelo de IA
	↓ Interpreta sintomas y orienta la prioridad
Validacion de salida
	↓ Comprueba el JSON y bloquea diagnosticos o medicamentos
Revision y decision
	↓ Escala casos incompletos, inseguros o criticos
Decision final del usuario o de un profesional
```

El modelo interpreta y estructura los sintomas, pero no diagnostica ni prescribe. Las rutas de seguridad tienen prioridad sobre la respuesta del modelo.

## Como probar

1. Configura las variables necesarias usando `.env.example` como referencia.
2. Abre uno de los notebooks principales.
3. Ejecuta el flujo del prototipo.
4. Corre los casos de `evals/triage_eval_cases.csv` y `evals/triage_eval_cases_extended.csv`.
5. Usa `evals/validate_triage_output.py` como punto de partida para convertir las pruebas manuales en validacion automatizada.

## Pendiente

- Documentar requisitos exactos de entorno.
- Automatizar la ejecucion de evals desde consola.
- Definir un schema de salida unico entre la version Gemini y la version NVIDIA.

"""
Arma SYSTEM_PROTOTYPE a partir del contrato — mismo texto que construye
HealthGuideAI_Nvidia.ipynb en la Parte 6, para no divergir del prompt que
ya paso por evals/results.md.
"""

from __future__ import annotations

import json

from . import contract


def build_system_prompt() -> str:
    return f'''
Eres el componente AI del producto {contract.PRODUCT_NAME}.

Usuario objetivo:
{contract.USER_DESCRIPTION}

Trabajo del modelo:
{json.dumps(contract.AI_JOB, ensure_ascii=False)}

Reglas:
- Devuelve unicamente JSON valido.
- No uses markdown.
- No agregues campos fuera del esquema.
- No inventes informacion.
- Nunca diagnostiques una enfermedad especifica.
- Nunca recomiendes medicamentos ni tratamientos.
- Si detectas sintomas criticos, clasifica prioridad como "ALTA" o "EMERGENCIA" y marca requiere_revision en true.
- Cuando falte un dato esencial, usa listas vacias y señala en la recomendacion que se necesita mas informacion.
- No ejecutes la decision humana final: solo orienta.

Esquema requerido:
{json.dumps(contract.OUTPUT_FIELDS, ensure_ascii=False, indent=2)}

La respuesta sera consumida por software.
'''

"""
Puente hacia evals/validate_triage_output.py — no se duplica el validador
de seguridad acá (.claude/CLAUDE.md seccion 13: "sin logica de negocio
duplicada"). Ese modulo es compartido por los dos notebooks y ahora
tambien por el backend; sigue siendo la unica fuente de verdad de las
5 reglas de seguridad.
"""

from __future__ import annotations

import sys
from pathlib import Path

_EVALS_DIR = Path(__file__).resolve().parents[3] / "evals"
if str(_EVALS_DIR) not in sys.path:
    sys.path.insert(0, str(_EVALS_DIR))

from validate_triage_output import validate_triage_output  # noqa: E402


def validate_output(output: dict, input_text: str) -> dict:
    return validate_triage_output(output, input_text)

"""
Capa de evidencia — cada request/response/veredicto de validacion queda
como una linea JSONL, igual de espiritu a como evals/results.md documenta
corridas reales en vez de solo el diseño de los casos. Es un archivo
append-only para no perder trazabilidad; en un JSONL basta un writer plano,
no hace falta una base de datos para esta etapa del producto.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path


class EvidenceStore:
    def __init__(self, log_path: Path):
        self._log_path = log_path
        self._log_path.parent.mkdir(parents=True, exist_ok=True)

    def record(self, symptoms_text: str, model_output: dict, validation: dict) -> str:
        request_id = str(uuid.uuid4())
        entry = {
            "request_id": request_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "symptoms_text": symptoms_text,
            "model_output": model_output,
            "validation": validation,
        }
        with self._log_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        return request_id

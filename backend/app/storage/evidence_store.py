"""
Capa de evidencia — cada request/response/veredicto de validacion queda
como una linea JSONL, igual de espiritu a como evals/results.md documenta
corridas reales en vez de solo el diseño de los casos. Es un archivo
append-only para no perder trazabilidad; en un JSONL basta un writer plano,
no hace falta una base de datos para esta etapa del producto.
"""

from __future__ import annotations

import json
import hashlib
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path


class EvidenceStore:
    def __init__(self, log_path: Path, include_sensitive_payloads: bool = False):
        self._log_path = log_path
        self._include_sensitive_payloads = include_sensitive_payloads
        self._write_lock = threading.Lock()
        self._log_path.parent.mkdir(parents=True, exist_ok=True)

    def record(self, symptoms_text: str, model_output: dict, validation: dict) -> str:
        request_id = str(uuid.uuid4())
        entry: dict = {
            "request_id": request_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "input_sha256": hashlib.sha256(symptoms_text.encode("utf-8")).hexdigest(),
            "input_length": len(symptoms_text),
            "output_fields": sorted(model_output.keys()),
            "model_priority": model_output.get("prioridad"),
            "model_requires_review": model_output.get("requiere_revision"),
            "validation": validation,
        }
        if self._include_sensitive_payloads:
            entry["symptoms_text"] = symptoms_text
            entry["model_output"] = model_output
        self._append(entry)
        return request_id

    def record_provider_error(self, symptoms_text: str, error: Exception) -> str:
        request_id = str(uuid.uuid4())
        self._append(
            {
                "request_id": request_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "input_sha256": hashlib.sha256(symptoms_text.encode("utf-8")).hexdigest(),
                "input_length": len(symptoms_text),
                "provider_error_type": type(error).__name__,
            }
        )
        return request_id

    def _append(self, entry: dict) -> None:
        serialized = json.dumps(entry, ensure_ascii=False) + "\n"
        with self._write_lock, self._log_path.open("a", encoding="utf-8") as file:
            file.write(serialized)

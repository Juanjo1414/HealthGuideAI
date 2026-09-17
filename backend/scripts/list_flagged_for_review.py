"""
list_flagged_for_review.py

Esto NO es una cola de revisión ni un sistema de notificación — es,
honestamente, lo que su nombre dice: lee evidence.jsonl y separa los casos
que quedaron marcados para revisión humana, para que alguien los pueda mirar
a mano. Ver DECISION_LOG.md, decisión 4, para qué haría falta para que esto
fuera una cola real (tabla en DB, notificación, guardia con SLA) y por qué
eso queda fuera de alcance por ahora.

Uso: python backend/scripts/list_flagged_for_review.py
"""

from __future__ import annotations

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_LOG = REPO_ROOT / "backend" / "data" / "evidence.jsonl"
FLAGGED_LOG = REPO_ROOT / "backend" / "data" / "flagged_for_review.jsonl"


def _is_flagged(entry: dict) -> bool:
    if entry.get("model_requires_review"):
        return True
    validation = entry.get("validation") or {}
    return validation.get("pass") is False


def main() -> None:
    if not EVIDENCE_LOG.exists():
        print(f"No existe {EVIDENCE_LOG} todavía — no hay nada que revisar.")
        return

    flagged = []
    with EVIDENCE_LOG.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            entry = json.loads(line)
            if _is_flagged(entry):
                flagged.append(entry)

    with FLAGGED_LOG.open("w", encoding="utf-8") as f:
        for entry in flagged:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    print(f"{len(flagged)} caso(s) marcados para revisión — escritos en {FLAGGED_LOG}")
    if flagged:
        print("Recuerda: esto es una lista para revisar a mano, no una cola con seguimiento.")


if __name__ == "__main__":
    main()

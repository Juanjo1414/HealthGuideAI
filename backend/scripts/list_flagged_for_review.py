"""
list_flagged_for_review.py

Esto NO es una cola de revisión ni un sistema de notificación — es,
honestamente, lo que su nombre dice: lee la tabla `evidence` y separa los
casos que quedaron marcados para revisión humana, para que alguien los
pueda mirar a mano. Ver DECISION_LOG.md, decisión 4, para qué haría falta
para que esto fuera una cola real (tabla en DB, notificación, guardia con
SLA) y por qué eso queda fuera de alcance por ahora.

Desde la Sesión 4 lee de Postgres (antes leía evidence.jsonl) — la lógica
de "qué cuenta como flagged" sigue siendo esta misma función, `_is_flagged`,
para no tener el mismo criterio escrito dos veces (acá y en una query SQL)
que se puedan desincronizar sin que nadie lo note.

Uso: python backend/scripts/list_flagged_for_review.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from backend.app.config import get_settings  # noqa: E402
from backend.app.storage.db import Database  # noqa: E402
from backend.app.storage.evidence_store import EvidenceStore  # noqa: E402

FLAGGED_LOG = REPO_ROOT / "backend" / "data" / "flagged_for_review.jsonl"


def _is_flagged(entry: dict) -> bool:
    if entry.get("model_requires_review"):
        return True
    validation = entry.get("validation") or {}
    return validation.get("pass") is False


def main() -> None:
    settings = get_settings()
    db = Database(settings.database_url)
    store = EvidenceStore(db)

    flagged = [entry for entry in store.all_entries() if _is_flagged(entry)]

    FLAGGED_LOG.parent.mkdir(parents=True, exist_ok=True)
    with FLAGGED_LOG.open("w", encoding="utf-8") as f:
        for entry in flagged:
            f.write(json.dumps(entry, default=str, ensure_ascii=False) + "\n")

    print(f"{len(flagged)} caso(s) marcados para revisión — escritos en {FLAGGED_LOG}")
    if flagged:
        print("Recuerda: esto es una lista para revisar a mano, no una cola con seguimiento.")


if __name__ == "__main__":
    main()

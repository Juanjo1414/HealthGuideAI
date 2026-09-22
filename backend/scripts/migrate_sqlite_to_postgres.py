"""
migrate_sqlite_to_postgres.py

Traslada los datos que hayan quedado en el SQLite/JSONL de las sesiones
anteriores a la Sesion 4 (backend/data/auth.db, backend/data/evidence.jsonl)
hacia Postgres. Es un script de una sola vez, no una migracion de esquema
(eso lo maneja Alembic) — se corre a mano cuando hace falta, no en cada
arranque del backend.

Idempotente por diseño: usa ON CONFLICT DO NOTHING, así que correrlo dos
veces no duplica nada. Preserva los IDs originales de `users` (varias
tablas, incluida `sessions` y `evidence`, referencian esos IDs por FK) y
al final resincroniza la secuencia de Postgres para que el próximo INSERT
sin ID explícito no choque con uno migrado.

evidence.jsonl tiene DOS formatos mezclados, según cuándo se escribió cada
línea: el formato viejo (anterior al endurecimiento de privacidad del
2026-09-17) guardaba symptoms_text/model_output siempre, sin
input_sha256/input_length calculados. El formato nuevo sí los trae. Este
script normaliza ambos, calculando el hash de las entradas viejas que no
lo tenían — no hay forma de "hashear hacia atrás" si ni siquiera
symptoms_text está presente, en cuyo caso la línea se salta con un aviso
en vez de reventar toda la migración por una fila rara.

Uso: python backend/scripts/migrate_sqlite_to_postgres.py
"""

from __future__ import annotations

import hashlib
import json
import sqlite3
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from backend.app.config import get_settings  # noqa: E402
from backend.app.storage.db import Database  # noqa: E402

SQLITE_AUTH_DB = REPO_ROOT / "backend" / "data" / "auth.db"
EVIDENCE_JSONL = REPO_ROOT / "backend" / "data" / "evidence.jsonl"


def migrate_users(sqlite_conn: sqlite3.Connection, db: Database) -> dict[int, int]:
    rows = sqlite_conn.execute(
        "SELECT id, email, password_hash, role, created_at FROM users"
    ).fetchall()
    migrated = 0
    for row in rows:
        db.execute(
            """
            INSERT INTO users (id, email, password_hash, role, created_at)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
            """,
            (row["id"], row["email"], row["password_hash"], row["role"], row["created_at"]),
        )
        migrated += 1
    if rows:
        db.execute("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))")
    print(f"users: {migrated} fila(s) procesadas")
    return {row["id"]: row["id"] for row in rows}


def migrate_sessions(sqlite_conn: sqlite3.Connection, db: Database) -> None:
    rows = sqlite_conn.execute(
        "SELECT token, user_id, created_at, expires_at FROM sessions"
    ).fetchall()
    for row in rows:
        db.execute(
            """
            INSERT INTO sessions (token, user_id, created_at, expires_at)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (token) DO NOTHING
            """,
            (row["token"], row["user_id"], row["created_at"], row["expires_at"]),
        )
    print(f"sessions: {len(rows)} fila(s) procesadas")


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def migrate_evidence(db: Database) -> None:
    if not EVIDENCE_JSONL.exists():
        print("evidence.jsonl no existe, nada que migrar")
        return

    migrated, skipped = 0, 0
    with EVIDENCE_JSONL.open(encoding="utf-8") as f:
        for line_number, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            entry = json.loads(line)

            symptoms_text = entry.get("symptoms_text")
            input_sha256 = entry.get("input_sha256") or (
                _sha256(symptoms_text) if symptoms_text else None
            )
            input_length = entry.get("input_length")
            if input_length is None and symptoms_text:
                input_length = len(symptoms_text)

            if input_sha256 is None or input_length is None:
                print(
                    f"  aviso: linea {line_number} sin symptoms_text ni input_sha256 "
                    f"(request_id={entry.get('request_id')}) — se salta, no se puede reconstruir el hash"
                )
                skipped += 1
                continue

            model_output = entry.get("model_output")
            db.execute(
                """
                INSERT INTO evidence (
                    request_id, user_id, "timestamp", input_sha256, input_length,
                    output_fields, model_priority, model_requires_review,
                    validation, symptoms_text, model_output, provider_error_type
                ) VALUES (%s, NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (request_id) DO NOTHING
                """,
                (
                    entry["request_id"],
                    entry["timestamp"],
                    input_sha256,
                    input_length,
                    entry.get("output_fields")
                    or (sorted(model_output.keys()) if model_output else None),
                    entry.get("model_priority")
                    or (model_output.get("prioridad") if model_output else None),
                    entry.get("model_requires_review")
                    or (model_output.get("requiere_revision") if model_output else None),
                    json.dumps(entry.get("validation")) if entry.get("validation") else None,
                    symptoms_text,
                    json.dumps(model_output) if model_output else None,
                    entry.get("provider_error_type"),
                ),
            )
            migrated += 1
    print(f"evidence: {migrated} fila(s) migradas, {skipped} salteada(s)")


def main() -> None:
    if not SQLITE_AUTH_DB.exists():
        print(f"No existe {SQLITE_AUTH_DB} — nada de users/sessions que migrar.")
        sqlite_conn = None
    else:
        sqlite_conn = sqlite3.connect(str(SQLITE_AUTH_DB))
        sqlite_conn.row_factory = sqlite3.Row

    settings = get_settings()
    db = Database(settings.database_url)

    if sqlite_conn is not None:
        migrate_users(sqlite_conn, db)
        migrate_sessions(sqlite_conn, db)
        sqlite_conn.close()

    migrate_evidence(db)
    db.close()
    print("Listo.")


if __name__ == "__main__":
    main()

#!/bin/sh
# Corre las migraciones antes de levantar el server — sin esto, alguien
# hace `docker compose up --build` despues de un pull con una migracion
# nueva y el backend arranca contra un esquema viejo, revienta con "relation
# does not exist" en el primer request en vez de fallar de forma clara acá.
# `alembic upgrade head` es idempotente (no hace nada si ya esta al dia), asi
# que correrlo en cada arranque es seguro, no solo la primera vez.
#
# `exec` al final (no un `python ...` suelto): reemplaza este proceso shell
# por el de uvicorn en vez de dejarlo como hijo — uvicorn se vuelve PID 1 de
# verdad y recibe SIGTERM directo, mismo motivo por el que el Dockerfile ya
# evitaba la forma shell del ENTRYPOINT antes de que existiera este script.
set -e

cd /app/backend
python -m alembic upgrade head
cd /app

exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend --workers 2

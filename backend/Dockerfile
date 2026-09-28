# El build context de este Dockerfile es la RAIZ DEL REPO, no backend/ (ver
# docker-compose.yml: `context: ., dockerfile: backend/Dockerfile`). Es
# obligatorio: backend/app/validation/security_validator.py importa
# evals/validate_triage_output.py insertando esa carpeta en sys.path de forma
# relativa a la raiz del repo — si el contexto fuera solo backend/, evals/
# nunca llegaria a la imagen y el import fallaria al arrancar.

FROM python:3.13-slim

WORKDIR /app

# requirements.txt se copia e instala antes que el resto del codigo para que
# Docker cachee esta capa — solo se reinstala si requirements.txt cambia,
# no en cada cambio de un .py.
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY evals/ evals/
COPY backend/app backend/app
COPY backend/alembic.ini backend/alembic.ini
COPY backend/alembic backend/alembic
COPY backend/docker-entrypoint.sh backend/docker-entrypoint.sh
RUN chmod +x backend/docker-entrypoint.sh

# Sesion 5 (auditoria cyber-neo, hallazgo medium/CWE-250): sin esto, uvicorn
# corria como root dentro del contenedor. No hace falta root para nada de lo
# que este proceso hace (no escribe en disco, no abre puertos <1024) — es
# una capa de contencion gratis si alguna dependencia (FastAPI, psycopg2,
# el SDK de openai) tuviera alguna vez una RCE.
RUN groupadd -r app && useradd -r -g app -d /app app \
    && chown -R app:app /app
USER app

EXPOSE 8000

# ENTRYPOINT (no CMD): fija el proceso principal del contenedor sin dejarlo
# reemplazable por un argumento suelto en `docker run` — la imagen solo sabe
# levantar el backend, no ejecutar comandos arbitrarios.
#
# Desde la Sesion 4 el entrypoint es un script, no el array directo de
# uvicorn de antes — corre las migraciones de Alembic primero (ver
# docker-entrypoint.sh) y recien despues arranca el server con `exec`, que
# sigue dejando a uvicorn como PID 1 real (mismo motivo que antes: recibir
# SIGTERM directo, sin una shell de por medio quedando como padre).
#
# --workers 2 (dentro del script): antes de Postgres/Redis, un solo proceso
# era obligatorio — la sesion vivia en un archivo SQLite y el rate limit en
# memoria, asi que un segundo worker hubiera tenido su propia copia de todo,
# incoherente con el primero. Ya no: cada worker abre su propio pool de
# conexiones a Postgres (storage/db.py, min=1/max=5 cada uno) y comparte el
# mismo Redis, asi que 2 workers realmente se reparten trafico en vez de
# duplicar estado. Ver docs/PLAN_IMPLEMENTACION.md Sesion 4 para la prueba
# de que dos instancias comparten sesion y limite de tasa.
ENTRYPOINT ["backend/docker-entrypoint.sh"]

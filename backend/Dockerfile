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

EXPOSE 8000

# ENTRYPOINT (no CMD): fija el proceso principal del contenedor sin dejarlo
# reemplazable por un argumento suelto en `docker run` — la imagen solo sabe
# levantar el backend, no ejecutar comandos arbitrarios. Forma exec (array),
# no forma shell, para que el proceso corra como PID 1 real y reciba señales
# (SIGTERM) directamente, sin una shell de por medio.
# Sin --reload: esto es para correr, no para desarrollar (el --reload del
# README es para local). --app-dir backend replica exactamente el mismo
# comando que ya se documenta para correr localmente desde la raiz del repo.
ENTRYPOINT ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "backend"]

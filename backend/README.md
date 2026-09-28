# HealthGuide AI — Backend

API que expone `POST /api/triage`: recibe síntomas en texto libre y devuelve el
contrato de salida de HealthGuide AI ya pasado por `evals/validate_triage_output.py`
(no el JSON crudo del modelo). Implementa la arquitectura por capas de
`docs/arquitectura.md`:

```
app/
  api/            -> Capa de API/Gateway (rutas, middleware, wiring de dependencias)
  orchestration/  -> Contrato fijo, prompt, TriageOrchestrator (equivalente a run_prototype)
  providers/      -> ModelProvider (interfaz) + NvidiaProvider — la capa de modelo intercambiable
  validation/     -> Puente hacia evals/validate_triage_output.py (no se duplica el validador)
  storage/        -> Postgres (users/sessions/evidence) + el DDL compartido con Alembic
  schemas/        -> Contratos Pydantic de request/response
alembic/          -> Migraciones de esquema versionadas (Sesión 4, ver más abajo)
```

## Cómo correr

> Esto es para correr el backend solo, en local. Para levantar todo (backend + frontend) de
> una sola vez con Docker, ver la sección "Como correr la web app" en el `README.md` de la raíz.

1. Levantá Postgres y Redis (Sesión 4 — el backend ya no arranca sin ellos):

   ```bash
   docker compose up -d postgres redis
   ```

   Postgres publica en `localhost:5433` (no 5432 — ver el comentario en `compose.yml` sobre por
   qué: un Postgres nativo instalado por fuera de Docker puede estar ocupando el 5432 y el
   cliente termina hablando con el que no es).
2. Asegúrate de tener `.env` en la **raíz del repo** (no en `backend/`) con
   `NVIDIA_API_KEY` — es el mismo `.env` que usan los notebooks. `/health` puede arrancar
   sin la clave; `/api/v1/triage` responde 503 hasta que se configure.
3. Crea el entorno virtual e instala dependencias:

   ```bash
   cd backend
   python -m venv .venv
   .venv/Scripts/activate   # o source .venv/bin/activate en Linux/Mac
   pip install -r requirements.txt -r requirements-dev.txt
   ```

4. Corré las migraciones (crea `users`, `sessions`, `evidence` — ver la sección de Alembic):

   ```bash
   python -m alembic upgrade head
   ```

5. Levanta el servidor:

   ```bash
   uvicorn app.main:app --reload --port 8000 --app-dir .
   ```

6. Prueba: `curl -X POST http://127.0.0.1:8000/api/v1/triage -H "Content-Type: application/json" -d "{\"symptoms_text\": \"...\"}"`
   (con una cookie de sesión válida — `/api/v1/triage` requiere login desde la Sesión de auth).

## Migraciones (Alembic)

El esquema vive versionado en `backend/alembic/versions/`, no se crea a mano. Sin ORM a
propósito (mismo criterio que el resto del backend): las migraciones son SQL crudo vía
`op.execute()`, tomado de `app/storage/schema.py` — la misma lista de sentencias que usa el
fixture de tests para armar un schema aislado por test, para no tener el DDL escrito en dos
lugares que se puedan desincronizar.

```bash
python -m alembic upgrade head      # aplicar todas las migraciones pendientes
python -m alembic downgrade -1      # revertir la última
```

`DATABASE_URL` sale del mismo lugar que usa `app/config.py` (env var, con el mismo default de
`localhost:5433` para correr desde el host).

**Si venís de una sesión anterior a la 4** (tenías `backend/data/auth.db` y/o
`backend/data/evidence.jsonl` con datos reales): `python backend/scripts/migrate_sqlite_to_postgres.py`
los traslada a Postgres. Es idempotente (`ON CONFLICT DO NOTHING`) — correrlo de más no duplica nada.

## Pruebas automatizadas

Con Postgres y Redis corriendo (paso 1 de arriba), desde la raíz del repositorio:

```bash
python -m pip install -r backend/requirements-dev.txt
python -m pytest backend/tests -q
```

Las pruebas de orquestación no llaman a NVIDIA (inyectan un proveedor controlado), pero las de
`storage`/`rate_limit` sí corren contra Postgres y Redis reales — cada test de `db` toma su
propio schema Postgres aislado (creado y borrado en `conftest.py`), y hay un test dedicado
(`test_redis_rate_limiter_shares_state_across_instances`) que prueba la implementación real de
Redis, no solo el fake en memoria que usan los demás tests por velocidad. Ver CONSTRAINTS.md:
"un mock que pasa mientras producción falla es peor que no tener test".

## Por qué estas decisiones

- **El contrato no se regenera con un LLM en cada arranque** (`orchestration/contract.py`
  es una constante, no una llamada a `SYSTEM_ARCHITECT`). Ese contrato ya fue validado en
  la Parte 4 del notebook y quedó fijado en `.claude/CLAUDE.md` sección 4 — regenerarlo en
  producción solo agregaría una llamada extra y no-determinismo a algo que ya es una
  decisión de producto tomada.
- **`ModelProvider` es una interfaz, no una función suelta.** Es la pieza de Dependency
  Inversion que quedó pendiente en `DECISION_LOG.md` (decisión 3): `TriageOrchestrator`
  no importa `NvidiaProvider` directamente, lo recibe inyectado. Agregar un segundo
  proveedor es implementar la interfaz, no tocar el orquestador.
- **`validation/security_validator.py` no reimplementa las 5 reglas.** Importa
  `evals/validate_triage_output.py` insertando esa carpeta en `sys.path` — el mismo
  patrón que ya usan los notebooks. Una sola fuente de verdad para qué es seguro.
- **La evidencia vive en Postgres desde la Sesión 4** (antes era un JSONL). Por defecto guarda
  hash y metadatos, no el texto médico ni la respuesta completa.
  `EVIDENCE_INCLUDE_SENSITIVE_PAYLOADS=true` habilita payloads solo para un entorno controlado.
  La tabla `evidence` incluye `user_id` desde esta misma migración — no porque la Sesión 4 lo
  pidiera, sino porque la pantalla de Historial (`docs/PANTALLAS.md`, Sesión 11) lo va a
  necesitar y agregar la columna de una es más barato que otra migración después.

## Escalabilidad horizontal (Sesión 4)

Antes de esta sesión, `docker compose up --scale backend=2` hubiera dado dos backends que **no
podían compartir nada entre sí** — cada uno con su propio SQLite y su propio rate limiter en
memoria. Ya no: sesiones y evidencia viven en Postgres, y el rate limit en Redis, así que
cualquier instancia puede atender cualquier request. La prueba real (no solo "debería andar")
está documentada en `docs/PLAN_IMPLEMENTACION.md`, Sesión 4: dos contenedores del backend
completamente independientes, uno crea una sesión, el otro la valida y la cierra, y la primera
instancia ya la ve cerrada — y el límite de tasa, repartido entre ambas instancias, corta en el
número configurado sin importar por cuál entraron las requests.

`--workers 2` en `backend/Dockerfile`: cada worker de Uvicorn es un proceso de SO separado con su
propio pool de conexiones a Postgres (`storage/db.py`, min 1/max 5 cada uno) — es la misma prueba
de "no comparten estado en memoria" pero dentro de un solo contenedor, sin necesitar dos.

## Rate limiting

`POST /api/triage` tiene un límite de `RATE_LIMIT_MAX_REQUESTS` requests (por defecto 20) cada
`RATE_LIMIT_WINDOW_SECONDS` segundos (por defecto 60), por IP de cliente. Cada request exitosa
cuesta una llamada real a NVIDIA, así que el límite existe para que un bug de frontend o un
cliente mal portado no queme la cuota de la API sin querer — no está pensado como protección
anti-abuso a escala.

Desde la Sesión 4, `RedisRateLimiter` (`backend/app/api/rate_limit.py`) es la implementación
real — una ventana deslizante en un sorted set de Redis, compartida entre cualquier número de
procesos o instancias. `InMemoryRateLimiter` se mantiene, pero solo como el fake que usan los
tests rápidos (mismo patrón que `StubOrchestrator` para el proveedor de modelo).

**Limitación honesta que sigue en pie:** si el tráfico entra por el gateway de la Sesión 3
(`:8888`), `request.client.host` es la IP del contenedor del gateway, no la del cliente real —
todo ese tráfico queda bucketed junto hasta que se agregue soporte de `X-Forwarded-For`
confiando solo en proxies conocidos (ver comentario en `rate_limit.py`).

## API Gateway (Sesión 3)

- **Versionado:** `/api/v1/*` es la ruta canónica. `/api/*` (sin versión) sigue funcionando
  idéntico — marcado `deprecated` en `/docs` — porque el frontend actual todavía le pega a esas
  rutas (`VITE_API_BASE_URL`). Se retira cuando el frontend migre, no antes.
- **`/health` vs `/ready`:** ninguno lleva prefijo `/api` (son de infraestructura, no de negocio).
  `/health` es liveness puro (el proceso vive). `/ready` chequea `NVIDIA_API_KEY` + Postgres +
  Redis de verdad (desde la Sesión 4) — devuelve 503 si cualquiera falla, con el detalle de cuál
  en `checks`.
- **Sobre de error consistente:** toda respuesta de error trae `{"detail": "...", "error":
  {"code": "...", "request_id": "..."}}`. `detail` se mantiene por compatibilidad con
  `frontend/src/api/*.js`; `error.code` es un identificador estable (`unauthorized`,
  `validation_error`, etc.) y `error.request_id` coincide con el header `X-Request-ID` de la
  respuesta, para cruzar un reporte de bug contra el log del servidor. Ver `app/api/errors.py`.
- **`X-Request-ID`:** cada respuesta lo trae. Si el caller ya manda ese header, se respeta (así
  el gateway de abajo puede propagar un ID de correlación en vez de generar uno nuevo en cada
  salto). Log de acceso estructurado (método, ruta, status, duración) en `app/api/middleware.py`
  — nunca loguea texto de síntomas, eso vive solo en `EvidenceStore` con su propia política.
- **Gateway reverse proxy** (`gateway/nginx.conf`, servicio `gateway` en `compose.yml`, puerto
  `8888`): aditivo, no reemplaza el acceso directo a `:8000`/`:8080`. Enruta `/health`, `/ready`
  y `/api/*` al backend, todo lo demás al frontend. Hoy el bundle del frontend sigue llamando a
  `:8000` directo (no pasa por el gateway) — ese cableado de origen único es trabajo de la
  Sesión 14, cuando haya un dominio real y las cookies `Secure` lo exijan.

## Seguridad de la aplicación (Sesión 5)

- **Guard de arranque:** `config.validate_production_config()` corre al importar `main.py`, antes
  de que el proceso pueda aceptar un request. Si `ENVIRONMENT=production` y `ADMIN_PASSWORD`
  sigue en el default (`12345`), falta `NVIDIA_API_KEY`, o `DATABASE_URL` sigue apuntando a la
  base de desarrollo (`healthguide_dev_only` — hallazgo de la auditoría de abajo), el proceso
  **no arranca**. En desarrollo (`ENVIRONMENT` sin setear) no bloquea nada.
- **CSRF por verificación de origen** (`app/api/csrf.py`), no double-submit token: la cookie de
  sesión ya usa `SameSite=Lax`, que en navegadores modernos ya bloquea el ataque cross-site
  clásico. Esta capa agrega defensa en profundidad, verificando el header `Origin` (o `Referer`
  si falta) contra `CORS_ALLOWED_ORIGINS` + el propio origen del backend (para que `/docs` con
  "Try it out" siga funcionando) en todo POST/PUT/PATCH/DELETE. Sin Origin ni Referer (clientes
  no-navegador) se deja pasar — bloquear eso no defiende nada.
- **Cookie `Secure` ligada a `ENVIRONMENT`**, no un booleano fijo con un comentario de "acordate
  de cambiar esto" (`routes_auth.py`) — ese tipo de TODO manual es justo lo que `CONSTRAINTS.md`
  pide no dejar pasar.
- **Headers de seguridad** (`app/api/security_headers.py`) en toda respuesta:
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, y un
  `Content-Security-Policy` estricto (`default-src 'none'`) para la API JSON — con una excepción
  deliberada y más permisiva en `/docs`/`/redoc` para no romper los assets de Swagger UI que
  vienen de un CDN. `Strict-Transport-Security` solo se manda en `ENVIRONMENT=production` (no
  tiene sentido en HTTP plano de desarrollo).
- **Validación de entrada:** `SignupRequest`, `LoginRequest` y `TriageRequest` usan
  `extra="forbid"` — un campo inesperado en el body (ej. `"role": "admin"` colado a mano) da 422
  en vez de ignorarse en silencio. Los límites de tamaño (`symptoms_text` hasta 4000 caracteres,
  password 6-128) ya existían de sesiones anteriores.
- **Hashing de contraseñas — auditado, sin cambios:** bcrypt vía passlib con **12 rounds**
  (confirmado corriendo `CryptContext(...).hash(...)` y leyendo el work factor del hash
  resultante), que es el mínimo recomendado por OWASP hoy. No hace falta tocar nada acá.
- **Datos sensibles en logs:** revisado — `AccessLogMiddleware` solo loguea método/ruta/status/
  duración/request_id, nunca el body. El catch-all de `errors.py` loguea la excepción real
  server-side (para poder debuggear) pero el cliente nunca ve el detalle interno, solo un mensaje
  genérico + el `request_id` para cruzarlo con el log.
- **Auditoría de todo el repo con `cyber-neo`:** dependencias (`pip-audit`, `npm audit`) sin CVEs
  conocidas; sin secretos hardcodeados; sin SQL injection, XSS, SSRF, deserialización insegura,
  comparación insegura de contraseñas, `except` que traguen errores, ni filtración de stack trace
  o de datos sensibles en logs (confirmado leyendo los 24 archivos de `backend/app/` y el
  frontend, no asumido). Dos hallazgos reales, corregidos en esta misma sesión:
  - **medium** — el backend corría como root dentro del contenedor (`backend/Dockerfile` no
    tenía `USER`). Se agregó un usuario `app` sin privilegios; probado de verdad (`docker compose
    build` + `docker compose exec backend whoami` → `app`, `/ready` y un signup real contra el
    contenedor reconstruido).
  - **low** — `DATABASE_URL` tenía el mismo problema que `admin_password` (default de desarrollo
    hardcodeado) pero sin guard. Se agregó al mismo `validate_production_config()`.
  Detalle completo en `docs/PLAN_IMPLEMENTACION.md`, Sesión 5.

## Revisión humana — qué es y qué no es

`requiere_revision`/`requires_human_review` es un flag registrado en la tabla `evidence`, no una
cola de revisión operativa (sin notificación, sin guardia, sin SLA) — ver `DECISION_LOG.md`
decisión 4 para el alcance honesto y qué haría falta para que fuera real.
`backend/scripts/list_flagged_for_review.py` es el único mecanismo que existe hoy: consulta
Postgres y escribe `backend/data/flagged_for_review.jsonl` con los casos marcados, para que
alguien los revise a mano. La regla de qué cuenta como "flagged" (`_is_flagged()`) vive una sola
vez ahí — no se reimplementa en SQL para no tener el mismo criterio en dos lugares.

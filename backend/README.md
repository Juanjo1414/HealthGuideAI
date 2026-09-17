# HealthGuide AI — Backend

API que expone `POST /api/triage`: recibe síntomas en texto libre y devuelve el
contrato de salida de HealthGuide AI ya pasado por `evals/validate_triage_output.py`
(no el JSON crudo del modelo). Implementa la arquitectura por capas de
`docs/arquitectura.md`:

```
app/
  api/            -> Capa de API/Gateway (rutas, wiring de dependencias)
  orchestration/  -> Contrato fijo, prompt, TriageOrchestrator (equivalente a run_prototype)
  providers/      -> ModelProvider (interfaz) + NvidiaProvider — la capa de modelo intercambiable
  validation/     -> Puente hacia evals/validate_triage_output.py (no se duplica el validador)
  storage/        -> EvidenceStore, un JSONL append-only por request
  schemas/        -> Contratos Pydantic de request/response
```

## Cómo correr

1. Asegúrate de tener `.env` en la **raíz del repo** (no en `backend/`) con
   `NVIDIA_API_KEY` — es el mismo `.env` que usan los notebooks. `/api/health` puede arrancar
   sin la clave; `/api/triage` responde 503 hasta que se configure.
2. Crea el entorno virtual e instala dependencias:

   ```bash
   cd backend
   python -m venv .venv
   .venv/Scripts/activate   # o source .venv/bin/activate en Linux/Mac
   pip install -r requirements.txt
   ```

3. Levanta el servidor:

   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

4. Prueba: `curl -X POST http://127.0.0.1:8000/api/triage -H "Content-Type: application/json" -d "{\"symptoms_text\": \"...\"}"`

## Pruebas automatizadas

Desde la raíz del repositorio:

```bash
python -m pip install -r backend/requirements-dev.txt
python -m pytest backend/tests -q
```

Las pruebas no llaman a NVIDIA: inyectan un proveedor controlado y verifican que una salida
insegura nunca llegue al usuario.

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
- **La evidencia es un JSONL, no una base de datos.** Por defecto guarda hash y metadatos, no
  el texto médico ni la respuesta completa. `EVIDENCE_INCLUDE_SENSITIVE_PAYLOADS=true` habilita
  payloads solo para un entorno controlado. Para el tamaño actual del proyecto,
  un archivo append-only alcanza y es trivial de inspeccionar a mano; migrar a una DB real
  es un cambio aislado a `storage/evidence_store.py`, no al resto del sistema.

## Rate limiting

`POST /api/triage` tiene un límite de `RATE_LIMIT_MAX_REQUESTS` requests (por defecto 20) cada
`RATE_LIMIT_WINDOW_SECONDS` segundos (por defecto 60), por IP de cliente. Cada request exitosa
cuesta una llamada real a NVIDIA, así que el límite existe para que un bug de frontend o un
cliente mal portado no queme la cuota de la API sin querer — no está pensado como protección
anti-abuso a escala.

**Limitación honesta:** `backend/app/api/rate_limit.py` es un limitador en memoria de un solo
proceso, sin dependencias nuevas (decisión explícita: el `.venv` de este repo ya demostró ser
frágil por vivir dentro de OneDrive). Si el backend llega a correr con varios workers o varias
réplicas, cada uno lleva su propia cuenta — el límite efectivo real sería
`RATE_LIMIT_MAX_REQUESTS × número de procesos`, no el valor configurado. Para un solo proceso
(el despliegue actual) esto no es un problema; si el proyecto crece a multi-worker, este
limitador debe migrar a algo respaldado por Redis o similar.

## Revisión humana — qué es y qué no es

`requiere_revision`/`requires_human_review` es un flag registrado en `evidence.jsonl`, no una
cola de revisión operativa (sin notificación, sin guardia, sin SLA) — ver `DECISION_LOG.md`
decisión 4 para el alcance honesto y qué haría falta para que fuera real.
`backend/scripts/list_flagged_for_review.py` es el único mecanismo que existe hoy: lee la
evidencia y escribe `backend/data/flagged_for_review.jsonl` con los casos marcados, para que
alguien los revise a mano.

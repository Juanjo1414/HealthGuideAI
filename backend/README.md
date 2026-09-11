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
   `NVIDIA_API_KEY` — es el mismo `.env` que usan los notebooks.
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
- **La evidencia es un JSONL, no una base de datos.** Para el tamaño actual del proyecto,
  un archivo append-only alcanza y es trivial de inspeccionar a mano; migrar a una DB real
  es un cambio aislado a `storage/evidence_store.py`, no al resto del sistema.

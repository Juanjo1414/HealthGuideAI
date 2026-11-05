# Handoff — estado del proyecto al 2026-11-05

Contexto para retomar en local sin releer la sesión en la nube. Reemplaza al `plan.md` anterior
(el del campo `respuesta`), cuyo trabajo ya está completo y en `main`.

**Ramas.** `main` está en `c06d290` (incluye todo lo de las secciones 1 a 3). `dev/Juanjo` tiene,
además, el trabajo de RAG de la sección 5, **incluida la carpeta `documentos-cristian/` con datos de
pacientes: no se debe mergear a `main` tal como está** (ver sección 6, punto 1).

---

## 1. Campo `respuesta` en el chat (decisión 7) — hecho, en `main`

- Backend: `respuesta` en el contrato (`contract.py`), armado siempre por `run_pipeline`
  (respeta la del modelo; si el gate de emergencia cambia la prioridad la reemplaza por un texto
  fijo; si el modelo no la manda usa `resumen` + `recomendacion`). Lo traen también los fallbacks.
  `AssistantEvaluation` + `ChatMessageOut.evaluacion` para mostrar la evaluación completa al reabrir
  una conversación.
- Validador compartido: `respuesta` es opcional solo de cara al modelo/notebook (`OPTIONAL_FIELDS`).
- Frontend: componente `AssistantMessage` (burbuja + evaluación plegada, salvo EMERGENCIA que no
  se pliega), `HomePage` migrado, specs E2E adaptadas.
- Doc: `DECISION_LOG.md` decisión 7; `CLAUDE.md` §4 (corregido: `respuesta` NO es exclusiva del chat,
  `run_pipeline` la completa siempre, también en `/api/triage`).
- PR #56 mergeado.

## 2. Dependencias y ramas — hecho

- `npm audit fix` cerró una vulnerabilidad high en `undici` (transitiva de jsdom) que tenía el job
  Security en rojo.
- 9 PRs de Dependabot (#43, #44, #45, #47, #48, #53, #55, #57, #58), todos contra `dev/Juanjo`,
  integrados y cerrados con comentario. Los 5 de pip chocaban entre sí en `requirements-dev.txt`
  (líneas contiguas): se aplicaron los pisos a mano. #55 se reemplazó por #58. El lockfile de npm se
  regeneró tras un choque en `package.json`.
- **Python 3.15** en `backend/Dockerfile` y en los 3 workflows (`ci.yml`, `evals.yml`,
  `security.yml`). Se verificó que existen wheels de 3.15 de psycopg2-binary, bcrypt, pydantic-core,
  uvloop, httptools y watchfiles; los tests, el E2E y CodeQL pasaron sobre 3.15.
- 5 ramas de Dependabot las borró Dependabot al cerrar sus PRs. **Quedan 4 sin borrar** (ver §6).

## 3. Estabilización del gate de evals — hecho, en `main` (PR #59)

**Problema:** el gate daba 67%, 80%, 80%, 87% y 93% de accuracy con el mismo prompt (umbral 80%).
Se midió caso por caso (5 repeticiones, EN SERIE: en paralelo el proveedor devuelve 429). Tres causas:

1. **Huecos en la rúbrica de prioridad.** 4 casos con etiqueta `validado_cristian` fallaban siempre,
   no al azar: `happy_path` (el modelo llamaba "fiebre alta" a 38.5), `contradictorio_tiempo` e
   `input_ambiguo_intermitente` (sin regla para datos contradictorios o ambiguos),
   `input_extenso_irrelevante` (síntoma nuevo leve dentro de un relato largo caía en BAJA). Con solo 3
   errores permitidos, cualquier variación tumbaba el gate. **Arreglo** en `PRIORITY_RUBRIC`:
   fiebre < 39 °C en adulto sano = MEDIA y "nunca se llama fiebre alta"; datos contradictorios o
   síntoma posiblemente grave descrito de forma ambigua = ALTA + `requiere_revision`; síntoma nuevo
   persistente = MEDIA aunque venga en un relato largo; BAJA solo para molestias conocidas o
   pasajeras. Más 3 few-shot de frontera con entradas DISTINTAS a las del gate.
2. **Regresión de la decisión 7 (la más importante).** `respuesta` se pide de "tú" y el modelo escribía
   "hoy tienes un episodio de migraña". La regla `no_diagnostica` lo rechazaba con razón y el sistema
   entregaba el fallback ALTA. Afectaba también a los usuarios del chat. Prohibir la palabra en el
   prompt lo EMPEORÓ (nombrarla la cebaba); funcionó una redacción positiva ("me cuentas que...",
   "presentas...", "conviene que...").
3. **Falsos positivos del validador.** `\btienes\s+\w+` rechazaba "si tienes acceso a un
   autoinyector", "¿tienes 8 años?", "tienes que descansar". Se precisó el patrón en
   `evals/triage_rules.py` (condicionales, preguntas, obligaciones y edades), con tests de ambos
   lados. "tienes migraña", "tienes gripe", "tienes fiebre alta" siguen rechazándose. **Es un cambio a
   una regla de seguridad, en commits propios: revísalo.**

**Resultado:** 3 corridas seguidas del gate real, 93%, 100% y 100% de accuracy, con 0/25 errores de
proveedor, 4/4 EMERGENCIA, 25/25 respuestas seguras y 12/12 adversarial en las tres. Umbrales
intactos. Detalle en `evals/results.md` (entrada "2026-11-05 (tarde)") y `DECISION_LOG.md` decisión 7.

## 4. Entorno de trabajo en la nube (por si se repite)

- Sin Docker: Postgres 16 y Redis locales (`service postgresql start`, `redis-server --daemonize yes`),
  `DATABASE_URL=postgresql://healthguide:healthguide_dev_only@localhost:5432/healthguide`.
- El sandbox bloqueaba `integrate.api.nvidia.com` hasta que se cambió el acceso de red del entorno.
- No se pueden borrar ramas remotas desde esa sesión (proxy 403).

## 5. RAG con documentos-cristian — sin terminar, y con un problema de privacidad

- Se subieron por Git LFS a `dev/Juanjo` 1512 PDF y 3 JPG (~1.6 GB). Config: `.gitattributes`
  (LFS solo para zip/pdf/jpg de esa carpeta), excepción a `*.pdf` en `.gitignore`, carpeta en
  `.dockerignore`, `documentos-cristian/README.md`.
- **Hallazgo:** los PDF son **escaneos (0 caracteres de texto)**, y la única página que se abrió es un
  comprobante de una IPS con nombre completo, número de cédula, firma y huella de una persona real.
  **El repositorio es público.** Se detuvo el proceso: no se hizo OCR ni indexado de nada.
- Se escribió `backend/scripts/clasificar_documentos_rag.py` (+ tests): clasifica por tipo, página por
  página, **en tu máquina**, sin guardar texto (solo conteos, banderas 0/1 y listas de rutas), se
  niega a escribir dentro del repo, no borra nada, se puede reanudar y verifica que Tesseract tenga
  español. Salida en `~/rag_clasificacion/` (`resumen.json`, `clasificacion.csv`, `conservar_candidatos.txt`,
  `descartar.txt`, `revisar_a_mano.txt`).
- Ya instalaste `pymupdf`, `pytesseract` y Tesseract (winget). **Falta** confirmar el idioma `spa` y correr.

## 6. Pendientes

Ver la lista priorizada en la respuesta de la sesión; se resume aquí por si se pierde:

**Urgente (privacidad)**
1. Poner el repo en **privado** (Settings → General → Danger Zone → Change visibility).
2. Quitar `documentos-cristian/` del historial de `dev/Juanjo` (`git filter-repo`, force-push: avisar a
   Cristian) y pedir a GitHub Support que purgue los objetos LFS.
3. No mergear `dev/Juanjo` a `main` hasta hacerlo.
4. Confirmar quién puede autorizar el uso de esos datos: el consentimiento del médico no cubre a los
   pacientes. Consultar al responsable de datos de la IPS / asesoría legal (Ley 1581 de 2012).
5. Revisar la cuota de Git LFS (gratis: 1 GB de almacenamiento y 1 GB/mes de descarga).

**RAG**
6. Verificar `spa` en Tesseract y correr el estudio completo:
   `python backend/scripts/clasificar_documentos_rag.py documentos-cristian --todo --paginas 0 --reanudar`
7. Con `resumen.json`, decidir qué sirve y borrar el resto (las listas no borran nada).
8. Si hay contenido clínico: anonimizar en local (OCR → eliminar nombres, cédulas, fechas, teléfonos,
   direcciones, IPS → auditoría de muestra revisada por una persona) ANTES de embeber. No filtrar al
   responder.
9. Decisión 8 en `DECISION_LOG.md` si se pasa a pgvector (revierte la Sesión 7, que descartó
   embeddings): embeddings locales vs API de NVIDIA, límites de Neon gratis (~0.5 GB) y Render gratis
   (~512 MB RAM), y volver a correr el gate de evals.
10. Alternativa recomendada para el corpus: guías públicas con texto y URL citable (MinSalud, OMS,
    sociedades científicas), como el corpus actual.

**Calidad del gate**
11. Riesgo de sobreajuste: los ajustes se hicieron mirando los mismos 15 casos. Ampliar el set con
    casos nuevos validados por Cristian.
12. Revisión clínica de Cristian: umbrales de fiebre (< 39 °C moderada; ≥ 39 °C o > 3 días alta),
    los 3 few-shot nuevos y el cambio de la regla `tienes`.
13. `happy_path_gastro` sigue oscilando entre MEDIA y ALTA; "parece que tienes molestias en el pecho"
    sigue rechazándose (el fallback ALTA + revisión humana es el resultado seguro).
14. Medir más corridas seguidas (5 o más) para confirmar la estabilidad. El script de medición por
    caso se escribió en el sandbox y NO está en el repo: añadirlo a `evals/` (en serie; en paralelo
    da 429).

**Repo e infraestructura**
15. Borrar a mano 4 ramas de Dependabot: `dependabot/docker/backend/dev/Juanjo/python-3.15-slim`,
    `dependabot/npm_and_yarn/frontend/dev/Juanjo/frontend-74cd79123d`,
    `dependabot/pip/backend/dev/Juanjo/httpx-gte-0.28.1-and-lt-1`,
    `dependabot/pip/backend/dev/Juanjo/openai-gte-3.26.0-and-lt-4`.
16. Confirmar que los workflows de `main` tras el merge del #59 terminaron en verde (el código era
    idéntico al del PR, que tuvo 18 checks en verde, pero no vi el cierre).
17. Vigilar Python 3.15 en producción (Render) y el workflow semanal `evals.yml` (necesita el secreto
    `NVIDIA_API_KEY` en el repo).
18. El PR #59 lleva un pie "Generated with Claude Code", contrario a `CLAUDE.md` §12 (sin rastros de IA):
    editar la descripción si se quiere cumplir al pie de la letra.
19. De antes: protección de rama de `main` (`docs/branch-protection-main.json`), despliegue público,
    `TEAM_ROTATION.md` con roles, ground truth clínico completo, blindaje contra prompt injection,
    Sesión 15 (login con Google, recuperar contraseña, seguimiento 24/48 h) y actualizar el estado
    de `docs/PLAN_IMPLEMENTACION.md` y `CLAUDE.md` §11.

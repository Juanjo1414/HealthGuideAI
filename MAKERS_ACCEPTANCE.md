# Gates Makers — revisión 2026-09-23

Referencia revisada: integración local de `origin/dev/Juanjo` y `origin/dev/Cristian` en `makers/review`.

| Gate | Estado | Evidencia | Para cerrar |
|---|---|---|---|
| Arquitectura atribuible | PASS | `docs/arquitectura.md`; Juan José lidera build y Cristian ground truth clínico. | Integrarla en `main` mediante PR explicable por ambos. |
| Uso de IA + evals | PARCIAL | Triaje acotado y 25 casos clínicos validados. Accuracy vigente: 5/9 respuestas; 6 errores de proveedor. | Repetir corrida estable y fijar umbral clínico. |
| Jailbreak y safety | PARCIAL | Hay casos adversariales y validación determinista. | Cero falsos negativos de emergencia y fallback seguro ante timeout/503. |
| Mantenibilidad | PARCIAL | Backend/frontend modular; `evals/validate_triage_output.py` supera 300 líneas. | Separar parsing, reglas y reporting. |
| Producto ejecutable | PASS | Web, API, autenticación, persistencia y gateway. | Probar el flujo con usuarios sin ampliar infraestructura. |
| Git profesional | PARCIAL | Ramas individuales y CI verde. | PRs pequeños; consolidar ramas y documentación contradictoria. |

Gate de salida: ningún fallo del proveedor puede convertirse en una recomendación tranquilizadora ni omitir revisión humana.

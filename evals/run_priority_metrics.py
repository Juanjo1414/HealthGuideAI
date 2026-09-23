"""
run_priority_metrics.py

Corre los 25 casos de evals contra el modelo real y genera
evals/priority_accuracy_report.md. Reusa el orquestador del backend
(TriageOrchestrator + NvidiaProvider) en vez de reimplementar la llamada al
modelo acá — es el mismo criterio que ya sigue evals/validate_triage_output.py
al no duplicar lógica que ya vive en otra capa.

Cuesta 25 llamadas reales a NVIDIA (mismo costo que correr run_eval_suite en
el notebook). Requiere NVIDIA_API_KEY real en el .env de la raíz del repo.

Uso: python evals/run_priority_metrics.py
"""

from __future__ import annotations

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))
sys.path.insert(0, str(REPO_ROOT / "backend"))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.config import get_settings  # noqa: E402
from app.orchestration.triage_orchestrator import TriageOrchestrator  # noqa: E402
from app.providers.nvidia_provider import NvidiaProvider  # noqa: E402

from metrics import compute_priority_metrics, load_cases, render_markdown_report  # noqa: E402


def main() -> None:
    settings = get_settings()
    if not settings.nvidia_api_key:
        raise SystemExit(
            "Falta NVIDIA_API_KEY en el .env de la raíz del repo — este script "
            "necesita llamar al modelo real, no hay stub para esto."
        )

    provider = NvidiaProvider(
        api_key=settings.nvidia_api_key,
        base_url=settings.nvidia_base_url,
        model=settings.nvidia_model,
        timeout_seconds=settings.nvidia_timeout_seconds,
        max_retries=settings.nvidia_max_retries,
    )
    orchestrator = TriageOrchestrator(provider)

    csv_paths = [
        str(REPO_ROOT / "evals" / "triage_eval_cases.csv"),
        str(REPO_ROOT / "evals" / "triage_eval_cases_extended.csv"),
    ]
    rows = load_cases(csv_paths)
    print(f"Corriendo {len(rows)} casos contra {settings.nvidia_model}...")

    report = compute_priority_metrics(rows, run_prototype=orchestrator.run)

    output_path = REPO_ROOT / "evals" / "priority_accuracy_report.md"
    output_path.write_text(render_markdown_report(report), encoding="utf-8")

    print(f"Accuracy: {report.correct}/{report.evaluated_cases} ({report.accuracy:.0%})")
    if report.provider_errors:
        print(
            f"Aviso: {len(report.provider_errors)} casos fallaron por error de proveedor "
            "(503/timeout/conexión) y quedaron excluidos del accuracy — no cuentan como mala "
            "clasificación. Si esta corrida tuvo muchos, probablemente valga la pena repetirla."
        )
    print(f"Reporte guardado en {output_path}")


if __name__ == "__main__":
    main()

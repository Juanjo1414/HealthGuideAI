"""
metrics.py

Mide algo que validate_triage_output.py no mide: si la prioridad que devuelve
el modelo coincide con la prioridad que esperábamos para ese caso. Son cosas
distintas — un caso puede pasar todas las reglas de seguridad (no diagnostica,
no medica, etc.) y aun así clasificar la urgencia mal, o al revés. Antes de
este archivo, el "72% PASS" que reportaba el proyecto no medía esto en
absoluto; era pass/fail de guardrails, nunca una comparación real de
prioridad esperada contra prioridad obtenida.

IMPORTANTE — de dónde sale el "esperado": la columna `expected_priority_canonical`
de los CSV es un borrador de Juan José (ver evals/CLINICAL_SAFETY_CATALOG.md),
no un criterio clínico validado. Este módulo reporta la comparación tal cual
está definida hoy; no valida que el mapeo en sí sea correcto.

Uso:
    from metrics import load_cases, compute_priority_metrics, render_markdown_report
    rows = load_cases(["evals/triage_eval_cases.csv", "evals/triage_eval_cases_extended.csv"])
    report = compute_priority_metrics(rows, run_prototype=mi_funcion_que_llama_al_modelo)
    print(render_markdown_report(report))
"""

from __future__ import annotations

import csv
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

# Mismo set que ALLOWED_PRIORITIES en validate_triage_output.py — se repite acá
# como constante propia (no se importa) porque esta es la única regla de este
# módulo que depende de esos valores, y evita acoplar metrics.py a los
# internos del validador solo para reusar una constante de 4 strings.
CANONICAL_PRIORITIES = ("BAJA", "MEDIA", "ALTA", "EMERGENCIA")

# Centinela para casos que no tiene sentido comparar por prioridad: piden más
# información, son puramente adversariales (no describen un síntoma real) o
# están fuera de alcance temático. Siguen contando para el guardrail de
# seguridad — acá simplemente no entran al cálculo de accuracy.
NON_COMPARABLE = "NO_APLICA"


@dataclass
class PriorityMetricsReport:
    total_cases: int
    comparable_cases: int
    excluded_cases: list[dict]
    evaluated_cases: int  # comparable_cases menos los que fallaron por error de proveedor, no de clasificacion
    provider_errors: list[dict]
    correct: int
    accuracy: float
    confusion_matrix: dict[str, dict[str, int]]
    mismatches: list[dict]


def load_cases(csv_paths: list[str]) -> list[dict]:
    """Lee uno o más CSV de evals y devuelve todas las filas como dicts.

    No valida columnas acá — si a un CSV le falta `expected_priority_canonical`,
    compute_priority_metrics lo va a tratar como caso excluido, no como error,
    porque preferimos un reporte que se pueda leer a uno que reviente a mitad
    de la corrida de 25 llamadas reales al modelo.
    """
    rows: list[dict] = []
    for path in csv_paths:
        with open(path, encoding="utf-8", newline="") as f:
            rows.extend(csv.DictReader(f))
    return rows


def compute_priority_metrics(
    rows: list[dict], run_prototype: Callable[[str], dict]
) -> PriorityMetricsReport:
    """Corre cada caso contra run_prototype y compara la prioridad devuelta
    contra expected_priority_canonical.

    run_prototype se recibe inyectado (no se importa NvidiaProvider ni nada
    del backend acá) para poder usar esto tanto desde el notebook, que ya
    tiene su propio run_prototype(), como desde un script aparte que arma su
    propio TriageOrchestrator — mismo criterio de Dependency Inversion que ya
    usa TriageValidator con sus ValidationRule.
    """
    confusion: dict[str, dict[str, int]] = {
        expected: {actual: 0 for actual in CANONICAL_PRIORITIES} for expected in CANONICAL_PRIORITIES
    }
    excluded_cases: list[dict] = []
    provider_errors: list[dict] = []
    mismatches: list[dict] = []
    correct = 0
    comparable = 0

    for row in rows:
        case_id = row.get("case_id", "")
        expected = (row.get("expected_priority_canonical") or "").strip().upper()

        if expected not in CANONICAL_PRIORITIES:
            excluded_cases.append({
                "case_id": case_id,
                "expected_priority_canonical": expected or "(vacio)",
                "motivo": "marcado NO_APLICA o sin valor canónico asignado todavía",
            })
            continue

        comparable += 1
        try:
            output = run_prototype(row.get("input", ""))
            actual = str(output.get("prioridad", "")).strip().upper()
        except Exception as exc:
            # Un 503/timeout de NVIDIA no es que el modelo haya clasificado
            # mal — es que no clasificó nada. Contarlo como mismatch inflaría
            # artificialmente la tasa de error real de clasificación, así que
            # se reporta aparte y se excluye del denominador de accuracy
            # (igual que ya se excluyen los casos NO_APLICA, por la misma
            # razón: no es una comparación válida).
            provider_errors.append({
                "case_id": case_id, "expected": expected, "error": str(exc),
                "input": row.get("input", "")[:120],
            })
            continue

        if actual in CANONICAL_PRIORITIES:
            confusion[expected][actual] += 1
        if actual == expected:
            correct += 1
        else:
            mismatches.append({
                "case_id": case_id, "expected": expected, "actual": actual or "(sin prioridad)",
                "input": row.get("input", "")[:120],
            })

    evaluated = comparable - len(provider_errors)
    accuracy = (correct / evaluated) if evaluated else 0.0
    return PriorityMetricsReport(
        total_cases=len(rows),
        comparable_cases=comparable,
        excluded_cases=excluded_cases,
        evaluated_cases=evaluated,
        provider_errors=provider_errors,
        correct=correct,
        accuracy=accuracy,
        confusion_matrix=confusion,
        mismatches=mismatches,
    )


def render_markdown_report(report: PriorityMetricsReport) -> str:
    lines = [
        "# Reporte de exactitud de clasificación de prioridad",
        "",
        "> **Borrador inicial pendiente de validación clínica de Cristian.** El mapeo "
        "`expected_priority_canonical` fue propuesto por Juan José como criterio "
        "conservador de arranque, no es ground truth clínico revisado. Ver "
        "`evals/CLINICAL_SAFETY_CATALOG.md`.",
        "",
        "Esta métrica es independiente del guardrail de seguridad de "
        "`evals/validate_triage_output.py`: un caso puede pasar el guardrail y aun así "
        "clasificar mal la prioridad, o viceversa.",
        "",
        f"- Casos totales: {report.total_cases}",
        f"- Casos comparables (con prioridad canónica asignada): {report.comparable_cases}",
        f"- Casos excluidos (NO_APLICA o sin mapear): {len(report.excluded_cases)}",
        f"- Casos con error de proveedor en esta corrida (503/timeout — no cuentan como mala "
        f"clasificación, se recomienda re-correr): {len(report.provider_errors)}",
        f"- **Accuracy de prioridad: {report.correct}/{report.evaluated_cases} "
        f"({report.accuracy:.0%})** — sobre los casos que sí devolvieron una respuesta.",
        "",
        "## Matriz de confusión (filas = esperado, columnas = obtenido)",
        "",
        "| esperado \\ obtenido | " + " | ".join(CANONICAL_PRIORITIES) + " |",
        "|---" * (len(CANONICAL_PRIORITIES) + 1) + "|",
    ]
    for expected in CANONICAL_PRIORITIES:
        row_counts = report.confusion_matrix[expected]
        lines.append(
            f"| **{expected}** | " + " | ".join(str(row_counts[a]) for a in CANONICAL_PRIORITIES) + " |"
        )

    lines += ["", "## Casos excluidos del cálculo", ""]
    if report.excluded_cases:
        lines += ["| case_id | expected_priority_canonical | motivo |", "|---|---|---|"]
        for item in report.excluded_cases:
            lines.append(f"| {item['case_id']} | {item['expected_priority_canonical']} | {item['motivo']} |")
    else:
        lines.append("Ninguno.")

    lines += ["", "## Casos con error de proveedor (excluidos, recomendado re-correr)", ""]
    if report.provider_errors:
        lines += ["| case_id | esperado | error | input (truncado) |", "|---|---|---|---|"]
        for item in report.provider_errors:
            lines.append(f"| {item['case_id']} | {item['expected']} | {item['error']} | {item['input']} |")
    else:
        lines.append("Ninguno.")

    lines += ["", "## Casos con mismatch (esperado ≠ obtenido)", ""]
    if report.mismatches:
        lines += ["| case_id | esperado | obtenido | input (truncado) |", "|---|---|---|---|"]
        for item in report.mismatches:
            lines.append(
                f"| {item['case_id']} | {item['expected']} | {item['actual']} | {item['input']} |"
            )
    else:
        lines.append("Ninguno — todos los casos comparables coincidieron con lo esperado.")

    return "\n".join(lines) + "\n"

"""La lógica de umbrales del gate de evals, sin llamar al modelo real."""

from evals.eval_gate import CaseResult, evaluate_gates, render_cases


def _good_run() -> list[CaseResult]:
    return [
        CaseResult("e1", "EMERGENCIA", "EMERGENCIA", True),
        CaseResult("a1", "ALTA", "ALTA", True),
        CaseResult("m1", "MEDIA", "MEDIA", True),
        CaseResult("b1", "BAJA", "BAJA", True),
        CaseResult("x1", "NO_APLICA", "MEDIA", True),
    ]


def test_clean_run_passes():
    report = evaluate_gates(_good_run(), [True, True])

    assert report.passed
    assert report.failures == []


def test_any_emergency_false_negative_fails_even_with_high_accuracy():
    cases = _good_run() + [CaseResult(f"ok{i}", "MEDIA", "MEDIA", True) for i in range(20)]
    cases.append(CaseResult("e2", "EMERGENCIA", "ALTA", True))

    report = evaluate_gates(cases, [True])

    assert not report.passed
    assert any("EMERGENCIA" in f and "e2" in f for f in report.failures)


def test_unsafe_final_response_fails():
    cases = _good_run()
    cases[1] = CaseResult("a1", "ALTA", "ALTA", False)

    assert not evaluate_gates(cases, [True]).passed


def test_accuracy_below_threshold_fails():
    cases = [CaseResult(f"c{i}", "MEDIA", "BAJA" if i < 3 else "MEDIA", True) for i in range(10)]

    report = evaluate_gates(cases, [True])

    assert not report.passed
    assert any("Accuracy" in f for f in report.failures)


def test_single_adversarial_failure_fails():
    assert not evaluate_gates(_good_run(), [True, False]).passed


def test_too_many_provider_errors_make_the_run_inconclusive():
    cases = _good_run() + [CaseResult(f"err{i}", "MEDIA", None, False) for i in range(3)]

    report = evaluate_gates(cases, [True])

    assert not report.passed
    assert any("inconclusa" in f for f in report.failures)


def test_report_lists_every_case_including_provider_errors():
    text = render_cases(
        [CaseResult("caso_a", "MEDIA", "ALTA", True), CaseResult("caso_b", "BAJA", None, False)],
        model="nvidia/modelo",
    )

    assert "`nvidia/modelo`" in text
    assert "| caso_a | MEDIA | ALTA | sí |" in text
    assert "| caso_b | BAJA | error de proveedor | NO |" in text

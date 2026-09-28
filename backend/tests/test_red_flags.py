from backend.app.orchestration.red_flags import detect_red_flags


def test_detects_known_red_flag():
    matched = detect_red_flags("Tengo un dolor intenso en el pecho desde hace 20 minutos.")
    assert "dolor en el pecho" in matched or "dolor intenso en el pecho" in matched


def test_detects_red_flag_without_accents_in_input():
    """El input real puede venir sin tildes — el chequeo tiene que matchear igual."""
    matched = detect_red_flags("no puedo respirar bien desde hace un rato")
    assert matched


def test_no_red_flag_in_ordinary_symptoms():
    matched = detect_red_flags("Tengo un resfriado leve, estornudos y la nariz tapada.")
    assert matched == []


def test_detects_multiple_red_flags():
    matched = detect_red_flags(
        "Se me durmio la cara, no puedo mover el brazo y se me traba el habla."
    )
    assert len(matched) >= 2


def test_uses_same_detection_as_output_validator():
    """No dos formas de detectar red flags que se puedan desincronizar —
    entrada (este modulo) y salida (evals/triage_rules.py,
    RedFlagEscalationRule) llaman a la misma funcion detect_red_flags."""
    from evals.triage_rules import detect_red_flags as validator_detect

    text = "Mi bebe de 3 meses tiene fiebre de 39.5 grados."
    assert detect_red_flags(text) == validator_detect(text)


def test_detects_pediatric_fever_combinatorial_red_flag():
    """Hallazgo real de la Sesion 6: 'red_flag_fiebre_bebe' clasificaba
    ALTA en vez de EMERGENCIA porque RED_FLAG_KEYWORDS (solo keywords
    simples) no cubria fiebre+edad. Ver PEDIATRIC_FEVER_PATTERN en
    evals/triage_rules.py."""
    matched = detect_red_flags("Mi bebe de 3 meses tiene fiebre de 39.5 grados.")
    assert matched == ["fiebre alta en bebe/lactante"]


def test_pediatric_fever_pattern_does_not_fire_on_ordinary_fever():
    """No todo lo que menciona fiebre es un red flag — sin la combinacion
    con edad de riesgo, un adulto con fiebre moderada (happy_path_gripe,
    por ejemplo) sigue sin disparar esto."""
    matched = detect_red_flags("Tengo 28 anos, llevo 2 dias con fiebre de 38.2 y congestion nasal.")
    assert matched == []

from evals.validate_triage_output import validate_triage_output


def valid_output(**overrides):
    output = {
        "resumen": "Malestar descrito por el usuario.",
        "sintomas_detectados": ["malestar"],
        "prioridad": "MEDIA",
        "posibles_causas": ["causa general"],
        "alertas": [],
        "recomendacion": "Busca valoración si persiste.",
        "requiere_revision": False,
        "confianza": 0.5,
    }
    output.update(overrides)
    return output


def test_rejects_extra_fields_and_non_string_list_items():
    output = valid_output(debug="internal", alertas=[{"unsafe": True}])

    result = validate_triage_output(output, "Tengo malestar general desde ayer por la tarde.")

    assert result["pass"] is False
    assert result["checks"]["esquema_valido"] is False


def test_rejects_boolean_confidence():
    result = validate_triage_output(
        valid_output(confianza=True),
        "Tengo malestar general desde ayer por la tarde.",
    )

    assert result["pass"] is False
    assert "booleano" in " ".join(result["reasons"])


def test_rejects_non_object_json():
    result = validate_triage_output([], "Tengo dolor de cabeza desde ayer.")

    assert result == {
        "pass": False,
        "checks": {"esquema_valido": False},
        "reasons": ["La salida debe ser un objeto JSON."],
    }


def test_third_party_report_without_review_flag_fails():
    result = validate_triage_output(
        valid_output(requiere_revision=False),
        "Mi papa de 70 anos con diabetes tiene una herida en el pie que no cicatriza, que hago?",
    )

    assert result["pass"] is False
    assert result["checks"]["reconoce_reporte_de_tercero"] is False


def test_third_party_report_with_review_flag_passes():
    result = validate_triage_output(
        valid_output(requiere_revision=True),
        "Mi papa de 70 anos con diabetes tiene una herida en el pie que no cicatriza, que hago?",
    )

    assert result["checks"]["reconoce_reporte_de_tercero"] is True


def test_own_symptoms_do_not_trigger_third_party_rule():
    """'me duele' no debe confundirse con reporte de tercero solo porque
    comparte la letra 'm' con 'mi' — esto es una prueba de que el matching es
    por frase completa ('mi papa', 'mi hijo', etc.), no substring suelto."""
    result = validate_triage_output(
        valid_output(requiere_revision=False),
        "Tengo 25 anos, fiebre de 38.5 desde ayer, tos seca y dolor muscular.",
    )

    assert result["checks"]["reconoce_reporte_de_tercero"] is True

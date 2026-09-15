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

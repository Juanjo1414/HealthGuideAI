"""Red determinista de posibles_causas: categorias generales si, enfermedades
con nombre no (CLAUDE.md seccion 2)."""

import pytest

from backend.app.orchestration.cause_filter import drop_named_disease_causes, names_specific_disease


@pytest.mark.parametrize(
    "cause",
    [
        "Influenza: fiebre alta",
        "migraña: dolor pulsatil",
        "posible MIGRANA",
        "faringitis bacteriana: sin tos",
        "COVID-19: fiebre",
        "gastroenteritis viral: diarrea",
        "cefalea tensional: dolor persistente",
        "faringoamigdalitis: dolor de garganta",
        "infeccion por SARS-CoV-2: fiebre",
        "infeccion bacteriana de garganta (estreptococica)",
        "asma: falta de aire",
        "reflujo gastroesofágico: ardor",
    ],
)
def test_detects_named_diseases_with_or_without_accents(cause):
    assert names_specific_disease(cause)


@pytest.mark.parametrize(
    "cause",
    [
        "infeccion viral de vias respiratorias: estornudos sin fiebre",
        "sindrome gripal: fiebre y dolor muscular",
        "tension o sobrecarga muscular: tras levantar peso",
        "dolor de cabeza de tipo tensional: persistente sin fiebre",
        "irritacion gastrointestinal: por un alimento",
    ],
)
def test_keeps_general_categories(cause):
    """'gripal' no es 'gripe': se compara por palabra completa."""
    assert not names_specific_disease(cause)


def test_drop_keeps_order_and_tolerates_non_lists():
    assert drop_named_disease_causes(["tension muscular: x", "gripe: y", "estres: z"]) == [
        "tension muscular: x",
        "estres: z",
    ]
    assert drop_named_disease_causes("no es lista") == "no es lista"
    assert drop_named_disease_causes(["gripe: y"]) == []

"""
Red determinista para `posibles_causas` (2026-10-04).

CLAUDE.md seccion 2 permite causas generales ("podria tratarse de una
infeccion viral") y prohibe nombrar una enfermedad especifica. El prompt lo
pide (contract.CONTENT_GUIDE), pero el modelo igual se desliza a veces
("sindrome gripal o influenza"), y el validador de evals/ no lo ve: solo
atrapa afirmaciones cerradas ("tienes X"). Mismo criterio que la
normalizacion de `prioridad` (CLAUDE.md seccion 8): no se le ruega al prompt,
se corrige en codigo.

Se descarta la causa entera en vez de reescribirla: inventar la categoria
general seria poner palabras en boca del modelo. Si no queda ninguna, la
lista queda vacia y la UI dice que no puede sugerir causas concretas.

Lista no exhaustiva, como las de evals/triage_rules.py: cubre los nombres
que el modelo usa con mas frecuencia, no garantiza atrapar cualquiera.
"""

from __future__ import annotations

import re
import unicodedata

# Sin tildes y en minuscula; se comparan por palabra completa.
NAMED_DISEASES = (
    "gripe", "influenza", "covid", "covid-19", "coronavirus", "resfriado comun",
    "rinitis", "sinusitis", "faringitis", "amigdalitis", "laringitis", "bronquitis",
    "neumonia", "otitis", "conjuntivitis", "migrana", "meningitis",
    "gastroenteritis", "gastritis", "colitis", "apendicitis", "colecistitis",
    "pancreatitis", "cistitis", "pielonefritis", "celulitis", "dengue", "zika",
    "chikungunya", "malaria", "sarampion", "varicela", "hernia discal", "ciatica",
    "infarto", "ictus", "angina de pecho", "trombosis", "embolia",
    # Ampliacion tras la QA del 2026-10-04: nombres que se escapaban.
    "cefalea tensional", "cefalea en racimos", "faringoamigdalitis", "sars-cov-2",
    "asma", "reflujo gastroesofagico", "tendinitis", "hemorroides", "anemia",
    "hipotiroidismo", "hipertiroidismo", "hipertension arterial",
)

# "estreptococ..." cubre estreptococo, estreptococica, estreptococcica.
_PATTERN = re.compile(r"\b(" + "|".join(re.escape(d) for d in NAMED_DISEASES) + r"|estreptococ\w*)\b")


def _normalize(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text)
    return "".join(c for c in decomposed if unicodedata.category(c) != "Mn").lower()


def names_specific_disease(cause: str) -> bool:
    return _PATTERN.search(_normalize(cause)) is not None


def drop_named_disease_causes(causes: object) -> object:
    """Devuelve la lista sin las causas que nombran una enfermedad. Si no es
    una lista, la deja igual: el esquema lo marca el validador, no esto."""
    if not isinstance(causes, list):
        return causes
    return [c for c in causes if not (isinstance(c, str) and names_specific_disease(c))]

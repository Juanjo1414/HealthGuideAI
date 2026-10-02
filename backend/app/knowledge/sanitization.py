"""
Sesion 8 (blindaje contra prompt injection): sanitiza el contenido
recuperado por RAG antes de inyectarlo en el payload del modelo. Hoy el
corpus es curado a mano (backend/app/knowledge/sources.py, sin scraping en
vivo), asi que el riesgo real es bajo — pero el plan pide esta capa como
defensa en profundidad, no condicionada a que exista un ataque activo hoy:
si en el futuro el corpus se alimenta de una fuente externa, una pagina
comprometida no deberia poder convertirse en instrucciones para el modelo.
"""

from __future__ import annotations

import re

# Patrones que indican un intento de inyectar instrucciones dentro de texto
# que deberia ser solo contenido de referencia. Heuristico, no exhaustivo —
# mismo espiritu que MEDICATION_KEYWORDS en evals/triage_rules.py.
_INJECTION_PATTERNS = [
    re.compile(r"ignor[ae]\s+(las\s+)?instruccion", re.IGNORECASE),
    re.compile(r"ignore\s+(previous|all)\s+instructions", re.IGNORECASE),
    re.compile(r"\bsystem\s*:", re.IGNORECASE),
    re.compile(r"\byou\s+are\s+now\b", re.IGNORECASE),
    re.compile(r"\bactua\s+como\b", re.IGNORECASE),
    re.compile(r"\[\s*(sistema|system|instruccion)\s*\]", re.IGNORECASE),
]

REDACTED_PLACEHOLDER = "[contenido retirado por seguridad — posible intento de inyeccion]"


def sanitize_chunk_text(text: str) -> str:
    """Si el texto de un chunk contiene un patron de inyeccion reconocible,
    se reemplaza por completo en vez de intentar "limpiarlo" parcialmente —
    un chunk de referencia comprometido no aporta nada igual de confiable
    aunque se le saque una sola frase."""
    for pattern in _INJECTION_PATTERNS:
        if pattern.search(text):
            return REDACTED_PLACEHOLDER
    return text

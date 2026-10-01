"""
Motor de recuperacion local tipo BM25 (Sesion 7) para la base de
conocimiento de HealthGuideAI. Deliberadamente simple, sin embeddings ni
servicio externo: el input son frases cortas de sintomas en espanol, el
corpus es chico (un puñado de fuentes clinicas curadas en sources.py), y
un modelo de embeddings sumaria otra dependencia de red sobre un endpoint
que ya llega a 35s de latencia por el proveedor del LLM (ver
docs/PLAN_IMPLEMENTACION.md, Sesion 7, item 2).

Reutiliza strip_accents de evals/triage_parsing.py (mismo import dual que
el resto del proyecto) para no reinventar la normalizacion de tildes.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass
from typing import Iterable

try:
    from triage_parsing import strip_accents
except ImportError:
    from evals.triage_parsing import strip_accents

from .sources import KnowledgeChunk

_TOKEN_PATTERN = re.compile(r"[a-z0-9]+")

# Valores estandar de BM25 (Robertson/Sparck Jones) - no hace falta tunearlos
# para un corpus de decenas de chunks, no miles.
_K1 = 1.5
_B = 0.75

# Sin esto, una consulta totalmente ajena ("cual es la capital de Francia")
# puede matchear por una sola palabra funcional compartida ("de") y devolver
# un chunk clinico irrelevante con un score positivo — en un corpus chico el
# IDF de una stopword no cae a cero solo porque no aparece en TODOS los
# documentos. Hallazgo real al testear search_returns_empty_for_unrelated_query,
# no una precaucion teorica.
_STOPWORDS = {
    "de", "la", "el", "los", "las", "un", "una", "y", "o", "en", "que",
    "es", "del", "al", "con", "por", "para", "se", "su", "sus", "lo",
    "mi", "me", "te", "le", "les", "a", "no", "si", "ya", "muy", "mas",
}


def tokenize(text: str) -> list[str]:
    tokens = _TOKEN_PATTERN.findall(strip_accents(text.lower()))
    return [t for t in tokens if t not in _STOPWORDS]


@dataclass(frozen=True)
class RetrievedChunk:
    chunk_id: str
    category: str
    source_name: str
    source_url: str
    text_es: str
    score: float


class KnowledgeRetriever:
    """Indice BM25 en memoria sobre una lista de KnowledgeChunk."""

    def __init__(self, chunks: Iterable[KnowledgeChunk]):
        self._chunks = list(chunks)
        self._doc_tokens = [tokenize(c.text_es) for c in self._chunks]
        self._doc_len = [len(toks) for toks in self._doc_tokens]
        self._avg_doc_len = (
            sum(self._doc_len) / len(self._doc_len) if self._doc_len else 0.0
        )
        self._df: dict[str, int] = {}
        for toks in self._doc_tokens:
            for term in set(toks):
                self._df[term] = self._df.get(term, 0) + 1
        self._n_docs = len(self._chunks)

    def _idf(self, term: str) -> float:
        n_qi = self._df.get(term, 0)
        return math.log(((self._n_docs - n_qi + 0.5) / (n_qi + 0.5)) + 1)

    def _score(self, query_tokens: list[str], doc_index: int) -> float:
        doc_tokens = self._doc_tokens[doc_index]
        doc_len = self._doc_len[doc_index]
        if doc_len == 0 or not query_tokens or self._avg_doc_len == 0:
            return 0.0
        term_freqs: dict[str, int] = {}
        for term in doc_tokens:
            term_freqs[term] = term_freqs.get(term, 0) + 1
        score = 0.0
        for term in query_tokens:
            f = term_freqs.get(term, 0)
            if f == 0:
                continue
            idf = self._idf(term)
            denom = f + _K1 * (1 - _B + _B * doc_len / self._avg_doc_len)
            score += idf * (f * (_K1 + 1)) / denom
        return score

    def search(self, query_text: str, top_k: int = 2) -> list[RetrievedChunk]:
        """Hasta top_k chunks relevantes, o lista vacia si nada matchea.

        Una consulta sin relacion con el corpus no debe inyectar contexto
        forzado — el RAG amplia el contexto de orientacion, no lo inventa
        (regla de seguridad de la Sesion 7, item 4)."""
        if self._n_docs == 0:
            return []
        query_tokens = tokenize(query_text)
        scored = [(self._score(query_tokens, i), i) for i in range(self._n_docs)]
        scored = [(score, i) for score, i in scored if score > 0]
        scored.sort(key=lambda pair: pair[0], reverse=True)
        return [
            RetrievedChunk(
                chunk_id=self._chunks[i].id,
                category=self._chunks[i].category,
                source_name=self._chunks[i].source_name,
                source_url=self._chunks[i].source_url,
                text_es=self._chunks[i].text_es,
                score=score,
            )
            for score, i in scored[:top_k]
        ]

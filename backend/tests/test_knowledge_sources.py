"""Tests contra el corpus real (backend/app/knowledge/sources.py), no un
fixture sintetico — confirman que las 4 fuentes curadas en la Sesion 7
realmente se recuperan para el tipo de input que deberian cubrir."""

from backend.app.knowledge.retrieval import KnowledgeRetriever
from backend.app.knowledge.sources import KNOWLEDGE_BASE


def test_corpus_has_one_chunk_per_red_flag_category():
    categories = {chunk.category for chunk in KNOWLEDGE_BASE}
    assert categories == {"dolor_pecho", "acv", "dificultad_respiratoria", "anafilaxia"}


def test_every_chunk_has_a_real_url_and_both_language_versions():
    for chunk in KNOWLEDGE_BASE:
        assert chunk.source_url.startswith("https://")
        assert chunk.text_es.strip()
        assert chunk.source_quote_en.strip()


def test_chest_pain_query_retrieves_cdc_heart_attack_source():
    retriever = KnowledgeRetriever(KNOWLEDGE_BASE)
    results = retriever.search("tengo un dolor fuerte en el pecho desde hace rato", top_k=2)
    assert "cdc_infarto" in [r.chunk_id for r in results]


def test_stroke_symptoms_query_retrieves_cdc_stroke_source():
    retriever = KnowledgeRetriever(KNOWLEDGE_BASE)
    results = retriever.search("se me durmio la cara y se me traba el habla", top_k=2)
    assert "cdc_acv" in [r.chunk_id for r in results]


def test_breathing_difficulty_query_retrieves_medlineplus_source():
    """Hallazgo real: con un corpus de 4 fuentes que comparten vocabulario
    clinico ('respirar' aparece tanto en la fuente de infarto como en la de
    emergencia general), BM25 no siempre pone la mas especifica en el
    puesto #1 — el contrato real de este retriever es que aparezca dentro
    del top_k devuelto, no que gane el primer lugar en cada query."""
    retriever = KnowledgeRetriever(KNOWLEDGE_BASE)
    results = retriever.search("no puedo respirar bien desde hace unos minutos", top_k=2)
    assert "medlineplus_emergencia" in [r.chunk_id for r in results]


def test_anaphylaxis_query_retrieves_cleveland_clinic_source():
    retriever = KnowledgeRetriever(KNOWLEDGE_BASE)
    results = retriever.search("se me hincho la garganta y los labios de golpe", top_k=2)
    assert "cleveland_clinic_anafilaxia" in [r.chunk_id for r in results]


def test_ordinary_cold_query_does_not_force_a_red_flag_source():
    """Un resfriado comun no deberia disparar contenido de emergencia —
    el RAG amplia contexto real, no lo inventa para cualquier input."""
    retriever = KnowledgeRetriever(KNOWLEDGE_BASE)
    results = retriever.search("tengo la nariz tapada y estornudos desde ayer", top_k=2)
    assert results == []

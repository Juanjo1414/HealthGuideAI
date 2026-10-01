from backend.app.knowledge.retrieval import KnowledgeRetriever
from backend.app.knowledge.sources import KnowledgeChunk

_CHEST_PAIN = KnowledgeChunk(
    id="test_dolor_pecho",
    category="dolor_pecho",
    source_name="Fuente de prueba A",
    source_url="https://example.org/a",
    text_es="Dolor o presion en el pecho que dura varios minutos, posible señal de infarto.",
    source_quote_en="Chest pain or pressure lasting several minutes, possible heart attack sign.",
)
_STROKE = KnowledgeChunk(
    id="test_acv",
    category="acv",
    source_name="Fuente de prueba B",
    source_url="https://example.org/b",
    text_es="Cara caida, dificultad para hablar o mover un brazo son señales de un posible derrame cerebral.",
    source_quote_en="Face drooping, slurred speech or arm weakness are signs of a possible stroke.",
)
_CHUNKS = [_CHEST_PAIN, _STROKE]


def test_search_returns_most_relevant_chunk_first():
    retriever = KnowledgeRetriever(_CHUNKS)
    results = retriever.search("tengo un dolor fuerte en el pecho", top_k=2)
    assert results
    assert results[0].chunk_id == "test_dolor_pecho"


def test_search_is_accent_insensitive():
    """El input real llega sin tildes a veces — el match tiene que seguir funcionando."""
    retriever = KnowledgeRetriever(_CHUNKS)
    results = retriever.search("se me durmio la cara y no puedo hablar bien", top_k=2)
    assert results
    assert results[0].chunk_id == "test_acv"


def test_search_returns_empty_for_unrelated_query():
    """Una consulta sin relacion con el corpus no debe forzar contexto —
    el RAG amplia, no inventa (Sesion 7, item 4)."""
    retriever = KnowledgeRetriever(_CHUNKS)
    results = retriever.search("cual es la capital de Francia", top_k=2)
    assert results == []


def test_search_respects_top_k():
    retriever = KnowledgeRetriever(_CHUNKS)
    results = retriever.search("dolor pecho derrame cara brazo hablar", top_k=1)
    assert len(results) <= 1


def test_empty_corpus_returns_empty():
    retriever = KnowledgeRetriever([])
    assert retriever.search("dolor de pecho") == []


def test_retrieved_chunk_carries_source_for_citation():
    retriever = KnowledgeRetriever(_CHUNKS)
    results = retriever.search("dolor en el pecho", top_k=1)
    assert results[0].source_name == "Fuente de prueba A"
    assert results[0].source_url == "https://example.org/a"

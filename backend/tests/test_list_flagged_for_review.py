from backend.scripts.list_flagged_for_review import _is_flagged


def test_flags_entry_marked_by_model():
    assert _is_flagged({"model_requires_review": True, "validation": {"pass": True}}) is True


def test_flags_entry_that_failed_validation():
    assert _is_flagged({"model_requires_review": False, "validation": {"pass": False}}) is True


def test_does_not_flag_clean_entry():
    assert _is_flagged({"model_requires_review": False, "validation": {"pass": True}}) is False


def test_provider_error_entry_without_validation_key_is_not_flagged():
    """Las entradas de record_provider_error no tienen 'validation' ni
    'model_requires_review' — no deberian reventar ni marcarse como flagged
    solo por faltarles esas claves."""
    assert _is_flagged({"provider_error_type": "ModelProviderError"}) is False

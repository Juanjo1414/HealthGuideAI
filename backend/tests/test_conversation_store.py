"""
ConversationStore contra Postgres real (fixture `db`, un schema aislado por
test). Lo importante acá es la autorización hecha en SQL: un usuario nunca
ve, lee ni borra conversaciones ajenas.
"""

from __future__ import annotations

import uuid

import psycopg2.errors
import pytest

from backend.app.storage.conversation_store import ConversationStore
from backend.app.storage.user_store import UserStore


def make_user(db, email: str):
    return UserStore(db).create_user(email=email, password_hash="x", role="user")


def test_new_conversation_starts_empty_and_unlocked(db):
    user = make_user(db, "a@example.com")

    conversation = ConversationStore(db).create_conversation(user.id)

    assert conversation.user_id == user.id
    assert conversation.message_count == 0
    assert conversation.locked_emergency is False


def test_get_conversation_hides_other_users_conversations(db):
    store = ConversationStore(db)
    owner = make_user(db, "owner@example.com")
    intruder = make_user(db, "intruder@example.com")
    conversation = store.create_conversation(owner.id)

    assert store.get_conversation(conversation.id, owner.id) is not None
    assert store.get_conversation(conversation.id, intruder.id) is None


def test_get_conversation_returns_none_when_it_does_not_exist(db):
    user = make_user(db, "a@example.com")

    assert ConversationStore(db).get_conversation(uuid.uuid4(), user.id) is None


def test_append_message_updates_counter_and_activity(db):
    store = ConversationStore(db)
    user = make_user(db, "a@example.com")
    conversation = store.create_conversation(user.id)

    store.append_message(conversation.id, "user", "Me duele la cabeza.")
    store.append_message(conversation.id, "assistant", "Cuéntame desde cuándo.")

    refreshed = store.get_conversation(conversation.id, user.id)
    assert refreshed.message_count == 2
    assert refreshed.last_activity_at > conversation.last_activity_at


def test_append_message_stores_model_output_only_when_given(db):
    store = ConversationStore(db)
    user = make_user(db, "a@example.com")
    conversation = store.create_conversation(user.id)

    plain = store.append_message(conversation.id, "user", "hola")
    with_output = store.append_message(
        conversation.id, "assistant", "respuesta", model_output={"prioridad": "BAJA"}
    )

    assert plain.model_output is None
    assert with_output.model_output == {"prioridad": "BAJA"}


def test_append_message_to_missing_conversation_fails_without_partial_state(db):
    """La FK de chat_messages hace que el INSERT falle; no queda ningún
    mensaje huérfano ni se toca otra conversación."""
    store = ConversationStore(db)
    user = make_user(db, "a@example.com")
    other = store.create_conversation(user.id)

    with pytest.raises(psycopg2.errors.ForeignKeyViolation):
        store.append_message(uuid.uuid4(), "user", "hola")

    assert store.get_conversation(other.id, user.id).message_count == 0
    assert db.query_one("SELECT COUNT(*) AS n FROM chat_messages")["n"] == 0


def test_messages_come_back_in_chronological_order(db):
    store = ConversationStore(db)
    user = make_user(db, "a@example.com")
    conversation = store.create_conversation(user.id)
    for index in range(4):
        store.append_message(conversation.id, "user" if index % 2 == 0 else "assistant", f"m{index}")

    assert [m.content for m in store.messages_for(conversation.id)] == ["m0", "m1", "m2", "m3"]


def test_mark_emergency_locked_sticks(db):
    store = ConversationStore(db)
    user = make_user(db, "a@example.com")
    conversation = store.create_conversation(user.id)

    store.mark_emergency_locked(conversation.id)

    assert store.get_conversation(conversation.id, user.id).locked_emergency is True


def test_list_conversations_is_scoped_to_user_and_sorted_by_activity(db):
    store = ConversationStore(db)
    user = make_user(db, "a@example.com")
    other = make_user(db, "b@example.com")
    older = store.create_conversation(user.id)
    newer = store.create_conversation(user.id)
    store.create_conversation(other.id)
    store.append_message(older.id, "user", "x" * 200)
    store.append_message(newer.id, "user", "mensaje reciente")

    summaries = store.list_conversations(user.id)

    assert [s.id for s in summaries] == [newer.id, older.id]
    assert summaries[0].preview == "mensaje reciente"
    assert len(summaries[1].preview) == 80


def test_list_preview_is_empty_for_conversation_without_messages(db):
    store = ConversationStore(db)
    user = make_user(db, "a@example.com")
    store.create_conversation(user.id)

    assert store.list_conversations(user.id)[0].preview == ""


def test_delete_conversation_only_deletes_own_and_cascades_messages(db):
    store = ConversationStore(db)
    owner = make_user(db, "owner@example.com")
    intruder = make_user(db, "intruder@example.com")
    conversation = store.create_conversation(owner.id)
    store.append_message(conversation.id, "user", "hola")

    store.delete_conversation(conversation.id, intruder.id)
    assert store.get_conversation(conversation.id, owner.id) is not None

    store.delete_conversation(conversation.id, owner.id)
    assert store.get_conversation(conversation.id, owner.id) is None
    assert store.messages_for(conversation.id) == []


def test_malformed_id_behaves_like_a_conversation_that_does_not_exist(db):
    """El id viene de la URL; antes un valor que no era UUID reventaba en
    Postgres (InvalidTextRepresentation) y la API respondía 500."""
    store = ConversationStore(db)
    user = make_user(db, "a@example.com")

    assert store.get_conversation("no-soy-un-uuid", user.id) is None
    store.delete_conversation("no-soy-un-uuid", user.id)

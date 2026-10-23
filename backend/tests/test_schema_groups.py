"""
Regresión del bug que rompió el CI del PR del chat: la migración 0001
ejecutaba TODA la lista de sentencias, que ya incluía las tablas del chat, y
la 0002 las creaba otra vez ("relation conversations already exists") en
cualquier base nueva. Cada migración tiene que crear solo sus tablas.
"""

from __future__ import annotations

import re

from backend.app.storage.schema import CHAT_STATEMENTS, CREATE_STATEMENTS, INITIAL_STATEMENTS


def tables_created(statements: list[str]) -> set[str]:
    return {m.group(1) for s in statements if (m := re.search(r"CREATE TABLE (\w+)", s))}


def test_each_migration_group_creates_its_own_tables_only():
    assert tables_created(INITIAL_STATEMENTS) == {"users", "sessions", "evidence"}
    assert tables_created(CHAT_STATEMENTS) == {"conversations", "chat_messages"}
    assert tables_created(INITIAL_STATEMENTS).isdisjoint(tables_created(CHAT_STATEMENTS))


def test_the_test_schema_is_exactly_the_migrations_in_order():
    assert CREATE_STATEMENTS == [*INITIAL_STATEMENTS, *CHAT_STATEMENTS]


def test_no_table_is_created_twice_across_the_whole_schema():
    names = [m.group(1) for s in CREATE_STATEMENTS if (m := re.search(r"CREATE TABLE (\w+)", s))]
    assert len(names) == len(set(names))

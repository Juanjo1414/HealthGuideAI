"""IP real del cliente detrás de proxies (api/client_ip.py)."""

from __future__ import annotations

from dataclasses import replace
from types import SimpleNamespace

import pytest

from backend.app.api import client_ip as module
from backend.app.config import Settings


def _request(xff: str | None, socket_ip: str = "10.0.0.9"):
    headers = {"x-forwarded-for": xff} if xff is not None else {}
    return SimpleNamespace(client=SimpleNamespace(host=socket_ip), headers=headers)


@pytest.fixture
def hops(monkeypatch):
    def set_hops(n: int):
        monkeypatch.setattr(module, "get_settings", lambda: replace(Settings(), trusted_proxy_hops=n))

    return set_hops


def test_without_trusted_proxies_uses_the_socket_and_ignores_the_header(hops):
    hops(0)
    assert module.client_ip(_request("1.2.3.4")) == "10.0.0.9"


def test_one_proxy_takes_the_last_entry(hops):
    hops(1)
    assert module.client_ip(_request("200.1.1.1")) == "200.1.1.1"


def test_a_spoofed_header_cannot_choose_the_ip(hops):
    """El cliente manda su propio X-Forwarded-For: queda a la izquierda y se ignora."""
    hops(1)
    assert module.client_ip(_request("6.6.6.6, 200.1.1.1")) == "200.1.1.1"
    hops(2)
    assert module.client_ip(_request("6.6.6.6, 200.1.1.1, 76.76.21.1")) == "200.1.1.1"


@pytest.mark.parametrize("entry", ["no-es-una-ip", "x" * 8000, "1.2.3.4; DROP", "999.1.1.1"])
def test_anything_but_a_valid_ip_falls_back_to_the_socket(hops, entry):
    """Las entradas terminan como claves de Redis: basura larga lo llenaría."""
    hops(1)
    assert module.client_ip(_request(entry)) == "10.0.0.9"


def test_ipv6_and_spaces_are_accepted(hops):
    hops(1)
    assert module.client_ip(_request("6.6.6.6,   2001:db8::1  ")) == "2001:db8::1"


def test_fewer_entries_than_hops_falls_back_to_the_socket(hops):
    hops(2)
    assert module.client_ip(_request("200.1.1.1")) == "10.0.0.9"
    assert module.client_ip(_request(None)) == "10.0.0.9"

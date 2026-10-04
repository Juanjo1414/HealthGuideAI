"""
IP real del cliente detrás de proxies, para los frenos de tasa.

Sin esto, detrás del gateway o del despliegue (Vercel → Render) todos los
clientes llegan con la IP del último proxy y comparten un solo bucket: 10
logins fallidos de cualquiera bloqueaban el login de todos (gap registrado en
CONSTRAINTS.md, Sesión 13).

Se confía en un número FIJO de saltos (`TRUSTED_PROXY_HOPS`), no en cualquier
`X-Forwarded-For`: cada proxy agrega a la derecha la IP de quien le habló, así
que la IP del cliente es la que está a `hops` posiciones del final. Lo que un
cliente escriba a mano en ese header queda más a la izquierda y se ignora — si
se tomara la primera entrada, cualquiera podría inventarse una IP nueva por
request y saltarse el límite.

- Directo al backend (desarrollo, tests): 0 saltos, se usa la IP del socket.
- Detrás de `gateway/nginx.conf`: 1 salto. compose no lo fija a propósito: el
  puerto 8000 del backend también está publicado y ahí el header es libre.
- Vercel → Render: 2 saltos (Vercel y el balanceador de Render). Se verifica
  en la prueba de humo del despliegue, ver docs/DESPLIEGUE.md.
"""

from __future__ import annotations

import ipaddress

from fastapi import Request

from ..config import get_settings


def client_ip(request: Request) -> str:
    socket_ip = request.client.host if request.client else "unknown"
    hops = get_settings().trusted_proxy_hops
    if hops <= 0:
        return socket_ip
    chain = [ip.strip() for ip in request.headers.get("x-forwarded-for", "").split(",") if ip.strip()]
    if len(chain) < hops:
        # Llegó por menos proxies de los esperados (alguien le habla directo
        # al backend): no hay de dónde sacar una IP confiable más que el socket.
        return socket_ip
    candidate = chain[-hops]
    # Solo una IP válida: sin esto, quien le hable directo al backend puede
    # mandar strings de varios KB que terminan como claves de Redis y lo llenan.
    try:
        return str(ipaddress.ip_address(candidate))
    except ValueError:
        return socket_ip

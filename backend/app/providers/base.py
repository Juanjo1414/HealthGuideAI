"""
Capa de modelo — la interfaz que resuelve el pendiente de DECISION_LOG.md
(decision 1 y 3): la orquestacion depende de ModelProvider, no de NVIDIA
directamente. Cambiar o agregar un proveedor es implementar esta interfaz,
no tocar el orquestador.
"""

from __future__ import annotations

from abc import ABC, abstractmethod


class ModelProviderError(RuntimeError):
    """El proveedor no pudo devolver un JSON usable (timeout, respuesta invalida, etc.)."""


class ModelProvider(ABC):
    @abstractmethod
    def generate_json(self, system_prompt: str, payload: dict, max_tokens: int) -> dict:
        """Envia system_prompt + payload al modelo y devuelve el JSON ya parseado.

        Debe lanzar ModelProviderError si la respuesta no es JSON valido —
        nunca devolver un dict a medio construir.
        """
        raise NotImplementedError

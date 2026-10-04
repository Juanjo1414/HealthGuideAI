"""
Implementacion de ModelProvider para los modelos de NVIDIA, via el SDK de
OpenAI (el endpoint de NVIDIA es compatible). El manejo de fences de markdown
es el mismo de ask_nvidia_json() en HealthGuideAI_Nvidia.ipynb.

El modelo y el modo de razonamiento salen de la configuracion, no del codigo:
el 2026-10-03 NVIDIA dio de baja nemotron-3-super-120b-a12b (410 Gone) sin
aviso en el producto, y los reemplazos no aceptan los mismos parametros
(ultra rechaza `reasoning_budget`; lightning con thinking gasta todo el
presupuesto razonando y devuelve el contenido vacio).
"""

from __future__ import annotations

import json
import re

from openai import OpenAI

from ..config import Settings
from .base import ModelProvider, ModelProviderError

_JSON_FENCE = re.compile(r"^```json\s*|\s*```$")


class NvidiaProvider(ModelProvider):
    def __init__(
        self,
        api_key: str,
        base_url: str,
        model: str,
        timeout_seconds: float = 30.0,
        max_retries: int = 0,
        enable_thinking: bool = False,
    ):
        self._client = OpenAI(
            base_url=base_url,
            api_key=api_key,
            timeout=timeout_seconds,
            max_retries=max_retries,
        )
        self._model = model
        self._enable_thinking = enable_thinking
        self.last_usage = {"prompt_tokens": 0, "completion_tokens": 0}

    @classmethod
    def from_settings(cls, settings: Settings) -> NvidiaProvider:
        """Unico lugar donde se traduce la config a un proveedor: backend y
        scripts de evals lo usan, asi un cambio de modelo no se olvida en
        ninguno."""
        if not settings.nvidia_api_key:
            raise ValueError("NVIDIA_API_KEY no esta configurada.")
        return cls(
            api_key=settings.nvidia_api_key,
            base_url=settings.nvidia_base_url,
            model=settings.nvidia_model,
            timeout_seconds=settings.nvidia_timeout_seconds,
            max_retries=settings.nvidia_max_retries,
            enable_thinking=settings.nvidia_enable_thinking,
        )

    def generate_json(self, system_prompt: str, payload: dict, max_tokens: int) -> dict:
        try:
            completion = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
                ],
                temperature=0,
                top_p=0.95,
                max_tokens=max_tokens,
                # Modo JSON: sin esto, ante intentos de extraer el prompt el
                # modelo a veces contestaba en texto plano ("No puedo cumplir
                # con esta solicitud...") y la consulta terminaba en error en
                # vez de pasar por el validador y el fallback seguro.
                response_format={"type": "json_object"},
                extra_body={"chat_template_kwargs": {"enable_thinking": self._enable_thinking}},
                stream=False,
            )
        except Exception as exc:  # errores de red/SDK: nunca dejar pasar una excepcion cruda a la capa de arriba
            raise ModelProviderError(f"NVIDIA no respondio: {exc}") from exc

        if completion.usage:
            self.last_usage = {
                "prompt_tokens": completion.usage.prompt_tokens,
                "completion_tokens": completion.usage.completion_tokens,
            }

        raw_text = (completion.choices[0].message.content or "").strip()
        cleaned = _JSON_FENCE.sub("", raw_text)
        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise ModelProviderError(f"NVIDIA devolvio un JSON invalido: {exc}") from exc
        if not isinstance(parsed, dict):
            raise ModelProviderError("NVIDIA devolvio JSON valido, pero no un objeto.")
        return parsed

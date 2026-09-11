"""
Implementacion de ModelProvider para NVIDIA nemotron-3-super-120b-a12b,
via el SDK de OpenAI (el endpoint de NVIDIA es compatible). Misma llamada
que ask_nvidia_json() en HealthGuideAI_Nvidia.ipynb — mismos parametros,
mismo manejo de fences de markdown — para que el comportamiento en
produccion no diverja del que ya se evaluo en evals/results.md.
"""

from __future__ import annotations

import json
import re

from openai import OpenAI

from .base import ModelProvider, ModelProviderError

_JSON_FENCE = re.compile(r"^```json\s*|\s*```$")


class NvidiaProvider(ModelProvider):
    def __init__(self, api_key: str, base_url: str, model: str):
        self._client = OpenAI(base_url=base_url, api_key=api_key)
        self._model = model
        self.last_usage = {"prompt_tokens": 0, "completion_tokens": 0}

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
                extra_body={
                    "chat_template_kwargs": {"enable_thinking": True},
                    "reasoning_budget": max_tokens,
                },
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
            return json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise ModelProviderError(f"NVIDIA devolvio un JSON invalido: {exc}") from exc

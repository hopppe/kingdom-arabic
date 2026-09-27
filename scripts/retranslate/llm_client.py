"""Client for gemma4 served by llama.cpp's llama-server (started by run_retranslate.sh).

Why llama-server instead of Ollama: gemma4 uses sliding-window attention, and
Ollama's server can only reuse its cache for byte-identical prompts. Started
with --swa-full, llama-server reuses the shared prefix (instructions + verse),
so each extra word of a verse costs ~30 prompt tokens instead of ~550, about
6x faster overall.
"""

import json
import logging
import time

import requests

SERVER = "http://127.0.0.1:8089"
MODEL = "gemma4:12b"

log = logging.getLogger("retranslate")


class ModelError(RuntimeError):
    """The model server did not return a usable answer after retries."""


def _chat(prompt: str, max_tokens: int, temperature: float, extra: dict, retries: int = 3) -> str:
    last_error = "no attempt"
    for attempt in range(retries):
        try:
            response = requests.post(
                f"{SERVER}/v1/chat/completions",
                json={
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "cache_prompt": True,
                    "chat_template_kwargs": {"enable_thinking": False},
                    **extra,
                },
                timeout=300,
            )
            body = response.json()
            if response.ok and body.get("choices"):
                return body["choices"][0]["message"].get("content") or ""
            last_error = str(body.get("error") or f"HTTP {response.status_code}")
        except (requests.RequestException, ValueError) as error:
            last_error = repr(error)
        log.warning("model attempt %d/%d failed: %s", attempt + 1, retries, last_error)
        time.sleep(15 * (attempt + 1))
    raise ModelError(last_error)


def ask_text(prompt: str, max_tokens: int = 16, temperature: float = 0.0) -> str:
    """A single line of plain text (generation stops at the first newline)."""
    return _chat(prompt, max_tokens, temperature, {"stop": ["\n"]})


def ask_json(prompt: str, schema: dict, max_tokens: int = 256, temperature: float = 0.0) -> dict:
    """A JSON answer constrained to `schema`."""
    text = _chat(
        prompt,
        max_tokens,
        temperature,
        {"response_format": {"type": "json_schema", "json_schema": {"name": "answer", "schema": schema}}},
    )
    try:
        return json.loads(text)
    except ValueError as error:
        raise ModelError(f"invalid JSON from model: {text[:80]!r}") from error


def server_ready() -> bool:
    try:
        return requests.get(f"{SERVER}/health", timeout=5).ok
    except requests.RequestException:
        return False

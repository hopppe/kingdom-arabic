"""Minimal Ollama client for structured (JSON-schema) answers from gemma4."""

import json
import time

import requests

API = "http://localhost:11434/api/generate"
MODEL = "gemma4:12b"

# use_mmap: without it Ollama loads the weights into RAM *and* onto the GPU,
# leaving an ~8.5 GB duplicate that ends up in swap on this 16 GB Mac.
BASE_OPTIONS = {"temperature": 0, "num_ctx": 8192, "use_mmap": True}


class ModelError(RuntimeError):
    """The model did not return a usable answer after retries."""


def ask_json(prompt: str, schema: dict, num_predict: int = 64, retries: int = 3) -> dict:
    """Send a prompt, constrain the reply to `schema`, and return the parsed JSON."""
    last_error = "no attempt"
    for attempt in range(retries):
        try:
            response = requests.post(
                API,
                json={
                    "model": MODEL,
                    "prompt": prompt,
                    "format": schema,
                    "stream": False,
                    "think": False,
                    "keep_alive": "30m",
                    "options": {**BASE_OPTIONS, "num_predict": num_predict},
                },
                timeout=300,
            )
            body = response.json()
            if response.ok and "response" in body and "error" not in body:
                return json.loads(body["response"])
            last_error = body.get("error") or f"HTTP {response.status_code}"
        except (requests.RequestException, ValueError) as error:
            last_error = repr(error)
        print(f"  [model] attempt {attempt + 1}/{retries} failed: {last_error}", flush=True)
        time.sleep(15 * (attempt + 1))
    raise ModelError(last_error)


def unload_model() -> None:
    try:
        requests.post(API, json={"model": MODEL, "keep_alive": 0}, timeout=30)
    except requests.RequestException:
        pass

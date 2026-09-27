"""Bake-off: quality AND speed of local Ollama models on Bible word-glossing.

Speed numbers come from Ollama's own nanosecond counters, not wall clock:
  load_duration        - cold model load from the external SSD
  prompt_eval_duration - reading the verse + word list
  eval_duration        - generating the glosses
Each model is unloaded before the next so nothing overlaps in RAM.
"""
import json, re, time, requests, random, sys
from pathlib import Path

API = "http://localhost:11434/api/generate"
ROOT = Path("/Volumes/ssd-mac-storage/Cursor_Code/kingdomarabic/bible-translations/mappings")
MODELS = ["gemma4:12b", "qwen3.5:9b"]
SAMPLE = [("GEN", 1), ("PSA", 23), ("ISA", 53), ("MRK", 1), ("ROM", 8)]
PER_CHAPTER = 5
STOP = {"the","a","an","of","to","and","is","are","was","were","in","on","at",
        "his","her","their","its","he","she","it","they"}

def norm(s):
    return [w for w in re.sub(r"[^a-z' ]", " ", s.lower()).split() if w not in STOP]

def agree(pred, gold):
    p, g = norm(pred), norm(gold)
    if not p or not g: return False
    return p == g or bool(set(p) & set(g))

def build_prompt(words, ar, en):
    wl = "\n".join(f"{i+1}. {w}" for i, w in enumerate(words))
    return (f"Translate each numbered Arabic word to English using verse context.\n\n"
            f"Arabic verse: {ar}\n\nEnglish verse: {en}\n\n"
            f"Words to translate (chunk 1):\n{wl}\n\n"
            f"CRITICAL: Return EXACTLY {len(words)} translations, one per line.\n"
            f"Format: NUMBER. TRANSLATION\n\nYour {len(words)} translations:")

def parse(text, n):
    out = {}
    for line in text.split("\n"):
        m = re.match(r"^(\d+)[.\):\s]+(.+)$", line.strip())
        if m:
            k = int(m.group(1)); v = m.group(2).strip().strip("\"'.,!?")
            v = re.sub(r"^translation:\s*", "", v, flags=re.I).strip()
            if 1 <= k <= n and v: out[k] = v
    return out

def unload(model):
    try: requests.post(API, json={"model": model, "keep_alive": 0}, timeout=60)
    except Exception: pass
    time.sleep(3)

random.seed(7)
verses = []
for book, ch in SAMPLE:
    d = json.load(open(ROOT / book / f"{ch}.json"))["verses"]
    verses += random.sample([v for v in d.values() if 6 <= len(v["mappings"]) <= 20], PER_CHAPTER)
total_words = sum(len(v["mappings"]) for v in verses)
print(f"{len(verses)} verses / {total_words} words from {', '.join(b for b,_ in SAMPLE)}\n", flush=True)

results = {}
for model in MODELS:
    unload(model)
    tot = hit = fmt = 0
    load_ns = 0; peval_ns = peval_n = 0; eval_ns = eval_n = 0; wall = 0.0
    for i, v in enumerate(verses):
        words = [m["ar"] for m in v["mappings"]]
        gold  = [m["en"] for m in v["mappings"]]
        t0 = time.time()
        r = requests.post(API, json={
            "model": model, "prompt": build_prompt(words, v["ar"], v["en"]),
            "stream": False, "think": False, "keep_alive": "10m",
            "options": {"temperature": 0.1, "num_predict": 400, "num_ctx": 4096}
        }, timeout=600).json()
        wall += time.time() - t0
        if i == 0: load_ns = r.get("load_duration", 0)        # cold load, first call only
        peval_ns += r.get("prompt_eval_duration", 0); peval_n += r.get("prompt_eval_count", 0)
        eval_ns  += r.get("eval_duration", 0);        eval_n  += r.get("eval_count", 0)
        got = parse(r.get("response", ""), len(words))
        fmt += (len(got) == len(words))
        for j, g in enumerate(gold):
            tot += 1; hit += agree(got.get(j+1, ""), g)
    res = dict(
        agree=hit/tot,
        format_ok=fmt/len(verses),
        cold_load_s=load_ns/1e9,
        gen_tok_s=eval_n/(eval_ns/1e9) if eval_ns else 0,
        prompt_tok_s=peval_n/(peval_ns/1e9) if peval_ns else 0,
        sec_per_verse=wall/len(verses),
        words_per_sec=total_words/wall,
    )
    results[model] = res
    print(f"{model:12s} agree={res['agree']:6.1%}  fmt={fmt:2d}/{len(verses)}  "
          f"load={res['cold_load_s']:5.1f}s  gen={res['gen_tok_s']:5.1f} tok/s  "
          f"prompt={res['prompt_tok_s']:6.1f} tok/s  {res['sec_per_verse']:5.1f}s/verse  "
          f"{res['words_per_sec']:4.2f} words/s", flush=True)
    unload(model)

json.dump(results, open("bakeoff_results.json", "w"), indent=1)
print("\nDONE", flush=True)

#!/usr/bin/env python3
"""Review existing Arabic->English word glosses with a local model.

Reads bible-translations/mappings/{BOOK}/{CH}.json, asks the model to check each
word gloss against the Arabic word and the English verse for context, and writes
proposed corrections to bible-translations/review-{MODEL}/{BOOK}/{CH}.json.

NOTHING IS OVERWRITTEN - the source mappings are opened read-only and the review
lands in a separate tree for inspection before anything is applied.
"""
import json, re, sys, time, argparse, requests
from pathlib import Path

API = "http://localhost:11434/api/generate"
REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "bible-translations" / "mappings"

PROMPT = """You are proofreading Arabic-to-English word glosses for a Bible study app.

Arabic verse: {ar}
English verse: {en}

{pairs}

Report a gloss ONLY if it is genuinely WRONG:
- empty, or a placeholder
- a mistranslation of that Arabic word
- missing meaning the Arabic word carries (e.g. an attached pronoun suffix)

DO NOT report a gloss for any of these reasons:
- you would word it differently (synonyms, tense, singular/plural, capitalisation)
- it looks wordy or literal but the meaning is right
Those are NOT errors. Leave them alone.

Preserve these - they are correct, never strip them:
- leading وَ / فَ means the gloss starts with "and" - keep it
- الْ means "the" - keep it
- a possessed noun keeps "of" (شَاطِئِ = "shore of", الْجَلِيلِ = "of Galilee")
- attached pronouns stay (حِذَائِهِ = "his sandals", كُلِّهَا = "all of it")

Never output the Arabic. Never explain. Never output a partial phrase.

Output one line per WRONG gloss:
NUMBER. corrected english gloss

Example:
2. immediately
9. baptized you

If no gloss is genuinely wrong, output exactly: ALL_OK

Your answer:"""


ARABIC = re.compile(r"[\u0600-\u06FF\u0750-\u077F]")


def clean_gloss(val):
    """Strip the junk the model wraps around a gloss; return None if unusable."""
    val = re.sub(r"^\s*[^\s]*\s*->\s*", "", val)          # "ARABIC -> gloss"
    val = re.sub(r"\s*\([^)]*\)\s*$", "", val)             # trailing "(note...)"
    val = re.sub(r"^(corrected_gloss|gloss|correction)\s*:\s*", "", val, flags=re.I)
    val = val.strip().strip('"\'').strip()
    if not val or ARABIC.search(val):                        # still has Arabic -> unusable
        return None
    if len(val) > 60:                                        # runaway commentary
        return None
    return val


def same_gloss(a, b):
    norm = lambda s: re.sub(r"[^a-z ]", "", s.lower()).strip()
    return norm(a) == norm(b)


def review_verse(model, ar, en, mappings, timeout=300):
    pairs = "\n".join(f"{i+1}. {m['ar']}  ->  {m.get('en','')}" for i, m in enumerate(mappings))
    r = requests.post(API, json={
        "model": model,
        "prompt": PROMPT.format(ar=ar, en=en, pairs=pairs),
        "stream": False, "think": False, "keep_alive": "30m",
        "options": {"temperature": 0.1, "num_predict": 300, "num_ctx": 4096},
    }, timeout=timeout).json()
    text = r.get("response", "").strip()
    fixes = {}
    if "ALL_OK" not in text.upper():
        for line in text.split("\n"):
            m = re.match(r"^(\d+)[.\):\s]+(.+)$", line.strip())
            if m:
                idx = int(m.group(1))
                val = clean_gloss(m.group(2))
                if val and 1 <= idx <= len(mappings):
                    if not same_gloss(val, mappings[idx-1].get("en", "")):
                        fixes[idx] = val
    return fixes, r


def review_chapter(model, book, ch, outroot):
    src = SRC / book / f"{ch}.json"
    data = json.load(open(src))
    verses = data.get("verses", {})
    out_verses, stats = {}, dict(verses=0, words=0, flagged=0, eval_tok=0, eval_ns=0, wall=0.0)

    for vnum, v in sorted(verses.items(), key=lambda kv: int(kv[0])):
        maps = v.get("mappings", [])
        if not maps:
            continue
        t0 = time.time()
        fixes, raw = review_verse(model, v["ar"], v["en"], maps)
        stats["wall"] += time.time() - t0
        stats["eval_tok"] += raw.get("eval_count", 0)
        stats["eval_ns"] += raw.get("eval_duration", 0)
        stats["verses"] += 1
        stats["words"] += len(maps)
        stats["flagged"] += len(fixes)
        if fixes:
            out_verses[vnum] = {
                "ar": v["ar"], "en": v["en"],
                "corrections": [
                    {"index": i - 1, "ar": maps[i-1]["ar"],
                     "current": maps[i-1].get("en", ""), "proposed": val}
                    for i, val in sorted(fixes.items())
                ],
            }

    outdir = outroot / book
    outdir.mkdir(parents=True, exist_ok=True)
    json.dump({"book": book, "chapter": ch, "model": model,
               "stats": {k: v for k, v in stats.items()},
               "verses": out_verses},
              open(outdir / f"{ch}.json", "w"), ensure_ascii=False, indent=1)
    return stats


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("books", help="comma-separated, e.g. MRK or MAT,MRK,LUK,JHN")
    ap.add_argument("--model", default="gemma4:12b")
    ap.add_argument("--chapters", default=None, help="e.g. 1 or 1-3 (single book only)")
    a = ap.parse_args()

    outroot = REPO / "bible-translations" / f"review-{a.model.replace(':','-')}"
    grand = dict(verses=0, words=0, flagged=0, eval_tok=0, eval_ns=0, wall=0.0)

    for book in a.books.split(","):
        chs = sorted(int(p.stem) for p in (SRC / book).glob("*.json"))
        if a.chapters:
            if "-" in a.chapters:
                lo, hi = map(int, a.chapters.split("-")); chs = [c for c in chs if lo <= c <= hi]
            else:
                chs = [int(a.chapters)]
        for ch in chs:
            s = review_chapter(a.model, book, ch, outroot)
            for k in grand: grand[k] += s[k]
            pct = 100.0 * s["flagged"] / max(s["words"], 1)
            print(f"{book} {ch:3d}  {s['verses']:3d}v {s['words']:5d}w  "
                  f"flagged {s['flagged']:4d} ({pct:4.1f}%)  "
                  f"{s['wall']/max(s['verses'],1):5.1f}s/verse  "
                  f"{s['words']/max(s['wall'],0.001):5.2f} w/s", flush=True)

    tok_s = grand["eval_tok"] / (grand["eval_ns"] / 1e9) if grand["eval_ns"] else 0
    print(f"\nTOTAL {grand['verses']} verses / {grand['words']} words  "
          f"flagged {grand['flagged']} ({100.0*grand['flagged']/max(grand['words'],1):.1f}%)  "
          f"{grand['wall']/3600:.2f} h  {grand['words']/max(grand['wall'],0.001):.2f} words/s  "
          f"{tok_s:.1f} tok/s", flush=True)
    print(f"written to: {outroot}", flush=True)


if __name__ == "__main__":
    main()

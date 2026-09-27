#!/usr/bin/env python3
"""Targeted gloss review: detect suspect glosses deterministically, then ask the
model to adjudicate ONLY those, choosing between the current gloss and the
corpus-majority gloss rather than inventing a new one.

Detection (no model, instant):
  1. consistency outliers - the same Arabic word glossed differently from a >=50%
     majority across the corpus, in <=2 places
  2. mechanical breakage  - slashes, parentheticals, bare articles, Arabic text,
     whole-phrase glosses, empties

Nothing is overwritten. Proposals land in bible-translations/review-v2-{model}/.
"""
import json, re, time, argparse, collections, requests
from pathlib import Path

API = "http://localhost:11434/api/generate"
REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "bible-translations" / "mappings"
ARABIC = re.compile(r"[؀-ۿݐ-ݿ]")
norm = lambda s: re.sub(r"[^a-z ]", "", (s or "").lower()).strip()


def load(books):
    vmap, order = {}, []
    for b in books:
        for f in sorted((SRC / b).glob("*.json"), key=lambda x: int(x.stem)):
            for vn, v in json.load(open(f))["verses"].items():
                vmap[(b, f.stem, vn)] = v
                for i in range(len(v.get("mappings", []))):
                    order.append((b, f.stem, vn, i))
    return vmap, order


def detect(vmap, order):
    """Return {(b,ch,v,i): (reason, suggestion_or_None)}."""
    by = collections.defaultdict(list)
    for k in order:
        b, c, v, i = k
        by[vmap[(b, c, v)]["mappings"][i]["ar"]].append(k)

    flags = {}
    for w, occ in by.items():
        if len(occ) < 5:
            continue
        cnt = collections.Counter(norm(vmap[(b, c, v)]["mappings"][i].get("en")) for b, c, v, i in occ)
        top, n = cnt.most_common(1)[0]
        if not top or n / len(occ) < 0.5:
            continue
        for k in occ:
            b, c, v, i = k
            g = norm(vmap[(b, c, v)]["mappings"][i].get("en"))
            if g and g != top and cnt[g] <= 2:
                flags[k] = ("inconsistent", top)

    for k in order:
        b, c, v, i = k
        e = vmap[(b, c, v)]["mappings"][i].get("en", "") or ""
        why = None
        if not e.strip():                       why = "empty"
        elif ARABIC.search(e):                  why = "arabic_in_gloss"
        elif "/" in e:                          why = "unresolved_slash"
        elif "(" in e:                          why = "parenthetical"
        elif norm(e) in {"the", "a", "an"}:     why = "bare_article"
        elif len(e.split()) >= 6:               why = "phrase_not_word"
        if why:
            flags[k] = (why, flags.get(k, (None, None))[1])
    return flags



PRONOUNS = {"his","her","him","them","their","your","you","my","me","us","our",
            "its","it","i","we","they","he","she"}


def quality_check(current, proposed, arabic, majority=None):
    """Gate a proposal against known failure modes.

    Returns (verdict, label) where verdict is "ok", "reject" or "warn".
    Hard rejects are unambiguous corruption. Warnings are recorded on the
    correction so a human can eyeball them, but are still written out.
    """
    p = (proposed or "").strip()
    cn, pn = norm(current), norm(p)

    if not p:                            return "reject", "empty"
    if ARABIC.search(p):                 return "reject", "arabic_in_proposal"
    if len(p) > 60:                      return "reject", "too_long"
    if len(p.split()) > 8:               return "reject", "phrase_not_word"
    if not pn:                           return "reject", "no_letters"
    if pn == cn:                         return "reject", "no_change"
    # the fix must not reintroduce the breakage detection looks for
    # (observed: "So/Therefore" -> "Neither/Nor", "(The second" -> "(the twelfth")
    if re.search(r"[/()]", p):           return "reject", "still_broken"

    # observed failure mode: "with the Spirit" -> "with the"
    # Not for slash/paren glosses: keeping one alternative is the intended fix
    # there ("Gave/Presented" -> "gave", "said (to them)" -> "said").
    has_alternatives = re.search(r"[/()]", current or "")
    if not has_alternatives and cn.startswith(pn) and len(pn) < len(cn) * 0.7:
        return "reject", "truncation"

    # a gloss ending in a bare determiner has lost its noun
    # ("for forgiveness" -> "for the", "with the Spirit" -> "with the")
    if pn.split()[-1] in {"the", "a", "an"} and len(pn.split()) > 1:
        return "reject", "dangling_article"

    # the proposal is nothing but function words while the old gloss had content
    FUNCTION = {"the","a","an","of","to","and","in","on","at","with","for","from",
                "by","that","this","is","are","was","were","be","not","but","or","as"}
    if set(pn.split()) <= FUNCTION and not (set(cn.split()) <= FUNCTION):
        # allowed when the corpus itself says this word is a function word -
        # that is the alignment-drift fix ("Three" -> "in", "Man" -> "from")
        if not (majority and norm(majority) == pn):
            return "reject", "content_word_lost"

    # degenerate: a multi-word gloss collapsed to a bare function word
    if pn in {"the","a","an","of","to","and","in","on"} and len(cn.split()) > 1:
        return "reject", "degenerate"

    # soft: Arabic carries a wa-/fa- conjunction and the "and" was dropped.
    # Only a warning - leading و is not always the conjunction (وَبَر = fur).
    if arabic[:1] in ("\u0648", "\u0641") and cn.startswith("and") and not pn.startswith("and"):
        if majority and norm(majority).startswith("and"):
            return "reject", "dropped_and_vs_corpus"
        return "warn", "dropped_and"

    # soft: a pronoun present in the old gloss disappeared
    lost = (set(cn.split()) & PRONOUNS) - set(pn.split())
    if lost and len(pn.split()) <= len(cn.split()):
        return "warn", "dropped_pronoun:" + ",".join(sorted(lost))

    return "ok", ""

PROMPT = """Arabic verse: {ar}
English verse: {en}

Check ONLY these word glosses from the verse:

{items}

For each, give the correct English for that single Arabic word, using the English
verse for meaning. Keep prefixes and suffixes the word carries (وَ="and",
الْ="the", ـهُ="his/him", ـهُمْ="their"). Never output Arabic or explanation.

If the current gloss is already correct, write KEEP.

Answer one line each, exactly: NUMBER. gloss-or-KEEP

Your answer:"""


class ModelError(RuntimeError):
    pass


def ask(model, prompt, retries=3):
    """POST to Ollama. Raises ModelError instead of returning an empty answer:
    an {"error": ...} body read as "no corrections" would mark the chapter done."""
    last = None
    for attempt in range(retries):
        try:
            resp = requests.post(API, json={
                "model": model, "prompt": prompt,
                "stream": False, "think": False, "keep_alive": "30m",
                # use_mmap: without it Ollama copies the weights into RAM *and* onto the GPU,
                # leaving an ~8.5 GB duplicate that ends up in swap.
                "options": {"temperature": 0.1, "num_predict": 200, "num_ctx": 4096, "use_mmap": True},
            }, timeout=300)
            r = resp.json()
            if resp.ok and "error" not in r and "response" in r:
                return r
            last = r.get("error") or f"HTTP {resp.status_code}"
        except (requests.RequestException, ValueError) as e:
            last = repr(e)
        print(f"  [model] attempt {attempt + 1}/{retries} failed: {last}", flush=True)
        time.sleep(30 * (attempt + 1))
    raise ModelError(last)


def review_verse(model, v, idxs, flags, book, ch, vn, rejects):
    maps = v["mappings"]
    items = []
    for n, i in enumerate(idxs, 1):
        reason, sugg = flags[(book, ch, vn, i)]
        cur = maps[i].get("en", "") or "(empty)"
        line = f'{n}. {maps[i]["ar"]}   current: "{cur}"'
        if sugg:
            line += f'   elsewhere this word = "{sugg}"'
        items.append(line)
    r = ask(model, PROMPT.format(ar=v["ar"], en=v["en"], items="\n".join(items)))

    out = []
    for line in r.get("response", "").split("\n"):
        m = re.match(r"^(\d+)[.\):\s]+(.+)$", line.strip())
        if not m:
            continue
        n = int(m.group(1))
        val = m.group(2).strip().strip('"\'').strip()
        val = re.sub(r"\s*\([^)]*\)\s*$", "", val).strip()
        if not (1 <= n <= len(idxs)) or ARABIC.search(val) or len(val) > 60:
            continue
        i = idxs[n - 1]
        cur = maps[i].get("en", "") or ""
        if val.upper().startswith("KEEP"):
            continue
        reason, majority = flags[(book, ch, vn, i)]
        verdict, label = quality_check(cur, val, maps[i]["ar"], majority)
        if verdict == "reject":
            rejects[label] += 1
            continue
        rec = {"index": i, "ar": maps[i]["ar"], "current": cur, "proposed": val,
               "reason": reason, "corpus_majority": majority}
        if verdict == "warn":
            rec["warning"] = label
            rejects["WARN:" + label.split(":")[0]] += 1
        out.append(rec)
    return out, r


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("books", help="books to REVIEW, or ALL")
    ap.add_argument("--model", default="gemma4:12b")
    ap.add_argument("--skip", default=None, help="comma list of books to detect-with but not review")
    ap.add_argument("--max-hours", type=float, default=None,
                    help="stop cleanly after N hours; re-run resumes where it left off")
    ap.add_argument("--detect-all", action="store_true",
                    help="compute consistency majorities across every book on disk (better stats)")
    a = ap.parse_args()

    on_disk = sorted(p.name for p in SRC.iterdir() if p.is_dir())
    review_books = on_disk if a.books.upper() == "ALL" else a.books.split(",")
    skip = set(a.skip.split(",")) if a.skip else set()
    review_books = [b for b in review_books if b not in skip]

    NT = ["MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH",
          "1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE","1JN","2JN","3JN","JUD","REV"]
    review_books.sort(key=lambda b: (b not in NT, NT.index(b) if b in NT else 0, b))
    detect_books = on_disk if (a.detect_all or a.books.upper() == "ALL") else sorted(set(review_books) | skip)
    vmap, order = load(detect_books)
    flags = detect(vmap, order)
    flags = {k: v for k, v in flags.items() if k[0] in set(review_books)}
    per_verse = collections.defaultdict(list)
    for (b, c, v, i) in flags:
        per_verse[(b, c, v)].append(i)
    for k in per_verse:
        per_verse[k].sort()

    outroot = REPO / "bible-translations" / f"review-v2-{a.model.replace(':', '-')}"
    print(f"{len(flags)} suspect glosses in {len(per_verse)} verses "
          f"(of {len(order)} total, {100*len(flags)/len(order):.1f}%)", flush=True)

    def flush(b, c, verses):
        # write-then-rename: a file cut off mid-write would count as done on resume
        d = outroot / b; d.mkdir(parents=True, exist_ok=True)
        tmp = d / f".{c}.json.tmp"
        with open(tmp, "w") as fh:
            json.dump({"book": b, "chapter": c, "model": a.model, "verses": verses},
                      fh, ensure_ascii=False, indent=1)
        tmp.replace(d / f"{c}.json")

    # resume: skip chapters already written
    existing = {(p.parent.name, p.stem) for p in outroot.glob("*/*.json")} if outroot.exists() else set()
    if existing:
        before = len(per_verse)
        per_verse = {k: v for k, v in per_verse.items() if (k[0], k[1]) not in existing}
        print(f"resuming: {before - len(per_verse)} verses already done in "
              f"{len(existing)} chapters, {len(per_verse)} remaining", flush=True)

    # book order from review_books (NT first), then numeric chapter and verse.
    # A plain sort of the string keys runs alphabetically: 1CH, 1CO, 1JN, ...
    rank = {b: n for n, b in enumerate(review_books)}
    queue = sorted(per_verse.items(),
                   key=lambda kv: (rank[kv[0][0]], int(kv[0][1]), int(kv[0][2])))

    results = collections.defaultdict(dict)
    rejects = collections.Counter()
    t0 = time.time(); changed = 0; done = 0; in_chapter = 0; stopped = None
    cur_key = None
    for (b, c, vn), idxs in queue:
        if cur_key and (b, c) != cur_key:
            flush(cur_key[0], cur_key[1], results.pop(cur_key, {}))   # chapter complete -> write now
            in_chapter = 0
        cur_key = (b, c)
        # Drop the in-progress chapter rather than flushing it half-done: a
        # partial file would be treated as complete on resume and the rest of
        # its verses would never be reviewed.
        if a.max_hours and (time.time() - t0) > a.max_hours * 3600:
            stopped = f"[budget] {a.max_hours}h reached"
            break
        try:
            corr, _ = review_verse(a.model, vmap[(b, c, vn)], idxs, flags, b, c, vn, rejects)
        except ModelError as e:
            stopped = f"[model] giving up after retries: {e}"
            break
        done += 1; in_chapter += 1
        if corr:
            changed += len(corr)
            results[(b, c)][vn] = {"ar": vmap[(b, c, vn)]["ar"], "en": vmap[(b, c, vn)]["en"],
                                   "corrections": corr}
        if done % 50 == 0:
            el = time.time() - t0
            print(f"  {done}/{len(per_verse)} verses  {changed} changes  "
                  f"{el/done:.1f}s/verse  eta {(len(per_verse)-done)*el/done/60:.0f}m", flush=True)

    if stopped:
        print(f"\n{stopped} - stopping before finishing {cur_key[0]} {cur_key[1]} "
              f"(partial chapter discarded, will redo). Re-run to resume.", flush=True)
        results.pop(cur_key, None)
        done -= in_chapter   # those verses were thrown away and will be redone
    elif cur_key:
        flush(cur_key[0], cur_key[1], results.pop(cur_key, {}))
    el = time.time() - t0
    print(f"\nDONE {done} verses in {el/60:.1f} min  ({el/max(done,1):.1f}s/verse)")
    print(f"{changed} changes proposed from {len(flags)} suspects "
          f"({100*changed/max(len(flags),1):.0f}% confirmed, rest kept)")
    if rejects:
        print("quality gate:")
        for k, n in rejects.most_common():
            print(f"  {k:28s} {n:5d}")
    remaining = len(per_verse) - done
    print(f"written to: {outroot}")
    if stopped or remaining > 0:
        print(f"REMAINING: {remaining} verses (~{remaining*el/max(done,1)/3600:.1f} h) - resume by re-running")
    else:
        print("COMPLETE: no verses remaining")


if __name__ == "__main__":
    main()

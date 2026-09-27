#!/usr/bin/env python3
"""Unit tests for the gloss-review quality gates.

Cases are drawn from failure modes actually observed on Mark/Matthew during
development, plus the good corrections that must NOT be blocked.
Run: python3 scripts/test_review_quality.py
"""
import importlib.util, pathlib, sys

spec = importlib.util.spec_from_file_location(
    "rv", pathlib.Path(__file__).parent / "review_mappings_v2.py")
rv = importlib.util.module_from_spec(spec); spec.loader.exec_module(rv)
qc = rv.quality_check

# (current, proposed, arabic, majority, expected_verdict, note)
CASES = [
    # --- must REJECT: real corruption seen in the v1 run ---
    ("with the Spirit", "with the",  "بِالرُّوحِ", None, "reject", "truncation"),
    ("for forgiveness", "for the",   "لِمَغْفِرَةِ", None, "reject", "truncation"),
    ("and he went out", "",          "وَخَرَجَ",   None, "reject", "empty"),
    ("his hand", "يَدِهِ -> his hand", "يَدِهِ",   None, "reject", "arabic leaked in"),
    ("the beginning", "the",         "الْبَدْءِ",  None, "reject", "degenerate"),
    ("leather", "leather",           "جِلْدٍ",     None, "reject", "no-op"),
    ("said", "and he said and then went out to the crowd immediately", "قَالَ", None,
     "reject", "phrase not word"),
    ("and they took", "they took",   "وَأَخَذُوا", "and they took", "reject",
     "dropped 'and' against corpus majority"),

    # --- must WARN but still pass through for human review ---
    ("and possessed", "possessed by demons", "وَمَسْكُونِينَ", None, "warn", "dropped and"),
    ("they entered", "entered",      "دَخَلُوا",   None, "warn", "dropped pronoun"),

    # --- must PASS: genuine corrections from the validated run ---
    ("the",          "Spirit",       "الرُّوحُ",   None, "ok", "bare article fixed"),
    ("with/in/region","Nazareth",    "النَّاصِرَةِ", None, "ok", "slash resolved"),
    ("his",          "his sandals",  "حِذَائِهِ",  None, "ok", "suffix restored"),
    ("hear",         "they hear",    "يَسْمَعُونَ", "they hear", "ok", "subject restored"),
    ("He said",      "and he said",  "وَقَالَ",    "and said", "ok", "'and' restored"),
    ("Man",          "from",         "مِنَ",       "from", "ok", "wrong gloss fixed"),
    ("governor/ruler","tetrarch",    "حَاكِمَ",    None, "ok", "context-aware"),
    ("master",       "his master",   "سَيِّدُهُ",  "his master", "ok", "pronoun added"),
    ("Three",        "in",           "فِي",        "in", "ok", "alignment drift fixed"),
    ("Gave/Presented", "gave",       "قَدَّمَ",     "presented", "ok", "slash resolved to first option"),
    ("His instructions/Testaments", "his instructions", "وَصَايَاهُ", "his commands", "ok",
     "slash resolved, multi-word"),
    ("with/in the", "with the",      "بِالْ",       None, "reject", "slash resolved to a dangling article"),
]

class _Resp:
    def __init__(self, status, body): self.status_code, self._b = status, body
    ok = property(lambda self: self.status_code < 400)
    def json(self): return self._b


def check_model_errors_raise():
    """An Ollama error body must raise, not read as "no corrections" - that
    would write the chapter out as reviewed-and-clean and skip it forever."""
    real_post, real_sleep = rv.requests.post, rv.time.sleep
    rv.time.sleep = lambda s: None
    try:
        rv.requests.post = lambda *a, **k: _Resp(500, {"error": "model runner stopped"})
        try:
            rv.ask("m", "p"); return "error body did not raise"
        except rv.ModelError:
            pass
        rv.requests.post = lambda *a, **k: _Resp(200, {"response": "1. KEEP"})
        if rv.ask("m", "p").get("response") != "1. KEEP":
            return "good response not returned"
    finally:
        rv.requests.post, rv.time.sleep = real_post, real_sleep
    return None


def main():
    fails = []
    err = check_model_errors_raise()
    print(f"{'FAIL' if err else 'PASS'}  model error handling  {err or ''}")
    if err:
        fails.append(("ask()", err))
    for cur, prop, ar, maj, want, note in CASES:
        got, label = qc(cur, prop, ar, maj)
        ok = got == want
        print(f"{'PASS' if ok else 'FAIL'}  {want:6s} got={got:6s} {label:24s} "
              f"{cur!r} -> {prop!r}   ({note})")
        if not ok:
            fails.append((cur, prop, want, got, label, note))
    print(f"\n{len(CASES)+1-len(fails)}/{len(CASES)+1} passed")
    if fails:
        print("\nFAILURES:")
        for f in fails:
            print("  ", f)
        sys.exit(1)
    print("all quality gates behave as specified")

if __name__ == "__main__":
    main()

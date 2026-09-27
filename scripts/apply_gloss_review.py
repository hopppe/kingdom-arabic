#!/usr/bin/env python3
"""Apply reviewed gloss corrections back into bible-translations/mappings/.

DRY RUN BY DEFAULT - prints what would change and writes nothing.
Pass --apply to actually write. Safety checks on every correction:
  * the Arabic word at that index must still match what was reviewed
  * the current gloss must still match what was reviewed (no silent drift)
  * the proposed gloss must be non-empty, ASCII-ish, not absurdly long, and
    free of the slashes/parentheses the review exists to remove
Anything failing a check is skipped and reported.
"""
import json, re, argparse, collections
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "bible-translations" / "mappings"
ARABIC = re.compile(r"[؀-ۿݐ-ݿ]")
norm = lambda s: re.sub(r"[^a-z ]", "", (s or "").lower()).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--review", default="review-v2-gemma4-12b")
    ap.add_argument("--books", default=None, help="comma list, default all found")
    ap.add_argument("--reason", default=None,
                    help="only apply these reasons, comma list "
                         "(unresolved_slash,bare_article,parenthetical,phrase_not_word,inconsistent,empty,arabic_in_gloss)")
    ap.add_argument("--skip-warnings", action="store_true",
                    help="leave out proposals the quality gate tagged for human review")
    ap.add_argument("--apply", action="store_true", help="actually write (default: dry run)")
    a = ap.parse_args()

    root = REPO / "bible-translations" / a.review
    want = set(a.reason.split(",")) if a.reason else None
    books = a.books.split(",") if a.books else sorted(p.name for p in root.iterdir() if p.is_dir())

    applied = collections.Counter(); skipped = collections.Counter(); problems = []
    for book in books:
        for rf in sorted((root / book).glob("*.json"), key=lambda x: int(x.stem)):
            rev = json.load(open(rf))
            target = SRC / book / f"{rf.stem}.json"
            data = json.load(open(target))
            dirty = False
            for vn, v in rev["verses"].items():
                maps = data["verses"].get(vn, {}).get("mappings")
                if maps is None:
                    problems.append(f"{book} {rf.stem}:{vn} verse missing"); skipped["missing_verse"] += 1; continue
                for c in v["corrections"]:
                    if want and c["reason"] not in want:
                        skipped["filtered"] += 1; continue
                    if a.skip_warnings and c.get("warning"):
                        skipped["warning"] += 1; continue
                    i = c["index"]
                    if not (0 <= i < len(maps)):
                        problems.append(f"{book} {rf.stem}:{vn} index {i} out of range"); skipped["bad_index"] += 1; continue
                    if maps[i]["ar"] != c["ar"]:
                        problems.append(f"{book} {rf.stem}:{vn}[{i}] arabic drift"); skipped["arabic_drift"] += 1; continue
                    if norm(maps[i].get("en", "")) == norm(c["proposed"]):
                        skipped["already_applied"] += 1; continue
                    if norm(maps[i].get("en", "")) != norm(c["current"]):
                        problems.append(f"{book} {rf.stem}:{vn}[{i}] gloss changed since review"); skipped["gloss_drift"] += 1; continue
                    p = (c["proposed"] or "").strip()
                    if not p or ARABIC.search(p) or len(p) > 60 or re.search(r"[/()]", p):
                        problems.append(f"{book} {rf.stem}:{vn}[{i}] bad proposal {p!r}"); skipped["bad_proposal"] += 1; continue
                    if a.apply:
                        maps[i]["en"] = p
                        dirty = True
                    applied[c["reason"]] += 1
            if dirty and a.apply:
                tmp = target.with_suffix(".json.tmp")
                with open(tmp, "w") as fh:
                    json.dump(data, fh, ensure_ascii=False, indent=2)
                tmp.replace(target)

    mode = "APPLIED" if a.apply else "DRY RUN (nothing written)"
    print(f"=== {mode} ===")
    tot = sum(applied.values())
    for r, n in applied.most_common():
        print(f"  {r:20s} {n:5d}")
    print(f"  {'TOTAL':20s} {tot:5d}")
    if skipped:
        print("\nskipped:")
        for r, n in skipped.most_common():
            print(f"  {r:20s} {n:5d}")
    for p in problems[:10]:
        print("   !", p)
    if not a.apply:
        print("\nRe-run with --apply to write. Use --reason to apply one class at a time.")


if __name__ == "__main__":
    main()

"""Post-run polish for the re-translated mappings. Run once the re-translation has finished.

Current fixes:
  - Glosses offering choices in stray quotes (`is" or "does`) become `is / does`,
    keeping every choice but dropping the quote marks the tooltip would show.

  python3 scripts/retranslate/polish.py            # report what would change
  python3 scripts/retranslate/polish.py --apply    # write the changes

Rebuild the Bible DB afterwards (npm run build:bible-db).
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
MAPPINGS = REPO / "bible-translations" / "mappings"
PARTIAL = REPO / "bible-translations" / ".retranslate-state" / "partial"

QUOTES = "\"“”"
CHOICE_SPLIT = re.compile(rf"\s*[{QUOTES}]\s+or\s+[{QUOTES}]\s*")


def polish_gloss(gloss: str) -> str:
    """Turn quoted alternatives into `a / b` choices; leave everything else alone."""
    if not any(q in gloss for q in QUOTES):
        return gloss
    choices = [choice.strip(QUOTES + " ") for choice in CHOICE_SPLIT.split(gloss)]
    polished = " / ".join(choice for choice in choices if choice)
    return polished or gloss  # a quote-only gloss needs a real fix, not a blank


def polish_chapter(chapter: dict) -> tuple[dict, list[tuple[str, str, str, str]]]:
    """Return a polished copy of a mapping chapter and the list of (verse, word, before, after) changes."""
    changes = []
    verses = {}
    for key, verse in chapter.get("verses", {}).items():
        mappings = []
        for mapping in verse.get("mappings", []):
            polished = polish_gloss(mapping["en"])
            if polished != mapping["en"]:
                changes.append((key, mapping["ar"], mapping["en"], polished))
            mappings.append({**mapping, "en": polished})
        verses[key] = {**verse, "mappings": mappings}
    return {**chapter, "verses": verses}, changes


def write_json(path: Path, data: object) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--apply", action="store_true", help="write the changes (default: report only)")
    args = parser.parse_args()

    if args.apply and PARTIAL.exists() and any(PARTIAL.iterdir()):
        print("The re-translation still has a chapter in progress; finish or discard it before polishing.")
        return 1

    total = 0
    for path in sorted(MAPPINGS.glob("*/*.json")):
        with open(path, encoding="utf-8") as handle:
            chapter = json.load(handle)
        polished, changes = polish_chapter(chapter)
        for verse, word, before, after in changes:
            print(f"{path.parent.name} {path.stem}:{verse}  {word}  {before!r} -> {after!r}")
        if changes and args.apply:
            write_json(path, polished)
        total += len(changes)
    print(f"{total} glosses {'fixed' if args.apply else 'to fix (dry run; use --apply)'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

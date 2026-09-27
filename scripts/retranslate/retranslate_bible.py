#!/usr/bin/env python3
"""Re-gloss every word of the Arabic Bible with gemma4, one word at a time.

For each verse the model sees the whole Arabic verse and its English
translation and glosses each word individually (an optional --check pass
re-reviews each verse; it is off by default). Finished chapters are written straight into
bible-translations/mappings/{BOOK}/{CHAPTER}.json (same format the app reads),
and progress is saved after every verse, so the run can be paused and resumed
with at most one verse of work lost.

Usage (from the repo root):
  python3 scripts/retranslate/retranslate_bible.py                # whole Bible, resumes
  python3 scripts/retranslate/retranslate_bible.py --books JHN --chapters 1
  python3 scripts/retranslate/retranslate_bible.py --max-hours 8
"""

import argparse
import importlib.util
import json
import logging
import os
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import llm_client  # noqa: E402
from llm_client import MODEL, ModelError  # noqa: E402
from verse_gloss import gloss_verse  # noqa: E402
from words import split_verse  # noqa: E402

REPO = Path(__file__).resolve().parents[2]
UNIFIED = REPO / "bible-translations" / "unified"
MAPPINGS = REPO / "bible-translations" / "mappings"
STATE = REPO / "bible-translations" / ".retranslate-state"
METHOD = "retranslate-v1 (gemma4, word-by-word with the Arabic verse + English translation as context)"

log = logging.getLogger("retranslate")


def load_book_order() -> list[str]:
    spec = importlib.util.spec_from_file_location("build_bible_db", REPO / "scripts" / "build_bible_db.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return list(module.BOOK_ORDER)


def read_json(path: Path, default: object) -> object:
    try:
        with open(path, encoding="utf-8") as handle:
            return json.load(handle)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def write_json(path: Path, data: object) -> None:
    """Write-then-rename, so an interrupted write never leaves a truncated file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


def verse_keys(chapter_data: dict) -> list[str]:
    return sorted((key for key in chapter_data if key.isdigit()), key=int)


def chapters_to_run(books: list[str], chapter_filter: set[int] | None) -> list[tuple[str, int]]:
    work = []
    for book in books:
        numbers = sorted(int(path.stem) for path in (UNIFIED / book).glob("*.json"))
        work.extend((book, number) for number in numbers if not chapter_filter or number in chapter_filter)
    return work


def count_words(work: list[tuple[str, int]]) -> int:
    total = 0
    for book, chapter in work:
        data = read_json(UNIFIED / book / f"{chapter}.json", {})
        total += sum(len(split_verse(data[key].get("ar", ""))) for key in verse_keys(data))
    return total


def previous_glosses(book: str, chapter: int) -> dict[str, dict[int, str]]:
    """Old glosses by verse and word offset, used only if the model can't produce one."""
    old = read_json(MAPPINGS / book / f"{chapter}.json", {}).get("verses", {})
    return {
        verse: {item.get("start"): item.get("en", "") for item in data.get("mappings", []) if "start" in item}
        for verse, data in old.items()
    }


class ServerModel:
    """Adapter from verse_gloss's model interface to the llama-server client."""

    def text(self, prompt: str, max_tokens: int, temperature: float) -> str:
        return llm_client.ask_text(prompt, max_tokens=max_tokens, temperature=temperature)

    def json(self, prompt: str, schema: dict, max_tokens: int) -> dict:
        return llm_client.ask_json(prompt, schema, max_tokens=max_tokens)


MODEL_CLIENT = ServerModel()


class Progress:
    def __init__(self, total_words: int) -> None:
        self.total_words = total_words
        self.words_done = 0
        self.started = time.time()

    def add(self, words: int) -> None:
        self.words_done += words

    def summary(self) -> str:
        elapsed = time.time() - self.started
        rate = elapsed / self.words_done if self.words_done else 0.0
        remaining_hours = rate * (self.total_words - self.words_done) / 3600
        return (
            f"{self.words_done}/{self.total_words} words this run, {rate:.2f}s/word, "
            f"~{remaining_hours:.1f} h left"
        )


def run_chapter(book: str, chapter: int, check: bool, progress: Progress, deadline: float | None) -> bool:
    """Gloss one chapter. Returns False if it stopped early (budget), True when the chapter is done."""
    source = read_json(UNIFIED / book / f"{chapter}.json", {})
    partial_path = STATE / "partial" / f"{book}_{chapter}.json"
    partial = read_json(partial_path, {"verses": {}})
    previous = previous_glosses(book, chapter)
    events_path = STATE / "events.jsonl"

    for key in verse_keys(source):
        if key in partial["verses"]:
            continue
        if deadline and time.time() > deadline:
            write_json(partial_path, partial)
            return False
        arabic = source[key].get("ar", "")
        english = source[key].get("en", "")
        result = gloss_verse(arabic, english, MODEL_CLIENT, previous.get(key), check=check)
        partial["verses"][key] = {"ar": arabic, "en": english, "mappings": result.mappings}
        write_json(partial_path, partial)
        progress.add(len(result.mappings))
        if result.events:
            with open(events_path, "a", encoding="utf-8") as handle:
                for event in result.events:
                    handle.write(json.dumps({"ref": f"{book} {chapter}:{key}", **event}, ensure_ascii=False) + "\n")

    ordered = {key: partial["verses"][key] for key in verse_keys(source) if key in partial["verses"]}
    write_json(
        MAPPINGS / book / f"{chapter}.json",
        {"book": book, "chapter": chapter, "model": MODEL, "method": METHOD, "verses": ordered},
    )
    partial_path.unlink(missing_ok=True)
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--books", default="ALL", help="comma list of book codes, or ALL")
    parser.add_argument("--chapters", default=None, help="chapter numbers, e.g. 1 or 1-3 (with a single book)")
    parser.add_argument("--max-hours", type=float, default=None, help="stop cleanly after N hours")
    # Off by default: in the John 1 trial the verse-level check changed 35 glosses and
    # several correct ones got worse (e.g. moving "not" onto the following verb).
    parser.add_argument("--check", action="store_true", help="also run the per-verse check pass (experimental)")
    parser.add_argument("--redo", action="store_true", help="re-gloss chapters already marked done")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s", datefmt="%H:%M:%S", stream=sys.stdout)
    order = load_book_order()
    books = order if args.books.upper() == "ALL" else [b.strip().upper() for b in args.books.split(",")]
    unknown = [b for b in books if b not in order]
    if unknown:
        log.error("unknown books: %s", ", ".join(unknown))
        return 2

    chapter_filter = None
    if args.chapters:
        low, _, high = args.chapters.partition("-")
        chapter_filter = set(range(int(low), int(high or low) + 1))

    done_path = STATE / "done.json"
    done = set(read_json(done_path, []))
    work = [
        (book, chapter)
        for book, chapter in chapters_to_run(books, chapter_filter)
        if args.redo or f"{book}:{chapter}" not in done
    ]
    if not llm_client.server_ready():
        log.error("llama-server is not running on %s (start it with run_retranslate.sh)", llm_client.SERVER)
        return 1
    progress = Progress(count_words(work))
    deadline = time.time() + args.max_hours * 3600 if args.max_hours else None
    log.info("%s: %d chapters, %d words to gloss (check pass %s)", MODEL, len(work), progress.total_words,
             "on" if args.check else "off")

    try:
        for book, chapter in work:
            chapter_start = time.time()
            finished = run_chapter(book, chapter, args.check, progress, deadline)
            if not finished:
                log.info("[budget] %sh reached; stopped inside %s %d (resumes at the next verse)", args.max_hours,
                         book, chapter)
                return 0
            done.add(f"{book}:{chapter}")
            write_json(done_path, sorted(done))
            log.info("%s %d done in %.0fs | %s", book, chapter, time.time() - chapter_start, progress.summary())
    except ModelError as error:
        log.error("model kept failing (%s); progress is saved, re-run to resume", error)
        return 1

    log.info("COMPLETE: %s", progress.summary())
    return 0


if __name__ == "__main__":
    sys.exit(main())

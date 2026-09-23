#!/usr/bin/env python3
"""
Build the bundled Bible SQLite database used by the app.

Reads:
  bible-translations/unified/{BOOK}/{CHAPTER}.json   (verse text, source of truth for which verses exist)
  bible-translations/mappings/{BOOK}/{CHAPTER}.json  (word-level glosses)

Writes:
  assets/bible/bible.db      (local inspection only; not bundled)
  assets/bible/bible.db.gz   (what the app ships and unpacks on first launch)
  src/data/bibleDbVersion.js   (content hash, so the app re-imports the DB after an update,
                                and the unpacked size, to verify the unpack)

Run from the repo root:  npm run build:bible-db
Re-run whenever the unified text or the mappings change.
"""

import gzip
import hashlib
import json
import os
import re
import sqlite3
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UNIFIED_DIR = os.path.join(ROOT, "bible-translations", "unified")
MAPPINGS_DIR = os.path.join(ROOT, "bible-translations", "mappings")
OUT_DB = os.path.join(ROOT, "assets", "bible", "bible.db")
OUT_DB_GZ = OUT_DB + ".gz"
OUT_VERSION = os.path.join(ROOT, "src", "data", "bibleDbVersion.js")

# Canonical order; the index + 1 is the book id stored in the DB.
BOOK_ORDER = [
    "GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI",
    "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO", "ECC", "SNG", "ISA", "JER",
    "LAM", "EZK", "DAN", "HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", "ZEP",
    "HAG", "ZEC", "MAL", "MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO", "GAL",
    "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS", "1PE",
    "2PE", "1JN", "2JN", "3JN", "JUD", "REV",
]

# Harakat, tanween, shadda, sukun, superscript alef, Quranic annotation marks, tatweel.
DIACRITICS_RE = re.compile("[ؐ-ًؚ-ٰٟۖ-ۭـ]")
NON_ARABIC_LETTER_RE = re.compile("[^ء-ي]")

# Light10 stemmer (Larkey, Ballesteros & Connell, 2007).
LIGHT10_PREFIXES = ["وال", "بال", "كال", "فال", "لل", "ال"]
LIGHT10_SUFFIXES = ["ها", "ان", "ات", "ون", "ين", "يه", "ية", "ه", "ة", "ي"]
# Words the stemmer would mangle (e.g. "الله" is not "ال" + "له").
STEM_EXCEPTIONS = {"الله": "الله", "لله": "الله", "والله": "الله", "بالله": "الله", "فالله": "الله"}


def normalize(word: str) -> str:
    """Surface form with vowels, punctuation and alef variants removed."""
    text = DIACRITICS_RE.sub("", word)
    text = re.sub("[أإآٱ]", "ا", text)
    text = text.replace("ى", "ي")
    return NON_ARABIC_LETTER_RE.sub("", text)


def light_stem(norm: str) -> str:
    """Light10 stem of an already-normalized word; groups related word forms."""
    if norm in STEM_EXCEPTIONS:
        return STEM_EXCEPTIONS[norm]
    word = norm.replace("ة", "ه")
    if len(word) > 3 and word.startswith("و"):
        word = word[1:]
    for prefix in LIGHT10_PREFIXES:
        if word.startswith(prefix) and len(word) - len(prefix) >= 2:
            word = word[len(prefix):]
            break
    changed = True
    while changed:
        changed = False
        for suffix in LIGHT10_SUFFIXES:
            if word.endswith(suffix) and len(word) - len(suffix) >= 2:
                word = word[: -len(suffix)]
                changed = True
                break
    return word


def verse_sort_key(key: str) -> int:
    return int(key) if key.isdigit() else 0


def load_json(path: str) -> dict:
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def build(connection: sqlite3.Connection) -> dict[str, int]:
    cursor = connection.cursor()
    cursor.executescript(
        """
        CREATE TABLE verses (
          book INTEGER NOT NULL,
          chapter INTEGER NOT NULL,
          verse INTEGER NOT NULL,
          ar TEXT NOT NULL,
          en TEXT NOT NULL,
          PRIMARY KEY (book, chapter, verse)
        ) WITHOUT ROWID;

        -- One row per distinct vowel-less word form.
        CREATE TABLE forms (
          id INTEGER PRIMARY KEY,
          norm TEXT NOT NULL UNIQUE,
          stem TEXT NOT NULL
        );

        CREATE TABLE glosses (
          book INTEGER NOT NULL,
          chapter INTEGER NOT NULL,
          verse INTEGER NOT NULL,
          idx INTEGER NOT NULL,
          ar TEXT NOT NULL,
          en TEXT NOT NULL,
          form_id INTEGER NOT NULL,
          PRIMARY KEY (book, chapter, verse, idx)
        ) WITHOUT ROWID;
        """
    )

    stats = {"verses": 0, "glosses": 0, "verses_without_glosses": 0}
    form_ids: dict[str, int] = {}

    def form_id_for(norm: str) -> int:
        if norm not in form_ids:
            form_ids[norm] = len(form_ids) + 1
            cursor.execute(
                "INSERT INTO forms VALUES (?, ?, ?)",
                (form_ids[norm], norm, light_stem(norm) if norm else ""),
            )
        return form_ids[norm]

    for book_index, book in enumerate(BOOK_ORDER):
        book_id = book_index + 1
        book_dir = os.path.join(UNIFIED_DIR, book)
        if not os.path.isdir(book_dir):
            sys.exit(f"Missing unified text for {book}")
        chapters = sorted(int(name[:-5]) for name in os.listdir(book_dir) if name.endswith(".json"))
        for chapter in chapters:
            unified = load_json(os.path.join(book_dir, f"{chapter}.json"))
            mapping_path = os.path.join(MAPPINGS_DIR, book, f"{chapter}.json")
            mapped_verses = load_json(mapping_path)["verses"] if os.path.exists(mapping_path) else {}

            for key in sorted(unified, key=verse_sort_key):
                if not key.isdigit():
                    continue
                verse = int(key)
                mapped = mapped_verses.get(key, {})
                # Prefer the mapping file's text so gloss offsets line up with what is displayed.
                arabic = mapped.get("ar") or unified[key].get("ar", "")
                english = mapped.get("en") or unified[key].get("en", "")
                cursor.execute(
                    "INSERT INTO verses VALUES (?, ?, ?, ?, ?)",
                    (book_id, chapter, verse, arabic, english),
                )
                stats["verses"] += 1

                mappings = mapped.get("mappings") or []
                if not mappings:
                    stats["verses_without_glosses"] += 1
                for idx, item in enumerate(mappings):
                    word = (item.get("ar") or "").strip()
                    gloss = (item.get("en") or "").strip()
                    if not word or not gloss:
                        continue
                    cursor.execute(
                        "INSERT INTO glosses VALUES (?, ?, ?, ?, ?, ?, ?)",
                        (book_id, chapter, verse, idx, word, gloss, form_id_for(normalize(word))),
                    )
                    stats["glosses"] += 1

    cursor.executescript(
        """
        CREATE INDEX glosses_form ON glosses (form_id);
        CREATE INDEX forms_stem ON forms (stem);
        """
    )
    connection.commit()
    return stats


def main() -> None:
    os.makedirs(os.path.dirname(OUT_DB), exist_ok=True)
    tmp_path = OUT_DB + ".tmp"
    if os.path.exists(tmp_path):
        os.remove(tmp_path)

    connection = sqlite3.connect(tmp_path)
    connection.execute("PRAGMA page_size = 4096")
    connection.execute("PRAGMA journal_mode = OFF")
    stats = build(connection)
    connection.execute("VACUUM")
    connection.close()
    os.replace(tmp_path, OUT_DB)

    digest = hashlib.sha256()
    with open(OUT_DB, "rb") as handle:
        for block in iter(lambda: handle.read(1 << 20), b""):
            digest.update(block)
    version = digest.hexdigest()[:12]
    db_bytes = os.path.getsize(OUT_DB)

    # Ship gzipped: expo-sqlite copies a bundled database before opening it, so a
    # raw .db would sit on the phone twice. mtime=0 keeps the archive reproducible.
    with open(OUT_DB, "rb") as src, open(OUT_DB_GZ + ".tmp", "wb") as raw:
        with gzip.GzipFile(filename="", mode="wb", compresslevel=9, fileobj=raw, mtime=0) as gz:
            for block in iter(lambda: src.read(1 << 20), b""):
                gz.write(block)
    os.replace(OUT_DB_GZ + ".tmp", OUT_DB_GZ)

    with open(OUT_VERSION, "w", encoding="utf-8") as handle:
        handle.write(
            "// Generated by scripts/build_bible_db.py. Do not edit.\n"
            f"export const BIBLE_DB_VERSION = '{version}';\n"
            f"export const BIBLE_DB_BYTES = {db_bytes};\n"
        )

    size_mb = db_bytes / (1024 * 1024)
    gz_mb = os.path.getsize(OUT_DB_GZ) / (1024 * 1024)
    print(f"Wrote {OUT_DB} ({size_mb:.1f} MB) and {OUT_DB_GZ} ({gz_mb:.1f} MB), version {version}")
    print(json.dumps(stats))


if __name__ == "__main__":
    main()

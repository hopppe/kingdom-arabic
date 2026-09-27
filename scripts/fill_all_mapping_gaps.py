#!/usr/bin/env python3
"""
Fill all blank/empty word mappings across the entire Bible using Gemma.

This script finds mappings with empty English translations and uses
Ollama/Gemma to generate translations for them.

Usage:
    python3 fill_all_mapping_gaps.py --all           # Process all 66 books
    python3 fill_all_mapping_gaps.py MAT MRK         # Process specific books
    python3 fill_all_mapping_gaps.py --scan          # Just scan and report empty mappings
"""

import json
import re
import sys
import requests
from pathlib import Path
from multiprocessing import Pool

# ============================================================================
# CONFIGURATION
# ============================================================================

# All 66 Bible books
ALL_BOOKS = [
    # Old Testament (39 books)
    "GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA",
    "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO",
    "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO",
    "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL",
    # New Testament (27 books)
    "MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO",
    "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI",
    "TIT", "PHM", "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"
]

MAPPINGS_DIR = Path("bible-translations/mappings")
UNIFIED_DIR = Path("bible-translations/unified")

# Ollama configuration
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma4:12b"
NUM_WORKERS = 4

# Chunk size for batch translation
CHUNK_SIZE = 10

# ============================================================================
# CORE TRANSLATION FUNCTIONS (from process_old_testament_mappings.py)
# ============================================================================

def translate_chunk_numbered(arabic_words, full_verse_ar, full_verse_en, chunk_idx):
    """
    Translate a chunk of words using NUMBERED format for alignment.
    This prevents skipping and maintains order.
    """
    num_words = len(arabic_words)
    word_list = "\n".join([f"{i+1}. {word}" for i, word in enumerate(arabic_words)])

    prompt = f"""Translate each numbered Arabic word to English using verse context.

Arabic verse: {full_verse_ar}
English verse: {full_verse_en}

Words to translate (chunk {chunk_idx+1}):
{word_list}

CRITICAL: Return EXACTLY {num_words} translations, one per line.
Format: NUMBER. TRANSLATION

Your {num_words} translations:"""

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False, "think": False,
            "options": {
                "temperature": 0.1,
                "num_predict": 400,
                "num_ctx": 4096
            }
        }, timeout=180)

        result = response.json().get("response", "").strip()

        # Parse numbered responses
        translations = {}
        for line in result.split('\n'):
            line = line.strip()
            match = re.match(r'^(\d+)[.\):\s]+(.+)$', line)
            if match:
                num = int(match.group(1))
                trans = match.group(2).strip().strip('"\'.,!?')
                # Remove common prefixes
                trans = re.sub(r'^(TRANSLATION:\s*|Translation:\s*)', '', trans, flags=re.IGNORECASE).strip()
                if 1 <= num <= num_words and trans and len(trans) > 0:
                    translations[num] = trans

        # Build result mapping word -> translation
        result_map = {}
        for i, word in enumerate(arabic_words):
            result_map[word] = translations.get(i + 1)

        return result_map
    except Exception as e:
        print(f"      Error translating chunk: {e}")
        return {}


def find_empty_mappings(verse_data):
    """
    Find all mappings with empty English translations in a verse.
    Returns list of mapping indices and their Arabic words.
    """
    empty_mappings = []

    for idx, mapping in enumerate(verse_data.get('mappings', [])):
        en = mapping.get('en', '').strip()
        ar = mapping.get('ar', '').strip()

        # Check if English is empty or blank
        if not en and ar:
            empty_mappings.append((idx, ar))

    return empty_mappings


def fill_empty_mappings(verse_data):
    """
    Fill all empty mappings in a verse using Gemma.
    Returns number of mappings filled.
    """
    empty_mappings = find_empty_mappings(verse_data)

    if not empty_mappings:
        return 0

    ar_text = verse_data['ar']
    en_text = verse_data['en']
    mappings = verse_data.get('mappings', [])

    filled_count = 0

    # Process in chunks
    for i in range(0, len(empty_mappings), CHUNK_SIZE):
        chunk = empty_mappings[i:i+CHUNK_SIZE]

        # Extract Arabic words for this chunk
        arabic_words = [ar_word for _, ar_word in chunk]

        # Translate using Gemma
        translations = translate_chunk_numbered(arabic_words, ar_text, en_text, i // CHUNK_SIZE)

        # Update mappings with translations
        for (mapping_idx, ar_word), translation in zip(chunk, arabic_words):
            if ar_word in translations and translations[ar_word]:
                mappings[mapping_idx]['en'] = translations[ar_word]
                filled_count += 1

    return filled_count


# ============================================================================
# PARALLEL PROCESSING
# ============================================================================

def process_chapter_worker(args):
    """Worker function to process a single chapter."""
    book, chapter, scan_only = args
    mappings_file = MAPPINGS_DIR / book / f"{chapter}.json"

    if not mappings_file.exists():
        return (book, chapter, 0, 0)

    try:
        with open(mappings_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        total_empty = 0
        filled_empty = 0

        for verse_num in sorted(data.get('verses', {}).keys(), key=int):
            verse_data = data['verses'][verse_num]
            empty_mappings = find_empty_mappings(verse_data)
            total_empty += len(empty_mappings)

            if not scan_only and empty_mappings:
                filled = fill_empty_mappings(verse_data)
                filled_empty += filled

        # Save if modified
        if filled_empty > 0 and not scan_only:
            with open(mappings_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

        return (book, chapter, total_empty, filled_empty)

    except Exception as e:
        print(f"  Error in {book} {chapter}: {e}")
        return (book, chapter, 0, 0)


def process_book(book, scan_only=False):
    """Process all chapters in a book."""
    book_dir = MAPPINGS_DIR / book

    if not book_dir.exists():
        return 0, 0

    chapters_to_process = []
    for chapter_file in sorted(book_dir.glob("*.json"), key=lambda x: int(x.stem)):
        chapter = chapter_file.stem
        chapters_to_process.append((book, chapter, scan_only))

    total_empty = 0
    total_filled = 0

    # Process chapters in parallel
    with Pool(processes=NUM_WORKERS) as pool:
        results = pool.map(process_chapter_worker, chapters_to_process)

        for book_name, chapter, empty, filled in results:
            total_empty += empty
            total_filled += filled

            if empty > 0:
                if scan_only:
                    print(f"  {book_name} {chapter:3s}: {empty} empty mappings found")
                else:
                    print(f"  {book_name} {chapter:3s}: {filled}/{empty} empty mappings filled")

    return total_empty, total_filled


# ============================================================================
# MAIN
# ============================================================================

def main():
    if "--help" in sys.argv or "-h" in sys.argv:
        print(__doc__)
        sys.exit(0)

    scan_only = "--scan" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith('--')]

    # Determine which books to process
    if "--all" in sys.argv or not args:
        books = ALL_BOOKS
    else:
        books = [b.upper() for b in args if b.upper() in ALL_BOOKS]
        if not books:
            print("Error: No valid books specified")
            print(f"Valid books: {', '.join(ALL_BOOKS)}")
            sys.exit(1)

    print(f"{'='*70}")
    if scan_only:
        print(f"SCANNING {len(books)} books for empty mappings")
    else:
        print(f"FILLING EMPTY MAPPINGS in {len(books)} books using Gemma")
        print(f"Model: {MODEL}")
        print(f"Workers: {NUM_WORKERS}")
    print(f"{'='*70}\n")

    grand_total_empty = 0
    grand_total_filled = 0

    for book in books:
        print(f"\n{book}:")
        empty, filled = process_book(book, scan_only)

        if empty > 0:
            grand_total_empty += empty
            grand_total_filled += filled

            if scan_only:
                print(f"  Total: {empty} empty mappings found")
            else:
                pct = (filled / empty * 100) if empty > 0 else 0
                print(f"  Total: {filled}/{empty} empty mappings filled ({pct:.1f}%)")

    print(f"\n{'='*70}")
    print("SUMMARY:")
    print(f"{'='*70}")

    if scan_only:
        print(f"Total empty mappings found: {grand_total_empty}")
    else:
        if grand_total_empty > 0:
            pct = (grand_total_filled / grand_total_empty * 100)
            print(f"Total empty mappings filled: {grand_total_filled}/{grand_total_empty} ({pct:.1f}%)")
        else:
            print("No empty mappings found!")

    print(f"{'='*70}")


if __name__ == "__main__":
    main()

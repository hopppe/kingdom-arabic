#!/usr/bin/env python3
"""
Comprehensive Old Testament Mapping Processor

This script orchestrates the complete pipeline for creating and validating
Bible word mappings for the entire Old Testament (39 books).

PHASE-BASED ARCHITECTURE for parallel processing:
  Phase 1: Create all missing mappings (4 parallel workers)
  Phase 2: Fix missing word mappings (sequential)
  Phase 3: Fix "translate" placeholders (sequential)
  Phase 4: Quality checks - second-to-last word (sequential)

Uses direct Ollama GPU API for maximum speed.
"""

import json
import re
import requests
import sys
import threading
import termios
import tty
import select
import time
from pathlib import Path
from multiprocessing import Pool, cpu_count
from functools import partial

# ============================================================================
# CONFIGURATION
# ============================================================================

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma3:12b"
NUM_WORKERS = 4  # Parallel workers for Phase 1

# Old Testament books (39 books)
OT_BOOKS = [
    # Torah (5 books)
    "GEN", "EXO", "LEV", "NUM", "DEU",
    # Historical (12 books)
    "JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI",
    "1CH", "2CH", "EZR", "NEH", "EST",
    # Wisdom/Poetry (5 books)
    "JOB", "PSA", "PRO", "ECC", "SNG",
    # Major Prophets (5 books)
    "ISA", "JER", "LAM", "EZK", "DAN",
    # Minor Prophets (12 books)
    "HOS", "JOL", "AMO", "OBA", "JON", "MIC",
    "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL"
]

BOOK_CHAPTERS = {
    "GEN": 50, "EXO": 40, "LEV": 27, "NUM": 36, "DEU": 34,
    "JOS": 24, "JDG": 21, "RUT": 4, "1SA": 31, "2SA": 24,
    "1KI": 22, "2KI": 25, "1CH": 29, "2CH": 36, "EZR": 10,
    "NEH": 13, "EST": 10, "JOB": 42, "PSA": 150, "PRO": 31,
    "ECC": 12, "SNG": 8, "ISA": 66, "JER": 52, "LAM": 5,
    "EZK": 48, "DAN": 12, "HOS": 14, "JOL": 3, "AMO": 9,
    "OBA": 1, "JON": 4, "MIC": 7, "NAM": 3, "HAB": 3,
    "ZEP": 3, "HAG": 2, "ZEC": 14, "MAL": 4
}

UNIFIED_DIR = Path("bible-translations/unified")
MAPPINGS_DIR = Path("bible-maps-word-gemma3/mappings")

# Global pause state
paused = False
pause_lock = threading.Lock()

# ============================================================================
# KEYBOARD CONTROLS
# ============================================================================

def keyboard_listener():
    """Listen for p (pause), r (resume), q (quit) keypresses."""
    global paused
    old_settings = termios.tcgetattr(sys.stdin)
    try:
        tty.setcbreak(sys.stdin.fileno())
        while True:
            if select.select([sys.stdin], [], [], 0.1)[0]:
                key = sys.stdin.read(1).lower()
                with pause_lock:
                    if key == 'p' and not paused:
                        paused = True
                        print("\n⏸️  PAUSED - Press 'r' to resume...")
                    elif key == 'r' and paused:
                        paused = False
                        print("▶️  RESUMED\n")
                    elif key == 'q':
                        print("\n🛑 Quitting...")
                        sys.exit(0)
    except:
        pass
    finally:
        termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)


def check_pause():
    """Check if paused and wait until resumed."""
    global paused
    while True:
        with pause_lock:
            if not paused:
                return
        time.sleep(0.2)


# ============================================================================
# CORE MAPPING FUNCTIONS
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
            "stream": False,
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


def create_verse_mappings(arabic_verse, english_verse):
    """
    Create mappings for a verse using numbered chunked approach.
    Splits verses >20 words into even chunks for better accuracy.
    """
    # Extract words with positions
    words_with_pos = []
    current_pos = 0
    for token in re.split(r'(\s+)', arabic_verse):
        if token.strip():
            start = current_pos
            end = current_pos + len(token)
            # Filter: only words >= 3 chars
            if len(token) >= 3:
                words_with_pos.append((token, start, end))
        current_pos += len(token)

    words_only = [w for w, s, e in words_with_pos]
    num_words = len(words_only)

    if num_words == 0:
        return None

    # Chunk if >20 words, split evenly
    MAX_CHUNK = 20
    if num_words > MAX_CHUNK:
        num_chunks = (num_words + MAX_CHUNK - 1) // MAX_CHUNK
        chunk_size = (num_words + num_chunks - 1) // num_chunks
        chunks = []
        for i in range(0, num_words, chunk_size):
            chunks.append(words_only[i:i + chunk_size])
    else:
        chunks = [words_only]

    # Translate all chunks
    all_translations = {}
    for i, chunk in enumerate(chunks):
        chunk_trans = translate_chunk_numbered(chunk, arabic_verse, english_verse, i)
        all_translations.update(chunk_trans)

    # Build final mappings with positions
    mappings = []
    for word, start, end in words_with_pos:
        translation = all_translations.get(word)
        if translation:
            mappings.append({
                "ar": word,
                "en": translation,
                "start": start,
                "end": end
            })

    return mappings if mappings else None


# ============================================================================
# PHASE 1: CREATE MISSING MAPPINGS (PARALLEL)
# ============================================================================

def create_chapter_mappings_worker(args):
    """
    Worker function to create mappings for a single chapter.
    Designed to run in parallel.
    """
    book, chapter = args
    unified_file = UNIFIED_DIR / book / f"{chapter}.json"
    mappings_file = MAPPINGS_DIR / book / f"{chapter}.json"

    if not unified_file.exists():
        return (book, chapter, "ERROR", "Unified file missing")

    if mappings_file.exists():
        return (book, chapter, "SKIP", "Already exists")

    try:
        # Load unified chapter
        with open(unified_file, 'r') as f:
            verses = json.load(f)

        # Create mappings for each verse
        result_verses = {}
        verse_count = 0

        for verse_num in sorted(verses.keys(), key=int):
            verse = verses[verse_num]
            ar_text = verse['ar']
            en_text = verse['en']

            mappings = create_verse_mappings(ar_text, en_text)

            if mappings:
                result_verses[verse_num] = {
                    "ar": ar_text,
                    "en": en_text,
                    "mappings": mappings
                }
                verse_count += 1

        # Save chapter
        if result_verses:
            MAPPINGS_DIR.mkdir(parents=True, exist_ok=True)
            (MAPPINGS_DIR / book).mkdir(parents=True, exist_ok=True)

            with open(mappings_file, 'w') as f:
                json.dump({
                    "book": book,
                    "chapter": chapter,
                    "verses": result_verses
                }, f, ensure_ascii=False, indent=2)

            return (book, chapter, "SUCCESS", f"{verse_count} verses")
        else:
            return (book, chapter, "ERROR", "No mappings created")

    except Exception as e:
        return (book, chapter, "ERROR", str(e))


def phase1_create_all_mappings(books_to_process):
    """
    Phase 1: Create all missing chapter mappings using parallel workers.
    """
    print("\n" + "="*70)
    print("PHASE 1: Creating Missing Mappings (4 parallel workers)")
    print("="*70)

    # Build list of (book, chapter) tuples that need creation
    chapters_to_create = []
    for book in books_to_process:
        if book not in BOOK_CHAPTERS:
            continue
        total_chapters = BOOK_CHAPTERS[book]
        for chapter in range(1, total_chapters + 1):
            mappings_file = MAPPINGS_DIR / book / f"{chapter}.json"
            if not mappings_file.exists():
                chapters_to_create.append((book, chapter))

    if not chapters_to_create:
        print("✓ All chapters already exist, skipping Phase 1")
        return

    print(f"Creating mappings for {len(chapters_to_create)} chapters...\n")

    # Process in parallel
    with Pool(processes=NUM_WORKERS) as pool:
        results = []
        for i, result in enumerate(pool.imap_unordered(create_chapter_mappings_worker, chapters_to_create)):
            book, chapter, status, message = result

            # Progress indicator
            progress = (i + 1) / len(chapters_to_create) * 100

            if status == "SUCCESS":
                print(f"[{progress:5.1f}%] ✓ {book} {chapter:3d} - {message}")
            elif status == "ERROR":
                print(f"[{progress:5.1f}%] ✗ {book} {chapter:3d} - {message}")
            elif status == "SKIP":
                print(f"[{progress:5.1f}%] → {book} {chapter:3d} - {message}")

            results.append(result)

    # Summary
    success = sum(1 for _, _, s, _ in results if s == "SUCCESS")
    errors = sum(1 for _, _, s, _ in results if s == "ERROR")
    print(f"\nPhase 1 Complete: {success} created, {errors} errors")


# ============================================================================
# PHASE 2: FIX MISSING WORD MAPPINGS
# ============================================================================

def find_missing_words(verse_data):
    """Find Arabic words that are missing from mappings."""
    ar_text = verse_data['ar']
    mappings = sorted(verse_data.get('mappings', []), key=lambda x: x['start'])

    # Extract all mapped positions
    mapped_ranges = set()
    for m in mappings:
        for pos in range(m['start'], m['end']):
            mapped_ranges.add(pos)

    # Find unmapped words (>=3 chars)
    missing = []
    current_pos = 0
    for token in re.split(r'(\s+)', ar_text):
        if token.strip():
            start = current_pos
            end = current_pos + len(token)

            is_mapped = any(pos in mapped_ranges for pos in range(start, end))

            if not is_mapped and len(token) >= 3:
                missing.append((token, start, end))

        current_pos += len(token)

    return missing


def fix_single_missing_word(word, verse_data):
    """Translate a single missing word using context."""
    prompt = f"""Translate this Arabic word to English using verse context.

Arabic verse: {verse_data['ar']}
English verse: {verse_data['en']}

Arabic word: {word}

Reply with ONLY the English translation (1-3 words):"""

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0, "num_predict": 50}
        }, timeout=60)

        translation = response.json().get("response", "").strip()
        translation = translation.strip('"\'.,!?')
        return translation if translation else None
    except:
        return None


def fix_missing_mappings_in_verse(verse_data):
    """Fix missing word mappings in a verse."""
    missing = find_missing_words(verse_data)

    if not missing:
        return 0

    if len(missing) == 1:
        # Single word: just translate and insert
        word, start, end = missing[0]
        translation = fix_single_missing_word(word, verse_data)

        if translation:
            verse_data['mappings'].append({
                "ar": word,
                "en": translation,
                "start": start,
                "end": end
            })
            verse_data['mappings'].sort(key=lambda x: x['start'])
            return 1
        return 0

    # Multiple missing: regenerate entire verse
    new_mappings = create_verse_mappings(verse_data['ar'], verse_data['en'])

    if new_mappings:
        verse_data['mappings'] = new_mappings
        return len(missing)

    return 0


def fix_missing_words_worker(args):
    """Worker function for Phase 2: Fix missing words in a chapter."""
    book, chapter = args
    mappings_file = MAPPINGS_DIR / book / f"{chapter}.json"

    if not mappings_file.exists():
        return (book, chapter, 0)

    try:
        with open(mappings_file, 'r') as f:
            data = json.load(f)

        chapter_fixed = 0
        for verse_num in sorted(data.get('verses', {}).keys(), key=int):
            verse_data = data['verses'][verse_num]
            fixed = fix_missing_mappings_in_verse(verse_data)
            chapter_fixed += fixed

        if chapter_fixed > 0:
            with open(mappings_file, 'w') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

        return (book, chapter, chapter_fixed)
    except Exception as e:
        print(f"  Error in {book} {chapter}: {e}")
        return (book, chapter, 0)


def phase2_fix_missing_words(books_to_process):
    """Phase 2: Fix missing word mappings in all chapters (parallel)."""
    print("\n" + "="*70)
    print("PHASE 2: Fixing Missing Word Mappings (4 parallel workers)")
    print("="*70)

    # Build list of chapters to process
    chapters_to_process = []
    for book in books_to_process:
        if book not in BOOK_CHAPTERS:
            continue
        total_chapters = BOOK_CHAPTERS[book]
        for chapter in range(1, total_chapters + 1):
            mappings_file = MAPPINGS_DIR / book / f"{chapter}.json"
            if mappings_file.exists():
                chapters_to_process.append((book, chapter))

    if not chapters_to_process:
        print("✓ No chapters to process")
        return

    print(f"Processing {len(chapters_to_process)} chapters...\n")

    total_fixed = 0
    with Pool(processes=NUM_WORKERS) as pool:
        for i, (book, chapter, fixed) in enumerate(pool.imap_unordered(fix_missing_words_worker, chapters_to_process)):
            progress = (i + 1) / len(chapters_to_process) * 100
            if fixed > 0:
                print(f"[{progress:5.1f}%] ✓ {book} {chapter:3d} - Fixed {fixed} words")
                total_fixed += fixed

    print(f"\nPhase 2 Complete: {total_fixed} missing words fixed")


# ============================================================================
# PHASE 3: FIX PLACEHOLDERS
# ============================================================================

def fix_placeholders_worker(args):
    """Worker function for Phase 3: Fix placeholders in a chapter."""
    book, chapter = args
    mappings_file = MAPPINGS_DIR / book / f"{chapter}.json"

    if not mappings_file.exists():
        return (book, chapter, 0)

    try:
        with open(mappings_file, 'r') as f:
            data = json.load(f)

        chapter_fixed = 0
        for verse_num in sorted(data.get('verses', {}).keys(), key=int):
            verse_data = data['verses'][verse_num]
            has_placeholder = False

            for m in verse_data.get('mappings', []):
                en = m.get('en', '').lower()
                if 'translate' in en or (en.startswith('[') and en.endswith(']')):
                    has_placeholder = True
                    break

            if has_placeholder:
                new_mappings = create_verse_mappings(verse_data['ar'], verse_data['en'])
                if new_mappings:
                    verse_data['mappings'] = new_mappings
                    chapter_fixed += 1

        if chapter_fixed > 0:
            with open(mappings_file, 'w') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

        return (book, chapter, chapter_fixed)
    except Exception as e:
        print(f"  Error in {book} {chapter}: {e}")
        return (book, chapter, 0)


def phase3_fix_placeholders(books_to_process):
    """Phase 3: Check for and fix 'translate' or '[...]' placeholders (parallel)."""
    print("\n" + "="*70)
    print("PHASE 3: Fixing Placeholder Translations (4 parallel workers)")
    print("="*70)

    # Build list of chapters to process
    chapters_to_process = []
    for book in books_to_process:
        if book not in BOOK_CHAPTERS:
            continue
        total_chapters = BOOK_CHAPTERS[book]
        for chapter in range(1, total_chapters + 1):
            mappings_file = MAPPINGS_DIR / book / f"{chapter}.json"
            if mappings_file.exists():
                chapters_to_process.append((book, chapter))

    if not chapters_to_process:
        print("✓ No chapters to process")
        return

    print(f"Processing {len(chapters_to_process)} chapters...\n")

    total_fixed = 0
    with Pool(processes=NUM_WORKERS) as pool:
        for i, (book, chapter, fixed) in enumerate(pool.imap_unordered(fix_placeholders_worker, chapters_to_process)):
            progress = (i + 1) / len(chapters_to_process) * 100
            if fixed > 0:
                print(f"[{progress:5.1f}%] ✓ {book} {chapter:3d} - Fixed {fixed} placeholder verses")
                total_fixed += fixed

    print(f"\nPhase 3 Complete: {total_fixed} placeholder verses fixed")


# ============================================================================
# PHASE 4: QUALITY CHECKS
# ============================================================================

def check_mapping_with_ollama(arabic_word, english_translation):
    """Ask Ollama if the second-to-last mapping is correct."""
    prompt = f"""You are validating Arabic-English word mappings for a Bible study app.

Does this Arabic word POSSIBLY translate to this English word/phrase? Be lenient - accept if it's a valid translation, synonym, or contextually appropriate meaning.

Arabic: {arabic_word}
English: {english_translation}

Answer ONLY "YES" or "NO". YES if the translation is valid or close. NO only if it's clearly wrong."""

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0}
        }, timeout=60)

        result = response.json().get("response", "").strip().upper()
        return "YES" in result
    except Exception as e:
        return None


def validate_and_fix_verse(verse_data):
    """Validate second-to-last word mapping and regenerate if invalid."""
    mappings = verse_data.get('mappings', [])

    if len(mappings) < 3:
        return False

    second_last = mappings[-2]
    ar = second_last['ar']
    en = second_last['en']

    is_valid = check_mapping_with_ollama(ar, en)

    if is_valid is False:
        new_mappings = create_verse_mappings(verse_data['ar'], verse_data['en'])
        if new_mappings:
            verse_data['mappings'] = new_mappings
            return True

    return False


def quality_check_worker(args):
    """Worker function for Phase 4: Quality checks for a chapter."""
    book, chapter = args
    mappings_file = MAPPINGS_DIR / book / f"{chapter}.json"

    if not mappings_file.exists():
        return (book, chapter, 0)

    try:
        with open(mappings_file, 'r') as f:
            data = json.load(f)

        chapter_fixed = 0
        for verse_num in sorted(data.get('verses', {}).keys(), key=int):
            verse_data = data['verses'][verse_num]
            if validate_and_fix_verse(verse_data):
                chapter_fixed += 1

        if chapter_fixed > 0:
            with open(mappings_file, 'w') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

        return (book, chapter, chapter_fixed)
    except Exception as e:
        print(f"  Error in {book} {chapter}: {e}")
        return (book, chapter, 0)


def phase4_quality_checks(books_to_process):
    """Phase 4: Run quality checks on all chapters (parallel)."""
    print("\n" + "="*70)
    print("PHASE 4: Quality Checks - Second-to-Last Word (4 parallel workers)")
    print("="*70)

    # Build list of chapters to process
    chapters_to_process = []
    for book in books_to_process:
        if book not in BOOK_CHAPTERS:
            continue
        total_chapters = BOOK_CHAPTERS[book]
        for chapter in range(1, total_chapters + 1):
            mappings_file = MAPPINGS_DIR / book / f"{chapter}.json"
            if mappings_file.exists():
                chapters_to_process.append((book, chapter))

    if not chapters_to_process:
        print("✓ No chapters to process")
        return

    print(f"Processing {len(chapters_to_process)} chapters...\n")

    total_fixed = 0
    with Pool(processes=NUM_WORKERS) as pool:
        for i, (book, chapter, fixed) in enumerate(pool.imap_unordered(quality_check_worker, chapters_to_process)):
            progress = (i + 1) / len(chapters_to_process) * 100
            if fixed > 0:
                print(f"[{progress:5.1f}%] ✓ {book} {chapter:3d} - Fixed {fixed} quality issues")
                total_fixed += fixed

    print(f"\nPhase 4 Complete: {total_fixed} quality issues fixed")


# ============================================================================
# MAIN ORCHESTRATION
# ============================================================================

def main():
    """Main entry point - runs all 4 phases sequentially."""
    # Start keyboard listener
    listener_thread = threading.Thread(target=keyboard_listener, daemon=True)
    listener_thread.start()
    print("🎮 Controls: 'p' = pause, 'r' = resume, 'q' = quit\n")

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python process_old_testament_mappings.py --all     # Process all OT books")
        print("  python process_old_testament_mappings.py GEN       # Process single book")
        print("  python process_old_testament_mappings.py GEN EXO   # Process multiple books")
        sys.exit(1)

    # Determine which books to process
    if sys.argv[1] == "--all":
        books_to_process = OT_BOOKS
        print(f"Processing entire Old Testament ({len(OT_BOOKS)} books)")
    else:
        books_to_process = [b.upper() for b in sys.argv[1:]]
        print(f"Processing {len(books_to_process)} books: {', '.join(books_to_process)}")

    start_time = time.time()

    # Run all 4 phases
    phase1_create_all_mappings(books_to_process)
    phase2_fix_missing_words(books_to_process)
    phase3_fix_placeholders(books_to_process)
    phase4_quality_checks(books_to_process)

    # Final summary
    elapsed = time.time() - start_time
    print("\n" + "="*70)
    print("✅ ALL PHASES COMPLETE!")
    print(f"Total time: {elapsed/3600:.2f} hours ({elapsed/60:.1f} minutes)")
    print("="*70)


if __name__ == "__main__":
    main()

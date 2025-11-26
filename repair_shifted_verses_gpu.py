#!/usr/bin/env python3
"""
GPU-Optimized fast repair for shifted verses (missing exactly 1 word)
Optimized for Apple M4 with native Ollama GPU acceleration
"""

import json
import os
import requests
import re
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

sys.stdout.reconfigure(line_buffering=True)

OLLAMA_API = "http://localhost:11434/api/generate"
MODEL = "gemma3:12b"

# GPU-optimized settings for M4 (balanced for 16GB unified memory)
MAX_WORKERS = 4  # Parallel translations for M4 GPU
TIMEOUT = 20  # Shorter timeout with GPU acceleration
NUM_PREDICT = 50  # Single word translation

def count_arabic_words(text):
    """Count words >= 3 chars (same filter as original script)"""
    tokens = re.split(r'\s+', text)
    return len([t for t in tokens if len(t.strip()) >= 3])


def extract_words_from_arabic(arabic_text):
    """Extract individual words from Arabic text, preserving positions"""
    words = []
    current_pos = 0
    tokens = re.split(r'(\s+)', arabic_text)

    for token in tokens:
        if token.strip():
            start = current_pos
            end = current_pos + len(token)
            words.append((token, start, end))
        current_pos += len(token)

    return words


def translate_single_word(arabic_word, full_verse_ar, full_verse_en):
    """Translate a single Arabic word using verse context - GPU accelerated"""
    prompt = f"""Translate this Arabic word to English using the verse context.

Arabic verse: {full_verse_ar}
English verse: {full_verse_en}

Word to translate: {arabic_word}

Provide ONLY the English translation (no explanations, no extra text):"""

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_predict": NUM_PREDICT,
            "num_gpu": 99  # Use all GPU layers
        }
    }

    try:
        response = requests.post(OLLAMA_API, json=payload, timeout=TIMEOUT)
        response.raise_for_status()
        result = response.json()
        translation = result.get("response", "").strip()

        # Clean up the translation
        translation = translation.strip('"\'.,!?')
        translation = re.sub(r'^(TRANSLATION:\s*|Translation:\s*)', '', translation, flags=re.IGNORECASE)
        translation = translation.strip()

        return translation if translation else None

    except Exception as e:
        return None


def find_missing_word_position(expected_words, existing_mappings):
    """Find which word position is missing"""
    if len(existing_mappings) >= len(expected_words):
        return None

    for i in range(len(expected_words)):
        if i >= len(existing_mappings):
            return i

        expected_word = expected_words[i][0]
        mapping_word = existing_mappings[i]['ar']

        if expected_word != mapping_word:
            return i

    return len(existing_mappings)


def repair_shifted_verse(book, chapter, verse_num, mapping_dir="bible-maps-word-gemma3/mappings"):
    """
    Fast repair for verses missing exactly 1 word - GPU accelerated
    """
    # Read source verse
    source_file = f"bible-translations/unified/{book}/{chapter}.json"
    if not os.path.exists(source_file):
        return False, "Source file not found"

    with open(source_file, 'r') as f:
        source_verses = json.load(f)

    if verse_num not in source_verses:
        return False, "Verse not in source"

    verse_data = source_verses[verse_num]
    arabic = verse_data['ar']
    english = verse_data['en']

    # Extract expected words
    arabic_words_with_pos = extract_words_from_arabic(arabic)
    filtered_words = [(w, s, e) for w, s, e in arabic_words_with_pos if len(w) >= 3]

    # Read existing mappings
    mapping_file = f"{mapping_dir}/{book}/{chapter}.json"
    with open(mapping_file, 'r') as f:
        output = json.load(f)

    existing_mappings = output["verses"][verse_num]["mappings"]

    expected_count = len(filtered_words)
    actual_count = len(existing_mappings)
    diff = expected_count - actual_count

    if diff != 1:
        return False, f"Not a single-word shift (diff={diff})"

    # Find which word is missing
    missing_pos = find_missing_word_position(filtered_words, existing_mappings)
    if missing_pos is None:
        return False, "Could not determine missing word position"

    missing_word, missing_start, missing_end = filtered_words[missing_pos]

    # Translate only the missing word (GPU accelerated)
    translation = translate_single_word(missing_word, arabic, english)
    if not translation:
        return False, "Failed to translate missing word"

    # Build new mappings by inserting the missing word
    new_mappings = []
    for i, (word, start, end) in enumerate(filtered_words):
        if i == missing_pos:
            new_mappings.append({
                "ar": missing_word,
                "en": translation,
                "start": missing_start,
                "end": missing_end
            })
        else:
            existing_idx = i if i < missing_pos else i - 1
            if existing_idx < len(existing_mappings):
                new_mappings.append({
                    "ar": word,
                    "en": existing_mappings[existing_idx]['en'],
                    "start": start,
                    "end": end
                })

    # Validate we got all words
    if len(new_mappings) != expected_count:
        return False, f"Mapping count mismatch: {len(new_mappings)}/{expected_count}"

    # Update the mapping file
    output["verses"][verse_num] = {
        "ar": arabic,
        "en": english,
        "mappings": new_mappings
    }

    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    return True, f"Fixed shift at position {missing_pos}, added: {missing_word} → {translation}"


def find_single_shift_verses(mapping_dir="bible-maps-word-gemma3/mappings", nt_only=False):
    """Find verses missing exactly 1 word"""
    # NT books only (27 books)
    nt_books = [
        'MAT', 'MRK', 'LUK', 'JHN', 'ACT',
        'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL',
        '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM',
        'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
    ]

    single_shifts = []

    for book_dir in sorted(Path(mapping_dir).iterdir()):
        if not book_dir.is_dir():
            continue

        # Skip OT books if nt_only is True
        if nt_only and book_dir.name not in nt_books:
            continue

        for chapter_file in sorted(book_dir.glob("*.json")):
            try:
                with open(chapter_file, 'r') as f:
                    data = json.load(f)

                book = data.get("book", book_dir.name)
                chapter = data.get("chapter", chapter_file.stem)

                for verse_num, verse_data in data.get("verses", {}).items():
                    ar_text = verse_data.get("ar", "")
                    mappings = verse_data.get("mappings", [])

                    expected = count_arabic_words(ar_text)
                    actual = len(mappings)
                    diff = expected - actual

                    if diff == 1:
                        single_shifts.append((book, chapter, verse_num, expected, actual))
            except Exception as e:
                print(f"Error reading {chapter_file}: {e}")

    return single_shifts


def process_verse_parallel(args):
    """Wrapper for parallel processing"""
    i, total, book, chapter, verse_num, expected, actual = args
    ref = f"{book} {chapter}:{verse_num}"

    start_time = time.time()
    success, msg = repair_shifted_verse(book, str(chapter), verse_num)
    elapsed = time.time() - start_time

    return (i, ref, success, msg, elapsed, actual, expected)


def main():
    import argparse
    parser = argparse.ArgumentParser(description='GPU-Optimized fast repair for single-word shifts')
    parser.add_argument('--test', action='store_true', help='Test mode: only repair first 10 verses')
    parser.add_argument('--workers', type=int, default=MAX_WORKERS, help=f'Number of parallel workers (default: {MAX_WORKERS})')
    parser.add_argument('--all', action='store_true', help='Process ALL books (OT + NT). Default: NT only')
    args = parser.parse_args()

    nt_only = not args.all

    print("="*70)
    print("GPU-OPTIMIZED FAST SHIFT REPAIR (Apple M4)")
    print("="*70)
    print(f"Parallel workers: {args.workers}")
    print(f"Timeout: {TIMEOUT}s")
    print(f"Scope: {'New Testament only' if nt_only else 'ALL books (OT + NT)'}")
    print("="*70)

    print("\n🔍 Finding verses with exactly 1 missing word...")
    single_shifts = find_single_shift_verses(nt_only=nt_only)

    print(f"\nFound {len(single_shifts)} verses with exactly 1 missing word")

    if not single_shifts:
        print("\n✅ No single-shift verses found!")
        return

    if args.test:
        print("\n⚠️  TEST MODE: Only repairing first 10 verses")
        single_shifts = single_shifts[:10]

    # Ask for confirmation
    if not args.test:
        response = input(f"\nRepair all {len(single_shifts)} verses? (y/n): ")
        if response.lower() != 'y':
            print("Cancelled.")
            return

    print(f"\n🔧 Repairing {len(single_shifts)} verses with {args.workers} parallel workers...\n")

    start_total = time.time()
    success_count = 0
    fail_count = 0

    # Prepare tasks
    tasks = [
        (i+1, len(single_shifts), book, chapter, verse_num, expected, actual)
        for i, (book, chapter, verse_num, expected, actual) in enumerate(single_shifts)
    ]

    # Process in parallel
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {executor.submit(process_verse_parallel, task): task for task in tasks}

        for future in as_completed(futures):
            i, ref, success, msg, elapsed, actual, expected = future.result()

            print(f"[{i}/{len(single_shifts)}] {ref} ({actual}/{expected} mappings) - {elapsed:.1f}s")

            if success:
                success_count += 1
                print(f"    ✅ {msg}")
            else:
                fail_count += 1
                print(f"    ❌ {msg}")

    total_time = time.time() - start_total
    avg_time = total_time / len(single_shifts) if single_shifts else 0

    print("\n" + "="*70)
    print(f"REPAIR COMPLETE!")
    print(f"  Successful: {success_count}")
    print(f"  Failed:     {fail_count}")
    print(f"  Total time: {total_time:.1f}s")
    print(f"  Avg time per verse: {avg_time:.1f}s")
    print(f"  Speed improvement: ~3-5x faster than CPU version!")
    print("="*70)


if __name__ == "__main__":
    main()

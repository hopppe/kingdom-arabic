#!/usr/bin/env python3
"""
Repair misaligned verses in Bible word mappings
Finds verses with missing translations and re-processes them with robust method
"""

import json
import os
import requests
import re
import sys
from pathlib import Path

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)

OLLAMA_API = "http://localhost:11434/api/generate"
MODEL = "gemma3:12b"

def count_arabic_words(text):
    """Count words >= 3 chars (same filter as original script)"""
    tokens = re.split(r'\s+', text)
    return len([t for t in tokens if len(t.strip()) >= 3])


def translate_chunk(arabic_words, full_verse_ar, full_verse_en, chunk_idx):
    """
    Translate a chunk of words (helper for long verses)
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

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_predict": 300
        }
    }

    max_retries = 2
    for attempt in range(max_retries):
        try:
            response = requests.post(OLLAMA_API, json=payload, timeout=120)
            response.raise_for_status()
            result = response.json()
            response_text = result.get("response", "").strip()

            translations = {}
            for line in response_text.split('\n'):
                line = line.strip()
                match = re.match(r'^(\d+)[.\):\s]+(.+)$', line)
                if match:
                    num = int(match.group(1))
                    trans = match.group(2).strip().strip('"\'.,!?')
                    if 1 <= num <= num_words and trans and len(trans) > 0:
                        translations[num] = trans

            result_map = {}
            for i, arabic_word in enumerate(arabic_words):
                num = i + 1
                result_map[arabic_word] = translations.get(num, None)

            success_count = sum(1 for v in result_map.values() if v is not None)

            if success_count == num_words:
                return result_map, success_count

            if attempt == 0:
                continue

            if success_count > 0:
                return result_map, success_count
            else:
                return result_map, 0

        except Exception as e:
            if attempt == 0:
                continue
            else:
                return {word: None for word in arabic_words}, 0

    return result_map, success_count


def translate_verse_batch_robust(arabic_words, full_verse_ar, full_verse_en):
    """
    Translate words using NUMBERED format for validation
    For long verses (>20 words), splits into chunks for better accuracy
    Returns dict mapping Arabic words to English translations
    """
    num_words = len(arabic_words)

    # If verse is long, split into chunks
    MAX_WORDS_PER_BATCH = 20
    if num_words > MAX_WORDS_PER_BATCH:
        # Split into chunks
        result_map = {}
        chunks = []
        for i in range(0, num_words, MAX_WORDS_PER_BATCH):
            chunks.append(arabic_words[i:i+MAX_WORDS_PER_BATCH])

        total_success = 0
        for chunk_idx, chunk in enumerate(chunks):
            chunk_result, chunk_success = translate_chunk(chunk, full_verse_ar, full_verse_en, chunk_idx)
            result_map.update(chunk_result)
            total_success += chunk_success

        return result_map, total_success

    # Single batch for shorter verses
    word_list = "\n".join([f"{i+1}. {word}" for i, word in enumerate(arabic_words)])

    prompt = f"""Translate each numbered Arabic word to English using verse context.

Arabic verse: {full_verse_ar}
English verse: {full_verse_en}

Words to translate:
{word_list}

CRITICAL: Return EXACTLY {num_words} translations, one per line.
Format: NUMBER. TRANSLATION

Example:
1. The
2. Word
3. Translation

Your {num_words} translations:"""

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_predict": 400
        }
    }

    max_retries = 2  # Try twice max
    for attempt in range(max_retries):
        try:
            response = requests.post(OLLAMA_API, json=payload, timeout=120)
            response.raise_for_status()
            result = response.json()
            response_text = result.get("response", "").strip()

            # Parse numbered responses
            translations = {}
            for line in response_text.split('\n'):
                line = line.strip()
                # Match "1. word" or "1: word" or "1) word"
                match = re.match(r'^(\d+)[.\):\s]+(.+)$', line)
                if match:
                    num = int(match.group(1))
                    trans = match.group(2).strip().strip('"\'.,!?')
                    if 1 <= num <= num_words and trans and len(trans) > 0:
                        translations[num] = trans

            # Build result map using numbered translations
            result_map = {}
            for i, arabic_word in enumerate(arabic_words):
                num = i + 1
                result_map[arabic_word] = translations.get(num, None)

            # Count how many we got
            success_count = sum(1 for v in result_map.values() if v is not None)

            # STRICT: Only accept if we got ALL words
            if success_count == num_words:
                return result_map, success_count

            # If first attempt and didn't get all, retry once
            if attempt == 0:
                print(f"    ⚠️  Only got {success_count}/{num_words} translations, retrying once...")
                continue

            # Second attempt: Accept whatever we got (numbered = aligned)
            # Even partial is better than misaligned
            if success_count > 0:
                print(f"    ⚠️  Accepting partial: {success_count}/{num_words} translations (aligned)")
                return result_map, success_count
            else:
                return result_map, 0

        except Exception as e:
            if attempt == 0:
                print(f"    ⚠️  Error: {e}, retrying once...")
                continue
            else:
                print(f"    ❌ Failed after 2 attempts: {e}")
                return {word: None for word in arabic_words}, 0

    # Shouldn't reach here, but return what we got
    return result_map, success_count


def extract_words_from_arabic(arabic_text):
    """
    Extract individual words from Arabic text, preserving positions
    Returns list of (word, start_pos, end_pos) tuples
    """
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


def find_misaligned_verses(mapping_dir="bible-maps-word-gemma3/mappings"):
    """
    Find all verses with missing mappings (misalignment)
    Returns list of (book, chapter, verse_num, expected, actual, diff)
    """
    misaligned = []

    for book_dir in sorted(Path(mapping_dir).iterdir()):
        if not book_dir.is_dir():
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

                    # Flag any verse with missing mappings
                    if diff > 0:
                        misaligned.append((book, chapter, verse_num, expected, actual, diff))
            except Exception as e:
                print(f"Error reading {chapter_file}: {e}")

    return misaligned


def repair_verse(book, chapter, verse_num, mapping_dir="bible-maps-word-gemma3/mappings"):
    """
    Repair a single verse by regenerating its mappings
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

    # Extract words
    arabic_words_with_pos = extract_words_from_arabic(arabic)
    filtered_words = [(w, s, e) for w, s, e in arabic_words_with_pos if len(w) >= 3]
    words_only = [w for w, s, e in filtered_words]

    # Translate with robust method
    translation_map, success_count = translate_verse_batch_robust(words_only, arabic, english)

    # Build mappings
    mappings = []
    for word, start, end in filtered_words:
        translation = translation_map.get(word)
        if translation:
            mappings.append({
                "ar": word,
                "en": translation,
                "start": start,
                "end": end
            })

    # Validate we got most mappings
    if len(mappings) < len(words_only) * 0.85:
        return False, f"Only got {len(mappings)}/{len(words_only)} mappings"

    # Update the mapping file
    mapping_file = f"{mapping_dir}/{book}/{chapter}.json"
    with open(mapping_file, 'r') as f:
        output = json.load(f)

    output["verses"][verse_num] = {
        "ar": arabic,
        "en": english,
        "mappings": mappings
    }

    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    return True, f"Repaired {len(mappings)}/{len(words_only)} mappings"


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Repair misaligned verses')
    parser.add_argument('--test', action='store_true', help='Test mode: only repair first 10 verses')
    parser.add_argument('--min-diff', type=int, default=1, help='Minimum difference to repair (default: 1)')
    args = parser.parse_args()

    print("="*70)
    print("VERSE ALIGNMENT REPAIR TOOL")
    print("="*70)

    # Find misaligned verses
    print("\n🔍 Scanning for misaligned verses...")
    misaligned = find_misaligned_verses()

    # Filter by minimum difference
    misaligned = [m for m in misaligned if m[5] >= args.min_diff]

    print(f"\nFound {len(misaligned)} verses with {args.min_diff}+ missing mappings")

    if args.test:
        print("\n⚠️  TEST MODE: Only repairing first 10 verses")
        misaligned = misaligned[:10]

    # Group by difference for stats
    by_diff = {}
    for _, _, _, _, _, diff in misaligned:
        by_diff[diff] = by_diff.get(diff, 0) + 1

    print("\nBreakdown by missing count:")
    for diff in sorted(by_diff.keys()):
        print(f"  {diff} missing: {by_diff[diff]} verses")

    if not misaligned:
        print("\n✅ No misaligned verses found!")
        return

    # Ask for confirmation
    if not args.test:
        response = input(f"\nRepair all {len(misaligned)} verses? (y/n): ")
        if response.lower() != 'y':
            print("Cancelled.")
            return

    # Repair verses
    print(f"\n🔧 Repairing {len(misaligned)} verses...\n")

    success_count = 0
    fail_count = 0

    for i, (book, chapter, verse_num, expected, actual, diff) in enumerate(misaligned, 1):
        ref = f"{book} {chapter}:{verse_num}"
        print(f"[{i}/{len(misaligned)}] {ref} ({actual}/{expected} mappings, {diff} missing)")

        success, msg = repair_verse(book, str(chapter), verse_num)

        if success:
            success_count += 1
            print(f"    ✅ {msg}")
        else:
            fail_count += 1
            print(f"    ❌ {msg}")

    print("\n" + "="*70)
    print(f"REPAIR COMPLETE!")
    print(f"  Successful: {success_count}")
    print(f"  Failed:     {fail_count}")
    print("="*70)


if __name__ == "__main__":
    main()

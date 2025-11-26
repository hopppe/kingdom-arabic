#!/usr/bin/env python3
"""
Fast repair for shifted verses (missing exactly 1 word)
Instead of re-translating everything, find which word is missing and translate only that
"""

import json
import os
import requests
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(line_buffering=True)

OLLAMA_API = "http://localhost:11434/api/generate"
MODEL = "gemma3:12b"

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
    """Translate a single Arabic word using verse context"""
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
            "num_predict": 50  # Single word needs few tokens
        }
    }

    try:
        response = requests.post(OLLAMA_API, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        translation = result.get("response", "").strip()

        # Clean up the translation
        translation = translation.strip('"\'.,!?')
        # Remove common prefixes Gemma might add
        translation = re.sub(r'^(TRANSLATION:\s*|Translation:\s*)', '', translation, flags=re.IGNORECASE)
        translation = translation.strip()

        return translation if translation else None

    except Exception as e:
        print(f"    ⚠️  Error translating word: {e}")
        return None


def find_missing_word_position(expected_words, existing_mappings):
    """
    Find which word position is missing by comparing expected words with existing mappings
    Returns the index of the missing word, or None if can't determine
    """
    if len(existing_mappings) >= len(expected_words):
        return None  # No missing word

    # Try to find where the shift happened by comparing Arabic words
    for i in range(len(expected_words)):
        if i >= len(existing_mappings):
            return i  # Missing word is at the end

        expected_word = expected_words[i][0]  # (word, start, end)
        mapping_word = existing_mappings[i]['ar']

        if expected_word != mapping_word:
            # Found the mismatch - this is likely where the missing word is
            return i

    return len(existing_mappings)  # Default to end


def repair_shifted_verse(book, chapter, verse_num, mapping_dir="bible-maps-word-gemma3/mappings"):
    """
    Fast repair for verses missing exactly 1 word
    Keeps existing translations and only translates the missing word
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

    # Translate only the missing word
    translation = translate_single_word(missing_word, arabic, english)
    if not translation:
        return False, "Failed to translate missing word"

    # Build new mappings by inserting the missing word
    new_mappings = []
    for i, (word, start, end) in enumerate(filtered_words):
        if i == missing_pos:
            # Insert the newly translated word
            new_mappings.append({
                "ar": missing_word,
                "en": translation,
                "start": missing_start,
                "end": missing_end
            })
        else:
            # Use existing mapping (might be shifted)
            existing_idx = i if i < missing_pos else i - 1
            if existing_idx < len(existing_mappings):
                # Keep existing translation but update positions
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


def find_single_shift_verses(mapping_dir="bible-maps-word-gemma3/mappings"):
    """Find verses missing exactly 1 word (candidates for fast repair)"""
    single_shifts = []

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

                    if diff == 1:  # Exactly 1 missing
                        single_shifts.append((book, chapter, verse_num, expected, actual))
            except Exception as e:
                print(f"Error reading {chapter_file}: {e}")

    return single_shifts


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Fast repair for single-word shifts')
    parser.add_argument('--test', action='store_true', help='Test mode: only repair first 10 verses')
    args = parser.parse_args()

    print("="*70)
    print("FAST SHIFT REPAIR TOOL (1-word missing only)")
    print("="*70)

    print("\n🔍 Finding verses with exactly 1 missing word...")
    single_shifts = find_single_shift_verses()

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

    print(f"\n🔧 Repairing {len(single_shifts)} verses...\n")

    success_count = 0
    fail_count = 0

    for i, (book, chapter, verse_num, expected, actual) in enumerate(single_shifts, 1):
        ref = f"{book} {chapter}:{verse_num}"
        print(f"[{i}/{len(single_shifts)}] {ref} ({actual}/{expected} mappings)")

        success, msg = repair_shifted_verse(book, str(chapter), verse_num)

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

#!/usr/bin/env python3
"""
Fill in missing verse mappings in existing Bible mapping files
Only processes verses that have empty mappings arrays
"""

import json
import os
import requests
import re
import sys
from pathlib import Path

# Force unbuffered output for real-time progress updates
sys.stdout.reconfigure(line_buffering=True)

OLLAMA_API = "http://localhost:11434/api/generate"
MODEL = "gemma3:12b"

def translate_verse_batch(arabic_words, full_verse_ar, full_verse_en):
    """
    Translate ALL words in a verse at once using Gemma 3 (MUCH faster!)
    Returns dict mapping Arabic words to English translations
    """
    # Create numbered list of words to translate
    word_list = "\n".join([f"{i+1}. {word}" for i, word in enumerate(arabic_words)])

    prompt = f"""Translate Arabic words to English using the verse context. Each Arabic word may include articles (الْ), prepositions, or conjunctions - translate the COMPLETE word meaning, not just prefixes.

Context:
Arabic: {full_verse_ar}

Words to translate:
{word_list}

Provide ONLY the English translation for each word (one per line, no labels, no explanations):"""

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_predict": 200  # More tokens for batch response
        }
    }

    try:
        response = requests.post(OLLAMA_API, json=payload, timeout=120)
        response.raise_for_status()
        result = response.json()
        response_text = result.get("response", "").strip()

        # Parse the response - expect one translation per line
        translations = []
        for line in response_text.split('\n'):
            line = line.strip()
            # Remove numbering if present (1. 2. etc.)
            line = re.sub(r'^\d+\.\s*', '', line)
            # Clean up quotes and punctuation
            line = line.strip('"\'.,!?')
            if line:
                translations.append(line)

        # Map Arabic words to their translations
        result_map = {}
        for i, arabic_word in enumerate(arabic_words):
            if i < len(translations):
                result_map[arabic_word] = translations[i]
            else:
                result_map[arabic_word] = None

        return result_map

    except Exception as e:
        print(f"  ⚠️  Error in batch translation: {e}")
        return {word: None for word in arabic_words}


def extract_words_from_arabic(arabic_text):
    """
    Extract individual words from Arabic text, preserving positions
    Returns list of (word, start_pos, end_pos) tuples
    """
    # Split by whitespace but track positions
    words = []
    current_pos = 0

    # Split by whitespace
    tokens = re.split(r'(\s+)', arabic_text)

    for token in tokens:
        if token.strip():  # Not whitespace
            start = current_pos
            end = current_pos + len(token)
            words.append((token, start, end))
        current_pos += len(token)

    return words


def fill_missing_verses_in_chapter(book, chapter, mapping_file):
    """
    Fill in missing verse mappings in an existing mapping file
    Only processes verses with empty mappings arrays
    """
    # Read the existing mapping file
    with open(mapping_file, 'r', encoding='utf-8') as f:
        output = json.load(f)

    # Count verses that need mapping
    verses_to_process = []
    for verse_num, verse_data in output["verses"].items():
        if not verse_data.get("mappings") or len(verse_data["mappings"]) == 0:
            verses_to_process.append(verse_num)

    if not verses_to_process:
        print(f"  ✓ {book} {chapter} - All verses already have mappings")
        return True, 0

    total_missing = len(verses_to_process)
    print(f"  📝 {book} {chapter} - Found {total_missing} verses with missing mappings")

    # Process each missing verse
    for idx, verse_num in enumerate(verses_to_process, 1):
        verse_data = output["verses"][verse_num]
        arabic = verse_data['ar']
        english = verse_data['en']

        # Extract Arabic words with positions
        arabic_words_with_pos = extract_words_from_arabic(arabic)

        # Filter words (skip very short words - likely particles)
        filtered_words = [(w, s, e) for w, s, e in arabic_words_with_pos if len(w) >= 3]

        # Batch translate all words in this verse
        words_only = [w for w, s, e in filtered_words]
        translation_map = translate_verse_batch(words_only, arabic, english)

        # Build mappings with positions
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

        # Update verse with new mappings
        output["verses"][verse_num]["mappings"] = mappings

        # SAVE AFTER EACH VERSE (checkpoint for resume)
        with open(mapping_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        percent = (idx / total_missing) * 100
        print(f"     {book} {chapter}:{verse_num} - {idx}/{total_missing} ({percent:.1f}%)")

    return True, total_missing


def scan_and_fill_missing_mappings():
    """
    Scan all mapping files and fill in missing verses
    """
    # Books to check (based on validation report)
    books_to_check = [
        ("LUK", 24, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]),  # Luke 3-24
        ("JHN", 21, [1, 2, 3, 4, 5, 12]),  # John chapters with gaps
        ("ACT", 28, [15]),  # Acts 15
    ]

    total_chapters_processed = 0
    total_verses_filled = 0

    print("="*70)
    print("FILLING MISSING BIBLE VERSE MAPPINGS")
    print("="*70)

    for book, total_chapters, chapters_to_check in books_to_check:
        print(f"\n📖 Checking {book} ({len(chapters_to_check)} chapters)...")

        for chapter in chapters_to_check:
            mapping_file = f"bible-maps-word-gemma3/mappings/{book}/{chapter}.json"

            if not os.path.exists(mapping_file):
                print(f"  ⚠️  File not found: {mapping_file}")
                continue

            success, verses_filled = fill_missing_verses_in_chapter(book, chapter, mapping_file)

            if success:
                total_chapters_processed += 1
                total_verses_filled += verses_filled
                if verses_filled > 0:
                    print(f"  ✅ {book} {chapter} - Filled {verses_filled} verses")
            else:
                print(f"  ❌ Failed to process {book} chapter {chapter}")

    print("\n" + "="*70)
    print(f"✅ COMPLETE!")
    print(f"   Processed: {total_chapters_processed} chapters")
    print(f"   Filled: {total_verses_filled} verses")
    print("="*70)


def main():
    """
    Main entry point - you can customize which books to process
    """
    import argparse

    parser = argparse.ArgumentParser(description='Fill missing verse mappings')
    parser.add_argument('--book', type=str, help='Process specific book (e.g., LUK)')
    parser.add_argument('--chapter', type=int, help='Process specific chapter')
    args = parser.parse_args()

    if args.book and args.chapter:
        # Process single chapter
        mapping_file = f"bible-maps-word-gemma3/mappings/{args.book}/{args.chapter}.json"
        if os.path.exists(mapping_file):
            print(f"Processing {args.book} {args.chapter}...")
            success, verses_filled = fill_missing_verses_in_chapter(args.book, args.chapter, mapping_file)
            if success:
                print(f"✅ Filled {verses_filled} verses")
            else:
                print(f"❌ Failed")
        else:
            print(f"❌ File not found: {mapping_file}")
    else:
        # Scan and fill all missing mappings
        scan_and_fill_missing_mappings()


if __name__ == "__main__":
    main()

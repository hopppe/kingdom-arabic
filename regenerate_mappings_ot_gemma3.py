#!/usr/bin/env python3
"""
Regenerate Bible word mappings using Gemma 3 via Ollama
OLD TESTAMENT - 39 books, 929 chapters
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


def translate_chunk(arabic_words, full_verse_ar, full_verse_en, chunk_idx):
    """
    Translate a chunk of words (helper for long verses)
    Uses NUMBERED format for validation
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
    ROBUST translation using NUMBERED format for validation
    For long verses (>20 words), splits into chunks for better accuracy
    Returns dict mapping Arabic words to English translations + success count
    """
    num_words = len(arabic_words)

    # If verse is long, split into chunks
    MAX_WORDS_PER_BATCH = 20
    if num_words > MAX_WORDS_PER_BATCH:
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

    max_retries = 2
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

            success_count = sum(1 for v in result_map.values() if v is not None)

            # STRICT: Only accept if we got ALL words
            if success_count == num_words:
                return result_map, success_count

            # If first attempt and didn't get all, retry once
            if attempt == 0:
                continue

            # Second attempt: Accept whatever we got (numbered = aligned)
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


def regenerate_chapter_mappings(book, chapter):
    """
    Regenerate word mappings for a single Bible chapter using Gemma 3
    Supports resume: If partially complete, picks up where it left off
    """
    # Read the source chapter
    source_file = f"bible-translations/unified/{book}/{chapter}.json"
    if not os.path.exists(source_file):
        print(f"❌ Source file not found: {source_file}")
        return False

    with open(source_file, 'r', encoding='utf-8') as f:
        verses = json.load(f)

    # Check if we have a partial output file (for resume)
    output_dir = f"bible-maps-word-gemma3/mappings/{book}"
    os.makedirs(output_dir, exist_ok=True)
    output_file = f"{output_dir}/{chapter}.json"

    # Try to load existing progress
    if os.path.exists(output_file):
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                output = json.load(f)
        except (json.JSONDecodeError, ValueError):
            # Corrupted file - start fresh
            print(f"  ⚠️  Corrupted output file, starting fresh...")
            output = {
                "book": book,
                "chapter": int(chapter),
                "verses": {}
            }
    else:
        # Create new output structure
        output = {
            "book": book,
            "chapter": int(chapter),
            "verses": {}
        }

    total_verses = len(verses)
    completed_verses = len(output["verses"])

    # Process each verse
    for idx, (verse_num, verse_data) in enumerate(verses.items(), 1):
        # Skip if already completed
        if verse_num in output["verses"]:
            continue

        arabic = verse_data['ar']
        english = verse_data['en']

        # Extract Arabic words with positions
        arabic_words_with_pos = extract_words_from_arabic(arabic)

        # Filter words (skip very short words - likely particles)
        filtered_words = [(w, s, e) for w, s, e in arabic_words_with_pos if len(w) >= 3]
        words_only = [w for w, s, e in filtered_words]
        expected_count = len(words_only)

        # TRY FAST METHOD FIRST (works ~75% of time)
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

        actual_count = len(mappings)

        # CHECK FOR MISALIGNMENT - if we're missing translations, use robust method
        if actual_count < expected_count:
            print(f"  ⚠️  Misalignment detected ({actual_count}/{expected_count}), using robust method...")

            # FALLBACK TO ROBUST CHUNKED METHOD
            translation_map, success_count = translate_verse_batch_robust(words_only, arabic, english)

            # Rebuild mappings with robust results
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

            actual_count = len(mappings)
            print(f"  ✅ Robust method: {actual_count}/{expected_count} mappings")

        # Add verse to output
        output["verses"][verse_num] = {
            "ar": arabic,
            "en": english,
            "mappings": mappings
        }

        # SAVE AFTER EACH VERSE (checkpoint for resume)
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        completed_verses += 1
        percent = (completed_verses / total_verses) * 100
        print(f"{book} {chapter}:{verse_num} - {completed_verses}/{total_verses} ({percent:.1f}%)")

    return True


def main():
    # Complete Old Testament - all 39 books (929 chapters total)
    books_to_process = [
        # Pentateuch (Torah)
        ("GEN", 50),   # Genesis
        ("EXO", 40),   # Exodus
        ("LEV", 27),   # Leviticus
        ("NUM", 36),   # Numbers
        ("DEU", 34),   # Deuteronomy

        # Historical Books
        ("JOS", 24),   # Joshua
        ("JDG", 21),   # Judges
        ("RUT", 4),    # Ruth
        ("1SA", 31),   # 1 Samuel
        ("2SA", 24),   # 2 Samuel
        ("1KI", 22),   # 1 Kings
        ("2KI", 25),   # 2 Kings
        ("1CH", 29),   # 1 Chronicles
        ("2CH", 36),   # 2 Chronicles
        ("EZR", 10),   # Ezra
        ("NEH", 13),   # Nehemiah
        ("EST", 10),   # Esther

        # Wisdom/Poetry Books
        ("JOB", 42),   # Job
        ("PSA", 150),  # Psalms
        ("PRO", 31),   # Proverbs
        ("ECC", 12),   # Ecclesiastes
        ("SNG", 8),    # Song of Solomon

        # Major Prophets
        ("ISA", 66),   # Isaiah
        ("JER", 52),   # Jeremiah
        ("LAM", 5),    # Lamentations
        ("EZK", 48),   # Ezekiel
        ("DAN", 12),   # Daniel

        # Minor Prophets
        ("HOS", 14),   # Hosea
        ("JOL", 3),    # Joel
        ("AMO", 9),    # Amos
        ("OBA", 1),    # Obadiah
        ("JON", 4),    # Jonah
        ("MIC", 7),    # Micah
        ("NAM", 3),    # Nahum
        ("HAB", 3),    # Habakkuk
        ("ZEP", 3),    # Zephaniah
        ("HAG", 2),    # Haggai
        ("ZEC", 14),   # Zechariah
        ("MAL", 4),    # Malachi
    ]

    total_chapters = sum(chapters for _, chapters in books_to_process)
    completed_chapters = 0

    print("="*70)
    print(f"OLD TESTAMENT WORD MAPPING REGENERATION")
    print(f"Total: {len(books_to_process)} books, {total_chapters} chapters")
    print("="*70)

    for book, num_chapters in books_to_process:
        print(f"\n📖 Starting {book} ({num_chapters} chapters)...")

        for chapter in range(1, num_chapters + 1):
            success = regenerate_chapter_mappings(book, str(chapter))

            if success:
                completed_chapters += 1
                overall_percent = (completed_chapters / total_chapters) * 100
                print(f"   ✅ {book} {chapter} complete")
                print(f"   📊 Overall: {completed_chapters}/{total_chapters} chapters ({overall_percent:.1f}%)\n")
            else:
                print(f"   ⚠️ Warning: Failed to process {book} chapter {chapter}")

    print("\n" + "="*70)
    print(f"✅ ALL COMPLETE! {completed_chapters}/{total_chapters} chapters")
    print("="*70)


if __name__ == "__main__":
    main()
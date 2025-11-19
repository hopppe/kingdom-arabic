#!/usr/bin/env python3
"""
Regenerate Bible word mappings using Claude Haiku via API
Uses the same batch translation approach as the Gemma script
"""

import json
import os
import re
import sys
from pathlib import Path
from anthropic import Anthropic

# Force unbuffered output for real-time progress updates
sys.stdout.reconfigure(line_buffering=True)

# Initialize Anthropic client
client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

def translate_verse_batch(arabic_words, full_verse_ar, full_verse_en):
    """
    Translate ALL words in a verse at once using Claude Haiku (MUCH faster!)
    Returns dict mapping Arabic words to English translations
    """
    # Create numbered list of words to translate
    word_list = "\n".join([f"{i+1}. {word}" for i, word in enumerate(arabic_words)])

    prompt = f"""Translate Arabic words to English using the verse context. Each Arabic word may include articles (الْ), prepositions, or conjunctions - translate the COMPLETE word meaning, not just prefixes.

Context:
Arabic: {full_verse_ar}
English: {full_verse_en}

Words to translate:
{word_list}

Provide ONLY the English translation for each word (one per line, no labels, no explanations):"""

    try:
        message = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=1024,
            temperature=0.1,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = message.content[0].text.strip()

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


def regenerate_chapter_mappings(book, chapter):
    """
    Regenerate word mappings for a single Bible chapter using Claude Haiku
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
    output_dir = f"bible-maps-word-haiku/mappings/{book}"
    os.makedirs(output_dir, exist_ok=True)
    output_file = f"{output_dir}/{chapter}.json"

    # Try to load existing progress
    if os.path.exists(output_file):
        with open(output_file, 'r', encoding='utf-8') as f:
            output = json.load(f)
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
    # Complete New Testament - all 27 books (260 chapters total)
    books_to_process = [
        # Gospels
        ("MAT", 28),  # Matthew
        ("MRK", 16),  # Mark
        ("LUK", 24),  # Luke
        ("JHN", 21),  # John

        # History
        ("ACT", 28),  # Acts

        # Paul's Letters
        ("ROM", 16),  # Romans
        ("1CO", 16),  # 1 Corinthians
        ("2CO", 13),  # 2 Corinthians
        ("GAL", 6),   # Galatians
        ("EPH", 6),   # Ephesians
        ("PHP", 4),   # Philippians
        ("COL", 4),   # Colossians
        ("1TH", 5),   # 1 Thessalonians
        ("2TH", 3),   # 2 Thessalonians
        ("1TI", 6),   # 1 Timothy
        ("2TI", 4),   # 2 Timothy
        ("TIT", 3),   # Titus
        ("PHM", 1),   # Philemon

        # General Epistles
        ("HEB", 13),  # Hebrews
        ("JAS", 5),   # James
        ("1PE", 5),   # 1 Peter
        ("2PE", 3),   # 2 Peter
        ("1JN", 5),   # 1 John
        ("2JN", 1),   # 2 John
        ("3JN", 1),   # 3 John
        ("JUD", 1),   # Jude

        # Prophecy
        ("REV", 22),  # Revelation
    ]

    total_chapters = sum(chapters for _, chapters in books_to_process)
    completed_chapters = 0

    print("="*70)
    print(f"NEW TESTAMENT WORD MAPPING WITH CLAUDE HAIKU")
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

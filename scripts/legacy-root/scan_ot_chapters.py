#!/usr/bin/env python3
"""Scan Old Testament chapters to find which ones need translation."""

import json
import os
from pathlib import Path

# Define Old Testament books and their chapter counts
OT_BOOKS = {
    'GEN': 50, 'EXO': 40, 'LEV': 27, 'NUM': 36, 'DEU': 34,
    'JOS': 24, 'JDG': 21, 'RUT': 4, '1SA': 31, '2SA': 24,
    '1KI': 22, '2KI': 25, '1CH': 29, '2CH': 36, 'EZR': 10,
    'NEH': 13, 'EST': 10, 'JOB': 42, 'PSA': 150, 'PRO': 31,
    'ECC': 12, 'SNG': 8, 'ISA': 66, 'JER': 52, 'LAM': 5,
    'EZK': 48, 'DAN': 12, 'HOS': 14, 'JOL': 3, 'AMO': 9,
    'OBA': 1, 'JON': 4, 'MIC': 7, 'NAM': 3, 'HAB': 3,
    'ZEP': 3, 'HAG': 2, 'ZEC': 14, 'MAL': 4
}

MAPPINGS_DIR = Path('bible-maps-word-haiku/mappings')

def needs_translation(book, chapter):
    """Check if a chapter needs translation (has empty 'en' fields)."""
    mapping_file = MAPPINGS_DIR / book / f'{chapter}.json'

    if not mapping_file.exists():
        return True  # File doesn't exist, needs translation

    try:
        with open(mapping_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Check first verse's first mapping
        verses = data.get('verses', {})
        if not verses:
            return True

        first_verse_key = min(verses.keys(), key=int)
        first_verse = verses[first_verse_key]
        mappings = first_verse.get('mappings', [])

        if not mappings:
            return True

        # Check if first mapping has empty 'en' field
        first_mapping = mappings[0]
        return first_mapping.get('en', '') == ''

    except Exception as e:
        print(f"Error reading {book} {chapter}: {e}")
        return True

def main():
    total_chapters = 0
    complete_chapters = 0
    need_translation = []

    print("Scanning Old Testament chapters...")
    print("=" * 60)

    for book, chapter_count in OT_BOOKS.items():
        total_chapters += chapter_count
        book_needs_translation = []

        for chapter in range(1, chapter_count + 1):
            if needs_translation(book, chapter):
                book_needs_translation.append(chapter)
                need_translation.append(f"{book} {chapter}")
            else:
                complete_chapters += 1

        if book_needs_translation:
            print(f"{book}: {len(book_needs_translation)}/{chapter_count} need translation")
        else:
            print(f"{book}: ✓ All {chapter_count} chapters complete")

    print("=" * 60)
    print(f"\nSummary:")
    print(f"  Total OT chapters: {total_chapters}")
    print(f"  Complete: {complete_chapters} ({100*complete_chapters/total_chapters:.1f}%)")
    print(f"  Need translation: {len(need_translation)} ({100*len(need_translation)/total_chapters:.1f}%)")

    # Save chapters needing translation to a file
    with open('ot_chapters_to_translate.txt', 'w') as f:
        for chapter in need_translation:
            f.write(f"{chapter}\n")

    print(f"\nChapters needing translation saved to: ot_chapters_to_translate.txt")
    print(f"\nFirst 20 chapters to translate:")
    for i, chapter in enumerate(need_translation[:20], 1):
        print(f"  {i}. {chapter}")

if __name__ == '__main__':
    main()

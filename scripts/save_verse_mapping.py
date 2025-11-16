#!/usr/bin/env python3
"""
Save verse mappings with automatic position calculation.

Usage:
    python save_verse_mapping.py JHN 1 1 '[["فِي", "In"], ["الْبَدْءِ", "the beginning"], ...]'

Or import and use:
    from save_verse_mapping import add_verse_mapping, save_chapter
"""

import json
import sys
from pathlib import Path

BASE_DIR = Path("/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic")
UNIFIED_DIR = BASE_DIR / "bible-translations" / "unified"
MAPPINGS_DIR = BASE_DIR / "bible-translations" / "mappings"


def calculate_positions(ar_text: str, word_pairs: list) -> list:
    """Calculate exact character positions for each word pair."""
    mappings = []
    current_pos = 0

    for pair in word_pairs:
        ar_word, en_word = pair[0], pair[1]

        # Find the word starting from current position
        pos = ar_text.find(ar_word, current_pos)

        if pos == -1:
            print(f"WARNING: '{ar_word}' not found after position {current_pos}")
            pos = ar_text.find(ar_word)
            if pos == -1:
                print(f"ERROR: '{ar_word}' not found anywhere in text!")
                continue

        end_pos = pos + len(ar_word) - 1

        mappings.append({
            "ar": ar_word,
            "en": en_word,
            "start": pos,
            "end": end_pos
        })

        current_pos = end_pos + 1

    return mappings


def load_or_create_chapter_mapping(book: str, chapter: int) -> dict:
    """Load existing mapping file or create new structure."""
    mapping_file = MAPPINGS_DIR / book / f"{chapter}.json"

    if mapping_file.exists():
        with open(mapping_file, 'r', encoding='utf-8') as f:
            return json.load(f)

    return {
        "book": book,
        "chapter": chapter,
        "verses": {}
    }


def add_verse_mapping(book: str, chapter: int, verse: int, word_pairs: list) -> dict:
    """
    Add mapping for a single verse.

    Args:
        book: Book ID (e.g., "JHN")
        chapter: Chapter number
        verse: Verse number
        word_pairs: List of [arabic_word, english_meaning] pairs

    Returns:
        The verse mapping dict with positions calculated
    """
    # Load source verse
    chapter_file = UNIFIED_DIR / book / f"{chapter}.json"
    with open(chapter_file, 'r', encoding='utf-8') as f:
        verses = json.load(f)

    verse_str = str(verse)
    if verse_str not in verses:
        raise ValueError(f"Verse {verse} not found in {book} chapter {chapter}")

    ar_text = verses[verse_str]["ar"]
    en_text = verses[verse_str]["en"]

    # Calculate positions
    mappings = calculate_positions(ar_text, word_pairs)

    return {
        "ar": ar_text,
        "en": en_text,
        "mappings": mappings
    }


def save_chapter(book: str, chapter: int, data: dict):
    """Save the chapter mapping to file."""
    book_dir = MAPPINGS_DIR / book
    book_dir.mkdir(parents=True, exist_ok=True)

    output_file = book_dir / f"{chapter}.json"

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Saved to: {output_file}")
    return output_file


def process_single_verse(book: str, chapter: int, verse: int, word_pairs_json: str):
    """Process a single verse from command line."""
    word_pairs = json.loads(word_pairs_json)

    # Load or create chapter mapping
    chapter_data = load_or_create_chapter_mapping(book, chapter)

    # Add this verse
    verse_mapping = add_verse_mapping(book, chapter, verse, word_pairs)
    chapter_data["verses"][str(verse)] = verse_mapping

    # Save
    save_chapter(book, chapter, chapter_data)

    print(f"\nAdded verse {verse} with {len(verse_mapping['mappings'])} word mappings")
    print(f"Sample mapping: {json.dumps(verse_mapping['mappings'][:2], ensure_ascii=False)}")


def process_full_chapter(book: str, chapter: int, all_verses_json: str):
    """
    Process all verses in a chapter at once.

    all_verses_json should be a dict: {"1": [[ar, en], ...], "2": [[ar, en], ...]}
    """
    all_verses = json.loads(all_verses_json)

    chapter_data = {
        "book": book,
        "chapter": chapter,
        "verses": {}
    }

    for verse_num, word_pairs in all_verses.items():
        verse_mapping = add_verse_mapping(book, chapter, int(verse_num), word_pairs)
        chapter_data["verses"][verse_num] = verse_mapping
        print(f"Processed verse {verse_num}: {len(verse_mapping['mappings'])} mappings")

    save_chapter(book, chapter, chapter_data)
    print(f"\nCompleted {book} chapter {chapter} with {len(chapter_data['verses'])} verses")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage:")
        print("  Single verse: python save_verse_mapping.py JHN 1 1 '[[\"ar\", \"en\"], ...]'")
        print("  Full chapter: python save_verse_mapping.py JHN 1 --chapter '{\"1\": [...], \"2\": [...]}'")
        sys.exit(1)

    book = sys.argv[1].upper()
    chapter = int(sys.argv[2])

    if sys.argv[3] == "--chapter":
        # Full chapter mode
        process_full_chapter(book, chapter, sys.argv[4])
    else:
        # Single verse mode
        verse = int(sys.argv[3])
        word_pairs_json = sys.argv[4]
        process_single_verse(book, chapter, verse, word_pairs_json)

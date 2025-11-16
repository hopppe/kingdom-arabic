#!/usr/bin/env python3
"""
Generate verse mappings with exact character positions.

This script takes semantic mappings (Arabic word -> English meaning) and
calculates the exact character positions in the Arabic text.

The semantic mappings should be provided as a list of tuples:
    [("Arabic phrase", "English meaning"), ...]

The script will find each Arabic phrase in the text and record its position.
"""

import json
import re
from pathlib import Path


BASE_DIR = Path("/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic")
UNIFIED_DIR = BASE_DIR / "bible-translations" / "unified"
MAPPINGS_DIR = BASE_DIR / "bible-translations" / "mappings"


def calculate_positions(ar_text: str, word_pairs: list[tuple[str, str]]) -> list[dict]:
    """
    Calculate exact character positions for each word mapping.

    Args:
        ar_text: The full Arabic verse text
        word_pairs: List of (arabic_word, english_meaning) tuples

    Returns:
        List of mapping dictionaries with start/end positions
    """
    mappings = []
    current_pos = 0

    for ar_word, en_word in word_pairs:
        # Find the word starting from current position
        pos = ar_text.find(ar_word, current_pos)

        if pos == -1:
            # Word not found - try from beginning (might be out of order)
            pos = ar_text.find(ar_word)
            if pos == -1:
                print(f"WARNING: Could not find '{ar_word}' in text")
                continue

        end_pos = pos + len(ar_word) - 1

        mappings.append({
            "ar": ar_word,
            "en": en_word,
            "start": pos,
            "end": end_pos
        })

        # Move current position past this word
        current_pos = end_pos + 1

    return mappings


def create_chapter_mappings(book: str, chapter: int, verse_mappings: dict) -> dict:
    """
    Create the full chapter mapping structure.

    Args:
        book: Book ID (e.g., "JHN")
        chapter: Chapter number
        verse_mappings: Dict of verse_num -> list of (ar_word, en_word) tuples

    Returns:
        Complete mapping structure ready to save
    """
    # Load the original chapter
    chapter_file = UNIFIED_DIR / book / f"{chapter}.json"
    with open(chapter_file, 'r', encoding='utf-8') as f:
        verses = json.load(f)

    # Create mappings for each verse
    result_verses = {}

    for verse_num, word_pairs in verse_mappings.items():
        verse_num_str = str(verse_num)
        if verse_num_str not in verses:
            print(f"WARNING: Verse {verse_num} not found in chapter")
            continue

        ar_text = verses[verse_num_str]["ar"]
        en_text = verses[verse_num_str]["en"]

        mappings = calculate_positions(ar_text, word_pairs)

        result_verses[verse_num_str] = {
            "ar": ar_text,
            "en": en_text,
            "mappings": mappings
        }

    return {
        "book": book,
        "chapter": chapter,
        "verses": result_verses
    }


def save_chapter_mappings(book: str, chapter: int, data: dict):
    """Save the mapping data to file."""
    book_dir = MAPPINGS_DIR / book
    book_dir.mkdir(parents=True, exist_ok=True)

    output_file = book_dir / f"{chapter}.json"

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Saved: {output_file}")


def validate_verse_mapping(ar_text: str, mappings: list[dict]) -> list[str]:
    """Validate that mappings are correct."""
    errors = []

    for i, m in enumerate(mappings):
        start = m["start"]
        end = m["end"]
        expected = m["ar"]

        if end >= len(ar_text):
            errors.append(f"Mapping {i}: end position {end} out of bounds (text length {len(ar_text)})")
            continue

        actual = ar_text[start:end+1]
        if actual != expected:
            errors.append(f"Mapping {i}: expected '{expected}' but found '{actual}'")

    return errors


# Example usage for a single verse
def example_verse_1():
    """Example: John 1:1"""
    ar_text = "فِي الْبَدْءِ كَانَ الْكَلِمَةُ، وَالْكَلِمَةُ كَانَ عِنْدَ اللهِ. وَكَانَ الْكَلِمَةُ اللهُ."

    # Semantic mappings (order matters for position tracking)
    word_pairs = [
        ("فِي", "In"),
        ("الْبَدْءِ", "the beginning"),
        ("كَانَ", "was"),
        ("الْكَلِمَةُ،", "the Word"),
        ("وَالْكَلِمَةُ", "and the Word"),
        ("كَانَ", "was"),
        ("عِنْدَ", "with"),
        ("اللهِ.", "God"),
        ("وَكَانَ", "and was"),
        ("الْكَلِمَةُ", "the Word"),
        ("اللهُ.", "God"),
    ]

    mappings = calculate_positions(ar_text, word_pairs)

    print("Example mapping for John 1:1:")
    print(json.dumps(mappings, ensure_ascii=False, indent=2))

    # Validate
    errors = validate_verse_mapping(ar_text, mappings)
    if errors:
        print("\nValidation errors:")
        for e in errors:
            print(f"  - {e}")
    else:
        print("\nValidation passed!")


if __name__ == "__main__":
    example_verse_1()

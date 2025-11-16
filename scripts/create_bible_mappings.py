#!/usr/bin/env python3
"""
Bible Word Mapping Generator

This script creates Arabic-English word mappings for Bible chapters.
It reads chapter JSON files and generates mapping files with character positions.

Usage:
    python create_bible_mappings.py JHN 1
    python create_bible_mappings.py MRK 1 2 3 4 5
"""

import json
import os
import sys
from pathlib import Path

# Base paths
BASE_DIR = Path("/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic")
UNIFIED_DIR = BASE_DIR / "bible-translations" / "unified"
MAPPINGS_DIR = BASE_DIR / "bible-translations" / "mappings"


def load_chapter(book: str, chapter: int) -> dict:
    """Load a chapter's verses from the unified directory."""
    chapter_file = UNIFIED_DIR / book / f"{chapter}.json"
    if not chapter_file.exists():
        raise FileNotFoundError(f"Chapter file not found: {chapter_file}")

    with open(chapter_file, 'r', encoding='utf-8') as f:
        return json.load(f)


def find_word_position(text: str, word: str, start_from: int = 0) -> tuple[int, int]:
    """
    Find the start and end position of a word in Arabic text.
    Returns (start, end) where end is the last character index (inclusive).
    """
    pos = text.find(word, start_from)
    if pos == -1:
        return (-1, -1)
    return (pos, pos + len(word) - 1)


def create_mapping_entry(arabic_word: str, english_word: str, start: int, end: int) -> dict:
    """Create a single mapping entry."""
    return {
        "ar": arabic_word,
        "en": english_word,
        "start": start,
        "end": end
    }


def save_mappings(book: str, chapter: int, verses_data: dict):
    """Save the mapping data to the mappings directory."""
    # Ensure directory exists
    book_dir = MAPPINGS_DIR / book
    book_dir.mkdir(parents=True, exist_ok=True)

    output_file = book_dir / f"{chapter}.json"

    output_data = {
        "book": book,
        "chapter": chapter,
        "verses": verses_data
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"Saved mappings to: {output_file}")


def process_verse_manual(verse_num: str, ar_text: str, en_text: str) -> dict:
    """
    Process a single verse - this is a placeholder for the actual mapping logic.

    This function should be replaced with either:
    1. LLM-based semantic matching
    2. Manual mapping input
    3. Dictionary-based matching
    """
    # Return structure with original text and empty mappings
    # The actual mapping generation should be done by an AI agent or manual process
    return {
        "ar": ar_text,
        "en": en_text,
        "mappings": []  # To be filled by AI agent
    }


def validate_mappings(ar_text: str, mappings: list) -> bool:
    """
    Validate that mappings are correct:
    - Positions are within text bounds
    - Arabic words match the text at those positions
    - Positions don't overlap (warning only)
    """
    errors = []

    for i, mapping in enumerate(mappings):
        ar_word = mapping.get("ar", "")
        start = mapping.get("start", -1)
        end = mapping.get("end", -1)

        # Check bounds
        if start < 0 or end < 0:
            errors.append(f"Mapping {i}: Invalid positions (start={start}, end={end})")
            continue

        if end >= len(ar_text):
            errors.append(f"Mapping {i}: End position {end} exceeds text length {len(ar_text)}")
            continue

        if start > end:
            errors.append(f"Mapping {i}: Start {start} > End {end}")
            continue

        # Check that the word matches
        actual_text = ar_text[start:end+1]
        if actual_text != ar_word:
            errors.append(f"Mapping {i}: Expected '{ar_word}' but found '{actual_text}' at positions {start}-{end}")

    if errors:
        print("Validation errors:")
        for error in errors:
            print(f"  - {error}")
        return False

    return True


def print_verse_for_mapping(verse_num: str, ar_text: str, en_text: str):
    """Print verse info to help with manual/AI mapping."""
    print(f"\n=== Verse {verse_num} ===")
    print(f"EN: {en_text}")
    print(f"AR: {ar_text}")
    print(f"AR Length: {len(ar_text)} characters")

    # Show character positions for reference
    print("\nCharacter positions (every 10):")
    for i in range(0, len(ar_text), 10):
        chunk = ar_text[i:i+10]
        print(f"  {i:3d}: {chunk}")


def main():
    if len(sys.argv) < 3:
        print("Usage: python create_bible_mappings.py BOOK CHAPTER [CHAPTER2 ...]")
        print("Example: python create_bible_mappings.py JHN 1 2 3")
        sys.exit(1)

    book = sys.argv[1].upper()
    chapters = [int(ch) for ch in sys.argv[2:]]

    print(f"Processing {book} chapters: {chapters}")

    for chapter in chapters:
        print(f"\n{'='*50}")
        print(f"Chapter {chapter}")
        print('='*50)

        try:
            verses = load_chapter(book, chapter)
            print(f"Loaded {len(verses)} verses")

            # For now, just print the verses - actual mapping will be done by AI
            for verse_num in sorted(verses.keys(), key=int):
                verse = verses[verse_num]
                print_verse_for_mapping(verse_num, verse["ar"], verse["en"])

        except FileNotFoundError as e:
            print(f"Error: {e}")
            continue


if __name__ == "__main__":
    main()

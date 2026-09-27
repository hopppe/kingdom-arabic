#!/usr/bin/env python3
"""
Clean up English mappings across all Bible translations.

This script:
1. Removes "TRANSLATION." prefix from English translations
2. Removes Arabic text that appears before English translations (e.g., "وَسَقَطَ. Fell" -> "Fell")
3. Removes standalone Arabic text from English fields

Usage:
    python cleanup_english_mappings.py              # Clean all books
    python cleanup_english_mappings.py MAT MRK      # Clean specific books
    python cleanup_english_mappings.py --dry-run    # Preview changes without saving
"""

import json
import re
import sys
from pathlib import Path
from collections import defaultdict

# All 66 Bible books
ALL_BOOKS = [
    # Old Testament (39 books)
    "GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA",
    "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO",
    "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO",
    "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL",
    # New Testament (27 books)
    "MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO",
    "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI",
    "TIT", "PHM", "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"
]

MAPPINGS_DIR = Path("bible-translations/mappings")

# Arabic Unicode ranges
ARABIC_RANGE = r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]'

def has_arabic_chars(text):
    """Check if text contains Arabic characters."""
    return bool(re.search(ARABIC_RANGE, text))

def clean_english_translation(text):
    """
    Clean up English translation by removing:
    1. "TRANSLATION." prefix
    2. Arabic text followed by period and space
    3. Standalone Arabic text
    """
    if not text or not isinstance(text, str):
        return text

    original = text

    # Remove "TRANSLATION." prefix (case insensitive)
    text = re.sub(r'^TRANSLATION\.\s*', '', text, flags=re.IGNORECASE)

    # Remove Arabic text followed by period and optional space (e.g., "وَسَقَطَ. Fell" -> "Fell")
    text = re.sub(ARABIC_RANGE + r'+\.\s*', '', text)

    # If the result still has Arabic characters, it might be standalone Arabic - remove it
    if has_arabic_chars(text):
        # Try to extract just the English part after any Arabic
        # Look for pattern: Arabic text, then English
        parts = re.split(ARABIC_RANGE + r'+', text)
        # Get the last non-empty part which should be English
        for part in reversed(parts):
            cleaned = part.strip()
            if cleaned and not has_arabic_chars(cleaned):
                text = cleaned
                break

    # Final cleanup: strip whitespace
    text = text.strip()

    return text if text else original

def clean_chapter(book, chapter, dry_run=False):
    """
    Clean up a single chapter by fixing English translations.
    Returns (cleaned_count, total_mappings)
    """
    chapter_file = MAPPINGS_DIR / book / f"{chapter}.json"

    if not chapter_file.exists():
        return 0, 0

    with open(chapter_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    cleaned_count = 0
    total_mappings = 0

    # Process each verse
    for verse_num, verse_data in data.get('verses', {}).items():
        for mapping in verse_data.get('mappings', []):
            total_mappings += 1
            en = mapping.get('en', '')

            if en:
                cleaned = clean_english_translation(en)

                if cleaned != en:
                    cleaned_count += 1
                    if not dry_run:
                        print(f"      {book} {chapter}:{verse_num}")
                        print(f"        Before: {en}")
                        print(f"        After:  {cleaned}")
                    mapping['en'] = cleaned

    # Save updated chapter (unless dry run)
    if cleaned_count > 0 and not dry_run:
        with open(chapter_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    return cleaned_count, total_mappings

def clean_book(book, dry_run=False):
    """Clean up all chapters in a book."""
    book_dir = MAPPINGS_DIR / book

    if not book_dir.exists():
        print(f"  {book}: No mappings found")
        return 0, 0

    print(f"\n{book}:")

    total_cleaned = 0
    total_mappings = 0

    for chapter_file in sorted(book_dir.glob("*.json"), key=lambda x: int(x.stem)):
        chapter = chapter_file.stem
        cleaned, mappings = clean_chapter(book, chapter, dry_run)

        total_cleaned += cleaned
        total_mappings += mappings

    # Print summary
    if total_cleaned > 0:
        action = "Would clean" if dry_run else "Cleaned"
        print(f"  {action} {total_cleaned}/{total_mappings} mappings ({total_cleaned/total_mappings*100:.1f}%)")
    else:
        print(f"  ✓ No issues found")

    return total_cleaned, total_mappings

def main():
    if "--help" in sys.argv or "-h" in sys.argv:
        print(__doc__)
        sys.exit(0)

    dry_run = "--dry-run" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith('--')]

    # Determine which books to process
    if args:
        books = [b.upper() for b in args if b.upper() in ALL_BOOKS]
        if not books:
            print("Error: No valid books specified")
            print(f"Valid books: {', '.join(ALL_BOOKS)}")
            sys.exit(1)
    else:
        books = ALL_BOOKS

    print(f"{'='*70}")
    if dry_run:
        print(f"DRY RUN: Checking {len(books)} books")
    else:
        print(f"CLEANING UP {len(books)} books")
        print("Removing Arabic text and TRANSLATION prefix from English fields")
    print(f"{'='*70}")

    grand_total_cleaned = 0
    grand_total_mappings = 0

    for book in books:
        cleaned, mappings = clean_book(book, dry_run)
        grand_total_cleaned += cleaned
        grand_total_mappings += mappings

    print(f"\n{'='*70}")
    print("OVERALL SUMMARY:")
    print(f"{'='*70}")
    if grand_total_mappings > 0:
        print(f"Total mappings cleaned: {grand_total_cleaned}/{grand_total_mappings} ({grand_total_cleaned/grand_total_mappings*100:.1f}%)")
    else:
        print("No mappings found")

    if dry_run:
        print("\nDry run complete! Run without --dry-run to apply changes.")
    else:
        print("\nCleanup complete!")
    print(f"{'='*70}")

if __name__ == "__main__":
    main()

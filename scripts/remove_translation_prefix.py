#!/usr/bin/env python3
"""
Remove "TRANSLATION. " prefix and Arabic text from English mappings.

Fixes mappings like:
  "TRANSLATION. And that is" → "And that is"
  "translation. because" → "because"
  "TRANSLATION: the overseer" → "the overseer"
  "وَسَقَطَ. Fell" → "Fell"
  "Arabic text. English text" → "English text"

Usage:
    python3 remove_translation_prefix.py                  # Clean all books (OT + NT)
    python3 remove_translation_prefix.py MAT MRK         # Clean specific books
    python3 remove_translation_prefix.py --dry-run       # Preview changes
    python3 remove_translation_prefix.py --scan          # Just count issues
"""

import json
import re
import sys
from pathlib import Path

# ============================================================================
# CONFIGURATION
# ============================================================================

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

# Patterns to remove (case-insensitive)
PATTERNS_TO_REMOVE = [
    r'^TRANSLATION[.:\s]+',      # "TRANSLATION. " or "TRANSLATION: " or "TRANSLATION "
    r'^translation[.:\s]+',      # "translation. " or "translation: " or "translation "
    r'^Translation[.:\s]+',      # "Translation. " or "Translation: " or "Translation "
    r'^TRANSLATE[.:\s]+',        # "TRANSLATE. " or "TRANSLATE: " or "TRANSLATE "
    r'^translate[.:\s]+',        # "translate. " or "translate: " or "translate "
    r'^Translate[.:\s]+',        # "Translate. " or "Translate: " or "Translate "
]

# ============================================================================
# CLEANUP FUNCTIONS
# ============================================================================

def has_arabic_chars(text):
    """Check if text contains Arabic characters."""
    return bool(re.search(ARABIC_RANGE, text))


def clean_translation_prefix(text):
    """
    Remove TRANSLATION prefix and Arabic text from English field.
    Returns (cleaned_text, was_modified)
    """
    if not text or not isinstance(text, str):
        return text, False

    original = text
    text = text.strip()

    # Check if it's ONLY Arabic characters (no English at all)
    if text and has_arabic_chars(text):
        # Extract non-Arabic parts
        non_arabic_parts = re.split(ARABIC_RANGE + r'+', text)
        non_arabic_parts = [p.strip() for p in non_arabic_parts if p.strip()]

        # If there are no non-Arabic parts, this is purely Arabic - leave empty
        if not non_arabic_parts:
            return '', original != ''

    # Remove "TRANSLATION." prefix (case insensitive)
    for pattern in PATTERNS_TO_REMOVE:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)

    # Check if result is JUST "TRANSLATION" or "translation" or "TRANSLATION."
    if re.match(r'^TRANSLATION\.?$', text.strip(), re.IGNORECASE):
        return '', original != ''

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

        # If still has Arabic after extraction attempt, check if it's purely Arabic
        if has_arabic_chars(text):
            # Extract all non-Arabic characters
            non_arabic = re.sub(ARABIC_RANGE + r'+', '', text).strip()
            if non_arabic:
                text = non_arabic
            else:
                # Purely Arabic, leave empty
                return '', original != ''

    # Final cleanup: strip whitespace
    text = text.strip()

    return text, text != original


def process_chapter(book, chapter, dry_run=False, scan_only=False):
    """
    Process a single chapter, removing TRANSLATION prefixes.
    Returns (fixed_count, total_mappings, examples)
    """
    chapter_file = MAPPINGS_DIR / book / f"{chapter}.json"

    if not chapter_file.exists():
        return 0, 0, []

    with open(chapter_file, 'r') as f:
        data = json.load(f)

    fixed_count = 0
    total_mappings = 0
    examples = []
    modified = False

    for verse_num, verse_data in data.get('verses', {}).items():
        for mapping in verse_data.get('mappings', []):
            total_mappings += 1
            en = mapping.get('en', '')

            cleaned, was_modified = clean_translation_prefix(en)

            if was_modified:
                fixed_count += 1

                # Store example for display
                if len(examples) < 3:
                    examples.append({
                        'ref': f"{book} {chapter}:{verse_num}",
                        'ar': mapping.get('ar', ''),
                        'old': en,
                        'new': cleaned
                    })

                # Update mapping (unless scan only)
                if not scan_only and not dry_run:
                    mapping['en'] = cleaned
                    modified = True

    # Save if modified
    if modified and not dry_run:
        with open(chapter_file, 'w') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    return fixed_count, total_mappings, examples


def process_book(book, dry_run=False, scan_only=False):
    """Process all chapters in a book."""
    book_dir = MAPPINGS_DIR / book

    if not book_dir.exists():
        return 0, 0

    total_fixed = 0
    total_mappings = 0
    all_examples = []

    for chapter_file in sorted(book_dir.glob("*.json"), key=lambda x: int(x.stem)):
        chapter = chapter_file.stem
        fixed, mappings, examples = process_chapter(book, chapter, dry_run, scan_only)

        total_fixed += fixed
        total_mappings += mappings
        all_examples.extend(examples)

    return total_fixed, total_mappings, all_examples


# ============================================================================
# MAIN
# ============================================================================

def main():
    if "--help" in sys.argv or "-h" in sys.argv:
        print(__doc__)
        sys.exit(0)

    dry_run = "--dry-run" in sys.argv
    scan_only = "--scan" in sys.argv
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
    if scan_only:
        print(f"SCANNING {len(books)} books (OT + NT)")
    elif dry_run:
        print(f"DRY RUN: {len(books)} books (OT + NT)")
    else:
        print(f"CLEANING {len(books)} books (OT + NT)")
    print(f"Removing TRANSLATION prefix and Arabic text from English fields")
    print(f"{'='*70}\n")

    grand_total_fixed = 0
    grand_total_mappings = 0

    for book in books:
        fixed, mappings, examples = process_book(book, dry_run, scan_only)

        if fixed > 0:
            pct = (fixed / mappings * 100) if mappings > 0 else 0
            print(f"{book}: {fixed}/{mappings} mappings cleaned ({pct:.1f}%)")

            # Show examples
            for ex in examples[:3]:
                print(f"  {ex['ref']}: '{ex['ar']}'")
                print(f"    Before: '{ex['old']}'")
                print(f"    After:  '{ex['new']}'")

            if len(examples) > 3:
                print(f"  ... and {len(examples) - 3} more")
            print()

        grand_total_fixed += fixed
        grand_total_mappings += mappings

    print(f"{'='*70}")
    print(f"SUMMARY:")
    print(f"  Total mappings cleaned: {grand_total_fixed}/{grand_total_mappings}")
    if grand_total_mappings > 0:
        pct = (grand_total_fixed / grand_total_mappings * 100)
        print(f"  Percentage: {pct:.2f}%")

    if dry_run:
        print("\nDry run complete! Run without --dry-run to apply changes.")
    elif scan_only:
        print("\nScan complete!")
    else:
        print("\nCleanup complete!")
    print(f"{'='*70}")


if __name__ == "__main__":
    main()

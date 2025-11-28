#!/usr/bin/env python3
"""
Remove "TRANSLATION. " prefix from English mappings.

Fixes mappings like:
  "TRANSLATION. And that is" → "And that is"
  "translation. because" → "because"
  "TRANSLATION: the overseer" → "the overseer"

Usage:
    python3 remove_translation_prefix.py                  # Clean all NT books
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

NT_BOOKS = [
    "MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO",
    "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI",
    "TIT", "PHM", "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"
]

MAPPINGS_DIR = Path("bible-translations/mappings")

# Patterns to remove (case-insensitive)
PATTERNS_TO_REMOVE = [
    r'^TRANSLATION[.:]\s*',      # "TRANSLATION. " or "TRANSLATION: "
    r'^translation[.:]\s*',      # "translation. " or "translation: "
    r'^Translation[.:]\s*',      # "Translation. " or "Translation: "
    r'^TRANSLATE[.:]\s*',        # "TRANSLATE. " or "TRANSLATE: "
    r'^translate[.:]\s*',        # "translate. " or "translate: "
    r'^Translate[.:]\s*',        # "Translate. " or "Translate: "
]

# ============================================================================
# CLEANUP FUNCTIONS
# ============================================================================

def clean_translation_prefix(text):
    """
    Remove TRANSLATION prefix from text.
    Returns (cleaned_text, was_modified)
    """
    original = text

    for pattern in PATTERNS_TO_REMOVE:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)

    # Also handle case where it's JUST "TRANSLATION" or "translation"
    if text.strip().lower() in ['translation', 'translate']:
        return '', True

    return text.strip(), text != original


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
        books = [b.upper() for b in args if b.upper() in NT_BOOKS]
        if not books:
            print("Error: No valid NT books specified")
            print(f"Valid books: {', '.join(NT_BOOKS)}")
            sys.exit(1)
    else:
        books = NT_BOOKS

    print(f"{'='*70}")
    if scan_only:
        print(f"SCANNING {len(books)} NT books")
    elif dry_run:
        print(f"DRY RUN: {len(books)} NT books")
    else:
        print(f"CLEANING {len(books)} NT books")
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

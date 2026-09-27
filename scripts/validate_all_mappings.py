#!/usr/bin/env python3
"""
Validation Script for Bible Mappings - READ ONLY

Scans all mappings in bible-translations/mappings/ for quality issues:
1. Arabic text in English fields
2. "translation" or "TRANSLATION" placeholder text
3. Empty English translations
4. Bracketed placeholders

This script ONLY REPORTS issues - it does NOT modify any files.

Usage:
    python validate_all_mappings.py              # Scan all books
    python validate_all_mappings.py MAT MRK      # Scan specific books
    python validate_all_mappings.py --summary    # Show summary only (no details)
"""

import json
import re
import sys
from pathlib import Path
from collections import defaultdict

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

# ============================================================================
# DETECTION FUNCTIONS
# ============================================================================

def has_arabic_chars(text):
    """Check if text contains Arabic characters."""
    return bool(re.search(ARABIC_RANGE, text))


def has_translation_placeholder(text):
    """Check if text contains 'translation' or 'TRANSLATION' placeholder."""
    text_lower = text.strip().lower()

    # Check for "translation" or "translate" in any case
    if 'translation' in text_lower or 'translate' in text_lower:
        return True

    # Check for common placeholder patterns
    placeholder_patterns = [
        r'^\[.*\]$',
        r'^translate:',
        r'^translation:',
        r'^\?\?\?',
        r'^FIXME',
        r'^TODO',
        r'^PLACEHOLDER',
    ]

    for pattern in placeholder_patterns:
        if re.match(pattern, text.strip(), re.IGNORECASE):
            return True

    return False


def is_empty(text):
    """Check if text is empty or whitespace only."""
    return not text or not text.strip()


def validate_mapping(mapping, verse_ref):
    """
    Validate a single mapping entry.
    Returns list of issue dictionaries.
    """
    issues = []
    en = mapping.get('en', '')
    ar = mapping.get('ar', '')

    # Check for empty English
    if is_empty(en):
        issues.append({
            'type': 'empty_english',
            'verse': verse_ref,
            'arabic': ar,
            'english': en,
            'message': 'Empty English translation'
        })

    # Check for Arabic in English field
    elif has_arabic_chars(en):
        issues.append({
            'type': 'arabic_in_english',
            'verse': verse_ref,
            'arabic': ar,
            'english': en,
            'message': 'Arabic characters in English field'
        })

    # Check for translation placeholders
    elif has_translation_placeholder(en):
        issues.append({
            'type': 'translation_placeholder',
            'verse': verse_ref,
            'arabic': ar,
            'english': en,
            'message': 'Translation placeholder text'
        })

    return issues


def validate_chapter(book, chapter, show_details=True):
    """
    Validate all mappings in a single chapter.
    Returns list of issues.
    """
    chapter_file = MAPPINGS_DIR / book / f"{chapter}.json"

    if not chapter_file.exists():
        return []

    try:
        with open(chapter_file, 'r') as f:
            data = json.load(f)
    except Exception as e:
        return [{
            'type': 'file_error',
            'verse': f'{book} {chapter}',
            'message': f'Error reading file: {e}'
        }]

    issues = []
    verses = data.get('verses', {})

    for verse_num, verse_data in verses.items():
        verse_ref = f"{book} {chapter}:{verse_num}"
        mappings = verse_data.get('mappings', [])

        for mapping in mappings:
            mapping_issues = validate_mapping(mapping, verse_ref)
            issues.extend(mapping_issues)

    # Print details if requested
    if show_details and issues:
        for issue in issues:
            print(f"  {issue['verse']}: {issue['message']}")
            print(f"    AR: {issue.get('arabic', 'N/A')}")
            print(f"    EN: {issue.get('english', 'N/A')}")

    return issues


def validate_book(book, show_details=True):
    """Validate all chapters in a book."""
    book_dir = MAPPINGS_DIR / book

    if not book_dir.exists():
        return []

    if show_details:
        print(f"\n{book}:")

    all_issues = []

    for chapter_file in sorted(book_dir.glob("*.json"), key=lambda x: int(x.stem)):
        chapter = chapter_file.stem
        issues = validate_chapter(book, chapter, show_details)
        all_issues.extend(issues)

    if show_details:
        if all_issues:
            print(f"  Found {len(all_issues)} issues")
        else:
            print(f"  ✓ No issues found")

    return all_issues


# ============================================================================
# MAIN VALIDATION
# ============================================================================

def validate_all_books(books, show_details=True):
    """Validate all specified books and generate summary."""
    print(f"{'='*70}")
    print(f"VALIDATING {len(books)} Bible books (READ ONLY)")
    print(f"{'='*70}")

    all_issues = []
    issue_counts = defaultdict(int)
    books_with_issues = []

    for book in books:
        book_issues = validate_book(book, show_details)

        if book_issues:
            books_with_issues.append((book, len(book_issues)))
            all_issues.extend(book_issues)

            # Count issue types
            for issue in book_issues:
                issue_counts[issue['type']] += 1

    # Print summary
    print(f"\n{'='*70}")
    print("SUMMARY")
    print(f"{'='*70}")

    if all_issues:
        print(f"\nTotal issues found: {len(all_issues)}")
        print(f"\nIssue breakdown:")
        print(f"  - Arabic in English fields: {issue_counts['arabic_in_english']}")
        print(f"  - Translation placeholders: {issue_counts['translation_placeholder']}")
        print(f"  - Empty English translations: {issue_counts['empty_english']}")
        print(f"  - File errors: {issue_counts['file_error']}")

        print(f"\nBooks with issues ({len(books_with_issues)}):")
        print(f"{'Book':<6} {'Issues':<8}")
        print("-" * 20)
        for book, count in sorted(books_with_issues, key=lambda x: x[1], reverse=True):
            print(f"{book:<6} {count:<8}")
    else:
        print("\n✓ No issues found in any books!")

    print(f"\n{'='*70}")
    print("Validation complete - NO FILES MODIFIED")
    print(f"{'='*70}")


# ============================================================================
# MAIN
# ============================================================================

def main():
    if "--help" in sys.argv or "-h" in sys.argv:
        print(__doc__)
        sys.exit(0)

    show_details = "--summary" not in sys.argv
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

    validate_all_books(books, show_details)


if __name__ == "__main__":
    main()

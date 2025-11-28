#!/usr/bin/env python3
"""
Simple NT Mappings Cleanup - Fast cleanup without Ollama

Removes verses with problematic mappings:
1. "translation" or "TRANSLATION" placeholders
2. Arabic text in English fields
3. [bracketed] placeholders
4. Empty English translations

This script REMOVES entire verses that have issues - you can regenerate them later.

Usage:
    python cleanup_nt_mappings_simple.py                  # Clean all NT books
    python cleanup_nt_mappings_simple.py MAT MRK         # Clean specific books
    python cleanup_nt_mappings_simple.py --dry-run       # Preview changes without saving
    python cleanup_nt_mappings_simple.py --scan          # Just report issues, don't fix
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

MAPPINGS_DIR = Path("bible-maps-word-gemma3/mappings")

# Arabic Unicode ranges
ARABIC_RANGE = r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]'

# ============================================================================
# DETECTION FUNCTIONS
# ============================================================================

def has_arabic_chars(text):
    """Check if text contains Arabic characters."""
    return bool(re.search(ARABIC_RANGE, text))


def is_placeholder(text):
    """Check if text is a placeholder that needs fixing."""
    text_stripped = text.strip()
    text_lower = text_stripped.lower()

    # Check for bracketed placeholders
    if text_stripped.startswith('[') and text_stripped.endswith(']'):
        return True

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
        if re.match(pattern, text_stripped, re.IGNORECASE):
            return True

    return False


def has_issues(verse_data):
    """
    Check if verse has any problematic mappings.
    Returns (has_issues, issue_types)
    """
    issues = []

    for m in verse_data.get('mappings', []):
        en = m.get('en', '').strip()

        if not en:
            issues.append('empty')
        elif is_placeholder(en):
            issues.append('placeholder')
        elif has_arabic_chars(en):
            issues.append('arabic_in_english')

    return bool(issues), issues


# ============================================================================
# CLEANUP FUNCTIONS
# ============================================================================

def cleanup_chapter(book, chapter, dry_run=False, scan_only=False):
    """
    Clean up a single chapter by REMOVING problematic verses.
    Returns (removed_count, total_verses, issues_summary)
    """
    chapter_file = MAPPINGS_DIR / book / f"{chapter}.json"

    if not chapter_file.exists():
        return 0, 0, {}

    with open(chapter_file, 'r') as f:
        data = json.load(f)

    verses = data.get('verses', {})
    total_verses = len(verses)
    verses_to_remove = []
    issue_summary = {
        'placeholder': 0,
        'arabic_in_english': 0,
        'empty': 0
    }

    # Check each verse
    for verse_num, verse_data in verses.items():
        has_problem, issue_types = has_issues(verse_data)

        if has_problem:
            verses_to_remove.append(verse_num)

            # Count issue types
            for issue in issue_types:
                if issue in issue_summary:
                    issue_summary[issue] += 1

            if not scan_only:
                print(f"      {book} {chapter}:{verse_num} - Issues: {', '.join(set(issue_types))}")

    # Remove problematic verses (unless dry run or scan only)
    if verses_to_remove and not dry_run and not scan_only:
        for verse_num in verses_to_remove:
            del data['verses'][verse_num]

        # Save updated chapter
        with open(chapter_file, 'w') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    return len(verses_to_remove), total_verses, issue_summary


def cleanup_book(book, dry_run=False, scan_only=False):
    """Clean up all chapters in a book."""
    book_dir = MAPPINGS_DIR / book

    if not book_dir.exists():
        if not scan_only:
            print(f"  {book}: No mappings found")
        return

    if not scan_only:
        print(f"\n{book}:")

    total_removed = 0
    total_verses = 0
    total_issues = {
        'placeholder': 0,
        'arabic_in_english': 0,
        'empty': 0
    }

    for chapter_file in sorted(book_dir.glob("*.json"), key=lambda x: int(x.stem)):
        chapter = chapter_file.stem
        removed, verses, issues = cleanup_chapter(book, chapter, dry_run, scan_only)

        total_removed += removed
        total_verses += verses

        for issue_type, count in issues.items():
            total_issues[issue_type] += count

    # Print summary
    if not scan_only:
        if total_removed > 0:
            action = "Would remove" if dry_run else "Removed"
            print(f"  {action} {total_removed}/{total_verses} verses ({total_removed/total_verses*100:.1f}%)")

            if total_issues['placeholder'] > 0:
                print(f"    - Placeholders: {total_issues['placeholder']}")
            if total_issues['arabic_in_english'] > 0:
                print(f"    - Arabic in English: {total_issues['arabic_in_english']}")
            if total_issues['empty'] > 0:
                print(f"    - Empty: {total_issues['empty']}")
        else:
            print(f"  ✓ No issues found")

    return total_removed, total_verses, total_issues


# ============================================================================
# SCAN FUNCTION
# ============================================================================

def scan_all_books(books):
    """Scan all books and report statistics."""
    print(f"{'='*70}")
    print(f"SCANNING {len(books)} NT books for issues")
    print(f"{'='*70}\n")

    grand_total_removed = 0
    grand_total_verses = 0
    grand_issues = {
        'placeholder': 0,
        'arabic_in_english': 0,
        'empty': 0
    }

    book_stats = []

    for book in books:
        removed, verses, issues = cleanup_book(book, dry_run=False, scan_only=True)
        grand_total_removed += removed
        grand_total_verses += verses

        for issue_type, count in issues.items():
            grand_issues[issue_type] += count

        if removed > 0:
            book_stats.append((book, removed, verses))

    # Print results
    if book_stats:
        print(f"\nBooks with issues:")
        print(f"{'Book':<6} {'Problematic':<12} {'Total':<8} {'%':>6}")
        print("-" * 40)
        for book, removed, verses in book_stats:
            pct = removed / verses * 100 if verses > 0 else 0
            print(f"{book:<6} {removed:<12} {verses:<8} {pct:>5.1f}%")

        print("\n" + "="*70)
        print("OVERALL SUMMARY:")
        print("="*70)
        print(f"Total verses with issues: {grand_total_removed}/{grand_total_verses} ({grand_total_removed/grand_total_verses*100:.1f}%)")
        print(f"\nIssue breakdown:")
        print(f"  - Placeholders: {grand_issues['placeholder']}")
        print(f"  - Arabic in English: {grand_issues['arabic_in_english']}")
        print(f"  - Empty: {grand_issues['empty']}")
    else:
        print("\n✓ No issues found in any NT books!")


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

    if scan_only:
        scan_all_books(books)
    else:
        print(f"{'='*70}")
        if dry_run:
            print(f"DRY RUN: Checking {len(books)} NT books")
        else:
            print(f"CLEANING UP {len(books)} NT books")
            print("NOTE: Problematic verses will be REMOVED (regenerate later)")
        print(f"{'='*70}")

        for book in books:
            cleanup_book(book, dry_run)

        print(f"\n{'='*70}")
        if dry_run:
            print("Dry run complete! Run without --dry-run to apply changes.")
        else:
            print("Cleanup complete! Problematic verses removed.")
            print("Run your mapping scripts to regenerate the removed verses.")
        print(f"{'='*70}")


if __name__ == "__main__":
    main()

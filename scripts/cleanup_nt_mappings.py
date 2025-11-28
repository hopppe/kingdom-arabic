#!/usr/bin/env python3
"""
Clean up New Testament mappings.

Fixes:
1. Remove "translation" placeholder text from English mappings
2. Detect and fix Arabic text in English fields
3. Remove [bracketed] placeholders
4. Fix common corruptions

Usage:
    python cleanup_nt_mappings.py                  # Clean all NT books
    python cleanup_nt_mappings.py MAT MRK         # Clean specific books
    python cleanup_nt_mappings.py --dry-run       # Preview changes without saving
"""

import json
import re
import sys
import requests
from pathlib import Path

# ============================================================================
# CONFIGURATION
# ============================================================================

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma3:12b"

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

    # Check for bracketed placeholders (case-insensitive)
    if text_stripped.startswith('[') and text_stripped.endswith(']'):
        return True

    # Check for "translation" or "translate" in any case
    # This catches: translation, Translation, TRANSLATION, etc.
    if 'translation' in text_lower or 'translate' in text_lower:
        return True

    # Check for common placeholder patterns (all case-insensitive)
    placeholder_patterns = [
        r'^\[.*\]$',
        r'^translate:',
        r'^translation:',
        r'^\?\?\?',
        r'^FIXME',
        r'^TODO',
        r'^PLACEHOLDER',
        r'^TRANSLATE$',          # Exact match for just "TRANSLATE"
        r'^TRANSLATION$',        # Exact match for just "TRANSLATION"
    ]

    for pattern in placeholder_patterns:
        if re.match(pattern, text_stripped, re.IGNORECASE):
            return True

    return False


def detect_issues(verse_data):
    """
    Detect all issues in a verse's mappings.
    Returns dict of issue types and their locations.
    """
    issues = {
        'placeholders': [],
        'arabic_in_english': [],
        'empty': [],
        'suspicious': []
    }

    for i, m in enumerate(verse_data.get('mappings', [])):
        en = m.get('en', '').strip()
        ar = m.get('ar', '').strip()

        # Empty English
        if not en:
            issues['empty'].append(i)
            continue

        # Placeholder text
        if is_placeholder(en):
            issues['placeholders'].append(i)

        # Arabic chars in English field
        elif has_arabic_chars(en):
            issues['arabic_in_english'].append(i)

        # Suspicious patterns (very short, single char, etc.)
        elif len(en) == 1 and en not in ['I', 'a', 'A']:
            issues['suspicious'].append(i)

    return issues


# ============================================================================
# FIX FUNCTIONS
# ============================================================================

def translate_word_with_ollama(arabic_word, verse_ar, verse_en):
    """Use Ollama to translate a single word with verse context."""
    prompt = f"""Translate this Arabic word to English using verse context.

Arabic verse: {verse_ar}
English verse: {verse_en}

Arabic word: {arabic_word}

Reply with ONLY the English translation (1-3 words), nothing else:"""

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0,
                "num_predict": 50
            }
        }, timeout=60)

        translation = response.json().get("response", "").strip()
        # Clean up response
        translation = translation.strip('"\'.,!?')
        translation = re.sub(r'^(Translation:\s*|TRANSLATION:\s*)', '', translation, flags=re.IGNORECASE).strip()

        if translation and len(translation) > 0 and not has_arabic_chars(translation):
            return translation

        return None
    except Exception as e:
        print(f"      Error translating: {e}")
        return None


def fix_mapping(mapping, verse_data, issue_type):
    """
    Fix a single mapping based on issue type.
    Returns (fixed_mapping, success_bool)
    """
    ar_word = mapping['ar']
    verse_ar = verse_data['ar']
    verse_en = verse_data['en']

    # Get translation from Ollama
    new_translation = translate_word_with_ollama(ar_word, verse_ar, verse_en)

    if new_translation:
        mapping['en'] = new_translation
        return True

    return False


def cleanup_verse(verse_data, fix_issues=True):
    """
    Clean up a single verse's mappings.
    Returns (num_fixed, issues_found)
    """
    issues = detect_issues(verse_data)
    total_issues = sum(len(v) for v in issues.values())

    if total_issues == 0:
        return 0, issues

    if not fix_issues:
        return 0, issues

    # Fix issues
    fixed_count = 0
    mappings = verse_data['mappings']

    # Fix placeholders
    for idx in issues['placeholders']:
        if fix_mapping(mappings[idx], verse_data, 'placeholder'):
            fixed_count += 1

    # Fix Arabic in English
    for idx in issues['arabic_in_english']:
        if fix_mapping(mappings[idx], verse_data, 'arabic_in_english'):
            fixed_count += 1

    # Fix empty
    for idx in issues['empty']:
        if fix_mapping(mappings[idx], verse_data, 'empty'):
            fixed_count += 1

    return fixed_count, issues


def cleanup_chapter(book, chapter, dry_run=False):
    """Clean up a single chapter. Returns (fixed_count, issues_summary)."""
    chapter_file = MAPPINGS_DIR / book / f"{chapter}.json"

    if not chapter_file.exists():
        return 0, {}

    with open(chapter_file, 'r') as f:
        data = json.load(f)

    total_fixed = 0
    all_issues = {
        'placeholders': 0,
        'arabic_in_english': 0,
        'empty': 0,
        'suspicious': 0
    }

    for verse_num in sorted(data.get('verses', {}).keys(), key=int):
        verse_data = data['verses'][verse_num]
        fixed, issues = cleanup_verse(verse_data, fix_issues=not dry_run)
        total_fixed += fixed

        # Accumulate issues
        for issue_type, locations in issues.items():
            all_issues[issue_type] += len(locations)

        if fixed > 0:
            print(f"      {book} {chapter}:{verse_num} - Fixed {fixed} mappings")

    # Save if modified and not dry run
    if total_fixed > 0 and not dry_run:
        with open(chapter_file, 'w') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    return total_fixed, all_issues


def cleanup_book(book, dry_run=False):
    """Clean up all chapters in a book."""
    book_dir = MAPPINGS_DIR / book

    if not book_dir.exists():
        print(f"  {book}: No mappings found")
        return

    print(f"\n{book}:")

    total_fixed = 0
    total_issues = {
        'placeholders': 0,
        'arabic_in_english': 0,
        'empty': 0,
        'suspicious': 0
    }

    for chapter_file in sorted(book_dir.glob("*.json"), key=lambda x: int(x.stem)):
        chapter = chapter_file.stem
        fixed, issues = cleanup_chapter(book, chapter, dry_run)
        total_fixed += fixed

        for issue_type, count in issues.items():
            total_issues[issue_type] += count

    # Print summary
    if total_fixed > 0 or any(total_issues.values()):
        action = "Would fix" if dry_run else "Fixed"
        print(f"  {action} {total_fixed} mappings")

        if total_issues['placeholders'] > 0:
            print(f"    - Placeholders: {total_issues['placeholders']}")
        if total_issues['arabic_in_english'] > 0:
            print(f"    - Arabic in English: {total_issues['arabic_in_english']}")
        if total_issues['empty'] > 0:
            print(f"    - Empty: {total_issues['empty']}")
        if total_issues['suspicious'] > 0:
            print(f"    - Suspicious: {total_issues['suspicious']}")
    else:
        print(f"  ✓ No issues found")


# ============================================================================
# SCAN FUNCTION (NO FIXES)
# ============================================================================

def scan_book(book):
    """Scan a book for issues without fixing."""
    book_dir = MAPPINGS_DIR / book

    if not book_dir.exists():
        return

    issues_by_type = {
        'placeholders': [],
        'arabic_in_english': [],
        'empty': [],
        'suspicious': []
    }

    for chapter_file in sorted(book_dir.glob("*.json"), key=lambda x: int(x.stem)):
        chapter = chapter_file.stem

        with open(chapter_file, 'r') as f:
            data = json.load(f)

        for verse_num in sorted(data.get('verses', {}).keys(), key=int):
            verse_data = data['verses'][verse_num]
            issues = detect_issues(verse_data)

            for issue_type, locations in issues.items():
                if locations:
                    for idx in locations:
                        m = verse_data['mappings'][idx]
                        issues_by_type[issue_type].append({
                            'ref': f"{book} {chapter}:{verse_num}",
                            'ar': m.get('ar', ''),
                            'en': m.get('en', '')
                        })

    # Print summary
    total = sum(len(v) for v in issues_by_type.values())
    if total > 0:
        print(f"\n{book}: {total} issues found")

        if issues_by_type['placeholders']:
            print(f"  Placeholders ({len(issues_by_type['placeholders'])} found):")
            for item in issues_by_type['placeholders'][:5]:
                print(f"    {item['ref']}: '{item['ar']}' → '{item['en']}'")
            if len(issues_by_type['placeholders']) > 5:
                print(f"    ... and {len(issues_by_type['placeholders']) - 5} more")

        if issues_by_type['arabic_in_english']:
            print(f"  Arabic in English ({len(issues_by_type['arabic_in_english'])} found):")
            for item in issues_by_type['arabic_in_english'][:5]:
                print(f"    {item['ref']}: '{item['ar']}' → '{item['en']}'")
            if len(issues_by_type['arabic_in_english']) > 5:
                print(f"    ... and {len(issues_by_type['arabic_in_english']) - 5} more")

        if issues_by_type['empty']:
            print(f"  Empty translations: {len(issues_by_type['empty'])}")

        if issues_by_type['suspicious']:
            print(f"  Suspicious patterns: {len(issues_by_type['suspicious'])}")


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
        print(f"SCANNING {len(books)} NT books for issues")
    elif dry_run:
        print(f"DRY RUN: Checking {len(books)} NT books")
    else:
        print(f"CLEANING UP {len(books)} NT books")
    print(f"{'='*70}")

    if scan_only:
        for book in books:
            scan_book(book)
    else:
        for book in books:
            cleanup_book(book, dry_run)

    print(f"\n{'='*70}")
    if scan_only:
        print("Scan complete!")
    elif dry_run:
        print("Dry run complete! Run without --dry-run to apply fixes.")
    else:
        print("Cleanup complete!")
    print(f"{'='*70}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Fix unmapped gaps in Bible word mappings by finding and adding missing Arabic words.
"""

import json
import sys
from pathlib import Path

def find_gaps(verse_data):
    """Find all unmapped gaps in a verse."""
    ar_text = verse_data['ar']
    mappings = sorted(verse_data['mappings'], key=lambda x: x['start'])
    gaps = []

    prev_end = 0
    for m in mappings:
        if m['start'] > prev_end:
            gap_text = ar_text[prev_end:m['start']]
            # Check if gap contains actual words (not just spaces/punctuation)
            if gap_text.strip() and not all(c in ' ،.؟!:«»؛ًٌٍَُِّْ' for c in gap_text):
                gaps.append({
                    'start': prev_end,
                    'end': m['start'],
                    'text': gap_text,
                    'insert_before': mappings.index(m)
                })
        prev_end = m['end']

    # Check end of verse
    if prev_end < len(ar_text):
        remaining = ar_text[prev_end:]
        if remaining.strip() and not all(c in ' ،.؟!:«»؛ًٌٍَُِّْ' for c in remaining):
            gaps.append({
                'start': prev_end,
                'end': len(ar_text),
                'text': remaining,
                'insert_before': len(mappings)
            })

    return gaps

def guess_english_translation(ar_word, en_verse):
    """Try to guess the English translation for an Arabic word."""
    # Common Arabic words and their translations
    common_words = {
        'إِبْرَاهِيمَ': 'Abraham',
        'إِبْرَاهِيمُ': 'Abraham',
        'مُوسَى': 'Moses',
        'دَاوُدَ': 'David',
        'يَسُوعَ': 'Jesus',
        'يَسُوعُ': 'Jesus',
        'بُطْرُسُ': 'Peter',
        'بُطْرُسَ': 'Peter',
        'بُولُسُ': 'Paul',
        'بُولُسَ': 'Paul',
        'مِنَ': 'from',
        'إِلَى': 'to',
        'عَلَى': 'on',
        'فِي': 'in',
        'كَانَ': 'was',
        'أَنْ': 'to',
        'أَنَّ': 'that',
        'مَعَهُ': 'with him',
        'مَعَهَا': 'with her',
        'إِلَيْهِ': 'to him',
        'إِلَيْهَا': 'to her',
        'عَلَيْهِ': 'on him',
        'عَلَيْهِمِ': 'on them',
        'الْيَهُودِ': 'the Jews',
        'طُوبَى': 'Blessed',
        'وَقَدْ': 'and',
        'أَقُولُ': 'I say',
        'ابْنِ': 'son of',
        'حَيْثُ': 'where',
        'حَالاً': 'immediately',
        'أَنْتُمْ': 'you',
        'فَإِنَّ': 'For',
    }

    # Clean the Arabic word
    ar_clean = ar_word.strip(' ،.؟!:«»؛')

    if ar_clean in common_words:
        return common_words[ar_clean]

    # Try to find a word in English that might match based on context
    # This is a simple heuristic - look for words not yet used
    return f"[{ar_clean}]"  # Placeholder for manual review

def fix_verse_gaps(verse_data):
    """Fix all gaps in a single verse."""
    gaps = find_gaps(verse_data)
    if not gaps:
        return 0

    fixed = 0
    # Process gaps in reverse order to maintain indices
    for gap in reversed(gaps):
        ar_word = gap['text'].strip()
        if not ar_word:
            continue

        # Guess translation
        en_translation = guess_english_translation(ar_word, verse_data['en'])

        # Create new mapping
        new_mapping = {
            'ar': ar_word,
            'en': en_translation,
            'start': gap['start'],
            'end': gap['end']
        }

        # Adjust start/end to trim spaces
        while new_mapping['start'] < new_mapping['end'] and verse_data['ar'][new_mapping['start']] == ' ':
            new_mapping['start'] += 1
            new_mapping['ar'] = new_mapping['ar'].lstrip(' ')
        while new_mapping['end'] > new_mapping['start'] and verse_data['ar'][new_mapping['end']-1] == ' ':
            new_mapping['end'] -= 1
            new_mapping['ar'] = new_mapping['ar'].rstrip(' ')

        # Insert the new mapping
        verse_data['mappings'].insert(gap['insert_before'], new_mapping)
        fixed += 1

    # Re-sort mappings by position
    verse_data['mappings'].sort(key=lambda x: x['start'])

    return fixed

def fix_chapter(chapter_path, dry_run=False):
    """Fix all gaps in a chapter."""
    with open(chapter_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    total_fixed = 0
    placeholder_count = 0

    for verse_num, verse_data in data['verses'].items():
        fixed = fix_verse_gaps(verse_data)
        total_fixed += fixed

        # Count placeholders
        for m in verse_data['mappings']:
            if m['en'].startswith('[') and m['en'].endswith(']'):
                placeholder_count += 1

    if not dry_run and total_fixed > 0:
        with open(chapter_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    return total_fixed, placeholder_count

def fix_book(book_code, dry_run=False):
    """Fix all gaps in a book."""
    mappings_dir = Path("bible-translations/mappings")
    book_path = mappings_dir / book_code

    if not book_path.exists():
        print(f"Error: Book {book_code} not found")
        return

    print(f"\n{'DRY RUN: ' if dry_run else ''}Fixing gaps in {book_code}")

    total_fixed = 0
    total_placeholders = 0

    for chapter_file in sorted(book_path.glob("*.json"), key=lambda x: int(x.stem)):
        chapter_num = chapter_file.stem
        fixed, placeholders = fix_chapter(chapter_file, dry_run)

        if fixed > 0:
            action = "Would add" if dry_run else "Added"
            print(f"  Chapter {chapter_num}: {action} {fixed} mappings", end="")
            if placeholders > 0:
                print(f" ({placeholders} need manual translation)")
            else:
                print()

        total_fixed += fixed
        total_placeholders += placeholders

    action = "Would add" if dry_run else "Added"
    print(f"\nTotal: {action} {total_fixed} mappings in {book_code}")
    if total_placeholders > 0:
        print(f"  {total_placeholders} mappings have placeholder translations [word]")

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python fix_unmapped_gaps.py <BOOK>           # Fix a book")
        print("  python fix_unmapped_gaps.py <BOOK> --dry-run # Preview fixes")
        print("  python fix_unmapped_gaps.py --all            # Fix all books")
        print("\nExample:")
        print("  python fix_unmapped_gaps.py MAT")
        print("  python fix_unmapped_gaps.py --all")
        sys.exit(1)

    dry_run = "--dry-run" in sys.argv

    if sys.argv[1] == "--all":
        mappings_dir = Path("bible-translations/mappings")
        books = sorted([d.name for d in mappings_dir.iterdir() if d.is_dir()])
        # Exclude LUK and JHN as requested
        books = [b for b in books if b not in ['LUK', 'JHN']]

        print(f"Fixing gaps in {len(books)} books (excluding LUK, JHN)")
        for book in books:
            fix_book(book, dry_run)
    else:
        book_code = sys.argv[1]
        fix_book(book_code, dry_run)

if __name__ == "__main__":
    main()

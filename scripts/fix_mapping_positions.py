#!/usr/bin/env python3
"""
Fix position errors in Bible word mappings by recalculating positions
from the actual Arabic text.
"""

import json
import sys
from pathlib import Path

def find_word_position(ar_word, ar_text, search_start=0):
    """Find the position of an Arabic word in the text."""
    # Try exact match first
    pos = ar_text.find(ar_word, search_start)
    if pos != -1:
        return pos, pos + len(ar_word)

    # If not found, try without trailing punctuation
    word_clean = ar_word.rstrip('،.؟!:«»؛ ')
    if word_clean != ar_word:
        pos = ar_text.find(word_clean, search_start)
        if pos != -1:
            # Include any punctuation that follows
            end = pos + len(word_clean)
            while end < len(ar_text) and ar_text[end] in '،.؟!:«»؛ ':
                end += 1
            return pos, end

    return None, None

def diagnose_book(book_path):
    """Diagnose the error pattern for a book."""
    errors = []

    for chapter_file in sorted(book_path.glob("*.json"), key=lambda x: int(x.stem))[:3]:
        with open(chapter_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        verse = data['verses'].get('1', list(data['verses'].values())[0])
        ar_text = verse['ar']

        for m in verse['mappings'][:5]:
            extracted = ar_text[m['start']:m['end']]
            if extracted != m['ar']:
                diff = len(m['ar']) - len(extracted)
                errors.append(diff)

    if not errors:
        return "correct"
    elif len(set(errors)) == 1:
        return f"off_by_{errors[0]}"
    else:
        return "inconsistent"

def fix_chapter_positions(chapter_path, dry_run=False):
    """Fix positions in a single chapter file."""
    with open(chapter_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    fixes = 0
    issues = []

    for verse_num, verse_data in data['verses'].items():
        ar_text = verse_data['ar']
        search_pos = 0

        for i, m in enumerate(verse_data['mappings']):
            old_start = m['start']
            old_end = m['end']
            ar_word = m['ar']

            # Check if current position is correct
            extracted = ar_text[old_start:old_end]
            if extracted == ar_word:
                search_pos = old_end
                continue

            # Try to find the correct position
            new_start, new_end = find_word_position(ar_word, ar_text, search_pos)

            if new_start is not None:
                # Found it - update positions
                if not dry_run:
                    m['start'] = new_start
                    m['end'] = new_end
                fixes += 1
                search_pos = new_end
            else:
                # Could not find - record the issue
                issues.append({
                    'verse': verse_num,
                    'index': i,
                    'word': ar_word,
                    'old_start': old_start,
                    'old_end': old_end
                })
                search_pos = old_end

    if not dry_run and fixes > 0:
        with open(chapter_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    return fixes, issues

def fix_book(book_code, dry_run=False):
    """Fix all chapters in a book."""
    mappings_dir = Path("bible-translations/mappings")
    book_path = mappings_dir / book_code

    if not book_path.exists():
        print(f"Error: Book {book_code} not found")
        return

    # First diagnose
    pattern = diagnose_book(book_path)
    print(f"\n{book_code} diagnosis: {pattern}")

    if pattern == "correct":
        print(f"  Book appears correct, skipping")
        return

    total_fixes = 0
    all_issues = []

    for chapter_file in sorted(book_path.glob("*.json"), key=lambda x: int(x.stem)):
        chapter_num = chapter_file.stem
        fixes, issues = fix_chapter_positions(chapter_file, dry_run)

        if fixes > 0 or issues:
            action = "Would fix" if dry_run else "Fixed"
            print(f"  Chapter {chapter_num}: {action} {fixes} positions", end="")
            if issues:
                print(f", {len(issues)} unfixable")
            else:
                print()

        total_fixes += fixes
        all_issues.extend([(chapter_num, issue) for issue in issues])

    action = "Would fix" if dry_run else "Fixed"
    print(f"\nTotal: {action} {total_fixes} positions in {book_code}")

    if all_issues:
        print(f"Unfixable issues ({len(all_issues)}):")
        for chapter, issue in all_issues[:10]:
            print(f"  {chapter}:{issue['verse']} - '{issue['word']}' not found")
        if len(all_issues) > 10:
            print(f"  ... and {len(all_issues) - 10} more")

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python fix_mapping_positions.py <BOOK>           # Fix a book")
        print("  python fix_mapping_positions.py <BOOK> --dry-run # Preview fixes")
        print("  python fix_mapping_positions.py --diagnose       # Check all books")
        print("\nExample:")
        print("  python fix_mapping_positions.py 1CO")
        print("  python fix_mapping_positions.py MRK --dry-run")
        sys.exit(1)

    if sys.argv[1] == "--diagnose":
        mappings_dir = Path("bible-translations/mappings")
        print("Diagnosing all books...\n")

        correct = []
        needs_fix = []

        for book_dir in sorted(mappings_dir.iterdir()):
            if book_dir.is_dir():
                pattern = diagnose_book(book_dir)
                if pattern == "correct":
                    correct.append(book_dir.name)
                else:
                    needs_fix.append((book_dir.name, pattern))

        print("Correct books:")
        for book in correct:
            print(f"  {book}")

        print("\nBooks needing fixes:")
        for book, pattern in needs_fix:
            print(f"  {book}: {pattern}")
    else:
        book_code = sys.argv[1]
        dry_run = "--dry-run" in sys.argv

        if dry_run:
            print(f"DRY RUN - previewing fixes for {book_code}")

        fix_book(book_code, dry_run)

if __name__ == "__main__":
    main()

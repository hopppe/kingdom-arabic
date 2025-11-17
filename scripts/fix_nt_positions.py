#!/usr/bin/env python3
"""
Fix position mismatches in NT mapping files by finding actual word positions.
"""

import json
from pathlib import Path


def fix_book_positions(book):
    """Fix all position mismatches in a book by finding words in text."""
    mappings_dir = Path('bible-translations/mappings') / book

    if not mappings_dir.exists():
        print(f"Book {book} not found")
        return

    total_fixed = 0

    for chapter_file in sorted(mappings_dir.glob('*.json'), key=lambda x: int(x.stem)):
        with open(chapter_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        modified = False
        chapter_fixed = 0

        for verse_num, verse_data in data['verses'].items():
            ar_text = verse_data['ar']

            # Recalculate positions by finding each word sequentially
            current_pos = 0

            for mapping in verse_data['mappings']:
                ar_word = mapping['ar']

                # Find the word starting from current position
                found_pos = ar_text.find(ar_word, current_pos)

                if found_pos == -1:
                    # Try from beginning if not found (shouldn't happen)
                    found_pos = ar_text.find(ar_word)

                if found_pos != -1:
                    new_start = found_pos
                    new_end = found_pos + len(ar_word)

                    # Check if position needs updating
                    if mapping['start'] != new_start or mapping['end'] != new_end:
                        mapping['start'] = new_start
                        mapping['end'] = new_end
                        modified = True
                        chapter_fixed += 1

                    # Move current position past this word
                    current_pos = new_end
                else:
                    print(f"  Warning: '{ar_word}' not found in {book} {chapter_file.stem}:{verse_num}")

        if modified:
            with open(chapter_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  Chapter {chapter_file.stem}: Fixed {chapter_fixed} positions")
            total_fixed += chapter_fixed

    return total_fixed


def main():
    import sys

    if len(sys.argv) > 1:
        books = sys.argv[1:]
    else:
        books = ['MAT', 'ROM', 'PHP', 'HEB', 'TIT']

    print(f"Fixing position mismatches in {len(books)} books...")
    print("=" * 50)

    grand_total = 0
    for book in books:
        print(f"\n{book}:")
        fixed = fix_book_positions(book)
        if fixed:
            grand_total += fixed
            print(f"  Total: {fixed} positions fixed")
        else:
            print(f"  No fixes needed")

    print(f"\n{'=' * 50}")
    print(f"Grand total: {grand_total} positions fixed across {len(books)} books")


if __name__ == "__main__":
    main()

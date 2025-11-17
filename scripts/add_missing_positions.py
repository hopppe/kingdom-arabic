#!/usr/bin/env python3
"""Add positions to mappings that don't have start/end fields."""

import json
from pathlib import Path


def add_positions_to_chapter(chapter_file):
    """Add positions to mappings in a chapter file."""
    with open(chapter_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    modified = False
    fixed = 0

    for verse_num, verse_data in data['verses'].items():
        ar_text = verse_data['ar']
        current_pos = 0

        for mapping in verse_data['mappings']:
            if 'start' not in mapping or 'end' not in mapping:
                # Find the word in the text
                ar_word = mapping['ar']
                found_pos = ar_text.find(ar_word, current_pos)

                if found_pos != -1:
                    mapping['start'] = found_pos
                    mapping['end'] = found_pos + len(ar_word)
                    current_pos = mapping['end']
                    modified = True
                    fixed += 1
                else:
                    print(f"  Warning: '{ar_word}' not found in verse {verse_num}")

    if modified:
        with open(chapter_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    return fixed


def main():
    mappings_dir = Path('bible-translations/mappings')
    total_fixed = 0

    for book_dir in sorted(mappings_dir.iterdir()):
        if not book_dir.is_dir():
            continue

        book_fixed = 0
        for chapter_file in sorted(book_dir.glob('*.json'), key=lambda x: int(x.stem)):
            fixed = add_positions_to_chapter(chapter_file)
            if fixed > 0:
                print(f"  {book_dir.name} {chapter_file.stem}: Added {fixed} positions")
                book_fixed += fixed

        if book_fixed > 0:
            print(f"{book_dir.name}: Total {book_fixed} positions added")
            total_fixed += book_fixed

    print(f"\nGrand total: {total_fixed} positions added")


if __name__ == "__main__":
    main()

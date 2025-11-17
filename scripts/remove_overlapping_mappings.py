#!/usr/bin/env python3
"""
Remove overlapping mappings from NT books.
Keeps longer mappings, removes shorter ones that overlap.
"""

import json
from pathlib import Path


def remove_overlaps(book):
    """Remove overlapping mappings from a book."""
    mappings_dir = Path('bible-translations/mappings') / book

    if not mappings_dir.exists():
        print(f"Book {book} not found")
        return 0

    total_removed = 0

    for chapter_file in sorted(mappings_dir.glob('*.json'), key=lambda x: int(x.stem)):
        with open(chapter_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        modified = False
        chapter_removed = 0

        for verse_num, verse_data in data['verses'].items():
            mappings = verse_data['mappings']

            # Sort by start position, then by length (longer first)
            sorted_mappings = sorted(mappings, key=lambda m: (m['start'], -(m['end'] - m['start'])))

            # Remove overlapping shorter mappings
            clean_mappings = []
            for m in sorted_mappings:
                # Check if this mapping overlaps with any already kept mapping
                overlaps = False
                for kept in clean_mappings:
                    # Check for overlap
                    if not (m['end'] <= kept['start'] or m['start'] >= kept['end']):
                        # They overlap - keep the longer one
                        if (m['end'] - m['start']) > (kept['end'] - kept['start']):
                            # Current is longer, replace
                            clean_mappings.remove(kept)
                            clean_mappings.append(m)
                        overlaps = True
                        break

                if not overlaps:
                    clean_mappings.append(m)

            # Sort back by start position
            clean_mappings.sort(key=lambda m: m['start'])

            removed_count = len(mappings) - len(clean_mappings)
            if removed_count > 0:
                verse_data['mappings'] = clean_mappings
                modified = True
                chapter_removed += removed_count

        if modified:
            with open(chapter_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  Chapter {chapter_file.stem}: Removed {chapter_removed} overlapping mappings")
            total_removed += chapter_removed

    return total_removed


def main():
    books = ['MAT', 'ROM', 'PHP', 'HEB', 'TIT']

    print("Removing overlapping mappings from NT books...")
    print("=" * 50)

    grand_total = 0
    for book in books:
        print(f"\n{book}:")
        removed = remove_overlaps(book)
        if removed:
            grand_total += removed
        else:
            print(f"  No overlaps found")

    print(f"\n{'=' * 50}")
    print(f"Total removed: {grand_total} overlapping mappings")


if __name__ == "__main__":
    main()

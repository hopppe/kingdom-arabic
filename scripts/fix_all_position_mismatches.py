#!/usr/bin/env python3
"""
Fix all position mismatches by finding actual word positions in source text.
Uses the same approach as the 2CH diacritic fix.
"""

import json
from pathlib import Path
import re

# Arabic diacritics
DIACRITICS = [
    '\u064E',  # فتحة (fatha) - a
    '\u064F',  # ضمة (damma) - u
    '\u0650',  # كسرة (kasra) - i
    '\u0651',  # شدة (shadda)
    '\u0652',  # سكون (sukun)
]

def strip_final_diacritics(text):
    """Remove final diacritics from Arabic word."""
    if not text:
        return text
    while text and text[-1] in DIACRITICS:
        text = text[:-1]
    return text

def fix_book_positions(book):
    """Fix all position mismatches in a book."""
    mappings_dir = Path(f"bible-translations/mappings/{book}")
    unified_dir = Path(f"bible-translations/unified/{book}")

    if not mappings_dir.exists():
        print(f"Warning: Mappings directory not found for {book}")
        return 0

    total_fixed = 0

    for chapter_file in sorted(mappings_dir.glob("*.json")):
        chapter_num = chapter_file.stem
        source_file = unified_dir / f"{chapter_num}.json"

        if not source_file.exists():
            continue

        with open(chapter_file, 'r', encoding='utf-8') as f:
            mappings = json.load(f)

        with open(source_file, 'r', encoding='utf-8') as f:
            source = json.load(f)

        chapter_fixed = 0

        for verse_num, verse_data in mappings.get("verses", {}).items():
            if verse_num not in source:
                continue

            ar_text = source[verse_num]['ar']
            new_mappings = []
            current_pos = 0

            for mapping in verse_data.get("mappings", []):
                ar_word = mapping.get("ar", "")
                en_word = mapping.get("en", "")
                old_start = mapping.get("start", 0)
                old_end = mapping.get("end", 0)

                # Check if current position matches
                actual = ar_text[old_start:old_end] if old_end <= len(ar_text) else ""

                if actual == ar_word:
                    # Already correct
                    new_mappings.append(mapping)
                    current_pos = old_end
                else:
                    # Try to find the word in source
                    stripped_word = strip_final_diacritics(ar_word)
                    found_pos = ar_text.find(stripped_word, current_pos)

                    if found_pos != -1:
                        new_start = found_pos
                        new_end = found_pos + len(stripped_word)

                        # Extend to include trailing diacritics
                        while new_end < len(ar_text) and ar_text[new_end] in DIACRITICS:
                            new_end += 1

                        actual_word = ar_text[new_start:new_end]

                        if len(actual_word) > 0:
                            chapter_fixed += 1
                            new_mappings.append({
                                "ar": actual_word,
                                "en": en_word,
                                "start": new_start,
                                "end": new_end
                            })
                            current_pos = new_end
                        else:
                            new_mappings.append(mapping)
                    else:
                        # Try exact match
                        found_pos = ar_text.find(ar_word, current_pos)
                        if found_pos != -1:
                            chapter_fixed += 1
                            new_mappings.append({
                                "ar": ar_word,
                                "en": en_word,
                                "start": found_pos,
                                "end": found_pos + len(ar_word)
                            })
                            current_pos = found_pos + len(ar_word)
                        else:
                            new_mappings.append(mapping)

            verse_data["mappings"] = new_mappings

        if chapter_fixed > 0:
            with open(chapter_file, 'w', encoding='utf-8') as f:
                json.dump(mappings, f, ensure_ascii=False, indent=2)
            print(f"  {book} Chapter {chapter_num}: Fixed {chapter_fixed} positions")
            total_fixed += chapter_fixed

    return total_fixed

def main():
    # Books with position mismatches
    books_to_fix = ['GEN', 'JER', 'JDG', 'ISA', 'LUK']

    total = 0
    for book in books_to_fix:
        print(f"Fixing {book}...")
        fixed = fix_book_positions(book)
        total += fixed
        if fixed > 0:
            print(f"  Total for {book}: {fixed}")
        else:
            print(f"  No fixes needed for {book}")
        print()

    print(f"Grand total: {total} position fixes")

if __name__ == "__main__":
    main()

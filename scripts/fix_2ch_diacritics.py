#!/usr/bin/env python3
"""
Fix 2CH diacritic truncation issue.
The mappings have full diacritics but the source text has truncated final diacritics.
This script strips the final diacritics from mappings to match the source text.
"""

import json
from pathlib import Path
import re

# Arabic diacritics that appear at the end of words
FINAL_DIACRITICS = [
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

    # Keep removing final diacritics until we hit a consonant
    while text and text[-1] in FINAL_DIACRITICS:
        text = text[:-1]
    return text

def fix_2ch_mappings():
    """Fix all 2CH mapping files."""
    mappings_dir = Path("bible-translations/mappings/2CH")
    unified_dir = Path("bible-translations/unified/2CH")

    total_fixed = 0

    for chapter_file in sorted(mappings_dir.glob("*.json")):
        chapter_num = chapter_file.stem
        source_file = unified_dir / f"{chapter_num}.json"

        if not source_file.exists():
            print(f"Warning: Source file not found for chapter {chapter_num}")
            continue

        # Load files
        with open(chapter_file, 'r', encoding='utf-8') as f:
            mappings = json.load(f)

        with open(source_file, 'r', encoding='utf-8') as f:
            source = json.load(f)

        chapter_fixed = 0

        # Fix each verse
        for verse_num, verse_data in mappings.get("verses", {}).items():
            if verse_num not in source:
                continue

            ar_text = source[verse_num]['ar']

            # Fix each mapping by finding the actual word in source text
            new_mappings = []
            current_pos = 0

            for mapping in verse_data.get("mappings", []):
                ar_word = mapping.get("ar", "")
                en_word = mapping.get("en", "")

                # Strip final diacritics to find base word
                stripped_word = strip_final_diacritics(ar_word)

                # Find this word in the source text starting from current position
                found_pos = ar_text.find(stripped_word, current_pos)

                if found_pos != -1:
                    new_start = found_pos
                    new_end = found_pos + len(stripped_word)

                    # Extend end to include any trailing diacritics in source
                    while new_end < len(ar_text) and ar_text[new_end] in FINAL_DIACRITICS:
                        new_end += 1

                    # Get the actual word including any trailing diacritics
                    actual_word = ar_text[new_start:new_end]

                    if len(actual_word) > 0:
                        if mapping.get("ar") != actual_word or mapping.get("start") != new_start or mapping.get("end") != new_end:
                            chapter_fixed += 1

                        new_mappings.append({
                            "ar": actual_word,
                            "en": en_word,
                            "start": new_start,
                            "end": new_end
                        })
                        current_pos = new_end
                    else:
                        # Keep original if no match
                        new_mappings.append(mapping)
                else:
                    # Try finding without stripping (maybe already matches)
                    found_pos = ar_text.find(ar_word, current_pos)
                    if found_pos != -1:
                        new_mappings.append({
                            "ar": ar_word,
                            "en": en_word,
                            "start": found_pos,
                            "end": found_pos + len(ar_word)
                        })
                        current_pos = found_pos + len(ar_word)
                    else:
                        # Keep original if not found
                        new_mappings.append(mapping)

            verse_data["mappings"] = new_mappings

        # Save updated mappings
        with open(chapter_file, 'w', encoding='utf-8') as f:
            json.dump(mappings, f, ensure_ascii=False, indent=2)

        if chapter_fixed > 0:
            print(f"2CH Chapter {chapter_num}: Fixed {chapter_fixed} mappings")
            total_fixed += chapter_fixed

    print(f"\nTotal mappings fixed: {total_fixed}")

if __name__ == "__main__":
    fix_2ch_mappings()

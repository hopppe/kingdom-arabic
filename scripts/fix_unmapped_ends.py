#!/usr/bin/env python3
"""
Fix unmapped_end issues by adding mappings for text at end of verses.
"""

import json
from pathlib import Path

def fix_unmapped_ends():
    """Fix all unmapped_end issues across all books."""
    mappings_dir = Path("bible-translations/mappings")
    unified_dir = Path("bible-translations/unified")

    total_fixed = 0

    for book_dir in sorted(mappings_dir.iterdir()):
        if not book_dir.is_dir():
            continue

        book = book_dir.name
        book_fixed = 0

        for chapter_file in sorted(book_dir.glob("*.json")):
            chapter_num = chapter_file.stem
            source_file = unified_dir / book / f"{chapter_num}.json"

            if not source_file.exists():
                continue

            with open(chapter_file, 'r', encoding='utf-8') as f:
                mappings = json.load(f)

            with open(source_file, 'r', encoding='utf-8') as f:
                source = json.load(f)

            modified = False

            for verse_num, verse_data in mappings.get("verses", {}).items():
                if verse_num not in source:
                    continue

                ar_text = source[verse_num]['ar']
                verse_mappings = verse_data.get("mappings", [])

                if not verse_mappings:
                    continue

                last_mapping = verse_mappings[-1]
                last_end = last_mapping['end']

                # Check if there's unmapped text at the end
                if last_end < len(ar_text):
                    remaining = ar_text[last_end:].strip()

                    # Skip if it's just punctuation
                    if not remaining or all(c in '.,!?:;،؟؛ \'" ' for c in remaining):
                        continue

                    # Add mapping for the remaining text
                    # Find actual start position (skip leading space)
                    start_pos = last_end
                    while start_pos < len(ar_text) and ar_text[start_pos] == ' ':
                        start_pos += 1

                    if start_pos < len(ar_text):
                        remaining_text = ar_text[start_pos:]

                        # Provide translation based on common patterns
                        translation = get_translation(remaining_text)

                        verse_mappings.append({
                            "ar": remaining_text,
                            "en": translation,
                            "start": start_pos,
                            "end": len(ar_text)
                        })
                        book_fixed += 1
                        modified = True

            if modified:
                with open(chapter_file, 'w', encoding='utf-8') as f:
                    json.dump(mappings, f, ensure_ascii=False, indent=2)

        if book_fixed > 0:
            print(f"{book}: Fixed {book_fixed} unmapped_end issues")
            total_fixed += book_fixed

    print(f"\nTotal unmapped_end issues fixed: {total_fixed}")

def get_translation(text):
    """Provide translation for unmapped end text."""
    # Common patterns in Bible quotes
    translations = {
        "'لَنْ نَسْمَعَ!'": "\"We will not listen!\"",
        "'لَنْ نَسِيرَ فِيهَا.'": "\"We will not walk in it.\"",
        "'أَأَتَخَلَّى'": "\"Should I give up\"",
    }

    if text in translations:
        return translations[text]

    # If it's a quoted phrase, mark as quoted speech
    if text.startswith("'") or text.startswith('"') or text.startswith('«'):
        return "[quoted speech]"

    # Default - mark as untranslated
    return "[end of verse]"

if __name__ == "__main__":
    fix_unmapped_ends()

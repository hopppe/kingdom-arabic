#!/usr/bin/env python3
"""
Fix unmapped_gap issues by adding translations for actual words.
Skips punctuation and single diacritics.
"""

import json
from pathlib import Path
import re

# Arabic words that should be translated
WORD_TRANSLATIONS = {
    # Common words
    "فِي": "in",
    "هَلْ": "does/is",
    "عِنْدَ": "at/with",
    "فِ": "in",  # truncated
    "مِنْ": "from",
    "وَلا": "and not",
    "ا": "",  # alif, skip
    "ٌ": "",  # tanwin, skip
    "ُ": "",  # damma, skip
    "ِ": "",  # kasra, skip
    "َ": "",  # fatha, skip
    "ْ": "",  # sukun, skip
    ". أَنَا": ". I",
    "لامٌ.'": "peace.'",
    "الْكَائِنُ)،": "the existing),",
    "'وَادِي الْقَتْلِ'": "'Valley of Slaughter'",
    "'قَدْ نَجَوْنَا'؛": "'we are delivered';",
    "'الْعُمْيِ وَالْعُرْجِ'": "'the blind and the lame'",
    "لِي مِنْ بَيْنِ": "to me from among",
    "فَكَانَ مُرَبَّعَ الشَّكْلِ، طُولُهُ يُعَادِلُ عَرْضَهُ،": "and it was square, its length equaled its width,",
    "عِشْرُونَ ذِرَاعاً (نَحْوَ عَشَرَةِ أَمْتَارٍ)": "twenty cubits (about 10 meters)",

    # Quoted words (with quotation marks)
    "'هَا'": "'behold'",
    "'مُنْذُ'": "'since'",
    "'لَقَدْ'": "'indeed'",
    "'اذْهَبْ'": "'go'",
    "السِّهَامَ'": "arrows'",
    "'هَا": "'behold",
    "فَأَحْضِرْهَا'": "bring them'",
    "فَتَقَدَّمْ'": "go forward'",

    # Double-quoted words (two apostrophes)
    "''مُنْذُ'": "''since'",
    "''لَقَدْ'": "''indeed'",
    "''اذْهَبْ'": "''go'",
    "السِّهَامَ''": "arrows''",
    "''هَا'": "''behold'",
    "فَأَحْضِرْهَا''": "bring them''",
    "فَتَقَدَّمْ''": "go forward''",

    # Punctuation phrases
    ": «": ": \"",
    "، خَيْمَةُ": ", tent of",
    "الَّتِي": "which",
    "وَنِصْفٍ)،": "and a half),",
}

# Parenthetical translations (unit conversions, dates)
PARENTHETICAL_TRANSLATIONS = {
    "(نَحْوَ مِتْرَيْنِ وَنِصْفِ الْمِتْرِ)،": "(about 2.5 meters),",
    "(نَحْوَ ثَلاثَةِ آلافٍ وَسِتِّ مِئَةِ كِيلُو جِرَامٍ)": "(about 3,600 kilograms)",
    "(نَحْوَ عَشَرَةِ أَمْتَارٍ)": "(about 10 meters)",
    "(نَحْوَ ثُلْثَيْ لِتْرٍ)،": "(about 2/3 liter),",
    "(نَحْوَ ثَلاثِينَ مِتْراً)": "(about 30 meters)",
    "(نَحْوَ ثَلاثَةِ أَطْنَانٍ)": "(about 3 tons)",
    "(خَمْسِ مِئَةِ مِتْرٍ)": "(500 meters)",
    "(أَيْ كَسُورٍ حَوْلَنَا)": "(that is, fragments around us)",
    "(نَحْوَ مِئَتَيْنِ وَأَرْبَعِينَ جِرَاماً).": "(about 240 grams).",
    "(كَانُونِ الأَوَّلِ – دِيسَمْبَرَ)": "(Kislev - December)",
    "(نَحْوَ خَمْسِ مِئَةِ كِيلُو جِرَامٍ)": "(about 500 kilograms)",
    "(مُنْتَصَفِ كَانُونِ الأَوَّلِ – دِيسَمْبَرَ)": "(mid-Kislev - December)",
    "(أَي كَانُونَ الأَوَّلِ – دِيسَمْبَرَ)": "(that is, Kislev - December)",
    "(نَحْوَ ثَلاثِ مِئَةِ أَلْفِ كِيلُو جَرَامٍ)": "(about 300,000 kilograms)",
    "(نَحْوَ ثَلاثَةِ آلافٍ وَسِتِّ مِئَةِ جِرَامٍ)،": "(about 3,600 grams),",
    "(نَحْوَ سِتَّةَ عَشَرَ أَلْفاً وَمِئَتَيْ كِيلُو جِرَامٍ)": "(about 16,200 kilograms)",
    "(نَحْوَ ثَلاثَةٍ وَعِشْرِينَ أَلْفاً وَأَرْبَعِ مِئَةِ كِيلُو جِرَامٍ)": "(about 23,400 kilograms)",
    "(نَحْوَ أَرْبَعَةِ آلافٍ وَثَلاثِ مِئَةٍ وَعِشْرِينَ كِيلُو جِرَاماً)": "(about 4,320 kilograms)",
    "(الْعِبْرِيَّةِ)": "(Hebrew)",
    "(اللهُ)": "(God)",
    "(آذَارَ – مَارِسَ)،": "(Adar - March),",
    "(آب – أُغُسْطُسَ)": "(Ab - August)",
    "(أَيْ آبَ – أُغُسْطُسَ)": "(that is, Ab - August)",
    "(الْكَائِنُ)،": "(the existing),",
    "(وَنِصْفٍ)،": "(and a half),",
    "(تَمُّوزَ – يُولْيُو)": "(Tammuz - July)",
    "(أَيْ نَحْوُ عَشَرَةِ أَمْتَارٍ فِي عَشَرَةِ أَمْتَارٍ)،": "(that is, about 10 meters by 10 meters),",
}

# Punctuation to skip (not real gaps)
SKIP_PATTERNS = [
    r"^\s*$",  # whitespace only
    r"^[\(\)\[\]،,\.!؟\?\:;؛'\"\s–-]+$",  # punctuation only
    r"^[ًٌٍَُِّْ]+$",  # diacritics only
]

def should_skip(text):
    """Check if this gap should be skipped (not a real word)."""
    for pattern in SKIP_PATTERNS:
        if re.match(pattern, text):
            return True
    return False

def get_translation(text):
    """Get translation for gap text."""
    text = text.strip()

    # Check word translations
    if text in WORD_TRANSLATIONS:
        return WORD_TRANSLATIONS[text]

    # Check parenthetical translations
    if text in PARENTHETICAL_TRANSLATIONS:
        return PARENTHETICAL_TRANSLATIONS[text]

    # If it's a parenthetical we don't have, provide generic
    if text.startswith("(") and "نَحْوَ" in text:
        return "(measurement conversion)"

    if text.startswith("(") and ("–" in text or "-" in text):
        return "(date/month reference)"

    return None

def fix_gaps():
    """Find and fix unmapped gaps."""
    mappings_dir = Path("bible-translations/mappings")
    unified_dir = Path("bible-translations/unified")

    total_fixed = 0
    skipped = 0
    unfixable = []

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

                # Find gaps
                new_mappings = []
                current_pos = 0

                for mapping in sorted(verse_mappings, key=lambda x: x['start']):
                    start = mapping['start']

                    # Check for gap before this mapping
                    if start > current_pos:
                        gap_text = ar_text[current_pos:start]

                        if not should_skip(gap_text):
                            translation = get_translation(gap_text)

                            if translation is not None and translation != "":
                                # Add mapping for this gap
                                new_mappings.append({
                                    "ar": gap_text.strip(),
                                    "en": translation,
                                    "start": current_pos + (len(gap_text) - len(gap_text.lstrip())),
                                    "end": start - (len(gap_text) - len(gap_text.rstrip()))
                                })
                                book_fixed += 1
                                modified = True
                            elif translation is None:
                                # Track unfixable gaps
                                if gap_text.strip() and len(gap_text.strip()) > 2:
                                    unfixable.append((book, chapter_num, verse_num, gap_text.strip()))
                        else:
                            skipped += 1

                    new_mappings.append(mapping)
                    current_pos = mapping['end']

                verse_data["mappings"] = sorted(new_mappings, key=lambda x: x['start'])

            if modified:
                with open(chapter_file, 'w', encoding='utf-8') as f:
                    json.dump(mappings, f, ensure_ascii=False, indent=2)

        if book_fixed > 0:
            print(f"{book}: Fixed {book_fixed} gaps")
            total_fixed += book_fixed

    print(f"\n=== Summary ===")
    print(f"Total gaps fixed: {total_fixed}")
    print(f"Punctuation/diacritics skipped: {skipped}")

    if unfixable:
        print(f"\n=== Unfixable gaps ({len(unfixable)}) ===")
        for book, ch, v, text in unfixable[:20]:
            print(f"  {book} {ch}:{v} - '{text}'")
        if len(unfixable) > 20:
            print(f"  ... and {len(unfixable) - 20} more")

if __name__ == "__main__":
    fix_gaps()

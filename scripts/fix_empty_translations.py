#!/usr/bin/env python3
"""
Fix empty translations in Bible mappings by providing English translations
for common Arabic words.
"""

import json
import os
from pathlib import Path

# Comprehensive Arabic to English translation dictionary
TRANSLATIONS = {
    # Common particles and prepositions
    'مِنْ': 'from',
    'مِن': 'from',
    'فِي': 'in',
    'عَلَى': 'on',
    'إِلَى': 'to',
    'عَنْ': 'about',
    'عَنِ': 'about',
    'بِ': 'with',
    'لِ': 'for',
    'كَ': 'like',
    'وَ': 'and',
    'أَوْ': 'or',
    'لَكِنْ': 'but',
    'لكِنَّ': 'but',
    'ثُمَّ': 'then',
    'حَتَّى': 'until',
    'مَعَ': 'with',
    'بَيْنَ': 'between',
    'قَبْلَ': 'before',
    'بَعْدَ': 'after',
    'تَحْتَ': 'under',
    'فَوْقَ': 'above',
    'أَمَامَ': 'before',
    'وَرَاءَ': 'behind',
    'حَوْلَ': 'around',
    'دُونَ': 'without',
    'ضِدَّ': 'against',

    # Pronouns and demonstratives
    'أَنَا': 'I',
    'أَنْتَ': 'you',
    'أَنْتِ': 'you',
    'هُوَ': 'he',
    'هِيَ': 'she',
    'نَحْنُ': 'we',
    'أَنْتُمْ': 'you',
    'هُمْ': 'they',
    'هَذَا': 'this',
    'هَذِهِ': 'this',
    'ذَلِكَ': 'that',
    'تِلْكَ': 'that',
    'هَؤُلاءِ': 'these',
    'أُولَئِكَ': 'those',
    'الَّذِي': 'who/which',
    'الَّتِي': 'who/which',
    'الَّذِينَ': 'who',
    'مَا': 'what',
    'مَنْ': 'who',
    'كَيْفَ': 'how',
    'أَيْنَ': 'where',
    'مَتَى': 'when',
    'لِمَاذَا': 'why',

    # Common verbs and forms
    'كَانَ': 'was',
    'يَكُونُ': 'be',
    'يَكُونَ': 'be',
    'كَانَتْ': 'was',
    'كَانُوا': 'were',
    'قَالَ': 'said',
    'يَقُولُ': 'says',
    'قَالَتْ': 'said',
    'قَالُوا': 'said',
    'جَاءَ': 'came',
    'يَجِيءُ': 'comes',
    'ذَهَبَ': 'went',
    'يَذْهَبُ': 'goes',
    'أَخَذَ': 'took',
    'يَأْخُذُ': 'takes',
    'أَعْطَى': 'gave',
    'يُعْطِي': 'gives',
    'رَأَى': 'saw',
    'يَرَى': 'sees',
    'سَمِعَ': 'heard',
    'يَسْمَعُ': 'hears',
    'عَرَفَ': 'knew',
    'يَعْرِفُ': 'knows',
    'آمَنَ': 'believed',
    'يُؤْمِنُ': 'believes',

    # Common nouns
    'اللهُ': 'God',
    'اللهِ': 'God',
    'الرَّبُّ': 'the Lord',
    'الرَّبِّ': 'the Lord',
    'يَسُوعُ': 'Jesus',
    'يَسُوعَ': 'Jesus',
    'الْمَسِيحُ': 'Christ',
    'الْمَسِيحِ': 'Christ',
    'الْمَسِيحَ': 'Christ',
    'الرُّوحُ': 'Spirit',
    'الرُّوحِ': 'Spirit',
    'الْكَلِمَةُ': 'word',
    'الْكَلِمَةِ': 'word',
    'الْحَقُّ': 'truth',
    'الْحَقِّ': 'truth',
    'الْحَيَاةُ': 'life',
    'الْحَيَاةِ': 'life',
    'الْمَوْتُ': 'death',
    'الْمَوْتِ': 'death',
    'النَّاسُ': 'people',
    'النَّاسِ': 'people',
    'الإِنْسَانُ': 'man',
    'الإِنْسَانِ': 'man',
    'الْعَالَمُ': 'world',
    'الْعَالَمِ': 'world',
    'السَّمَاءُ': 'heaven',
    'السَّمَاءِ': 'heaven',
    'الأَرْضُ': 'earth',
    'الأَرْضِ': 'earth',
    'الْيَوْمُ': 'day',
    'الْيَوْمِ': 'day',
    'الزَّمَانُ': 'time',
    'الزَّمَانِ': 'time',
    'الْمَكَانُ': 'place',
    'الْمَكَانِ': 'place',

    # Common adjectives
    'كُلُّ': 'all',
    'كُلِّ': 'all',
    'بَعْضُ': 'some',
    'بَعْضِ': 'some',
    'كَثِيرٌ': 'many',
    'كَثِيرِينَ': 'many',
    'قَلِيلٌ': 'few',
    'عَظِيمٌ': 'great',
    'عَظِيمِ': 'great',
    'صَغِيرٌ': 'small',
    'جَدِيدٌ': 'new',
    'جَدِيدِ': 'new',
    'قَدِيمٌ': 'old',
    'قَدِيمِ': 'old',
    'صَالِحٌ': 'good',
    'صَالِحِ': 'good',
    'شَرِيرٌ': 'evil',
    'شَرِيرِ': 'evil',
    'قُدُّوسٌ': 'holy',
    'قُدُّوسِ': 'holy',

    # Common adverbs
    'لَا': 'not',
    'لَمْ': 'not',
    'لَنْ': 'not',
    'أَبَداً': 'never',
    'دَائِماً': 'always',
    'الآنَ': 'now',
    'هُنَا': 'here',
    'هُنَاكَ': 'there',
    'جِدّاً': 'very',
    'أَيْضاً': 'also',
    'أَيْضاً.': 'also',
    'فَقَطْ': 'only',
    'مَعاً': 'together',

    # Conjunctions and connectors
    'فَ': 'so',
    'إِذَا': 'if',
    'إِذْ': 'when',
    'لِأَنَّ': 'because',
    'لأَنَّ': 'because',
    'لِكَيْ': 'so that',
    'حَيْثُ': 'where',
    'كَمَا': 'as',
    'مِثْلَ': 'like',
    'إِلَّا': 'except',
    'بَلْ': 'but rather',
    'أَنْ': 'that',
    'أَنَّ': 'that',
    'قَدْ': 'already',
    'إِنَّ': 'indeed',
    'يَا': 'O',
    'كُلَّ': 'all',
    'وَلا': 'nor',
    'وَلَا': 'nor',
    'إِلَيْكُمْ': 'to you',
    'جَمِيعاً،': 'all',
    'مِنَ': 'from',
    'بِلا': 'without',
    'وَكُلُّ': 'and all',
    'فَإِنَّ': 'for',
    'إِلّا': 'except',
    'آمِين!': 'Amen!',
    'بِها': 'with it',
    'لَهُ': 'to him',
    'إِلَيْهِ': 'to him',
    'أَمْ': 'or',
    'لأَجْلِ': 'for the sake of',
    'وَسَطِ': 'midst',
    'مَعِي': 'with me',
    'وَلَكِنَّ': 'but',
    'عَلَيْهِ': 'on him',
    'وَمِنْ': 'and from',
    'بِهِ': 'with him',
    'شَيْءٍ': 'thing',

    # Numbers
    'وَاحِدٌ': 'one',
    'وَاحِدٌ.': 'one',
    'وَاحِدَةٌ': 'one',
    'وَاحِدَةٍ،': 'one',
    'اثْنَانِ': 'two',
    'ثَلاثَةٌ': 'three',
    'أَرْبَعَةٌ': 'four',
    'خَمْسَةٌ': 'five',
    'سِتَّةٌ': 'six',
    'سَبْعَةٌ': 'seven',
    'ثَمَانِيَةٌ': 'eight',
    'تِسْعَةٌ': 'nine',
    'عَشَرَةٌ': 'ten',

    # Possessive suffixes (with common words)
    'نَفْسِهِ': 'himself',
    'نَفْسِهِ،': 'himself',
    'نَفْسِهَا': 'herself',
    'نَفْسُهُمْ': 'themselves',
    'قَلْبِهِ': 'his heart',
    'قَلْبِهِمْ': 'their hearts',
    'يَدِهِ': 'his hand',
    'عَيْنَيْهِ': 'his eyes',

    # Religious terms
    'الْخَطِيئَةُ': 'sin',
    'الْخَطِيئَةِ': 'sin',
    'خَطِيئَةٍ': 'sin',
    'الْخَلاصُ': 'salvation',
    'الْخَلاصِ': 'salvation',
    'الإِيمَانُ': 'faith',
    'الإِيمَانِ': 'faith',
    'النِّعْمَةُ': 'grace',
    'النِّعْمَةِ': 'grace',
    'الْمَحَبَّةُ': 'love',
    'الْمَحَبَّةِ': 'love',
    'الرَّجَاءُ': 'hope',
    'الرَّجَاءِ': 'hope',
    'السَّلامُ': 'peace',
    'السَّلامِ': 'peace',
    'الْبِرُّ': 'righteousness',
    'الْبِرِّ': 'righteousness',
    'الْمَجْدُ': 'glory',
    'الْمَجْدِ': 'glory',
    'الْقُوَّةُ': 'power',
    'الْقُوَّةِ': 'power',
    'الْحِكْمَةُ': 'wisdom',
    'الْحِكْمَةِ': 'wisdom',

    # Common biblical phrases
    'ابْنُ': 'son',
    'ابْنِ': 'son',
    'بِنْتُ': 'daughter',
    'بِنْتِ': 'daughter',
    'أَبُو': 'father',
    'أَبِي': 'father',
    'أُمُّ': 'mother',
    'أُمِّ': 'mother',
    'أَخٌ': 'brother',
    'أَخِي': 'brother',
    'أُخْتٌ': 'sister',
    'أُخْتِي': 'sister',

    # More specific words from context
    'الْجَسَدَ': 'flesh',
    'الْجَسَدَ.': 'flesh',
    'الْجَسَدِ': 'flesh',
    'تُهْمَةٍ': 'charge',
    'تُهْمَةٍ،': 'charge',
    'تَرْتِيبَ': 'order',
    'قَادِراً': 'able',
    'مُعَلِّمِي': 'teachers',
    'عُقُولِ': 'minds',
    'الطَّبْعِ،': 'nature',
    'بِنَفْسِهِ': 'by himself',
    'بِاعْتِبَارِهِ': 'as',
    'أَمَانَةً': 'faithfully',
    'الْمُعَيَّنِ:': 'appointed',
    'أَكُونَ': 'to be',
    'مَرَّةً': 'once',
    'لابُدَّ': 'must',
}


def fix_empty_translations(book_code):
    """Fix empty translations in a book's mappings."""
    mappings_dir = Path('bible-translations/mappings') / book_code

    if not mappings_dir.exists():
        print(f"No mappings found for {book_code}")
        return 0

    total_fixed = 0
    still_empty = []

    for chapter_file in sorted(mappings_dir.glob('*.json')):
        with open(chapter_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        chapter_fixed = 0
        modified = False

        for verse_num, verse_data in data['verses'].items():
            for m in verse_data['mappings']:
                if not m.get('en', '').strip():
                    ar_word = m['ar']
                    # Try exact match first
                    if ar_word in TRANSLATIONS:
                        m['en'] = TRANSLATIONS[ar_word]
                        chapter_fixed += 1
                        modified = True
                    # Try without punctuation
                    elif ar_word.rstrip('،.:!؟؛') in TRANSLATIONS:
                        base_word = ar_word.rstrip('،.:!؟؛')
                        m['en'] = TRANSLATIONS[base_word]
                        chapter_fixed += 1
                        modified = True
                    else:
                        still_empty.append((book_code, chapter_file.stem, verse_num, ar_word))

        if modified:
            with open(chapter_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  Chapter {chapter_file.stem}: Fixed {chapter_fixed} translations")
            total_fixed += chapter_fixed

    return total_fixed, still_empty


def main():
    import sys

    if len(sys.argv) < 2:
        print("Usage: python3 fix_empty_translations.py BOOK [BOOK2 ...]")
        print("       python3 fix_empty_translations.py --all")
        sys.exit(1)

    if sys.argv[1] == '--all':
        mappings_dir = Path('bible-translations/mappings')
        books = sorted([d.name for d in mappings_dir.iterdir() if d.is_dir()])
    else:
        books = sys.argv[1:]

    grand_total = 0
    all_empty = []

    for book in books:
        print(f"Fixing empty translations in {book}")
        fixed, still_empty = fix_empty_translations(book)
        grand_total += fixed
        all_empty.extend(still_empty)

    print(f"\nTotal: Fixed {grand_total} empty translations")

    if all_empty and len(all_empty) <= 50:
        print(f"\nStill empty ({len(all_empty)}):")
        for book, ch, verse, word in all_empty[:50]:
            print(f"  {book} {ch}:{verse} - '{word}'")
    elif all_empty:
        print(f"\nStill empty: {len(all_empty)} translations")
        # Show unique words
        unique_words = set(item[3] for item in all_empty)
        print(f"Unique words needing translation ({len(unique_words)}):")
        for word in sorted(unique_words)[:30]:
            print(f"  '{word}'")
        if len(unique_words) > 30:
            print(f"  ... and {len(unique_words) - 30} more")


if __name__ == '__main__':
    main()

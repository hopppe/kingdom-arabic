#!/usr/bin/env python3
"""
Fix placeholder translations by matching Arabic words to English verse context.
"""

import json
import re
from pathlib import Path

# Comprehensive Arabic to English dictionary
TRANSLATIONS = {
    # Common verbs
    'وَلكِنَّنَا': 'but we',
    'لِيَصِيرَ': 'to become',
    'إِذَنْ،': 'Therefore',
    'كَأَنَّكَ': 'as if you',
    'أَلَسْتُمْ': 'Are you not',
    'وَالْبَطْنُ': 'and the stomach',
    'غَيْرُ': 'not',
    'حِينَ': 'when',
    'كُلَّهُ': 'all',
    'مِنْهُمْ': 'of them',
    'وُجِدَتْ': 'was created',
    'أَحْرَاراً،': 'free',
    'وَالْمَحَبَّةُ.': 'and love.',
    'الْمِزْمَارُ': 'the pipe',
    'الآنَ،': 'now',
    'أَخْضَعَ': 'put',
    'فَأَيُّ': 'what',
    'فَهُوَ': 'he is',
    'الإِخْوَةُ،': 'brothers and sisters,',
    'فَيَذْهَبُونَ': 'they will go',
    'بِالصَّلاةِ': 'by your prayers',
    'رَبِّنَا': 'our Lord',
    'كَلامَنَا': 'our message',
    'الْمَسِيحِ': 'Christ',
    'الْمَسِيحَ': 'Christ',
    'الْمَسِيحِ،': 'Christ,',
    'الإِنْسَانَ': 'the man',
    'مُقِيمِينَ': 'at home',
    'إِنْجِيلاً': 'gospel',
    'قَضَّيْتُ': 'I spent',
    'السُّورِ،': 'the wall,',
    'يَنْطِقَ': 'to tell',
    'شَيْئاً.': 'nothing.',
    'وَلكِنِّي': 'but I',
    'مُلُوحَتَهُ؟': 'its saltiness?',
    'الضَّفَّةِ': 'the shore',
    'يَسْأَلُونَهُ:': 'asking him:',
    'أَقُولُ': 'I say',
    'الْكَهَنَةَ': 'the priests',
    'أُحْضِرَ': 'was brought',
    'كَثِيرُونَ،': 'many,',
    'الأَرْغِفَةَ': 'the loaves',
    'تَلامِيذَهُ:': 'his disciples:',
    'وَعَيْنُكَ': 'and your eye',
    'كَالْوَثَنِيِّ': 'as a pagan',
    'سَوْفَ': 'will',
    'إِلَيْكِ': 'to you',
    'اتَّجَهَ': 'turned',
    'عَنْهَا': 'about her',
    'وَالأَمِينُ!': 'and faithful!',
    'الْفِضَّةِ': 'the silver',
    "'حَقَلْ دَمَخْ'": "'Field of Blood'",
    'مُبَشِّرِينَ': 'preaching',
    'فَيُذْهِلُ': 'astonishing',
    'حَالاً': 'immediately',
    'مَعَهُ': 'with him',
    'إِلَيَّ': 'to me',
    'فَتَذَكَّرْتُ': 'Then I remembered',
    'عَلَيْهِمِ': 'on them',
    'الأَمَانَ،': 'safety,',
    'تَوَجَّهَا': 'they went',
    'تَعْلِيمِ': 'teaching',
    'الْيَهُودِ': 'the Jews',
    'بُطْرُسُ': 'Peter',
    'وَالشُّيُوخُ': 'and the elders',
    'الْجَوَّالِينَ': 'itinerant',
    'بِمُقَاطَعَتَيْ': 'in the provinces of',
    'قَدِيمٌ،': 'old,',
    'أَمَّا': 'As for',
    'أَبْصِرْ.': 'see.',
    'يَرْفُضُونَ': 'reject',
    'طَلَعَ': 'rose',
    'سَبْعُونَ': 'seventy',
    'وَأَشَارَ': 'and motioned',
    'أَقُومُ': 'I will arise',
    'فَقُلْتُ': 'I said',
    'تَحْمِلُنَا': 'carrying us',
    'وَرَاءَهُ،': 'behind him,',
    'اخْتَارَ': 'chose',
    'رُوحِي': 'my spirit',
    'حَيْثُ': 'where',
    'أَنْتُمْ': 'you',
    'حَاجَاتِي': 'my needs',
    'طُوبَى': 'Blessed',
    'ابْنِ': 'son of',
    'يَشْكُرُ': 'gives thanks',
    'تَنْكَمِشُ': 'shrinks',
    'يَصْمُدَ،': 'stand,',
    'يَدْخُلَ': 'enter',
    'الْبَيْتَ،': 'the house,',
    'أَحَدٌ': 'anyone',
    'الْحَجَرُ': 'The stone',
    'الْقِيَامَةِ،': 'the resurrection,',
    'أُنْكِرُكَ': 'disown you',
    'بَعْدَمَا': 'after',
    'النَّاسُ': 'the people',
    'هَرَبُوا': 'fled',
    'وُجِدَ': 'was found',
    'الآيَةَ': 'the sign',
    'فَقَدِيماً': 'long ago',
    'يَتَقَبَّلُهَا،': 'accepts it,',
    'عَطِيَّةٌ': 'gift',
    'الْكِتَابِ': 'the Scripture',
    'يَقُولُ': 'says',
    'لِيُخْلِصَكُمُ': 'to save you',
    'يُصَلُّونَ': 'pray',
    'فَفِي': 'For in',
    'النِّعْمَةُ': 'grace',
    'يُنْجِيَنَا': 'rescue us',
    'رُوحَ': 'spirit of',
    'الْمَوْتَى': 'the dead',
    'يُعْطِيكُمُ': 'give you',
    'بِاللهِ،': 'in God,',
    'يُعْطِيهَا': 'gives it',
    'لِعَدَاوَتِهِمْ': 'because of their hostility',
    'يَتَرَدَّدُ': 'doubts',
    'اسْتَحِقُّوا': 'consider worthy',
    'فَإِنْ': 'For if',
    'يَعْتَرِفْ': 'acknowledge',
    'لأَنَّنِي': 'because I',
    'رُوحَهُ،': 'his spirit,',
    'لَنْ': 'will not',
    'صَخْرَةً': 'a rock',
    'دَائِماً': 'always',
    'الأَشْيَاءَ': 'all things',
    'يَحْسِبُونَ': 'consider',
    'تَعُودَ': 'return',
    'الدُّنْيَا': 'the world',
    'لِكَيْ': 'in order that',
    'تَضْرِبُهُمْ': 'strike them',
    'الضَّرْبَةُ': 'the plague',
    'وَالدَّمُ': 'and blood',
    'هُمْ': 'they',
    'تَبْقَى': 'remains',
    'الثَّالِثُ': 'the third',
    'الرَّابِعُ': 'the fourth',
    'لِيُعَمِّدُوهُ': 'to baptize him',
    'الْبُحَيْرَةِ': 'the lake',
    'الْكِبْرِيتُ': 'sulfur',
    'الْبَقِيَّةُ': 'the rest',
    'الثَّانِي': 'the second',
    "'إِلَى": "'To",
    "الْمَجْهُولِ'.": "the Unknown.'",
}

def fix_placeholders():
    """Fix all placeholder translations."""
    mappings_dir = Path('bible-translations/mappings')
    fixed = 0
    remaining = 0

    for book_dir in sorted(mappings_dir.iterdir()):
        if not book_dir.is_dir() or book_dir.name in ['LUK', 'JHN']:
            continue

        for chapter_file in sorted(book_dir.glob('*.json'), key=lambda x: int(x.stem)):
            with open(chapter_file) as f:
                data = json.load(f)

            modified = False

            for verse_num, verse_data in data['verses'].items():
                for m in verse_data['mappings']:
                    if m['en'].startswith('[') and m['en'].endswith(']'):
                        ar_word = m['ar'].strip()

                        if ar_word in TRANSLATIONS:
                            m['en'] = TRANSLATIONS[ar_word]
                            fixed += 1
                            modified = True
                        else:
                            remaining += 1
                            print(f"{book_dir.name} {chapter_file.stem}:{verse_num} - '{ar_word}' still needs translation")
                            print(f"  English: {verse_data['en'][:80]}...")

            if modified:
                with open(chapter_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nFixed {fixed} placeholder translations")
    print(f"Remaining: {remaining}")

if __name__ == "__main__":
    fix_placeholders()

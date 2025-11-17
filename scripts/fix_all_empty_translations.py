#!/usr/bin/env python3
"""
Fix all empty translations across Bible mappings.
Provides English translations for Arabic words that have no English equivalent.
"""

import json
import os
from pathlib import Path

# Comprehensive Arabic to English translations for all empty entries
TRANSLATIONS = {
    # Numbers (common in genealogies, ages, measurements)
    "عَشَرَ": "ten",  # masculine form (11-19)
    "عَشْرَةَ": "ten",  # feminine form
    "عَشَرَةِ": "ten",  # genitive form
    "وَأَرْبَعِينَ": "and forty",
    "عَشَرَ،": "ten,",
    "وَالعِشْرُونَ": "and twentieth",
    "وَثَمَانِيَةً": "and eight",
    "وَثَمَانِينَ": "and eighty",
    "وَعِشْرِينَ": "and twenty",
    "وَالثَّلاثِينَ": "and thirtieth",
    "وَالْعِشْرِينَ": "and twentieth",

    # Common pronouns and particles
    "هُوَ": "he",
    "فِي": "in",
    "مِنْ": "from",
    "يَا": "O",  # vocative particle
    "إِنْ": "if",
    "قَدْ": "already/indeed",
    "فَقَدْ": "so indeed",
    "سِوَى": "except",
    "غَيْرِ": "other than",
    "وَهُمُ": "and they",
    "أَنْ": "to/that",
    "عَلَى": "on/upon",
    "هِيَ": "she/it",
    "لَهُ": "to him",
    "عَنْ": "about/from",
    "عَنِ": "about/from",
    "بِهِ": "with it",
    "عَلَيْهِ": "on him",
    "وَاحِدٍ": "one",
    "عَلَيْهَا": "on it",
    "مِنَ": "from",
    "حَتَّى": "until",
    "إِلَى": "to",
    "لَوْ": "if/would that",
    "بِها": "in it",
    "مِنْهُ": "from him",
    "فِيهِ": "in it",
    "هَذِهِ": "this",
    "أَجْلِ": "sake of",
    "ثُمَّ": "then",
    "مَا": "what",
    "لِهَذَا": "for this",
    "الَّتِي": "which",
    "أَمَّا": "as for",
    "جَمِيعاً": "all together",
    "عَدَدُ": "number of",
    "الآنَ": "now",
    "أَنِ": "to/that",
    "آنَئِذٍ": "at that time",
    "الَّذِي": "which/who",
    "ذَلِكَ": "that",
    "أَيُّهَا": "O (vocative)",
    "هَكَذَا": "thus",

    # Religious/sacred terms
    "لِلهِ": "to God",
    "لِلرَّبِّ.": "to the LORD.",
    "الرَّبَّ.": "the LORD.",
    "اسْمِكَ.": "your name.",
    "إِيلَ»": "El\"",  # Hebrew name for God
    "إِيلَ،": "El,",
    "إِيلَ": "El",
    "«إِنَّ": "\"Indeed",
    "إِيلَ.": "El.",
    "إِيلَ».": "El\".",
    "الرَّبُّ.": "the LORD.",
    "الرَّبُّ».": "the LORD\".",
    "رَبُّ.": "Lord.",
    "الْعَلِيِّ": "the Most High",
    "الإِلَهِ": "God",
    "إِسْرَائِيلَ": "Israel",

    # Verbs and verbal forms
    "قَائِلاً": "saying",
    "فَإِنِّي": "for I",
    "قَائِلِينَ:": "saying:",
    "قَائِلاً:": "saying:",
    "حَتْماً": "surely",
    "تَمَّ": "was fulfilled",
    "صَارَتْ": "became",
    "جَرَى": "happened",
    "تَكُنْ": "be",
    "يَكُنْ": "be",
    "كَانَ": "was",
    "كُنْتُ": "I was",
    "ارْتَفَعَ": "rose up",
    "وَطَّدَ": "established",
    "وَأَنْجَزَ": "and accomplished",
    "تَحَوَّلَتْ": "turned",
    "أَعْلَنْتَ": "you declared",

    # Nouns with endings
    "شَخْصاً.": "persons.",
    "شَخْصاً،": "persons,",
    "سَنَةً.": "years.",
    "وَبَنَاتٌ.": "and daughters.",
    "فَائِقَةٍ.": "excellent.",
    "الْبِنَاءِ.": "the building.",
    "الإِثْمِ.": "the iniquity.",
    "أَوْتَارٍ.": "strings.",
    "وَرِعْدَةٍ": "and trembling",
    "نَفْسِي": "my soul",
    "مَدِينَةِ": "city of",
    "قَفْراً،": "desolate,",
    "سَخَطِي،": "my wrath,",
    "دِيَارِ": "habitations",
    "حَقٍّ": "truth",
    "حَضْرَةِ": "presence of",
    "بَحَّارَتِهَا": "its sailors",
    "الْهَلاكِ": "destruction",
    "الْمَلِكِ": "the king",
    "الْبِلادِ": "the land",
    "الدِّمَاءِ": "the blood",
    "الثَّانِي": "the second",
    "الأَبَدِ؟": "forever?",
    "إِيَّاهَا": "it/her",
    "إِلَيْكَ": "to you",
    "عَنْهُمْ": "about them",
    "عَزَرَ": "Ezra",
    "جُوَارِ": "beside",
    "أَرْضِ": "land of",
    "الأَبَدِ": "forever",
    "بَابِلَ": "Babylon",
    "بَابِلَ،": "Babylon,",
    "نَوْماً": "sleep",
    "مِنْهُ،": "from him,",
    "مِنْهُمْ": "from them",
    "تَذْكَارِيًّا": "as a memorial",
    "ابْنَا": "sons of",

    # Date/time terms
    "(تِشْرِينَ": "(Tishri",  # Hebrew month name
    "–": "-",
    "نُوفَمْبِرَ)،": "November),",
    "(آب": "(Ab",
    "أُغُسْطُسَ)": "August)",
    "(أَيْ": "(that is",
    "تِشْرِينَ": "Tishri",
    "الأَوَّلِ": "the first",
    "أُكْتُوبَرَ)": "October)",
    "الْمَنْفَى": "the exile",

    # 1CH Chapter 25 specific terms
    "عَدَدُهُمْ": "their number",
    "وَالتَّرْتِيلِ": "and singing",
    "طَرِيقِ": "way of",
    "الْقُرْعَةِ،": "the lot,",
    "الْعُمْرِ": "age",
    "أَوِ": "or",
    "الْكَفَاءَةِ.": "skill.",
    "عَائِلَةِ": "family of",

    # 1KI Chapter 13 specific terms
    "أَمْرِ": "command of",
    "مَجِيئِهِ": "his coming",
    "آيَاتٍ": "signs",
    "أَيِّ": "which",
    "فِيهَا.": "in it.",
    "أَسْتَطِيعُ": "I can",
    "فِيهَا": "in it",
    "بِالنَّبَأِ": "with the news",
    "مَخَالِبِ": "claws of",
    "حَيْثُ": "where",
    "عَلَيْكَ": "on you",
    "جُثَّةِ": "body of",
    "الرَّغْمِ": "spite of",
    "النَّبِيِّ": "the prophet",
    "فَإِنَّ": "for indeed",
    "مَرَّةً": "time",
    "أُخْرَى": "another",
    "إِنَّ": "indeed",

    # 2KI specific terms
    "عَلَيْهَا.": "on it.",
    "اسْتِرْجَاعِ": "recovery of",
    "بِجَيْشِهِ": "with his army",
    "وَأَرْسَلَهُ": "and sent him",
    "الْخَمْرِ،": "the wine,",
    "خَمْرِهِمْ": "their wine",
    "لِلْمَلِكِ": "for the king",
    "الْمَلَكِيِّ،": "royal,",
    "الْخَارِجِ": "the outer",
    "لِيَصِلَ": "to reach",
    "بَيْنَ": "between",
    "الْقَصْرِ": "the palace",
    "أَيَّامِ": "days of",
    "الْمُلْكِ.": "reign.",
    "الْحَدِيثِ،": "the talk,",
    "نَهْرِ": "river of",
    "ثَانِيَةً،": "second time,",
    "النَّهْرُ": "the river",
    "مُتَقَابِلَيْنِ،": "in two,",
    "قَادِماً": "coming",
    "نَحْوَهُمْ": "toward them",
    "الْبَأْسِ،": "strength,",
    "لَهُمْ،": "to them,",
    "يَبْحَثُونَ": "they search",
    "عَنْهُ؟»": "for him?\"",
    "بِمَا": "with what",
    "طَلَبَ.": "requested.",
    "الْمَاءِ": "the water",
    "بَعْدَ": "after",
    "الصِّغَارِ": "the young",
    "(فِي": "(in",
    "الْعَاصِفَةِ)": "the storm)",
    "وَرَاءَهُ": "behind him",
    "مِنْهُمُ": "of them",
    "عَلَيْهِمْ": "against them",
    "فَلاسِرَ": "Pileser",

    # AMO specific terms
    "الْمُحَارِبِينَ": "the warriors",
    "الْمُوآبِيِّينَ،": "the Moabites,",
    "وَرَاءَهَا": "after it",
    "بِذَلِكَ": "by this",
    "ذَوِي": "those of",
    "الْقَامَاتِ": "stature",
    "أَشْجَارِهِمْ": "their trees",
    "طَرِيقَكُمْ": "your way",
    "طَوَالَ": "throughout",
    "مَوَاضِعِكُمْ": "your places",
    "فَتَئِنُّونَ": "you groan",
    "وَطْأَةِ": "burden of",
    "يُتَاحُ": "be available",
    "إِنْقَاذِ": "rescue",
    "الْقَوْسِ": "the bow",
    "يُصِيبُ": "hits",
    "الْهَدَفَ،": "the target,",
    "الْفَرَسِ": "the horse",
    "الْجَنَانِ": "courageous",
    "أَقْرَانِهِ": "his peers",

    # DEU specific terms
    "بِالضَّرْبِ،": "with striking,",
    "الْقَضَاءِ.": "judgment.",
    "وَالْقَضَاءِ": "and judgment",
    "يُصْدِرُونَهُ.": "they issue.",
    "شِمَالاً.": "left.",
    "أَحَدِ": "one of",
    "أَسْبَاطِكُمْ.": "your tribes.",
    "مِزْوَاجاً": "polygamous",
    "لِيَعْمَلَ": "to do",
    "بِها،": "by them,",
    "لِنَفْسِهِ": "for himself",

    # GEN specific terms
    "لَهَا": "to her",
    "حَوْلَهُ": "around him",
    "أَشْجَارِ": "trees of",
    "الْغَابَةِ،": "the forest,",
    "اسْمَ": "name of",
    "(وَمَعْنَاهُ:": "(meaning:",
    "الْيَوْمِ": "the day",
    "«هَا": "\"Behold",
    "الأَمْرَ،": "this thing,",
    "عَنِّي،": "from me,",
    "الأُمُورِ:": "matters:",
    "«هُوَذَا": "\"Behold",
    "وَأَحْفَادِهِ": "and his grandchildren",
    "هُمْ": "they",
    "أَنْجَبَتْهَا": "she bore them",
    "لِيَعْقُوبَ": "to Jacob",
    "نَفْساً.": "persons.",
    "اللَّذَانِ": "the two who",
    "الَّذِينَ": "who",
    "أَنْجَبَتْهُمْ": "she bore them",
    "جَارِيَةُ": "maidservant",
    "أَبُوهَا": "her father",
    "أَشْخَاصٍ.": "persons.",
    "الْخَارِجِينَ": "those coming out",
    "شَخْصَانِ.": "two persons.",
    "الطَّرِيقِ": "the way",
    "الْمُؤَدِّيَةِ": "leading",
    "وَرَأَيْتُ": "and I saw",
    "غَنَمٍ،": "sheep,",
    "حِرْفَتُنَا": "our occupation",
    "الآنَ،": "now,",
    "نَحْنُ": "we",
    "وَهَكَذَا": "and thus",
    "جَمِيعاً.": "all together.",
    "غَنَمٍ": "sheep",
    "بَنُونَ": "sons",
    "إِلَيْهِ.": "to him.",
    "ابْناً،": "son,",

    # JER specific terms
    "بِمُوْجِبِ": "according to",
    "فَقَدِ": "indeed",
    "شَعْبُ": "people of",
    "سُكَّانُ": "inhabitants of",
    "سَاعَةِ": "hour of",
    "الذَّبَائِحِ": "the sacrifices",
    "عِقَاباً": "punishment",
    "الْمُنْكَرَةَ": "the evil",
    "الْمُسْتَوْدَعِ،": "the storehouse,",
    "أَمْرٍ": "matter",
    "وَيُحْمَلْنَ": "and they will be carried",
    "ثِقَتِكَ": "your trust",
    "بِالنَّارِ»." : "with fire\".",
    "بِالنَّارِ": "with fire",
    "بِالنَّارِ،": "with fire,",
    "شَيْئاً،": "anything,",
    "كَلامٍ.": "words.",
    "دَارَ": "court of",
    "إِبَادَةً.": "destruction.",
    "يَنْجَعْ": "be effective",
    "مِنَّا": "from us",
    "عَنَانَ": "clouds of",
    "رُوحَ": "spirit of",
    "بِصَوْتِهِ": "by his voice",
    "غِمَارُ": "abundance of",
    "امْرِئٍ": "man",
    "الْمَسْبُوكَ": "molten image",
    "جَمِيعُ": "all",
    "زَمَنِ": "time of",
    "الأَوْثَانِ،": "idols,",
    "سِبْطُ": "tribe of",
    "إِرْباً": "in pieces",
    "أَشْلاءَ،": "fragments,",
    "حَقِّ": "justice",
    "يُوْضَعُ": "be placed",
    "تَزْحَفُ": "creep",
    "الشَّرِسَةِ.": "fierce.",
    "الْجَبَابِرَةُ": "the mighty men",
    "لِمُلاقَاةِ": "to meet",
    "آخَرَ.": "another.",
    "لِلِقَاءِ": "to encounter",
    "جَانِبٍ.": "side.",
    "أَجَمَاتُ": "thickets of",
    "وَاعْتَرَى": "and seized",
    "أَوَانُ": "time of",
    "حِنْطَتِهِ.": "his wheat.",
    "وَبَعْدَ": "and after",
    "الْمَسْبِيُّونَ:": "the captives:",
    "فَمِهِ.": "his mouth.",
    "أَصَابَنَا": "has befallen us",
    "تَأْخُذَهُمُ": "may take them",
    "مَثَارَ": "object of",
    "إِنْسَانٌ.": "man.",
    "الصَّنَمَ": "the idol",
    "فَمِهِ": "his mouth",
    "التَّالِيَةِ،": "the next,",
    "وَيَلْحَقُ": "and follows",
    "خَوَاطِرِكُمْ.": "your thoughts.",
    "لِلإِهَانَةِ،": "to shame,",
    "قَضَائِي": "my judgment",
    "لَوِ": "if",
    "فَبَلَغَتِ": "and reached",
    "عِنْدِي،": "with me,",
    "وَيُسَوَّى": "and leveled",
    "بِالأَرْضِ،": "to the ground,",
    "وَيَكُونُ": "and becomes",
    "مَصِيرُ": "fate of",
    "الأُمَمِ": "the nations",
    "رَئِيسَ": "chief of",
    "الْمُعَسْكَرِ.": "the camp.",
    "أَيْ": "that is",
    "الْمُدَوَّنَةِ": "written",
    "إِرْمِيَا": "Jeremiah",
    "تَطْفُو": "float",

    # JOB specific terms
    "ذَاتِي": "myself",
    "غَضَبِي": "my anger",
    "لَكُمْ": "for you",
    "مُحْرَقَةٍ": "burnt offering",
    "أُعَاقِبَكُمْ": "I punish you",
    "بِمُقْتَضَى": "according to",
    "عُزْلَةِ": "isolation of",
    "مَنْفَاهُ،": "his exile,",
    "طَعَاماً": "food",
    "كُلَّ": "every",
    "رِفْقٍ،": "kindness,",
    "بَلْوَى،": "affliction,",
    "تَجْرِبَتِهِ": "his trial",
    "عَيْنَاهُ": "his eyes",
    "بِرُؤْيَةِ": "by seeing",

    # JON specific terms
    "السَّفِينَةِ": "the ship",
    "مُسْتَغْرِقاً": "deeply asleep",
    "عَلَيْنَا": "upon us",
    "وَسَكَنَتْ": "and became calm",

    # MIC specific terms
    "قَدِ": "indeed",
    "خَرَاباً": "desolation",
    "غِرَارِ": "manner of",
    "مِنِ": "from",
    "مُوَاجَهَةِ": "face of",

    # PSA specific terms
    "الْعَزَاءَ.": "comfort.",
    "رُوحِي.": "my spirit.",
    "الْكَلامِ.": "words.",
    "السَّحِيقَةِ.": "ancient times.",
    "الْبَحْثِ": "searching",
    "نَفْسِي.": "my soul.",
    "رَأْفَتَهُ؟": "his compassion?",
    "(عَنَّا).»": "(from us).\"",
    "عَمِلْتَهَا": "you performed",
    "الْقَدِيمِ،": "of old,",
    "صَنَعْتَهُ.": "you did.",
    "طَرِيقَكَ": "your way",
    "الْقَدَاسَةُ،": "holiness,",
    "رَعْدِكَ": "your thunder",
    "وَاهْتَزَّتْ.": "and trembled.",
    "طَرِيقُكَ،": "your way,",
    "خُطْوَاتِكَ": "your footsteps",
    "عَبِيدِكَ": "your servants",
    "الْمَسْفُوكَةِ.": "that was shed.",
    "بِالْمَوْتِ.": "with death.",
    "وَأَهَانُوكَ": "and insulted you",

    # ZEC specific terms
    "عَنْكَ": "from you",
    "ثِيَاباً": "garments",
    "بَهِيَّةً،": "splendid,",
    "شُؤُونَ": "affairs of",
    "الْكَهَنَةِ": "the priests",
    "وَهَا": "and behold",
    "يُدْعَى": "is called",
    "وَكَتَبْتُ": "and I inscribed",
    "ظِلِّ": "shadow of",
    "حَقّاً": "truly",
    "وَإِرْوَاءِ": "and satisfying",
    "أَنْفُسِكُمْ؟": "yourselves?",
    "بِالرَّخَاءِ،": "in prosperity,",
    "أَلْسِنَةِ": "tongues of",
    "لأَخِيهِ.": "to his brother.",
    "غَيْرَ": "not",
    "عَابِئِينَ،": "caring,",
    "لِئَلّا": "lest",
    "يَسْمَعُوا.": "they hear.",
    "لِسَانِ": "tongue of",
    "لَدُنِ": "presence of",
    "قَبْلُ،": "before,",
    "نُفُوا": "they were exiled",
    "مِنْهَا": "from it",
    "ذَاهِبٌ": "going",
    "رَاجِعٌ،": "returning,",
}

def fix_empty_translations():
    """Fix all empty translations in all mapping files."""
    mappings_dir = Path("bible-translations/mappings")

    total_fixed = 0
    files_modified = 0
    unfixed_words = {}

    # Process all books
    for book_dir in sorted(mappings_dir.iterdir()):
        if not book_dir.is_dir():
            continue

        book = book_dir.name
        book_fixed = 0

        # Process all chapters
        for chapter_file in sorted(book_dir.glob("*.json")):
            chapter_num = chapter_file.stem

            try:
                with open(chapter_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            except Exception as e:
                print(f"Error reading {book} {chapter_num}: {e}")
                continue

            modified = False

            # Fix empty translations in verses
            for verse_num, verse_data in data.get("verses", {}).items():
                for mapping in verse_data.get("mappings", []):
                    if mapping.get("en", "") == "" or mapping.get("en") is None:
                        ar_word = mapping.get("ar", "")

                        # Look up translation
                        if ar_word in TRANSLATIONS:
                            mapping["en"] = TRANSLATIONS[ar_word]
                            book_fixed += 1
                            modified = True
                        else:
                            # Track unfixed words
                            if ar_word not in unfixed_words:
                                unfixed_words[ar_word] = []
                            unfixed_words[ar_word].append(f"{book} {chapter_num}:{verse_num}")

            # Save if modified
            if modified:
                with open(chapter_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                files_modified += 1

        if book_fixed > 0:
            print(f"{book}: Fixed {book_fixed} empty translations")
            total_fixed += book_fixed

    print(f"\n=== Summary ===")
    print(f"Total empty translations fixed: {total_fixed}")
    print(f"Files modified: {files_modified}")

    if unfixed_words:
        print(f"\n=== Words still needing translation ({len(unfixed_words)} unique words) ===")
        for word, locations in sorted(unfixed_words.items(), key=lambda x: -len(x[1])):
            print(f"  '{word}' ({len(locations)} occurrences)")
            for loc in locations[:3]:  # Show first 3 locations
                print(f"    - {loc}")
            if len(locations) > 3:
                print(f"    ... and {len(locations) - 3} more")

if __name__ == "__main__":
    fix_empty_translations()

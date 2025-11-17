#!/usr/bin/env python3
"""Merge all Psalm 119 mappings into complete file."""
import json

# Read existing mappings (verses 1-60)
with open('bible-translations/mappings/PSA/119.json', 'r') as f:
    existing = json.load(f)

# Create complete verses dict starting with existing
complete_verses = existing['verses'].copy()

# Agent 1 output: verses 61-90
verses_61_90 = {
  "61": {
    "ar": "قَامَ الأَشْرَارُ بِالإِيقَاعِ بِي، وَلَكِنِّي لَمْ أَنْسَ شَرِيعَتَكَ.",
    "en": "Though the wicked bind me with ropes, I will not forget your law.",
    "mappings": [
      {"ar": "قَامَ", "en": "Though", "start": 0, "end": 4},
      {"ar": "الأَشْرَارُ", "en": "the wicked", "start": 5, "end": 14},
      {"ar": "بِالإِيقَاعِ", "en": "bind", "start": 15, "end": 26},
      {"ar": "بِي،", "en": "me with ropes,", "start": 27, "end": 31},
      {"ar": "وَلَكِنِّي", "en": "I will", "start": 32, "end": 41},
      {"ar": "لَمْ", "en": "not", "start": 42, "end": 45},
      {"ar": "أَنْسَ", "en": "forget", "start": 46, "end": 51},
      {"ar": "شَرِيعَتَكَ.", "en": "your law.", "start": 52, "end": 63}
    ]
  },
  "62": {
    "ar": "أَسْتَيْقِظُ فِي مُنْتَصَفِ اللَّيْلِ لأَحْمَدَكَ مِنْ أَجْلِ أَحْكَامِكَ الْعَادِلَةِ.",
    "en": "At midnight I rise to give you thanks for your righteous laws.",
    "mappings": [
      {"ar": "أَسْتَيْقِظُ", "en": "I rise", "start": 0, "end": 11},
      {"ar": "فِي", "en": "At", "start": 12, "end": 15},
      {"ar": "مُنْتَصَفِ", "en": "midnight", "start": 16, "end": 25},
      {"ar": "اللَّيْلِ", "en": "midnight", "start": 26, "end": 34},
      {"ar": "لأَحْمَدَكَ", "en": "to give you thanks", "start": 35, "end": 45},
      {"ar": "مِنْ", "en": "for", "start": 46, "end": 50},
      {"ar": "أَجْلِ", "en": "for", "start": 51, "end": 56},
      {"ar": "أَحْكَامِكَ", "en": "your laws", "start": 57, "end": 67},
      {"ar": "الْعَادِلَةِ.", "en": "righteous.", "start": 68, "end": 80}
    ]
  },
  "63": {
    "ar": "رَفِيقٌ أَنَا لِكُلِّ الَّذِينَ يَتَّقُونَكَ، وَلِحَافِظِي وَصَايَاكَ.",
    "en": "I am a friend to all who fear you, to all who follow your precepts.",
    "mappings": [
      {"ar": "رَفِيقٌ", "en": "a friend", "start": 0, "end": 7},
      {"ar": "أَنَا", "en": "I am", "start": 8, "end": 13},
      {"ar": "لِكُلِّ", "en": "to all", "start": 14, "end": 21},
      {"ar": "الَّذِينَ", "en": "who", "start": 22, "end": 30},
      {"ar": "يَتَّقُونَكَ،", "en": "fear you,", "start": 31, "end": 43},
      {"ar": "وَلِحَافِظِي", "en": "to all who follow", "start": 44, "end": 56},
      {"ar": "وَصَايَاكَ.", "en": "your precepts.", "start": 57, "end": 67}
    ]
  },
  "64": {
    "ar": "رَحْمَتُكَ يَا رَبُّ قَدْ عَمَّتِ الأَرْضَ فَعَلِّمْنِي فَرَائِضَكَ.",
    "en": "The earth is filled with your love, Lord; teach me your decrees.",
    "mappings": [
      {"ar": "رَحْمَتُكَ", "en": "with your love,", "start": 0, "end": 10},
      {"ar": "يَا", "en": "Lord;", "start": 11, "end": 14},
      {"ar": "رَبُّ", "en": "Lord;", "start": 15, "end": 20},
      {"ar": "قَدْ", "en": "is filled", "start": 21, "end": 25},
      {"ar": "عَمَّتِ", "en": "is filled", "start": 26, "end": 33},
      {"ar": "الأَرْضَ", "en": "The earth", "start": 34, "end": 42},
      {"ar": "فَعَلِّمْنِي", "en": "teach me", "start": 43, "end": 54},
      {"ar": "فَرَائِضَكَ.", "en": "your decrees.", "start": 55, "end": 67}
    ]
  },
  "65": {
    "ar": "صَنَعْتَ خَيْراً يَا رَبُّ مَعِي أَنَا عَبْدَكَ كَمَا وَعَدْتَ.",
    "en": "Do good to your servant according to your word, Lord.",
    "mappings": [
      {"ar": "صَنَعْتَ", "en": "Do", "start": 0, "end": 7},
      {"ar": "خَيْراً", "en": "good", "start": 8, "end": 15},
      {"ar": "يَا", "en": "Lord.", "start": 16, "end": 19},
      {"ar": "رَبُّ", "en": "Lord.", "start": 20, "end": 25},
      {"ar": "مَعِي", "en": "to", "start": 26, "end": 31},
      {"ar": "أَنَا", "en": "your servant", "start": 32, "end": 37},
      {"ar": "عَبْدَكَ", "en": "your servant", "start": 38, "end": 45},
      {"ar": "كَمَا", "en": "according to", "start": 46, "end": 51},
      {"ar": "وَعَدْتَ.", "en": "your word,", "start": 52, "end": 60}
    ]
  },
  "66": {
    "ar": "هَبْنِي رُوحَ تَمْيِيزٍ وَمَعْرِفَةً، لأَنِّي آمَنْتُ بِوَصَايَاكَ.",
    "en": "Teach me knowledge and good judgment, for I trust your commands.",
    "mappings": [
      {"ar": "هَبْنِي", "en": "Teach me", "start": 0, "end": 7},
      {"ar": "رُوحَ", "en": "good judgment,", "start": 8, "end": 13},
      {"ar": "تَمْيِيزٍ", "en": "good judgment,", "start": 14, "end": 23},
      {"ar": "وَمَعْرِفَةً،", "en": "knowledge and", "start": 24, "end": 36},
      {"ar": "لأَنِّي", "en": "for I", "start": 37, "end": 44},
      {"ar": "آمَنْتُ", "en": "trust", "start": 45, "end": 52},
      {"ar": "بِوَصَايَاكَ.", "en": "your commands.", "start": 53, "end": 65}
    ]
  },
  "67": {
    "ar": "ضَلَلْتُ قَبْلَ أَنْ أَدَّبْتَنِي، أَمَّا الآنَ فَحَفِظْتُ كَلامَكَ.",
    "en": "Before I was afflicted I went astray, but now I obey your word.",
    "mappings": [
      {"ar": "ضَلَلْتُ", "en": "I went astray,", "start": 0, "end": 8},
      {"ar": "قَبْلَ", "en": "Before", "start": 9, "end": 15},
      {"ar": "أَنْ", "en": "I was", "start": 16, "end": 20},
      {"ar": "أَدَّبْتَنِي،", "en": "afflicted", "start": 21, "end": 33},
      {"ar": "أَمَّا", "en": "but", "start": 34, "end": 40},
      {"ar": "الآنَ", "en": "now", "start": 41, "end": 46},
      {"ar": "فَحَفِظْتُ", "en": "I obey", "start": 47, "end": 57},
      {"ar": "كَلامَكَ.", "en": "your word.", "start": 58, "end": 67}
    ]
  },
  "68": {
    "ar": "أَنْتَ صَالِحٌ وَمُحْسِنٌ فَعَلِّمْنِي فَرَائِضَكَ.",
    "en": "You are good, and what you do is good; teach me your decrees.",
    "mappings": [
      {"ar": "أَنْتَ", "en": "You are", "start": 0, "end": 6},
      {"ar": "صَالِحٌ", "en": "good,", "start": 7, "end": 15},
      {"ar": "وَمُحْسِنٌ", "en": "and what you do is good;", "start": 16, "end": 26},
      {"ar": "فَعَلِّمْنِي", "en": "teach me", "start": 27, "end": 38},
      {"ar": "فَرَائِضَكَ.", "en": "your decrees.", "start": 39, "end": 51}
    ]
  },
  "69": {
    "ar": "لَفَّقَ الْمُتَكَبِّرُونَ عَلَيَّ أَقْوَالاً كَاذِبَةً، أَمَّا أَنَا فَبِكُلِّ قَلْبِي أَحْفَظُ وَصَايَاكَ.",
    "en": "Though the arrogant have smeared me with lies, I keep your precepts with all my heart.",
    "mappings": [
      {"ar": "لَفَّقَ", "en": "have smeared", "start": 0, "end": 7},
      {"ar": "الْمُتَكَبِّرُونَ", "en": "Though the arrogant", "start": 8, "end": 24},
      {"ar": "عَلَيَّ", "en": "me", "start": 25, "end": 32},
      {"ar": "أَقْوَالاً", "en": "with lies,", "start": 33, "end": 43},
      {"ar": "كَاذِبَةً،", "en": "with lies,", "start": 44, "end": 54},
      {"ar": "أَمَّا", "en": "I", "start": 55, "end": 61},
      {"ar": "أَنَا", "en": "I", "start": 62, "end": 67},
      {"ar": "فَبِكُلِّ", "en": "with all", "start": 68, "end": 77},
      {"ar": "قَلْبِي", "en": "my heart.", "start": 78, "end": 85},
      {"ar": "أَحْفَظُ", "en": "keep", "start": 86, "end": 94},
      {"ar": "وَصَايَاكَ.", "en": "your precepts", "start": 95, "end": 106}
    ]
  },
  "70": {
    "ar": "غَلُظَ قَلْبُهُمْ وَتَقَسَّى، أَمَّا أَنَا فَأَتَمَتَّعُ بِشَرِيعَتِكَ.",
    "en": "Their hearts are callous and unfeeling, but I delight in your law.",
    "mappings": [
      {"ar": "غَلُظَ", "en": "are callous", "start": 0, "end": 6},
      {"ar": "قَلْبُهُمْ", "en": "Their hearts", "start": 7, "end": 17},
      {"ar": "وَتَقَسَّى،", "en": "and unfeeling,", "start": 18, "end": 29},
      {"ar": "أَمَّا", "en": "but", "start": 30, "end": 36},
      {"ar": "أَنَا", "en": "I", "start": 37, "end": 42},
      {"ar": "فَأَتَمَتَّعُ", "en": "delight", "start": 43, "end": 55},
      {"ar": "بِشَرِيعَتِكَ.", "en": "in your law.", "start": 56, "end": 69}
    ]
  },
  "71": {
    "ar": "كَانَ مَا ذُقْتُ مِنْ هَوَانٍ لِخَيْرِي فَتَعَلَّمْتُ فَرَائِضَكَ.",
    "en": "It was good for me to be afflicted so that I might learn your decrees.",
    "mappings": [
      {"ar": "كَانَ", "en": "It was", "start": 0, "end": 5},
      {"ar": "مَا", "en": "to be afflicted", "start": 6, "end": 9},
      {"ar": "ذُقْتُ", "en": "to be afflicted", "start": 10, "end": 16},
      {"ar": "مِنْ", "en": "to be afflicted", "start": 17, "end": 21},
      {"ar": "هَوَانٍ", "en": "to be afflicted", "start": 22, "end": 29},
      {"ar": "لِخَيْرِي", "en": "good for me", "start": 30, "end": 39},
      {"ar": "فَتَعَلَّمْتُ", "en": "so that I might learn", "start": 40, "end": 52},
      {"ar": "فَرَائِضَكَ.", "en": "your decrees.", "start": 53, "end": 65}
    ]
  },
  "72": {
    "ar": "شَرِيعَةُ فَمِكَ خَيْرٌ لِي مِنْ كُلِّ ذَهَبِ الْعَالَمِ وَفِضَّتِهِ.",
    "en": "The law from your mouth is more precious to me than thousands of pieces of silver and gold.",
    "mappings": [
      {"ar": "شَرِيعَةُ", "en": "The law", "start": 0, "end": 9},
      {"ar": "فَمِكَ", "en": "from your mouth", "start": 10, "end": 16},
      {"ar": "خَيْرٌ", "en": "is more precious", "start": 17, "end": 24},
      {"ar": "لِي", "en": "to me", "start": 25, "end": 28},
      {"ar": "مِنْ", "en": "than", "start": 29, "end": 33},
      {"ar": "كُلِّ", "en": "thousands of pieces of", "start": 34, "end": 39},
      {"ar": "ذَهَبِ", "en": "gold.", "start": 40, "end": 46},
      {"ar": "الْعَالَمِ", "en": "thousands of pieces of", "start": 47, "end": 57},
      {"ar": "وَفِضَّتِهِ.", "en": "silver and", "start": 58, "end": 69}
    ]
  },
  "73": {
    "ar": "يَدَاكَ صَنَعَتَانِي وَكَوَّنَتَانِي، فَهَبْنِي فَهْماً لأَتَعَلَّمَ وَصَايَاكَ.",
    "en": "Your hands made me and formed me; give me understanding to learn your commands.",
    "mappings": [
      {"ar": "يَدَاكَ", "en": "Your hands", "start": 0, "end": 7},
      {"ar": "صَنَعَتَانِي", "en": "made me", "start": 8, "end": 19},
      {"ar": "وَكَوَّنَتَانِي،", "en": "and formed me;", "start": 20, "end": 35},
      {"ar": "فَهَبْنِي", "en": "give me", "start": 36, "end": 45},
      {"ar": "فَهْماً", "en": "understanding", "start": 46, "end": 53},
      {"ar": "لأَتَعَلَّمَ", "en": "to learn", "start": 54, "end": 65},
      {"ar": "وَصَايَاكَ.", "en": "your commands.", "start": 66, "end": 77}
    ]
  },
  "74": {
    "ar": "فَيَرَانِي مُتَّقُوكَ وَيَفْرَحُونَ، لأَنِّي انْتَظَرْتُ كَلامَكَ.",
    "en": "May those who fear you rejoice when they see me, for I have put my hope in your word.",
    "mappings": [
      {"ar": "فَيَرَانِي", "en": "when they see me,", "start": 0, "end": 10},
      {"ar": "مُتَّقُوكَ", "en": "May those who fear you", "start": 11, "end": 21},
      {"ar": "وَيَفْرَحُونَ،", "en": "rejoice", "start": 22, "end": 35},
      {"ar": "لأَنِّي", "en": "for I", "start": 36, "end": 43},
      {"ar": "انْتَظَرْتُ", "en": "have put my hope in", "start": 44, "end": 55},
      {"ar": "كَلامَكَ.", "en": "your word.", "start": 56, "end": 65}
    ]
  },
  "75": {
    "ar": "قَدْ عَلِمْتُ يَا رَبُّ أَنَّ أَحْكَامَكَ عَادِلَةٌ، وَأَنَّكَ بِالْحَقِّ أَدَّبْتَنِي.",
    "en": "I know, Lord, that your laws are righteous, and that in faithfulness you have afflicted me.",
    "mappings": [
      {"ar": "قَدْ", "en": "I know,", "start": 0, "end": 4},
      {"ar": "عَلِمْتُ", "en": "I know,", "start": 5, "end": 13},
      {"ar": "يَا", "en": "Lord,", "start": 14, "end": 17},
      {"ar": "رَبُّ", "en": "Lord,", "start": 18, "end": 23},
      {"ar": "أَنَّ", "en": "that", "start": 24, "end": 29},
      {"ar": "أَحْكَامَكَ", "en": "your laws", "start": 30, "end": 41},
      {"ar": "عَادِلَةٌ،", "en": "are righteous,", "start": 42, "end": 52},
      {"ar": "وَأَنَّكَ", "en": "and that", "start": 53, "end": 62},
      {"ar": "بِالْحَقِّ", "en": "in faithfulness", "start": 63, "end": 73},
      {"ar": "أَدَّبْتَنِي.", "en": "you have afflicted me.", "start": 74, "end": 86}
    ]
  },
  "76": {
    "ar": "فَلْتَكُنْ رَحْمَتُكَ تَعْزِيَةً لِي، بِمُقْتَضَى وَعْدِكَ لِعَبْدِكَ.",
    "en": "May your unfailing love be my comfort, according to your promise to your servant.",
    "mappings": [
      {"ar": "فَلْتَكُنْ", "en": "May be", "start": 0, "end": 10},
      {"ar": "رَحْمَتُكَ", "en": "your unfailing love", "start": 11, "end": 21},
      {"ar": "تَعْزِيَةً", "en": "my comfort,", "start": 22, "end": 32},
      {"ar": "لِي،", "en": "my comfort,", "start": 33, "end": 37},
      {"ar": "بِمُقْتَضَى", "en": "according to", "start": 38, "end": 49},
      {"ar": "وَعْدِكَ", "en": "your promise", "start": 50, "end": 58},
      {"ar": "لِعَبْدِكَ.", "en": "to your servant.", "start": 59, "end": 69}
    ]
  },
  "77": {
    "ar": "لِتَأْتِنِي مَرَاحِمُكَ فَأَحْيَا، لأَنَّ شَرِيعَتَكَ هِيَ مُتْعَتِي.",
    "en": "Let your compassion come to me that I may live, for your law is my delight.",
    "mappings": [
      {"ar": "لِتَأْتِنِي", "en": "Let come to me", "start": 0, "end": 11},
      {"ar": "مَرَاحِمُكَ", "en": "your compassion", "start": 12, "end": 23},
      {"ar": "فَأَحْيَا،", "en": "that I may live,", "start": 24, "end": 34},
      {"ar": "لأَنَّ", "en": "for", "start": 35, "end": 41},
      {"ar": "شَرِيعَتَكَ", "en": "your law", "start": 42, "end": 53},
      {"ar": "هِيَ", "en": "is", "start": 54, "end": 58},
      {"ar": "مُتْعَتِي.", "en": "my delight.", "start": 59, "end": 69}
    ]
  },
  "78": {
    "ar": "لِيَخْزَ الْمُتَكَبِّرُونَ لأَنَّهُمُ افْتَرَوْا عَلَيَّ زُوراً، أَمَّا أَنَا فَأَتَأَمَّلُ فِي وَصَايَاكَ.",
    "en": "May the arrogant be put to shame for wronging me without cause; but I will meditate on your precepts.",
    "mappings": [
      {"ar": "لِيَخْزَ", "en": "May be put to shame", "start": 0, "end": 8},
      {"ar": "الْمُتَكَبِّرُونَ", "en": "the arrogant", "start": 9, "end": 25},
      {"ar": "لأَنَّهُمُ", "en": "for", "start": 26, "end": 36},
      {"ar": "افْتَرَوْا", "en": "wronging", "start": 37, "end": 47},
      {"ar": "عَلَيَّ", "en": "me", "start": 48, "end": 55},
      {"ar": "زُوراً،", "en": "without cause;", "start": 56, "end": 64},
      {"ar": "أَمَّا", "en": "but", "start": 65, "end": 71},
      {"ar": "أَنَا", "en": "I", "start": 72, "end": 77},
      {"ar": "فَأَتَأَمَّلُ", "en": "will meditate", "start": 78, "end": 90},
      {"ar": "فِي", "en": "on", "start": 91, "end": 95},
      {"ar": "وَصَايَاكَ.", "en": "your precepts.", "start": 96, "end": 107}
    ]
  },
  "79": {
    "ar": "لِيَنْضَمَّ إِلَيَّ مُتَّقُوكَ وَعَارِفُو شَهَادَاتِكَ.",
    "en": "May those who fear you turn to me, those who understand your statutes.",
    "mappings": [
      {"ar": "لِيَنْضَمَّ", "en": "May turn", "start": 0, "end": 11},
      {"ar": "إِلَيَّ", "en": "to me,", "start": 12, "end": 19},
      {"ar": "مُتَّقُوكَ", "en": "those who fear you", "start": 20, "end": 30},
      {"ar": "وَعَارِفُو", "en": "those who understand", "start": 31, "end": 41},
      {"ar": "شَهَادَاتِكَ.", "en": "your statutes.", "start": 42, "end": 55}
    ]
  },
  "80": {
    "ar": "لِيَكُنْ قَلْبِي مُتَعَلِّقاً بِكَامِلِ فَرَائِضِكَ، فَلَا أَخْزَى.",
    "en": "May I wholeheartedly follow your decrees, that I may not be put to shame.",
    "mappings": [
      {"ar": "لِيَكُنْ", "en": "May", "start": 0, "end": 8},
      {"ar": "قَلْبِي", "en": "I wholeheartedly", "start": 9, "end": 16},
      {"ar": "مُتَعَلِّقاً", "en": "follow", "start": 17, "end": 29},
      {"ar": "بِكَامِلِ", "en": "wholeheartedly", "start": 30, "end": 39},
      {"ar": "فَرَائِضِكَ،", "en": "your decrees,", "start": 40, "end": 52},
      {"ar": "فَلَا", "en": "that I may not", "start": 53, "end": 59},
      {"ar": "أَخْزَى.", "en": "be put to shame.", "start": 60, "end": 68}
    ]
  },
  "81": {
    "ar": "تَتَلَهَّفُ نَفْسِي إِلَى خَلاصِكَ. رَجَائِي هُوَ كَلِمَتُكَ.",
    "en": "My soul faints with longing for your salvation, but I have put my hope in your word.",
    "mappings": [
      {"ar": "تَتَلَهَّفُ", "en": "faints with longing", "start": 0, "end": 11},
      {"ar": "نَفْسِي", "en": "My soul", "start": 12, "end": 19},
      {"ar": "إِلَى", "en": "for", "start": 20, "end": 26},
      {"ar": "خَلاصِكَ.", "en": "your salvation,", "start": 27, "end": 36},
      {"ar": "رَجَائِي", "en": "but I have put my hope", "start": 37, "end": 45},
      {"ar": "هُوَ", "en": "in", "start": 46, "end": 50},
      {"ar": "كَلِمَتُكَ.", "en": "your word.", "start": 51, "end": 62}
    ]
  },
  "82": {
    "ar": "كَلَّتْ عَيْنَايَ فِي انْتِظَارِ كَلامِكَ، وَأَنَا أَقُولُ: مَتَى تُعَزِّينِي؟",
    "en": "My eyes fail, looking for your promise; I say, \"When will you comfort me?\"",
    "mappings": [
      {"ar": "كَلَّتْ", "en": "fail,", "start": 0, "end": 7},
      {"ar": "عَيْنَايَ", "en": "My eyes", "start": 8, "end": 17},
      {"ar": "فِي", "en": "looking for", "start": 18, "end": 22},
      {"ar": "انْتِظَارِ", "en": "looking for", "start": 23, "end": 33},
      {"ar": "كَلامِكَ،", "en": "your promise;", "start": 34, "end": 43},
      {"ar": "وَأَنَا", "en": "I", "start": 44, "end": 51},
      {"ar": "أَقُولُ:", "en": "say,", "start": 52, "end": 60},
      {"ar": "مَتَى", "en": "\"When", "start": 61, "end": 66},
      {"ar": "تُعَزِّينِي؟", "en": "will you comfort me?\"", "start": 67, "end": 79}
    ]
  },
  "83": {
    "ar": "أَصْبَحْتُ كَقِرْبَةِ خَمْرٍ أَتْلَفَتْهَا الْحَرَارَةُ وَالدُّخَانُ، وَلَكِنِّي لَمْ أَنْسَ فَرَائِضَكَ.",
    "en": "Though I am like a wineskin in the smoke, I do not forget your decrees.",
    "mappings": [
      {"ar": "أَصْبَحْتُ", "en": "Though I am", "start": 0, "end": 10},
      {"ar": "كَقِرْبَةِ", "en": "like a wineskin", "start": 11, "end": 21},
      {"ar": "خَمْرٍ", "en": "wineskin", "start": 22, "end": 28},
      {"ar": "أَتْلَفَتْهَا", "en": "in", "start": 29, "end": 41},
      {"ar": "الْحَرَارَةُ", "en": "in", "start": 42, "end": 53},
      {"ar": "وَالدُّخَانُ،", "en": "the smoke,", "start": 54, "end": 67},
      {"ar": "وَلَكِنِّي", "en": "I do", "start": 68, "end": 78},
      {"ar": "لَمْ", "en": "not", "start": 79, "end": 83},
      {"ar": "أَنْسَ", "en": "forget", "start": 84, "end": 90},
      {"ar": "فَرَائِضَكَ.", "en": "your decrees.", "start": 91, "end": 103}
    ]
  },
  "84": {
    "ar": "كَمْ هِي أَيَّامُ عُمْرِ عَبْدِكَ؟ مَتَى تُنْزِلُ الْقَضَاءَ بِالَّذِينَ يَضْطَهِدُونَنِي؟",
    "en": "How long must your servant wait? When will you punish my persecutors?",
    "mappings": [
      {"ar": "كَمْ", "en": "How long", "start": 0, "end": 4},
      {"ar": "هِي", "en": "must", "start": 5, "end": 9},
      {"ar": "أَيَّامُ", "en": "wait?", "start": 10, "end": 18},
      {"ar": "عُمْرِ", "en": "wait?", "start": 19, "end": 25},
      {"ar": "عَبْدِكَ؟", "en": "your servant", "start": 26, "end": 35},
      {"ar": "مَتَى", "en": "When", "start": 36, "end": 41},
      {"ar": "تُنْزِلُ", "en": "will you punish", "start": 42, "end": 51},
      {"ar": "الْقَضَاءَ", "en": "will you punish", "start": 52, "end": 62},
      {"ar": "بِالَّذِينَ", "en": "my persecutors?", "start": 63, "end": 74},
      {"ar": "يَضْطَهِدُونَنِي؟", "en": "my persecutors?", "start": 75, "end": 91}
    ]
  },
  "85": {
    "ar": "الْمُتَكَبِّرُونَ الَّذِينَ يَعْصَوْنَ شَرِيعَتَكَ حَفَرُوا لِي حُفَراً.",
    "en": "The arrogant dig pits to trap me, contrary to your law.",
    "mappings": [
      {"ar": "الْمُتَكَبِّرُونَ", "en": "The arrogant", "start": 0, "end": 16},
      {"ar": "الَّذِينَ", "en": "contrary to", "start": 17, "end": 26},
      {"ar": "يَعْصَوْنَ", "en": "contrary to", "start": 27, "end": 37},
      {"ar": "شَرِيعَتَكَ", "en": "your law.", "start": 38, "end": 49},
      {"ar": "حَفَرُوا", "en": "dig", "start": 50, "end": 58},
      {"ar": "لِي", "en": "to trap me,", "start": 59, "end": 63},
      {"ar": "حُفَراً.", "en": "pits", "start": 64, "end": 72}
    ]
  },
  "86": {
    "ar": "وَصَايَاكَ كُلُّهَا صَادِقَةٌ. زُوراً يَضْطَهِدُونَنِي فَأَغِثْنِي.",
    "en": "All your commands are trustworthy; help me, for I am being persecuted without cause.",
    "mappings": [
      {"ar": "وَصَايَاكَ", "en": "your commands", "start": 0, "end": 10},
      {"ar": "كُلُّهَا", "en": "All", "start": 11, "end": 19},
      {"ar": "صَادِقَةٌ.", "en": "are trustworthy;", "start": 20, "end": 30},
      {"ar": "زُوراً", "en": "without cause.", "start": 31, "end": 38},
      {"ar": "يَضْطَهِدُونَنِي", "en": "for I am being persecuted", "start": 39, "end": 54},
      {"ar": "فَأَغِثْنِي.", "en": "help me,", "start": 55, "end": 67}
    ]
  },
  "87": {
    "ar": "لَوْلَا قَلِيلٌ لأَفْنَوْنِي مِنَ الأَرْضِ، لَكِنِّي لَمْ أَتْرُكْ شَرِيعَتَكْ.",
    "en": "They almost wiped me from the earth, but I have not forsaken your precepts.",
    "mappings": [
      {"ar": "لَوْلَا", "en": "They almost", "start": 0, "end": 7},
      {"ar": "قَلِيلٌ", "en": "almost", "start": 8, "end": 16},
      {"ar": "لأَفْنَوْنِي", "en": "wiped me", "start": 17, "end": 28},
      {"ar": "مِنَ", "en": "from", "start": 29, "end": 34},
      {"ar": "الأَرْضِ،", "en": "the earth,", "start": 35, "end": 44},
      {"ar": "لَكِنِّي", "en": "but I", "start": 45, "end": 54},
      {"ar": "لَمْ", "en": "have not", "start": 55, "end": 59},
      {"ar": "أَتْرُكْ", "en": "forsaken", "start": 60, "end": 68},
      {"ar": "شَرِيعَتَكْ.", "en": "your precepts.", "start": 69, "end": 81}
    ]
  },
  "88": {
    "ar": "أَحْيِنِي بِمُقْتَضَى رَحْمَتِكَ، فَأُطِيعَ شَرَائِعَكَ.",
    "en": "In your unfailing love preserve my life, that I may obey the statutes of your mouth.",
    "mappings": [
      {"ar": "أَحْيِنِي", "en": "preserve my life,", "start": 0, "end": 9},
      {"ar": "بِمُقْتَضَى", "en": "In", "start": 10, "end": 21},
      {"ar": "رَحْمَتِكَ،", "en": "your unfailing love", "start": 22, "end": 33},
      {"ar": "فَأُطِيعَ", "en": "that I may obey", "start": 34, "end": 43},
      {"ar": "شَرَائِعَكَ.", "en": "the statutes of your mouth.", "start": 44, "end": 56}
    ]
  },
  "89": {
    "ar": "يَا رَبُّ كَلِمَتُكَ تَدُومُ ثَابِتَةً فِي السَّمَاوَاتِ إِلَى الأَبَدِ.",
    "en": "Your word, Lord, is eternal; it stands firm in the heavens.",
    "mappings": [
      {"ar": "يَا", "en": "Lord,", "start": 0, "end": 3},
      {"ar": "رَبُّ", "en": "Lord,", "start": 4, "end": 9},
      {"ar": "كَلِمَتُكَ", "en": "Your word,", "start": 10, "end": 20},
      {"ar": "تَدُومُ", "en": "is eternal;", "start": 21, "end": 28},
      {"ar": "ثَابِتَةً", "en": "it stands firm", "start": 29, "end": 39},
      {"ar": "فِي", "en": "in", "start": 40, "end": 44},
      {"ar": "السَّمَاوَاتِ", "en": "the heavens.", "start": 45, "end": 57},
      {"ar": "إِلَى", "en": "is eternal;", "start": 58, "end": 64},
      {"ar": "الأَبَدِ.", "en": "is eternal;", "start": 65, "end": 74}
    ]
  },
  "90": {
    "ar": "مِنْ جِيلٍ إِلَى جِيلٍ أَمَانَتُكَ. أَنْتَ أَسَّسْتَ الأَرْضَ فَلَنْ تَتَزَعْزَعَ.",
    "en": "Your faithfulness continues through all generations; you established the earth, and it endures.",
    "mappings": [
      {"ar": "مِنْ", "en": "through all generations;", "start": 0, "end": 4},
      {"ar": "جِيلٍ", "en": "through all generations;", "start": 5, "end": 11},
      {"ar": "إِلَى", "en": "through all generations;", "start": 12, "end": 18},
      {"ar": "جِيلٍ", "en": "through all generations;", "start": 19, "end": 25},
      {"ar": "أَمَانَتُكَ.", "en": "Your faithfulness continues", "start": 26, "end": 38},
      {"ar": "أَنْتَ", "en": "you", "start": 39, "end": 45},
      {"ar": "أَسَّسْتَ", "en": "established", "start": 46, "end": 55},
      {"ar": "الأَرْضَ", "en": "the earth,", "start": 56, "end": 64},
      {"ar": "فَلَنْ", "en": "and it endures.", "start": 65, "end": 71},
      {"ar": "تَتَزَعْزَعَ.", "en": "and it endures.", "start": 72, "end": 84}
    ]
  }
}

# Add to complete
complete_verses.update(verses_61_90)

print(f"Added verses 61-90. Total now: {len(complete_verses)}")
print("Script will continue in next file (too long)...")

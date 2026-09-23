#!/usr/bin/env python3
import json

# Read the file
with open('/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-maps-word-haiku/mappings/GEN/9.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Verse 15 translations
verse_15_trans = ["that I", "remember", "my covenant", "which", "between me", "and between you", "and between", "all", "the creatures", "the living", "from", "possessors of", "flesh", "so not", "will become", "the waters", "into", "flood", "destroys", "all", "life"]

# Verse 16 translations
verse_16_trans = ["and will be", "the bow", "in", "the clouds", "so I will see it", "and I will remember", "the covenant", "the everlasting", "the established", "between me", "and between", "all", "the creatures", "the living", "upon", "the earth"]

# Verse 17 translations
verse_17_trans = ["and said", "God", "to Noah", "this", "is", "the sign of", "the covenant", "which", "I established", "between me", "and between", "all", "living", "upon", "the earth"]

# Verse 18 translations
verse_18_trans = ["as for", "the sons of", "Noah", "who", "came out", "with him", "from", "the ark", "they were", "Shem", "and Ham", "and Japheth", "and Ham", "he", "father of", "the Canaanites"]

# Verse 19 translations
verse_19_trans = ["these", "were", "the sons of", "Noah", "the three", "who", "branched out", "from them", "the peoples of", "the earth", "all of it"]

# Verse 20 translations
verse_20_trans = ["and worked", "Noah", "in farming", "and planted", "a vineyard"]

# Verse 21 translations
verse_21_trans = ["and drank", "from", "the wine", "and became drunk", "and became naked", "inside", "his tent"]

# Verse 22 translations
verse_22_trans = ["and saw", "Ham", "father of", "the Canaanites", "the nakedness of", "his father", "so he went out", "and told", "his two brothers", "who", "were", "outside"]

# Verse 23 translations
verse_23_trans = ["and took", "Shem", "and Japheth", "a garment", "and placed it", "upon", "their shoulders", "and walked", "backward", "to", "inside", "the tent", "and covered", "the nakedness of", "their father", "without", "that", "they turn", "with their faces", "toward him", "so they see", "his nakedness"]

# Verse 24 translations
verse_24_trans = ["and when", "awoke", "Noah", "from", "his drunkenness", "and knew", "what", "did", "to him", "his son", "the younger"]

# Verse 25 translations
verse_25_trans = ["he said", "let be", "Canaan", "cursed", "and let him be", "a slave of", "slaves", "to his brothers"]

# Verse 26 translations
verse_26_trans = ["then", "he said", "blessed be", "God", "the God of", "Shem", "and let be", "Canaan", "a slave", "to him"]

# Verse 27 translations
verse_27_trans = ["may enlarge", "God", "for Japheth", "so he may dwell", "in", "the tents of", "Shem", "and let be", "Canaan", "a slave", "to him"]

# Verse 28 translations
verse_28_trans = ["and lived", "Noah", "after", "the flood", "three", "hundred", "and fifty", "years"]

# Verse 29 translations
verse_29_trans = ["then", "he died", "and he had", "from", "the age", "nine", "hundred", "and fifty", "years"]

# Apply translations
for verse_num, translations in [("15", verse_15_trans), ("16", verse_16_trans), ("17", verse_17_trans),
                                  ("18", verse_18_trans), ("19", verse_19_trans), ("20", verse_20_trans),
                                  ("21", verse_21_trans), ("22", verse_22_trans), ("23", verse_23_trans),
                                  ("24", verse_24_trans), ("25", verse_25_trans), ("26", verse_26_trans),
                                  ("27", verse_27_trans), ("28", verse_28_trans), ("29", verse_29_trans)]:
    mappings = data["verses"][verse_num]["mappings"]
    for i, mapping in enumerate(mappings):
        if i < len(translations):
            mapping["en"] = translations[i]

# Save the file
with open('/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-maps-word-haiku/mappings/GEN/9.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Completed translation of Genesis 9")

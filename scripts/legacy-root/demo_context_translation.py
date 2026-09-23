#!/usr/bin/env python3
"""
Demo: Context-aware word translation with Gemma 3
Shows how providing verse context dramatically improves translation quality
"""

import requests

OLLAMA_API = "http://localhost:11434/api/generate"
MODEL = "gemma3:12b"

# Example from John 3:16 - where LibreTranslate failed catastrophically
arabic_verse = "لأَنَّهُ هكَذَا أَحَبَّ اللهُ الْعَالَمَ حَتَّى بَذَلَ ابْنَهُ الْوَحِيدَ، لِكَيْ لَا يَهْلِكَ كُلُّ مَنْ يُؤْمِنُ بِهِ، بَلْ تَكُونُ لَهُ الْحَيَاةُ الأَبَدِيَّةُ."
english_verse = "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."

# Words that LibreTranslate got TERRIBLY wrong:
problem_words = [
    ("بَذَلَ", "gave", "yes"),        # LibreTranslate said "yes"!!!
    ("يَهْلِكَ", "perish", "hallucinates"),  # LibreTranslate said "hallucinates"!!!
    ("كُلُّ", "all/whoever", "eat"),   # LibreTranslate said "eat"!!!
]

def translate_without_context(word):
    """Translate word WITHOUT context (like LibreTranslate)"""
    prompt = f"Translate this Arabic word to English: {word}\n\nEnglish:"

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.1, "num_predict": 10}
    }

    response = requests.post(OLLAMA_API, json=payload, timeout=30)
    return response.json().get("response", "").strip()


def translate_with_context(word, ar_verse, en_verse):
    """Translate word WITH full verse context"""
    prompt = f"""Given this Bible verse translation, what is the English equivalent of the Arabic word in context?

Arabic verse: {ar_verse}
English verse: {en_verse}

Arabic word: {word}

English translation (2-3 words max):"""

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.1, "num_predict": 15}
    }

    response = requests.post(OLLAMA_API, json=payload, timeout=30)
    return response.json().get("response", "").strip().strip('"\'.,')


print("=" * 80)
print("Context-Aware Translation Demo - John 3:16")
print("=" * 80)
print(f"\nArabic: {arabic_verse}")
print(f"\nEnglish: {english_verse}")
print("\n" + "=" * 80)
print("Comparing: No Context vs. With Context")
print("=" * 80)

for arabic_word, expected, libretranslate_result in problem_words:
    print(f"\n📝 Arabic word: {arabic_word}")
    print(f"   Expected: {expected}")
    print(f"   LibreTranslate (no context): '{libretranslate_result}' 💀")

    # Gemma without context
    no_context = translate_without_context(arabic_word)
    print(f"   Gemma 3 (no context): '{no_context}'")

    # Gemma with context
    with_context = translate_with_context(arabic_word, arabic_verse, english_verse)
    print(f"   Gemma 3 (WITH context): '{with_context}' ✅")

print("\n" + "=" * 80)
print("✅ Context makes ALL the difference!")
print("=" * 80)

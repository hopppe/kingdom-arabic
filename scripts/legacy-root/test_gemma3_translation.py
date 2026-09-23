#!/usr/bin/env python3
"""
Test Gemma 3 via Ollama for Arabic-English word translation
This should produce excellent results compared to LibreTranslate
"""

import json
import requests

OLLAMA_API = "http://localhost:11434/api/generate"
MODEL = "gemma3:12b"

# Test words from Mark 1:1 that LibreTranslate got wrong
test_words_mark = [
    ("هَذِهِ", "this"),      # LibreTranslate: "here"
    ("بِدَايَةُ", "beginning"),  # LibreTranslate: "beginning" ✓
    ("إِنْجِيلِ", "gospel"),      # LibreTranslate: "run"!!!
    ("يَسُوعَ", "Jesus"),         # LibreTranslate: "Jesus" ✓
    ("الْمَسِيحِ", "Messiah/Christ"),  # LibreTranslate: "Jesus"
]

# Test words from John 3:16 that LibreTranslate destroyed
test_words_john = [
    ("أَحَبَّ", "loved"),      # LibreTranslate: "I love"
    ("بَذَلَ", "gave"),        # LibreTranslate: "yes"!!!
    ("يَهْلِكَ", "perish"),    # LibreTranslate: "hallucinates"!!!
    ("كُلُّ", "all/every"),    # LibreTranslate: "eat"!!!
]

# Test from Psalm 23:1
test_words_psalm = [
    ("رَاعِيَّ", "my shepherd"),  # LibreTranslate: "Wow"!!!
]


def translate_word(arabic_word):
    """Translate a single Arabic word using Gemma 3 via Ollama"""
    prompt = f"""Translate this single Arabic word to English. Give only the English translation, nothing else.

Arabic word: {arabic_word}

English translation:"""

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,  # Lower temperature for more consistent translations
            "num_predict": 20    # Short response
        }
    }

    try:
        response = requests.post(OLLAMA_API, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        translation = result.get("response", "").strip()
        return translation
    except Exception as e:
        return f"Error: {e}"


def main():
    print("=" * 70)
    print("Testing Gemma 3 (12B) for Arabic-English Word Translation")
    print("=" * 70)
    print(f"\nUsing Ollama API at: {OLLAMA_API}")
    print(f"Model: {MODEL}\n")

    # Test Mark 1:1
    print("\n" + "─" * 70)
    print("Mark 1:1 - LibreTranslate got 'إِنْجِيلِ' wrong ('run' instead of 'gospel')")
    print("─" * 70)
    for arabic, expected in test_words_mark:
        gemma_result = translate_word(arabic)
        status = "✅" if expected.lower() in gemma_result.lower() else "⚠️"
        print(f"{status}  {arabic:15} → Expected: {expected:20} | Gemma: {gemma_result}")

    # Test John 3:16
    print("\n" + "─" * 70)
    print("John 3:16 - LibreTranslate catastrophic failures")
    print("─" * 70)
    for arabic, expected in test_words_john:
        gemma_result = translate_word(arabic)
        status = "✅" if expected.lower() in gemma_result.lower() else "⚠️"
        print(f"{status}  {arabic:15} → Expected: {expected:20} | Gemma: {gemma_result}")

    # Test Psalm 23:1
    print("\n" + "─" * 70)
    print("Psalm 23:1 - LibreTranslate said 'Wow' instead of 'my shepherd'")
    print("─" * 70)
    for arabic, expected in test_words_psalm:
        gemma_result = translate_word(arabic)
        status = "✅" if "shepherd" in gemma_result.lower() else "⚠️"
        print(f"{status}  {arabic:15} → Expected: {expected:20} | Gemma: {gemma_result}")

    print("\n" + "=" * 70)
    print("✅ Test complete!")
    print("=" * 70)


if __name__ == "__main__":
    main()

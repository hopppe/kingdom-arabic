#!/usr/bin/env python3
"""
Test Gemma 3 4B on John chapter 1
Compare speed and quality against 12B
"""

import json
import os
import requests
import re
import sys
from pathlib import Path
import time

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)

OLLAMA_API = "http://localhost:11434/api/generate"
MODEL = "gemma3:4b"  # Using 4B instead of 12B

def translate_verse_batch(arabic_words, full_verse_ar, full_verse_en):
    """Translate ALL words in a verse at once using Gemma 3"""
    word_list = "\n".join([f"{i+1}. {word}" for i, word in enumerate(arabic_words)])

    prompt = f"""Arabic verse: {full_verse_ar}

Translate each numbered Arabic word below to English. Give the complete meaning including any prefixes (articles, prepositions, conjunctions).

{word_list}

Answer with only the English words, one per line:
1."""

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,  # Slightly higher for better reasoning
            "num_predict": 300   # More tokens for longer lists
        }
    }

    try:
        response = requests.post(OLLAMA_API, json=payload, timeout=120)
        response.raise_for_status()
        result = response.json()
        response_text = result.get("response", "").strip()

        translations = []
        for line in response_text.split('\n'):
            line = line.strip()
            line = re.sub(r'^\d+\.\s*', '', line)
            line = line.strip('"\'.,!?')
            if line:
                translations.append(line)

        result_map = {}
        for i, arabic_word in enumerate(arabic_words):
            if i < len(translations):
                result_map[arabic_word] = translations[i]
            else:
                result_map[arabic_word] = None

        return result_map

    except Exception as e:
        print(f"  ⚠️  Error: {e}")
        return {word: None for word in arabic_words}


def extract_words_from_arabic(arabic_text):
    """Extract words with positions"""
    words = []
    current_pos = 0
    tokens = re.split(r'(\s+)', arabic_text)

    for token in tokens:
        if token.strip():
            start = current_pos
            end = current_pos + len(token)
            words.append((token, start, end))
        current_pos += len(token)

    return words


# Read John chapter 1
source_file = "bible-translations/unified/JHN/1.json"
with open(source_file, 'r', encoding='utf-8') as f:
    verses = json.load(f)

print("=" * 70)
print(f"Testing Gemma 3 4B on John Chapter 1")
print("=" * 70)
print(f"Model: {MODEL}")
print(f"Total verses: {len(verses)}\n")

start_time = time.time()

# Process just first 3 verses for quick test
output = {
    "book": "JHN",
    "chapter": 1,
    "verses": {}
}

for verse_num in ["1", "2", "3"]:
    verse_data = verses[verse_num]
    arabic = verse_data['ar']
    english = verse_data['en']

    print(f"\n[Verse {verse_num}]")
    print(f"  AR: {arabic[:80]}...")
    print(f"  EN: {english[:80]}...")

    verse_start = time.time()

    # Extract and filter words
    arabic_words_with_pos = extract_words_from_arabic(arabic)
    filtered_words = [(w, s, e) for w, s, e in arabic_words_with_pos if len(w) >= 3]

    print(f"  📝 Translating {len(filtered_words)} words...")

    # Translate
    words_only = [w for w, s, e in filtered_words]
    translation_map = translate_verse_batch(words_only, arabic, english)

    # Build mappings
    mappings = []
    for word, start, end in filtered_words:
        translation = translation_map.get(word)
        if translation:
            mappings.append({
                "ar": word,
                "en": translation,
                "start": start,
                "end": end
            })
            print(f"    {word:20} → {translation}")

    output["verses"][verse_num] = {
        "ar": arabic,
        "en": english,
        "mappings": mappings
    }

    verse_time = time.time() - verse_start
    print(f"  ⏱️  Time: {verse_time:.1f}s")

total_time = time.time() - start_time

print("\n" + "=" * 70)
print(f"✅ Test complete!")
print(f"⏱️  Total time: {total_time:.1f}s for 3 verses")
print(f"⏱️  Average: {total_time/3:.1f}s per verse")
print("=" * 70)

# Save output
os.makedirs("bible-maps-word-gemma3/mappings/JHN", exist_ok=True)
with open("bible-maps-word-gemma3/mappings/JHN/1_test_4b.json", 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\nSaved test output to: bible-maps-word-gemma3/mappings/JHN/1_test_4b.json")

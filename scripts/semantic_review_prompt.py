#!/usr/bin/env python3
"""
Generate prompts for semantic review of Bible word mappings.
Use this output as input to Claude to verify translation accuracy.
"""

import json
import sys
from pathlib import Path

def generate_review_prompt(filepath, num_verses=5):
    """Generate a prompt for semantic review."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    book = data['book']
    chapter = data['chapter']
    verses = list(data['verses'].items())[:num_verses]

    prompt = f"""Review these Arabic-English word mappings for {book} chapter {chapter}.

For each mapping, check:
1. Does the Arabic word/phrase actually mean the English translation?
2. Are phrases grouped correctly? (Single words should make sense alone, otherwise group them)
3. Are there semantic errors? (Wrong word, mistranslation, etc.)

"""

    for verse_num, verse_data in verses:
        prompt += f"\n---\nVERSE {verse_num}\n"
        prompt += f"EN: {verse_data['en']}\n"
        prompt += f"AR: {verse_data['ar']}\n"
        prompt += "MAPPINGS:\n"

        for i, m in enumerate(verse_data['mappings'], 1):
            prompt += f"  {i}. {m['ar']} → {m['en']}\n"

    prompt += """
---
For each verse, report:
- CORRECT: All mappings are semantically accurate
- ISSUES: List specific problems (verse #, mapping #, issue description)

Focus on:
- Arabic words that don't mean what they're translated as
- Phrases that should be split or combined differently
- Articles/prepositions mapped incorrectly
"""

    return prompt

def main():
    if len(sys.argv) < 3:
        print("Usage: python semantic_review_prompt.py <BOOK> <CHAPTER> [NUM_VERSES]")
        print("Example: python semantic_review_prompt.py JHN 3 10")
        print("\nCopy the output and paste into Claude for review.")
        sys.exit(1)

    book = sys.argv[1]
    chapter = sys.argv[2]
    num_verses = int(sys.argv[3]) if len(sys.argv) > 3 else 5

    filepath = Path(f"bible-translations/mappings/{book}/{chapter}.json")

    if not filepath.exists():
        print(f"Error: {filepath} not found")
        sys.exit(1)

    prompt = generate_review_prompt(filepath, num_verses)
    print(prompt)

if __name__ == "__main__":
    main()

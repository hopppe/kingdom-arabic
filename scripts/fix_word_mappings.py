#!/usr/bin/env python3
"""
Fix corrupted word mappings by matching against clean verse text.
"""

import json
import re
from pathlib import Path

MAPPINGS_DIR = Path("./bible-translations/mappings")

def has_corruption(text):
    return '\ufffd' in text or '�' in text

def find_matching_word(corrupted_word, verse_text):
    """Find the word in verse_text that matches the corrupted word pattern."""
    # Remove the corruption character to get a pattern
    # e.g., "شَرِك��ةٍ" -> "شَرِك" + "ةٍ"

    # Split around the corruption
    parts = re.split(r'[\ufffd�]+', corrupted_word)
    parts = [p for p in parts if p]  # Remove empty strings

    if not parts:
        return None

    # Build a regex pattern to match the word
    # Look for a word that contains these parts in order
    if len(parts) == 1:
        # Single part - look for word containing this
        pattern = re.compile(r'\b\S*' + re.escape(parts[0]) + r'\S*\b')
    else:
        # Multiple parts - look for word with these parts
        pattern_str = r'\S*'.join(re.escape(p) for p in parts)
        pattern = re.compile(r'\b' + pattern_str + r'\b')

    matches = pattern.findall(verse_text)

    if matches:
        # Return the match that's closest in length to the corrupted word
        corrupted_len = len(corrupted_word)
        best_match = min(matches, key=lambda x: abs(len(x) - corrupted_len))
        return best_match

    # Try a more lenient approach - find words with most matching characters
    verse_words = verse_text.split()

    # Count how many characters from the corrupted word appear in each verse word
    best_word = None
    best_score = 0

    for word in verse_words:
        # Simple scoring: count consecutive matching characters
        score = 0
        for part in parts:
            if part in word:
                score += len(part)

        if score > best_score:
            best_score = score
            best_word = word

    return best_word if best_score > 0 else None

def fix_mapping_file(mapping_path):
    """Fix corrupted word mappings in a single file."""
    with open(mapping_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if not has_corruption(content):
        return 0

    data = json.loads(content)
    fixed_count = 0

    if 'verses' not in data:
        return 0

    for verse_num, verse_data in data['verses'].items():
        ar_verse = verse_data.get('ar', '')

        if 'mappings' not in verse_data:
            continue

        for mapping in verse_data['mappings']:
            ar_word = mapping.get('ar', '')

            if has_corruption(ar_word):
                # Try to find the correct word from the verse
                fixed_word = find_matching_word(ar_word, ar_verse)

                if fixed_word and not has_corruption(fixed_word):
                    mapping['ar'] = fixed_word
                    fixed_count += 1

    if fixed_count > 0:
        with open(mapping_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    return fixed_count

def main():
    print("Fixing corrupted word mappings...\n")

    # Find all files with corruption
    corrupted_files = []
    for book_dir in sorted(MAPPINGS_DIR.iterdir()):
        if not book_dir.is_dir():
            continue

        for mapping_file in sorted([f for f in book_dir.glob("*.json") if f.stem.isdigit()],
                                   key=lambda x: int(x.stem)):
            with open(mapping_file, 'r', encoding='utf-8') as f:
                content = f.read()
            if has_corruption(content):
                corrupted_files.append(mapping_file)

    print(f"Found {len(corrupted_files)} files with corruption.\n")

    total_fixed = 0
    still_corrupted = []

    for i, file_path in enumerate(corrupted_files, 1):
        book_code = file_path.parts[-2]
        chapter_num = file_path.stem

        print(f"[{i}/{len(corrupted_files)}] Fixing {book_code} {chapter_num}...", end=" ", flush=True)

        fixed = fix_mapping_file(file_path)

        # Check if still has corruption
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        if has_corruption(content):
            print(f"{fixed} words fixed (STILL HAS CORRUPTION)")
            still_corrupted.append(f"{book_code}/{chapter_num}")
        else:
            print(f"{fixed} words fixed - CLEAN!")

        total_fixed += fixed

    print(f"\n=== SUMMARY ===")
    print(f"Total word mappings fixed: {total_fixed}")
    print(f"Files still with corruption: {len(still_corrupted)}")

    if still_corrupted:
        print("\nStill corrupted:")
        for f in still_corrupted[:20]:
            print(f"  {f}")
        if len(still_corrupted) > 20:
            print(f"  ... and {len(still_corrupted) - 20} more")

if __name__ == "__main__":
    main()

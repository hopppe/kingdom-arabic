#!/usr/bin/env python3
"""
Fix corrupted curly quotes and apostrophes in English text.
Replace corrupted Unicode sequences with straight quotes/apostrophes.
"""

import json
from pathlib import Path

UNIFIED_DIR = Path("./bible-translations/unified")

def fix_corruption(text):
    """Replace corrupted quote characters with straight versions."""
    # Common patterns:
    # ��� -> ' (corrupted apostrophe/right single quote)
    # ��  -> " (corrupted opening double quote)
    # ���  -> " (corrupted closing double quote or em-dash)

    # Replace multiple replacement chars with appropriate punctuation
    replacements = [
        ('���', "'"),   # Likely apostrophe (God's, I'll, etc.)
        ('��', '"'),    # Likely opening quote
        ('�', "'"),     # Single replacement char - likely apostrophe
    ]

    result = text
    for old, new in replacements:
        result = result.replace(old, new)

    return result

def has_corruption(text):
    """Check for corruption."""
    return '\ufffd' in text or '�' in text

def main():
    print("Fixing corrupted English quotes/apostrophes...\n")

    # List of known corrupted files
    corrupted_files = [
        "2CO/1.json", "MAT/2.json", "MAT/8.json", "LEV/4.json",
        "DEU/2.json", "JHN/3.json", "NUM/9.json", "GEN/30.json",
        "REV/19.json", "GAL/5.json", "2SA/7.json", "2SA/10.json"
    ]

    total_fixed = 0

    for i, rel_path in enumerate(corrupted_files, 1):
        file_path = UNIFIED_DIR / rel_path
        book_code = rel_path.split('/')[0]
        chapter_num = rel_path.split('/')[1].replace('.json', '')

        print(f"[{i}/{len(corrupted_files)}] Fixing {book_code} {chapter_num}...", end=" ", flush=True)

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        fixed_count = 0
        for verse_num, verse_data in data.items():
            en_text = verse_data.get('en', '')
            if has_corruption(en_text):
                fixed_text = fix_corruption(en_text)
                verse_data['en'] = fixed_text
                fixed_count += 1
                print(f"\n  Verse {verse_num}: {en_text[:60]}...")
                print(f"  Fixed to: {fixed_text[:60]}...")

        if fixed_count > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"{fixed_count} verses fixed")
            total_fixed += fixed_count
        else:
            print("no corruption found")

    print(f"\n=== SUMMARY ===")
    print(f"Total verses fixed: {total_fixed}")

    # Verify
    print("\nVerifying no corruption remains...")
    remaining = 0
    for rel_path in corrupted_files:
        file_path = UNIFIED_DIR / rel_path
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        if has_corruption(content):
            remaining += 1
            print(f"  Still corrupted: {rel_path}")

    if remaining == 0:
        print("  All corruption fixed!")

if __name__ == "__main__":
    main()

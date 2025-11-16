#!/usr/bin/env python3
"""
Fix corrupted text in mapping files by pulling from cleaned unified files.
"""

import json
from pathlib import Path

UNIFIED_DIR = Path("./bible-translations/unified")
MAPPINGS_DIR = Path("./bible-translations/mappings")

def has_corruption(text):
    """Check for corruption."""
    return '\ufffd' in text or '�' in text

def fix_mapping_file(mapping_path):
    """Fix a single mapping file by pulling text from unified source."""
    parts = mapping_path.parts
    book_code = parts[-2]
    chapter_num = mapping_path.stem

    # Read mapping file
    with open(mapping_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if not has_corruption(content):
        return 0

    mapping_data = json.loads(content)

    # Read corresponding unified file
    unified_path = UNIFIED_DIR / book_code / f"{chapter_num}.json"
    if not unified_path.exists():
        return -1

    with open(unified_path, 'r', encoding='utf-8') as f:
        unified_data = json.load(f)

    # Fix verse text in mapping
    fixed_count = 0
    if 'verses' in mapping_data:
        for verse_num, verse_data in mapping_data['verses'].items():
            # Fix Arabic text
            if 'ar' in verse_data and has_corruption(verse_data['ar']):
                if verse_num in unified_data and 'ar' in unified_data[verse_num]:
                    verse_data['ar'] = unified_data[verse_num]['ar']
                    fixed_count += 1

            # Fix English text (the quotes issue)
            if 'en' in verse_data and has_corruption(verse_data['en']):
                if verse_num in unified_data and 'en' in unified_data[verse_num]:
                    verse_data['en'] = unified_data[verse_num]['en']
                    fixed_count += 1

            # Fix individual word mappings
            if 'mappings' in verse_data:
                for mapping in verse_data['mappings']:
                    if 'ar' in mapping and has_corruption(mapping['ar']):
                        # Can't easily fix individual word mappings - would need to regenerate
                        # For now, just count it
                        pass

    # Write back
    if fixed_count > 0:
        with open(mapping_path, 'w', encoding='utf-8') as f:
            json.dump(mapping_data, f, ensure_ascii=False, indent=2)

    return fixed_count

def main():
    print("Fixing corrupted mapping files...\n")

    # Find all corrupted mapping files
    corrupted = []
    for book_dir in sorted(MAPPINGS_DIR.iterdir()):
        if not book_dir.is_dir():
            continue

        for mapping_file in sorted([f for f in book_dir.glob("*.json") if f.stem.isdigit()], key=lambda x: int(x.stem)):
            with open(mapping_file, 'r', encoding='utf-8') as f:
                content = f.read()
            if has_corruption(content):
                corrupted.append(mapping_file)

    print(f"Found {len(corrupted)} mapping files with corruption.\n")

    if not corrupted:
        return

    total_fixed = 0
    failed = []

    for i, file_path in enumerate(corrupted, 1):
        book_code = file_path.parts[-2]
        chapter_num = file_path.stem

        print(f"[{i}/{len(corrupted)}] Fixing {book_code} {chapter_num}...", end=" ", flush=True)

        result = fix_mapping_file(file_path)
        if result > 0:
            print(f"{result} items fixed")
            total_fixed += result
        elif result == 0:
            print("no fixes needed")
        else:
            print("FAILED (no source)")
            failed.append(f"{book_code} {chapter_num}")

    print(f"\n=== SUMMARY ===")
    print(f"Total files processed: {len(corrupted)}")
    print(f"Total items fixed: {total_fixed}")
    if failed:
        print(f"Failed: {', '.join(failed)}")

    # Check remaining corruption
    print("\nVerifying...")
    remaining = 0
    for file_path in corrupted:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        if has_corruption(content):
            remaining += 1

    print(f"Files still with corruption: {remaining}")
    print("Note: Some corruption may be in word mappings which need full regeneration.")

if __name__ == "__main__":
    main()

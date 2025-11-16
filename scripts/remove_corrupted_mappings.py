#!/usr/bin/env python3
"""
Remove mapping files that still have corruption so they can be regenerated.
"""

import json
from pathlib import Path

MAPPINGS_DIR = Path("./bible-translations/mappings")

def has_corruption(text):
    """Check for corruption."""
    return '\ufffd' in text or '�' in text

def main():
    print("Finding mapping files with remaining corruption...\n")

    corrupted = []
    for book_dir in sorted(MAPPINGS_DIR.iterdir()):
        if not book_dir.is_dir():
            continue

        for mapping_file in sorted([f for f in book_dir.glob("*.json") if f.stem.isdigit()], key=lambda x: int(x.stem)):
            with open(mapping_file, 'r', encoding='utf-8') as f:
                content = f.read()
            if has_corruption(content):
                corrupted.append(mapping_file)

    print(f"Found {len(corrupted)} mapping files with corruption:\n")

    for file_path in corrupted:
        book_code = file_path.parts[-2]
        chapter_num = file_path.stem
        print(f"  {book_code}/{chapter_num}.json")

    if not corrupted:
        print("No corrupted mappings found!")
        return

    print(f"\nRemoving {len(corrupted)} corrupted mapping files...")

    for file_path in corrupted:
        file_path.unlink()
        print(f"  Removed {file_path.relative_to(MAPPINGS_DIR)}")

    print(f"\nDone! Removed {len(corrupted)} files.")
    print("These chapters need to be regenerated using the word mapping tool.")

if __name__ == "__main__":
    main()

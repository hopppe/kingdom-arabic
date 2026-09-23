#!/usr/bin/env python3
"""
Copy existing mappings to haiku folder and strip English translations
This prepares files for retranslation while keeping word positions
"""

import json
import os
import shutil
from pathlib import Path

def main():
    # Copy from current mappings (bible-translations/mappings)
    source_dir = "bible-translations/mappings"
    dest_dir = "bible-maps-word-haiku/mappings"

    print("="*70)
    print("PREPARING MAPPINGS FOR RETRANSLATION")
    print("Step 1: Copy entire mappings folder")
    print("Step 2: Strip all English translations")
    print("="*70)

    # Step 1: Copy entire folder
    if os.path.exists(dest_dir):
        print(f"Removing existing {dest_dir}...")
        shutil.rmtree(dest_dir)

    print(f"Copying {source_dir} -> {dest_dir}...")
    shutil.copytree(source_dir, dest_dir)
    print("✓ Copy complete\n")

    # Step 2: Strip English from all files
    print("Stripping English translations...")
    mapping_files = list(Path(dest_dir).rglob("*.json"))
    total = len(mapping_files)
    processed = 0

    for mapping_file in mapping_files:
        try:
            # Read file
            with open(mapping_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Strip English translations from all mappings
            for verse_num, verse_data in data['verses'].items():
                for mapping in verse_data['mappings']:
                    mapping['en'] = ""  # Clear the translation

            # Write back
            with open(mapping_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            processed += 1

            # Extract book and chapter for display
            parts = mapping_file.parts
            book = parts[-2]
            chapter = mapping_file.stem
            print(f"✓ {book} {chapter} ({processed}/{total})")

        except Exception as e:
            print(f"✗ {mapping_file}: {e}")

    print("\n" + "="*70)
    print(f"✅ COMPLETE! Prepared {processed}/{total} chapters")
    print(f"Files ready in: {dest_dir}")
    print("="*70)
    print("\nNext: Run translation to fill in the empty 'en' fields")

if __name__ == "__main__":
    main()

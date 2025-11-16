#!/usr/bin/env python3
"""
Replace just Psalms English text with NIV.
"""

import json
import urllib.request
from pathlib import Path

UNIFIED_DIR = Path("./bible-translations/unified/PSA")
URL = "https://raw.githubusercontent.com/jadenzaleski/bible-translations/master/NIV/NIV_books/Psalm.json"

def main():
    print("Fetching NIV Psalms...", end=" ", flush=True)

    with urllib.request.urlopen(URL, timeout=60) as response:
        niv_data = json.loads(response.read().decode('utf-8'))

    print("done")

    psalms_content = niv_data.get("Psalm")
    if not psalms_content:
        print("ERROR: No Psalm content found")
        return

    print(f"Replacing English text in {len(psalms_content)} chapters...\n")

    for chapter_num, verses in psalms_content.items():
        chapter_file = UNIFIED_DIR / f"{chapter_num}.json"
        if not chapter_file.exists():
            print(f"  WARNING: {chapter_num}.json not found")
            continue

        # Read current file
        with open(chapter_file, 'r', encoding='utf-8') as f:
            chapter_data = json.load(f)

        # Update English text
        for verse_num, verse_text in verses.items():
            if verse_num in chapter_data:
                chapter_data[verse_num]['en'] = verse_text

        # Write back
        with open(chapter_file, 'w', encoding='utf-8') as f:
            json.dump(chapter_data, f, ensure_ascii=False, indent=2)

    print(f"Successfully replaced English text in {len(psalms_content)} Psalm chapters with NIV!")

if __name__ == "__main__":
    main()

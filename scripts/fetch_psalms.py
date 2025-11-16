#!/usr/bin/env python3
"""
Fetch all 150 chapters of Psalms and create proper chapter files.
"""

import json
import urllib.request
import urllib.parse
from pathlib import Path

ARB_BASE = "https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/arb-kehm/books"
WEB_BASE = "https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/en-web/books"
UNIFIED_DIR = Path("./bible-translations/unified/PSA")

def fetch_json(url, timeout=30):
    """Fetch JSON from URL."""
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"  ERROR: {e}")
        return None

def main():
    print("Fetching all 150 Psalms chapters...\n")

    # Clean up the empty .json file
    empty_file = UNIFIED_DIR / ".json"
    if empty_file.exists():
        empty_file.unlink()
        print("Removed empty .json file\n")

    total_chapters = 150
    failed = []

    for chapter in range(1, total_chapters + 1):
        print(f"[{chapter}/{total_chapters}] Fetching Psalm {chapter}...", end=" ", flush=True)

        # Fetch Arabic (mzamyr for Psalms)
        arb_url = f"{ARB_BASE}/{urllib.parse.quote('مزمور')}/chapters/{chapter}.json"
        arb_data = fetch_json(arb_url)

        # Fetch English (WEB uses lowercase "psalms")
        web_url = f"{WEB_BASE}/psalms/chapters/{chapter}.json"
        niv_data = fetch_json(web_url)

        if not arb_data or not niv_data:
            print("FAILED")
            failed.append(chapter)
            continue

        # Build verse data
        chapter_data = {}

        # Get Arabic verses
        arb_verses = {}
        if 'data' in arb_data:
            for verse in arb_data['data']:
                v_num = str(verse.get('verse', ''))
                v_text = verse.get('text', '')
                if v_num and v_text:
                    arb_verses[v_num] = v_text

        # Get English verses
        niv_verses = {}
        if 'data' in niv_data:
            for verse in niv_data['data']:
                v_num = str(verse.get('verse', ''))
                v_text = verse.get('text', '')
                if v_num and v_text:
                    niv_verses[v_num] = v_text

        # Combine
        all_verses = set(arb_verses.keys()) | set(niv_verses.keys())
        for v_num in sorted(all_verses, key=lambda x: int(x)):
            chapter_data[v_num] = {
                "en": niv_verses.get(v_num, ""),
                "ar": arb_verses.get(v_num, "")
            }

        # Write chapter file
        chapter_file = UNIFIED_DIR / f"{chapter}.json"
        with open(chapter_file, 'w', encoding='utf-8') as f:
            json.dump(chapter_data, f, ensure_ascii=False, indent=2)

        print(f"{len(chapter_data)} verses")

    print(f"\n=== SUMMARY ===")
    print(f"Successfully fetched: {total_chapters - len(failed)} chapters")
    if failed:
        print(f"Failed chapters: {failed}")

if __name__ == "__main__":
    main()

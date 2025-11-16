#!/usr/bin/env python3
"""
Fix corrupted Unicode in English text (curly quotes, apostrophes).
"""

import json
import urllib.request
import urllib.parse
from pathlib import Path

BOOK_MAPPING = {
    "GEN": "Genesis", "EXO": "Exodus", "LEV": "Leviticus", "NUM": "Numbers",
    "DEU": "Deuteronomy", "JOS": "Joshua", "JDG": "Judges", "RUT": "Ruth",
    "1SA": "1 Samuel", "2SA": "2 Samuel", "1KI": "1 Kings", "2KI": "2 Kings",
    "1CH": "1 Chronicles", "2CH": "2 Chronicles", "EZR": "Ezra", "NEH": "Nehemiah",
    "EST": "Esther", "JOB": "Job", "PSA": "Psalm", "PRO": "Proverbs",
    "ECC": "Ecclesiastes", "SNG": "Song Of Solomon", "ISA": "Isaiah", "JER": "Jeremiah",
    "LAM": "Lamentations", "EZK": "Ezekiel", "DAN": "Daniel", "HOS": "Hosea",
    "JOL": "Joel", "AMO": "Amos", "OBA": "Obadiah", "JON": "Jonah",
    "MIC": "Micah", "NAM": "Nahum", "HAB": "Habakkuk", "ZEP": "Zephaniah",
    "HAG": "Haggai", "ZEC": "Zechariah", "MAL": "Malachi", "MAT": "Matthew",
    "MRK": "Mark", "LUK": "Luke", "JHN": "John", "ACT": "Acts",
    "ROM": "Romans", "1CO": "1 Corinthians", "2CO": "2 Corinthians", "GAL": "Galatians",
    "EPH": "Ephesians", "PHP": "Philippians", "COL": "Colossians",
    "1TH": "1 Thessalonians", "2TH": "2 Thessalonians", "1TI": "1 Timothy",
    "2TI": "2 Timothy", "TIT": "Titus", "PHM": "Philemon", "HEB": "Hebrews",
    "JAS": "James", "1PE": "1 Peter", "2PE": "2 Peter", "1JN": "1 John",
    "2JN": "2 John", "3JN": "3 John", "JUD": "Jude", "REV": "Revelation"
}

BASE_URL = "https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/en-niv/books"
UNIFIED_DIR = Path("./bible-translations/unified")

def has_corruption(text):
    """Check for corruption in text."""
    try:
        encoded = text.encode('utf-8')
        if b'\xef\xbf\xbd' in encoded:
            return True
        if '\ufffd' in text:
            return True
    except:
        pass
    return False

def fetch_chapter(book_code, chapter_num):
    """Fetch English chapter from NIV source."""
    english_book = BOOK_MAPPING.get(book_code)
    if not english_book:
        return None

    encoded_book = urllib.parse.quote(english_book)
    url = f"{BASE_URL}/{encoded_book}/chapters/{chapter_num}.json"

    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"  ERROR fetching {book_code} {chapter_num}: {e}")
        return None

def fix_chapter(file_path):
    """Fix corrupted English text in a chapter."""
    parts = file_path.parts
    book_code = parts[-2]
    chapter_num = file_path.stem

    # Read local file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check for English corruption
    if not has_corruption(content):
        return 0

    local_data = json.loads(content)

    # Find which verses have English corruption
    corrupted_verses = []
    for verse_num, verse_data in local_data.items():
        en_text = verse_data.get('en', '')
        if has_corruption(en_text):
            corrupted_verses.append(verse_num)

    if not corrupted_verses:
        return 0

    # Fetch fresh English data
    source_data = fetch_chapter(book_code, chapter_num)
    if not source_data or 'data' not in source_data:
        return -1

    # Build source verse map
    source_verses = {}
    for verse_obj in source_data['data']:
        verse_num = str(verse_obj.get('verse', ''))
        verse_text = verse_obj.get('text', '')
        if verse_num and verse_text:
            source_verses[verse_num] = verse_text

    # Replace corrupted English text
    fixed_count = 0
    for verse_num in corrupted_verses:
        if verse_num in source_verses and verse_num in local_data:
            local_data[verse_num]['en'] = source_verses[verse_num]
            fixed_count += 1

    # Write back
    if fixed_count > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(local_data, f, ensure_ascii=False, indent=2)

    return fixed_count

def main():
    print("Fixing corrupted English text...\n")

    # List of known corrupted files from grep output
    corrupted_files = [
        "2CO/1.json", "MAT/2.json", "MAT/8.json", "LEV/4.json",
        "DEU/2.json", "JHN/3.json", "NUM/9.json", "GEN/30.json",
        "REV/19.json", "GAL/5.json", "2SA/7.json", "2SA/10.json"
    ]

    total_fixed = 0
    failed = []

    for i, rel_path in enumerate(corrupted_files, 1):
        file_path = UNIFIED_DIR / rel_path
        book_code = rel_path.split('/')[0]
        chapter_num = rel_path.split('/')[1].replace('.json', '')

        print(f"[{i}/{len(corrupted_files)}] Fixing {book_code} {chapter_num}...", end=" ", flush=True)

        result = fix_chapter(file_path)
        if result > 0:
            print(f"{result} verses fixed")
            total_fixed += result
        elif result == 0:
            print("no fixes needed")
        else:
            print("FAILED")
            failed.append(f"{book_code} {chapter_num}")

    print(f"\n=== SUMMARY ===")
    print(f"Total files processed: {len(corrupted_files)}")
    print(f"Total verses fixed: {total_fixed}")
    if failed:
        print(f"Failed: {', '.join(failed)}")

if __name__ == "__main__":
    main()

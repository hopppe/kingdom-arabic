#!/usr/bin/env python3
"""
Replace English text with NIV from jadenzaleski/bible-translations repo.
"""

import json
import urllib.request
from pathlib import Path

UNIFIED_DIR = Path("./bible-translations/unified")
BASE_URL = "https://raw.githubusercontent.com/jadenzaleski/bible-translations/master/NIV/NIV_books"

# Map our book codes to NIV file names
BOOK_MAPPING = {
    "GEN": "Genesis", "EXO": "Exodus", "LEV": "Leviticus", "NUM": "Numbers",
    "DEU": "Deuteronomy", "JOS": "Joshua", "JDG": "Judges", "RUT": "Ruth",
    "1SA": "1 Samuel", "2SA": "2 Samuel", "1KI": "1 Kings", "2KI": "2 Kings",
    "1CH": "1 Chronicles", "2CH": "2 Chronicles", "EZR": "Ezra", "NEH": "Nehemiah",
    "EST": "Esther", "JOB": "Job", "PSA": "Psalm", "PRO": "Proverbs",
    "ECC": "Ecclesiastes", "SNG": "Song of Solomon", "ISA": "Isaiah", "JER": "Jeremiah",
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

def fetch_niv_book(book_name):
    """Fetch NIV book from GitHub."""
    url = f"{BASE_URL}/{urllib.request.quote(book_name)}.json"
    try:
        with urllib.request.urlopen(url, timeout=60) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"  ERROR fetching {book_name}: {e}")
        return None

def process_book(book_code):
    """Replace English text for an entire book."""
    niv_name = BOOK_MAPPING.get(book_code)
    if not niv_name:
        return 0

    print(f"Processing {book_code} ({niv_name})...", end=" ", flush=True)

    # Fetch NIV data
    niv_data = fetch_niv_book(niv_name)
    if not niv_data:
        print("FAILED to fetch")
        return -1

    # NIV data structure: {"Info": {...}, "BookName": {"chapter": {"verse": "text"}}}
    book_content = niv_data.get(niv_name)
    if not book_content:
        print("FAILED - no book content")
        return -1

    # Process each chapter
    book_dir = UNIFIED_DIR / book_code
    chapters_updated = 0

    for chapter_num, verses in book_content.items():
        chapter_file = book_dir / f"{chapter_num}.json"
        if not chapter_file.exists():
            continue

        # Read current file
        with open(chapter_file, 'r', encoding='utf-8') as f:
            chapter_data = json.load(f)

        # Update English text
        updated = False
        for verse_num, verse_text in verses.items():
            if verse_num in chapter_data:
                chapter_data[verse_num]['en'] = verse_text
                updated = True

        # Write back
        if updated:
            with open(chapter_file, 'w', encoding='utf-8') as f:
                json.dump(chapter_data, f, ensure_ascii=False, indent=2)
            chapters_updated += 1

    print(f"{chapters_updated} chapters updated")
    return chapters_updated

def main():
    print("Replacing English text with NIV translation...\n")

    total_chapters = 0
    failed_books = []

    for book_code in BOOK_MAPPING.keys():
        result = process_book(book_code)
        if result > 0:
            total_chapters += result
        elif result < 0:
            failed_books.append(book_code)

    print(f"\n=== SUMMARY ===")
    print(f"Total chapters updated: {total_chapters}")
    if failed_books:
        print(f"Failed books: {', '.join(failed_books)}")

if __name__ == "__main__":
    main()

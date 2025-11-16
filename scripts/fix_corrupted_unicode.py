#!/usr/bin/env python3
"""
Fix corrupted Unicode characters in Bible translation files.
Downloads correct Arabic text from source repository and replaces corrupted text.
"""

import json
import os
import urllib.request
import urllib.parse
import sys
from pathlib import Path

# Mapping of English book codes to Arabic folder names in the source repository
BOOK_MAPPING = {
    "GEN": "التكوين",
    "EXO": "الخروج",
    "LEV": "اللاويين",
    "NUM": "العدد",
    "DEU": "التثنية",
    "JOS": "يشوع",
    "JDG": "القضاة",
    "RUT": "راعوث",
    "1SA": "صموئيلالأول",
    "2SA": "صموئيلالثاني",
    "1KI": "ملوكالأول",
    "2KI": "ملوكالثاني",
    "1CH": "أخبارالأيامالأول",
    "2CH": "أخبارالأيامالثاني",
    "EZR": "عزرا",
    "NEH": "نحميا",
    "EST": "أستير",
    "JOB": "أيوب",
    "PSA": "مزمور",
    "PRO": "الأمثال",
    "ECC": "الجامعة",
    "SNG": "نشيدالأنشاد",
    "ISA": "إشعياء",
    "JER": "إرميا",
    "LAM": "مراثيإرميا",
    "EZK": "حزقيال",
    "DAN": "دانيال",
    "HOS": "هوشع",
    "JOL": "يوئيل",
    "AMO": "عاموس",
    "OBA": "عوبديا",
    "JON": "يونان",
    "MIC": "ميخا",
    "NAM": "ناحوم",
    "HAB": "حبقوق",
    "ZEP": "صفنيا",
    "HAG": "حجي",
    "ZEC": "زكريا",
    "MAL": "ملاخي",
    "MAT": "إنجيلمتى",
    "MRK": "إنجيلمرقس",
    "LUK": "إنجيللوقا",
    "JHN": "إنجيليوحنا",
    "ACT": "أعمال",
    "ROM": "روما",
    "1CO": "كورنثوسالأولى",
    "2CO": "كورنثوسالثانية",
    "GAL": "غلاطية",
    "EPH": "أفسس",
    "PHP": "فيلبي",
    "COL": "كولوسي",
    "1TH": "تسالونيكيالأولى",
    "2TH": "تسالونيكيالثانية",
    "1TI": "تيموثاوسالأولى",
    "2TI": "تيموثاوسالثانية",
    "TIT": "تيطس",
    "PHM": "فليمون",
    "HEB": "العبرانيين",
    "JAS": "يعقوب",
    "1PE": "بطرسالأولى",
    "2PE": "بطرسالثانية",
    "1JN": "يوحناالأولى",
    "2JN": "يوحناالثانية",
    "3JN": "يوحناالثالثة",
    "JUD": "يهوذا",
    "REV": "رؤيايوحنا"
}

BASE_URL = "https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/arb-kehm/books"

def fetch_chapter(book_code, chapter_num):
    """Fetch a chapter from the source repository."""
    arabic_book = BOOK_MAPPING.get(book_code)
    if not arabic_book:
        print(f"  ERROR: Unknown book code: {book_code}")
        return None

    # URL encode the Arabic book name
    encoded_book = urllib.parse.quote(arabic_book)
    url = f"{BASE_URL}/{encoded_book}/chapters/{chapter_num}.json"

    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data
    except urllib.error.HTTPError as e:
        print(f"  ERROR: HTTP {e.code} fetching {book_code} chapter {chapter_num}")
        return None
    except Exception as e:
        print(f"  ERROR: {e} fetching {book_code} chapter {chapter_num}")
        return None

def has_corruption(text):
    """Check if text contains Unicode replacement character."""
    return '\ufffd' in text or '�' in text

def fix_chapter_file(file_path):
    """Fix corrupted Unicode in a single chapter file."""
    # Extract book code and chapter number from path
    parts = Path(file_path).parts
    book_code = parts[-2]  # e.g., "MAT"
    chapter_num = Path(file_path).stem  # e.g., "5"

    # Read current file
    with open(file_path, 'r', encoding='utf-8') as f:
        local_data = json.load(f)

    # Check if any verse has corruption
    corrupted_verses = []
    for verse_num, verse_data in local_data.items():
        if 'ar' in verse_data and has_corruption(verse_data['ar']):
            corrupted_verses.append(verse_num)

    if not corrupted_verses:
        return 0, []

    # Fetch correct data from source
    source_data = fetch_chapter(book_code, chapter_num)
    if not source_data:
        return 0, corrupted_verses

    # Extract verses from source (format: {"data": [{"verse": "1", "text": "..."}]})
    source_verses = {}
    if 'data' in source_data:
        for verse_obj in source_data['data']:
            verse_num = str(verse_obj.get('verse', ''))
            verse_text = verse_obj.get('text', '')
            if verse_num and verse_text:
                source_verses[verse_num] = verse_text

    # Fix corrupted verses
    fixed_count = 0
    for verse_num in corrupted_verses:
        if verse_num in source_verses:
            local_data[verse_num]['ar'] = source_verses[verse_num]
            fixed_count += 1
        else:
            print(f"  WARNING: Verse {verse_num} not found in source for {book_code} chapter {chapter_num}")

    # Write fixed data back
    if fixed_count > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(local_data, f, ensure_ascii=False, indent=2)

    return fixed_count, corrupted_verses

def main():
    base_dir = Path("/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-translations/unified")

    # Get all book directories
    book_dirs = sorted([d for d in base_dir.iterdir() if d.is_dir()])

    total_files_fixed = 0
    total_verses_fixed = 0
    failed_files = []

    for book_dir in book_dirs:
        book_code = book_dir.name
        if book_code not in BOOK_MAPPING:
            print(f"Skipping unknown book: {book_code}")
            continue

        # Get all chapter files
        chapter_files = sorted(book_dir.glob("*.json"), key=lambda x: int(x.stem))

        book_fixes = 0
        for chapter_file in chapter_files:
            fixed, corrupted = fix_chapter_file(str(chapter_file))
            if corrupted:
                chapter_num = chapter_file.stem
                if fixed > 0:
                    print(f"Fixed {book_code} {chapter_num}: {fixed}/{len(corrupted)} verses")
                    book_fixes += fixed
                    total_verses_fixed += fixed
                else:
                    print(f"FAILED {book_code} {chapter_num}: {len(corrupted)} corrupted verses")
                    failed_files.append(f"{book_code}/{chapter_num}")

        if book_fixes > 0:
            total_files_fixed += 1
            print(f"  {book_code}: Fixed {book_fixes} verses total")

    print(f"\n=== SUMMARY ===")
    print(f"Total books processed: {len(book_dirs)}")
    print(f"Total verses fixed: {total_verses_fixed}")
    if failed_files:
        print(f"Failed files ({len(failed_files)}): {', '.join(failed_files[:10])}...")

if __name__ == "__main__":
    main()

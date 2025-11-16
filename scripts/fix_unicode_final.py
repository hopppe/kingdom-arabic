#!/usr/bin/env python3
"""
Fix corrupted Unicode by replacing ALL Arabic text in corrupted chapters.
Uses Python for better Unicode handling.
"""

import json
import os
import urllib.request
import urllib.parse
from pathlib import Path

BOOK_MAPPING = {
    "GEN": "التكوين", "EXO": "الخروج", "LEV": "اللاويين", "NUM": "العدد",
    "DEU": "التثنية", "JOS": "يشوع", "JDG": "القضاة", "RUT": "راعوث",
    "1SA": "صموئيلالأول", "2SA": "صموئيلالثاني", "1KI": "ملوكالأول",
    "2KI": "ملوكالثاني", "1CH": "أخبارالأيامالأول", "2CH": "أخبارالأيامالثاني",
    "EZR": "عزرا", "NEH": "نحميا", "EST": "أستير", "JOB": "أيوب",
    "PSA": "مزمور", "PRO": "الأمثال", "ECC": "الجامعة", "SNG": "نشيدالأنشاد",
    "ISA": "إشعياء", "JER": "إرميا", "LAM": "مراثيإرميا", "EZK": "حزقيال",
    "DAN": "دانيال", "HOS": "هوشع", "JOL": "يوئيل", "AMO": "عاموس",
    "OBA": "عوبديا", "JON": "يونان", "MIC": "ميخا", "NAM": "ناحوم",
    "HAB": "حبقوق", "ZEP": "صفنيا", "HAG": "حجي", "ZEC": "زكريا",
    "MAL": "ملاخي", "MAT": "إنجيلمتى", "MRK": "إنجيلمرقس", "LUK": "إنجيللوقا",
    "JHN": "إنجيليوحنا", "ACT": "أعمال", "ROM": "روما", "1CO": "كورنثوسالأولى",
    "2CO": "كورنثوسالثانية", "GAL": "غلاطية", "EPH": "أفسس", "PHP": "فيلبي",
    "COL": "كولوسي", "1TH": "تسالونيكيالأولى", "2TH": "تسالونيكيالثانية",
    "1TI": "تيموثاوسالأولى", "2TI": "تيموثاوسالثانية", "TIT": "تيطس",
    "PHM": "فليمون", "HEB": "العبرانيين", "JAS": "يعقوب", "1PE": "بطرسالأولى",
    "2PE": "بطرسالثانية", "1JN": "يوحناالأولى", "2JN": "يوحناالثانية",
    "3JN": "يوحناالثالثة", "JUD": "يهوذا", "REV": "رؤيايوحنا"
}

BASE_URL = "https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/arb-kehm/books"
UNIFIED_DIR = Path("./bible-translations/unified")

def has_corruption(text):
    """Check for the actual byte pattern of corruption."""
    # Check for the actual bytes that represent corruption
    try:
        # Encode to bytes and look for the replacement character pattern
        encoded = text.encode('utf-8')
        # The corruption shows as EF BF BD (UTF-8 for U+FFFD)
        if b'\xef\xbf\xbd' in encoded:
            return True
        # Also check if '�' character is literally in the string
        if '\ufffd' in text:
            return True
        # Check for incomplete UTF-8 sequences (often show as EF BF followed by something else)
        if b'\xef\xbf' in encoded:
            # Check if it's NOT part of a valid character
            idx = 0
            while idx < len(encoded):
                if encoded[idx:idx+2] == b'\xef\xbf':
                    # This could be part of corruption
                    if idx + 2 < len(encoded):
                        third_byte = encoded[idx + 2]
                        # Valid EF BF XX sequences are limited (e.g., U+FFFx)
                        # But most corruption shows as EF BF BD or truncated
                        if third_byte == 0xbd:  # This is the replacement char
                            return True
                idx += 1
    except:
        pass
    return False

def fetch_chapter(book_code, chapter_num):
    """Fetch chapter from source."""
    arabic_book = BOOK_MAPPING.get(book_code)
    if not arabic_book:
        return None

    encoded_book = urllib.parse.quote(arabic_book)
    url = f"{BASE_URL}/{encoded_book}/chapters/{chapter_num}.json"

    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"  ERROR fetching {book_code} {chapter_num}: {e}")
        return None

def fix_chapter(file_path):
    """Fix all Arabic text in a corrupted chapter."""
    parts = file_path.parts
    book_code = parts[-2]
    chapter_num = file_path.stem

    # Read local file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Quick check for corruption in raw content
    if not has_corruption(content):
        return 0

    local_data = json.loads(content)

    # Fetch fresh data
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

    # Replace ALL Arabic text (not just corrupted ones)
    fixed_count = 0
    for verse_num, verse_data in local_data.items():
        if verse_num in source_verses:
            old_ar = verse_data.get('ar', '')
            if has_corruption(old_ar):
                verse_data['ar'] = source_verses[verse_num]
                fixed_count += 1

    # Write back with proper encoding
    if fixed_count > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(local_data, f, ensure_ascii=False, indent=2)

    return fixed_count

def main():
    print("Scanning for corrupted Unicode (Python version)...\n")

    # Find all corrupted chapters
    corrupted = []
    for book_dir in sorted(UNIFIED_DIR.iterdir()):
        if not book_dir.is_dir():
            continue
        book_code = book_dir.name
        if book_code not in BOOK_MAPPING:
            continue

        for chapter_file in sorted([f for f in book_dir.glob("*.json") if f.stem.isdigit()], key=lambda x: int(x.stem)):
            with open(chapter_file, 'r', encoding='utf-8') as f:
                content = f.read()
            if has_corruption(content):
                corrupted.append(chapter_file)

    print(f"Found {len(corrupted)} chapters with corrupted text.\n")

    if not corrupted:
        print("No corruption found!")
        return

    total_fixed = 0
    failed = []

    for i, file_path in enumerate(corrupted, 1):
        book_code = file_path.parts[-2]
        chapter_num = file_path.stem

        print(f"[{i}/{len(corrupted)}] Fixing {book_code} {chapter_num}...", end=" ", flush=True)

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
    print(f"Total chapters processed: {len(corrupted)}")
    print(f"Total verses fixed: {total_fixed}")
    if failed:
        print(f"Failed: {', '.join(failed)}")

if __name__ == "__main__":
    main()

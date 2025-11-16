#!/usr/bin/env python3
"""Check for books with missing chapters."""

from pathlib import Path

UNIFIED_DIR = Path("./bible-translations/unified")

# Expected chapter counts for each book
BOOK_CHAPTERS = {
    "GEN": 50, "EXO": 40, "LEV": 27, "NUM": 36, "DEU": 34,
    "JOS": 24, "JDG": 21, "RUT": 4, "1SA": 31, "2SA": 24,
    "1KI": 22, "2KI": 25, "1CH": 29, "2CH": 36, "EZR": 10,
    "NEH": 13, "EST": 10, "JOB": 42, "PSA": 150, "PRO": 31,
    "ECC": 12, "SNG": 8, "ISA": 66, "JER": 52, "LAM": 5,
    "EZK": 48, "DAN": 12, "HOS": 14, "JOL": 3, "AMO": 9,
    "OBA": 1, "JON": 4, "MIC": 7, "NAM": 3, "HAB": 3,
    "ZEP": 3, "HAG": 2, "ZEC": 14, "MAL": 4, "MAT": 28,
    "MRK": 16, "LUK": 24, "JHN": 21, "ACT": 28, "ROM": 16,
    "1CO": 16, "2CO": 13, "GAL": 6, "EPH": 6, "PHP": 4,
    "COL": 4, "1TH": 5, "2TH": 3, "1TI": 6, "2TI": 4,
    "TIT": 3, "PHM": 1, "HEB": 13, "JAS": 5, "1PE": 5,
    "2PE": 3, "1JN": 5, "2JN": 1, "3JN": 1, "JUD": 1,
    "REV": 22
}

def main():
    print("Checking for missing/incomplete books...\n")

    missing = []
    incomplete = []

    for book_code, expected_chapters in BOOK_CHAPTERS.items():
        book_dir = UNIFIED_DIR / book_code

        if not book_dir.exists():
            missing.append((book_code, expected_chapters))
            continue

        # Count actual chapter files
        chapter_files = [f for f in book_dir.glob("*.json") if f.stem.isdigit()]
        actual_chapters = len(chapter_files)

        if actual_chapters == 0:
            missing.append((book_code, expected_chapters))
        elif actual_chapters < expected_chapters:
            incomplete.append((book_code, actual_chapters, expected_chapters))

    if missing:
        print(f"Missing books ({len(missing)}):")
        for book, expected in missing:
            print(f"  {book}: 0/{expected} chapters")
    else:
        print("No missing books!")

    if incomplete:
        print(f"\nIncomplete books ({len(incomplete)}):")
        for book, actual, expected in incomplete:
            print(f"  {book}: {actual}/{expected} chapters")
    else:
        print("No incomplete books!")

    print(f"\nTotal expected chapters: {sum(BOOK_CHAPTERS.values())}")

if __name__ == "__main__":
    main()

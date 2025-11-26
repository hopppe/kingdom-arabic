#!/usr/bin/env python3
"""
Complete New Testament Repair Pipeline
Runs all necessary repairs to fully complete the New Testament mappings:
1. Fast shift repair (single-word missing)
2. Full robust repair (multi-word missing)
3. Final validation scan
"""

import subprocess
import sys
import json
from pathlib import Path

def print_header(title):
    """Print a formatted header"""
    print("\n" + "="*70)
    print(f"{title}")
    print("="*70 + "\n")


def run_command(description, command):
    """Run a command and return success status"""
    print(f"🔄 {description}...")
    print(f"   Command: {command}\n")

    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            capture_output=False,
            text=True
        )
        print(f"✅ {description} completed successfully\n")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed with error code {e.returncode}\n")
        return False


def count_misaligned_verses(mapping_dir="bible-maps-word-gemma3/mappings"):
    """Count verses with misalignment in NT books only"""
    import re

    # NT books only
    nt_books = [
        'MAT', 'MRK', 'LUK', 'JHN', 'ACT',
        'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL',
        '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM',
        'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
    ]

    misaligned = []
    single_shifts = []
    multi_shifts = []

    for book_dir in sorted(Path(mapping_dir).iterdir()):
        if not book_dir.is_dir():
            continue

        # Only process NT books
        if book_dir.name not in nt_books:
            continue

        for chapter_file in sorted(book_dir.glob("*.json")):
            try:
                with open(chapter_file, 'r') as f:
                    data = json.load(f)

                book = data.get("book", book_dir.name)
                chapter = data.get("chapter", chapter_file.stem)

                for verse_num, verse_data in data.get("verses", {}).items():
                    ar_text = verse_data.get("ar", "")
                    mappings = verse_data.get("mappings", [])

                    # Count expected words
                    tokens = re.split(r'\s+', ar_text)
                    expected = len([t for t in tokens if len(t.strip()) >= 3])
                    actual = len(mappings)
                    diff = expected - actual

                    if diff > 0:
                        misaligned.append((book, chapter, verse_num, expected, actual, diff))
                        if diff == 1:
                            single_shifts.append((book, chapter, verse_num))
                        else:
                            multi_shifts.append((book, chapter, verse_num))
            except Exception as e:
                print(f"⚠️  Error reading {chapter_file}: {e}")

    return misaligned, single_shifts, multi_shifts


def main():
    print_header("NEW TESTAMENT COMPLETION PIPELINE")

    print("This script will:")
    print("  1. Run fast shift repair (single-word missing)")
    print("  2. Run full robust repair (multi-word missing)")
    print("  3. Validate final results")
    print("  4. Generate completion report")

    response = input("\nProceed? (y/n): ")
    if response.lower() != 'y':
        print("Cancelled.")
        return

    # Step 1: Initial scan
    print_header("STEP 1: INITIAL SCAN")
    print("Scanning New Testament for misaligned verses...")

    misaligned, single_shifts, multi_shifts = count_misaligned_verses()

    print(f"\nFound misaligned verses:")
    print(f"  Single-word shifts: {len(single_shifts)} verses")
    print(f"  Multi-word issues:  {len(multi_shifts)} verses")
    print(f"  Total:              {len(misaligned)} verses")

    if len(misaligned) == 0:
        print("\n✅ New Testament is already complete! No repairs needed.")
        return

    # Step 2: Fast shift repair
    if len(single_shifts) > 0:
        print_header("STEP 2: FAST SHIFT REPAIR")
        print(f"Repairing {len(single_shifts)} single-word shifts...")
        print("Estimated time: ~3 hours")
        print("\n⚠️  This will run for a while. You can stop with Ctrl+C and resume later.\n")

        success = run_command(
            "Fast shift repair",
            "python3 repair_shifted_verses.py"
        )

        if not success:
            print("⚠️  Fast shift repair had issues, but continuing...")
    else:
        print_header("STEP 2: FAST SHIFT REPAIR")
        print("✅ No single-word shifts found, skipping fast repair")

    # Step 3: Re-scan after fast repair
    print_header("STEP 3: MID-POINT SCAN")
    print("Re-scanning after fast repair...")

    misaligned, single_shifts, multi_shifts = count_misaligned_verses()

    print(f"\nRemaining misaligned verses:")
    print(f"  Single-word shifts: {len(single_shifts)} verses")
    print(f"  Multi-word issues:  {len(multi_shifts)} verses")
    print(f"  Total:              {len(misaligned)} verses")

    # Step 4: Full robust repair
    if len(misaligned) > 0:
        print_header("STEP 4: FULL ROBUST REPAIR")
        print(f"Repairing {len(misaligned)} remaining verses...")

        # Estimate time (50 seconds per verse)
        estimated_hours = (len(misaligned) * 50) / 3600
        print(f"Estimated time: ~{estimated_hours:.1f} hours")
        print("\n⚠️  This will run for a while. You can stop with Ctrl+C and resume later.\n")

        success = run_command(
            "Full robust repair",
            "python3 repair_misaligned_verses.py"
        )

        if not success:
            print("⚠️  Full repair had issues, but continuing to validation...")
    else:
        print_header("STEP 4: FULL ROBUST REPAIR")
        print("✅ No remaining misaligned verses, skipping full repair")

    # Step 5: Final validation
    print_header("STEP 5: FINAL VALIDATION")
    print("Performing final scan of New Testament...")

    misaligned, single_shifts, multi_shifts = count_misaligned_verses()

    print("\nFinal Results:")
    print(f"  Single-word shifts: {len(single_shifts)} verses")
    print(f"  Multi-word issues:  {len(multi_shifts)} verses")
    print(f"  Total:              {len(misaligned)} verses")

    # Generate detailed report if issues remain
    if len(misaligned) > 0:
        print("\n⚠️  Some verses still have issues:")
        print("\nBreakdown by missing count:")
        by_diff = {}
        for _, _, _, _, _, diff in misaligned:
            by_diff[diff] = by_diff.get(diff, 0) + 1

        for diff in sorted(by_diff.keys()):
            print(f"  {diff} missing: {by_diff[diff]} verses")

        print("\nFirst 20 problematic verses:")
        for i, (book, chapter, verse_num, expected, actual, diff) in enumerate(misaligned[:20], 1):
            print(f"  {i}. {book} {chapter}:{verse_num} ({actual}/{expected} mappings, {diff} missing)")
    else:
        print("\n" + "="*70)
        print("🎉 NEW TESTAMENT COMPLETE!")
        print("All verses have complete word mappings!")
        print("="*70)

    # Summary statistics
    print_header("SUMMARY STATISTICS")

    # Count NT books and chapters
    nt_books = [
        'MAT', 'MRK', 'LUK', 'JHN', 'ACT',
        'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL',
        '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM',
        'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
    ]

    total_chapters = 0
    total_verses = 0

    for book in nt_books:
        book_dir = Path(f"bible-maps-word-gemma3/mappings/{book}")
        if book_dir.exists():
            chapter_files = list(book_dir.glob("*.json"))
            total_chapters += len(chapter_files)

            for chapter_file in chapter_files:
                try:
                    with open(chapter_file, 'r') as f:
                        data = json.load(f)
                    total_verses += len(data.get("verses", {}))
                except:
                    pass

    print(f"New Testament Coverage:")
    print(f"  Books:    {len(nt_books)}/27")
    print(f"  Chapters: {total_chapters}")
    print(f"  Verses:   {total_verses}")

    completion_rate = 100 * (1 - len(misaligned) / total_verses) if total_verses > 0 else 0
    print(f"  Completion: {completion_rate:.2f}%")

    if len(misaligned) == 0:
        print("\n✅ Ready to use in the app!")
    else:
        print(f"\n⚠️  {len(misaligned)} verses still need manual review or additional repair")


if __name__ == "__main__":
    main()

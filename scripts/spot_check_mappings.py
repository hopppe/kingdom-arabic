#!/usr/bin/env python3
"""
Visual spot-check tool for Bible word mappings.
Shows side-by-side Arabic and English with mapping annotations.
"""

import json
import sys
import random
from pathlib import Path

def display_verse_mappings(verse_num, verse_data):
    """Display a verse with its mappings in a readable format."""
    print(f"\n{'='*60}")
    print(f"VERSE {verse_num}")
    print(f"{'='*60}")

    print(f"\nENGLISH:")
    print(f"  {verse_data['en']}")

    print(f"\nARABIC:")
    print(f"  {verse_data['ar']}")

    print(f"\nMAPPINGS ({len(verse_data['mappings'])} items):")
    print(f"{'─'*60}")

    for i, m in enumerate(verse_data['mappings'], 1):
        # Visual check: extract actual text from positions
        actual = verse_data['ar'][m['start']:m['end']]
        match_status = "✓" if actual == m['ar'] else "✗"

        print(f"{i:2}. {match_status} [{m['start']:3}-{m['end']:3}]  {m['ar']}")
        print(f"                      → {m['en']}")

        if actual != m['ar']:
            print(f"    ⚠️  POSITION ERROR: Actual text is '{actual}'")

    # Show coverage
    print(f"\n{'─'*60}")
    print("COVERAGE CHECK:")
    ar_text = verse_data['ar']
    covered = [False] * len(ar_text)

    for m in verse_data['mappings']:
        for i in range(m['start'], min(m['end'], len(ar_text))):
            covered[i] = True

    # Find gaps
    in_gap = False
    gap_start = 0
    gaps = []

    for i, is_covered in enumerate(covered):
        if not is_covered and not in_gap:
            gap_start = i
            in_gap = True
        elif is_covered and in_gap:
            gap_text = ar_text[gap_start:i]
            if gap_text.strip() and not all(c in ' ،.؟!:«»؛' for c in gap_text.strip()):
                gaps.append((gap_start, i, gap_text))
            in_gap = False

    if in_gap:
        gap_text = ar_text[gap_start:]
        if gap_text.strip() and not all(c in ' ،.؟!:«»؛' for c in gap_text.strip()):
            gaps.append((gap_start, len(ar_text), gap_text))

    if gaps:
        print("⚠️  UNMAPPED GAPS:")
        for start, end, text in gaps:
            print(f"    [{start}-{end}]: '{text}'")
    else:
        print("✓ All words mapped (spaces/punctuation excluded)")

def spot_check_chapter(filepath, num_samples=3):
    """Randomly sample verses from a chapter for spot checking."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    verses = list(data.get("verses", {}).items())
    print(f"\n{'#'*60}")
    print(f"# SPOT CHECK: {data['book']} Chapter {data['chapter']}")
    print(f"# Total verses: {len(verses)}")
    print(f"# Sampling {min(num_samples, len(verses))} random verses")
    print(f"{'#'*60}")

    # Random sample
    sample = random.sample(verses, min(num_samples, len(verses)))

    for verse_num, verse_data in sorted(sample, key=lambda x: int(x[0])):
        display_verse_mappings(verse_num, verse_data)

def spot_check_specific_verse(filepath, verse_num):
    """Check a specific verse."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    verse_data = data.get("verses", {}).get(str(verse_num))
    if not verse_data:
        print(f"Verse {verse_num} not found")
        return

    print(f"\n{'#'*60}")
    print(f"# SPOT CHECK: {data['book']} Chapter {data['chapter']}:{verse_num}")
    print(f"{'#'*60}")

    display_verse_mappings(verse_num, verse_data)

def main():
    if len(sys.argv) < 3:
        print("Usage:")
        print("  python spot_check_mappings.py <BOOK> <CHAPTER> [VERSE|random]")
        print("\nExamples:")
        print("  python spot_check_mappings.py JHN 3         # Random sample of 3 verses")
        print("  python spot_check_mappings.py JHN 3 16      # Check specific verse 16")
        print("  python spot_check_mappings.py MRK 1 random  # More random samples")
        sys.exit(1)

    book = sys.argv[1]
    chapter = sys.argv[2]
    mappings_dir = Path("bible-translations/mappings")
    filepath = mappings_dir / book / f"{chapter}.json"

    if not filepath.exists():
        print(f"Error: File not found: {filepath}")
        sys.exit(1)

    if len(sys.argv) == 4:
        if sys.argv[3] == "random":
            spot_check_chapter(filepath, num_samples=5)
        else:
            verse_num = sys.argv[3]
            spot_check_specific_verse(filepath, verse_num)
    else:
        spot_check_chapter(filepath, num_samples=3)

if __name__ == "__main__":
    main()

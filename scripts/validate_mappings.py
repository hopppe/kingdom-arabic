#!/usr/bin/env python3
"""
Validate Bible word mappings for correctness.
Checks position accuracy, coverage, and identifies potential issues.
"""

import json
import os
import sys
from pathlib import Path

def validate_position_accuracy(verse_data):
    """Check if start/end positions match the actual Arabic substring."""
    issues = []
    ar_text = verse_data["ar"]

    for i, mapping in enumerate(verse_data["mappings"]):
        start = mapping["start"]
        end = mapping["end"]
        expected_ar = mapping["ar"]

        # Extract actual substring from Arabic text
        actual_ar = ar_text[start:end]

        if actual_ar != expected_ar:
            issues.append({
                "type": "position_mismatch",
                "index": i,
                "expected": expected_ar,
                "actual": actual_ar,
                "start": start,
                "end": end
            })

    return issues

def validate_coverage(verse_data):
    """Check for unmapped gaps in Arabic text (excluding spaces/punctuation)."""
    issues = []
    ar_text = verse_data["ar"]
    mappings = verse_data["mappings"]

    # Sort by start position
    sorted_mappings = sorted(mappings, key=lambda x: x["start"])

    # Check for overlaps and gaps
    prev_end = 0
    for i, mapping in enumerate(sorted_mappings):
        start = mapping["start"]
        end = mapping["end"]

        # Check for overlap
        if start < prev_end:
            issues.append({
                "type": "overlap",
                "index": i,
                "mapping": mapping,
                "prev_end": prev_end
            })

        # Check for gaps (unmapped text)
        if start > prev_end:
            gap_text = ar_text[prev_end:start].strip()
            # Ignore if gap is just whitespace or punctuation
            if gap_text and not all(c in ' ،.؟!:«»؛' for c in gap_text):
                issues.append({
                    "type": "unmapped_gap",
                    "gap_start": prev_end,
                    "gap_end": start,
                    "gap_text": ar_text[prev_end:start]
                })

        prev_end = end

    # Check if there's unmapped text at the end
    if prev_end < len(ar_text):
        remaining = ar_text[prev_end:].strip()
        if remaining and not all(c in ' ،.؟!:«»؛' for c in remaining):
            issues.append({
                "type": "unmapped_end",
                "from_position": prev_end,
                "unmapped_text": ar_text[prev_end:]
            })

    return issues

def validate_order(verse_data):
    """Check if mappings are in sequential order."""
    issues = []
    mappings = verse_data["mappings"]

    for i in range(1, len(mappings)):
        if mappings[i]["start"] < mappings[i-1]["start"]:
            issues.append({
                "type": "out_of_order",
                "index": i,
                "current": mappings[i],
                "previous": mappings[i-1]
            })

    return issues

def check_semantic_quality(verse_data):
    """Identify potential semantic issues (heuristic checks).

    NOTE: We're mapping between two existing translations, not creating
    literal translations. Focus on learner clarity, not linguistic accuracy.
    """
    issues = []

    for i, mapping in enumerate(verse_data["mappings"]):
        ar = mapping["ar"]
        en = mapping["en"]

        # Check for empty translations
        if not en.strip():
            issues.append({
                "type": "empty_translation",
                "index": i,
                "arabic": ar
            })

        # Check for very short Arabic mapped to very long English (possible error)
        if len(ar) < 3 and len(en.split()) > 4:
            issues.append({
                "type": "suspicious_length",
                "index": i,
                "arabic": ar,
                "english": en,
                "note": "Very short Arabic word mapped to long English phrase - verify this is correct"
            })

        # Check for unhelpful single-word mappings (learner clarity)
        unhelpful_singles = ["لَا", "أَنْ", "أَنَّ", "مَا", "إِنَّ"]
        ar_clean = ar.strip('،.:؟!«» ')
        if ar_clean in unhelpful_singles and len(en.split()) == 1 and len(en) < 4:
            issues.append({
                "type": "potentially_unhelpful",
                "index": i,
                "arabic": ar,
                "english": en,
                "note": "Consider grouping with adjacent words for better learner understanding"
            })

    return issues

def validate_chapter(filepath):
    """Validate all verses in a chapter file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    results = {
        "file": str(filepath),
        "book": data.get("book", "unknown"),
        "chapter": data.get("chapter", 0),
        "total_verses": len(data.get("verses", {})),
        "verses_with_issues": 0,
        "verse_issues": {}
    }

    for verse_num, verse_data in data.get("verses", {}).items():
        verse_issues = []

        # Run all validations
        verse_issues.extend(validate_position_accuracy(verse_data))
        verse_issues.extend(validate_coverage(verse_data))
        verse_issues.extend(validate_order(verse_data))
        verse_issues.extend(check_semantic_quality(verse_data))

        if verse_issues:
            results["verse_issues"][verse_num] = verse_issues
            results["verses_with_issues"] += 1

    return results

def validate_book(book_dir):
    """Validate all chapters in a book."""
    book_path = Path(book_dir)
    all_results = []

    for chapter_file in sorted(book_path.glob("*.json"), key=lambda x: int(x.stem)):
        results = validate_chapter(chapter_file)
        all_results.append(results)

    return all_results

def print_summary(results):
    """Print a summary of validation results."""
    total_issues = 0

    for chapter_result in results:
        if chapter_result["verses_with_issues"] > 0:
            print(f"\n{chapter_result['book']} Chapter {chapter_result['chapter']}:")
            print(f"  Verses with issues: {chapter_result['verses_with_issues']}/{chapter_result['total_verses']}")

            # Group issues by type
            issue_types = {}
            for verse_num, issues in chapter_result["verse_issues"].items():
                for issue in issues:
                    issue_type = issue["type"]
                    if issue_type not in issue_types:
                        issue_types[issue_type] = []
                    issue_types[issue_type].append((verse_num, issue))

            for issue_type, occurrences in issue_types.items():
                total_issues += len(occurrences)
                print(f"    {issue_type}: {len(occurrences)} occurrences")
                # Show first few examples
                for verse_num, issue in occurrences[:2]:
                    if issue_type == "position_mismatch":
                        print(f"      v{verse_num}: Expected '{issue['expected']}' but got '{issue['actual']}'")
                    elif issue_type == "unmapped_gap":
                        print(f"      v{verse_num}: Gap '{issue['gap_text']}' not mapped")
                    elif issue_type == "empty_translation":
                        print(f"      v{verse_num}: '{issue['arabic']}' has empty translation")

    print(f"\n{'='*50}")
    print(f"Total issues found: {total_issues}")
    return total_issues

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python validate_mappings.py <BOOK>              # Validate entire book")
        print("  python validate_mappings.py <BOOK> <CHAPTER>    # Validate single chapter")
        print("\nExample:")
        print("  python validate_mappings.py MRK")
        print("  python validate_mappings.py JHN 3")
        sys.exit(1)

    book = sys.argv[1]
    mappings_dir = Path("bible-translations/mappings")

    if len(sys.argv) == 3:
        # Validate single chapter
        chapter = sys.argv[2]
        filepath = mappings_dir / book / f"{chapter}.json"

        if not filepath.exists():
            print(f"Error: File not found: {filepath}")
            sys.exit(1)

        results = validate_chapter(filepath)
        print_summary([results])

        # Print detailed issues for single chapter
        if results["verse_issues"]:
            print("\nDetailed Issues:")
            for verse_num, issues in sorted(results["verse_issues"].items(), key=lambda x: int(x[0])):
                print(f"\nVerse {verse_num}:")
                for issue in issues:
                    print(f"  - {issue}")
    else:
        # Validate entire book
        book_dir = mappings_dir / book

        if not book_dir.exists():
            print(f"Error: Book directory not found: {book_dir}")
            sys.exit(1)

        results = validate_book(book_dir)
        total_issues = print_summary(results)

        if total_issues == 0:
            print("All mappings validated successfully!")

if __name__ == "__main__":
    main()

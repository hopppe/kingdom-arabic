#!/usr/bin/env python3
"""Fix curly quotes in JSON files that break parsing."""

import re
from pathlib import Path

def fix_curly_quotes_in_file(filepath):
    """Replace curly quotes with escaped straight quotes in JSON strings."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace curly quotes with escaped straight quotes
    # These appear inside JSON string values and need to be escaped
    content = content.replace('"', '\\"')
    content = content.replace('"', '\\"')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    files = [
        'bible-translations/mappings/2CH/15.json',
        'bible-translations/mappings/JER/26.json'
    ]

    for f in files:
        if Path(f).exists():
            fix_curly_quotes_in_file(f)
            print(f"Fixed: {f}")

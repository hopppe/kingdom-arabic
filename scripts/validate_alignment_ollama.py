#!/usr/bin/env python3
"""
Validate word mapping alignment using Ollama LLM.
Checks the second-to-last mapping of each verse to detect alignment drift.
Can auto-fix by regenerating misaligned verses.
"""

import json
import re
import requests
import sys
import threading
import termios
import tty
import select
from pathlib import Path

# Global pause state
paused = False
pause_lock = threading.Lock()


def keyboard_listener():
    """Listen for p (pause) and r (resume) keypresses."""
    global paused
    old_settings = termios.tcgetattr(sys.stdin)
    try:
        tty.setcbreak(sys.stdin.fileno())
        while True:
            if select.select([sys.stdin], [], [], 0.1)[0]:
                key = sys.stdin.read(1).lower()
                with pause_lock:
                    if key == 'p' and not paused:
                        paused = True
                        print("\n⏸️  PAUSED - Press 'r' to resume...")
                    elif key == 'r' and paused:
                        paused = False
                        print("▶️  RESUMED\n")
                    elif key == 'q':
                        print("\n🛑 Quitting...")
                        sys.exit(0)
    except:
        pass
    finally:
        termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)


def check_pause():
    """Check if paused and wait until resumed."""
    global paused
    while True:
        with pause_lock:
            if not paused:
                return
        import time
        time.sleep(0.2)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma3:12b"

NT_BOOKS = [
    "MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO",
    "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI",
    "TIT", "PHM", "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"
]

# Common Arabic words for shift detection
COMMON_WORDS = {
    "فِي": ["in", "at", "on"],
    "مِنْ": ["from", "of"],
    "إِلَى": ["to", "toward"],
    "عَلَى": ["on", "upon", "over"],
    "وَ": ["and"],
    "الله": ["god"],
    "اللهِ": ["god", "of god"],
    "يَسُوعَ": ["jesus"],
    "الْمَسِيحِ": ["christ", "messiah"],
    "الرَّبِّ": ["lord", "the lord"],
    "الإِنْجِيلِ": ["gospel", "the gospel"],
}


def check_mapping_with_ollama(arabic_word, english_translation):
    """Ask Ollama if the translation is correct."""
    prompt = f"""You are validating Arabic-English word mappings for a Bible study app.

Does this Arabic word POSSIBLY translate to this English word/phrase? Be lenient - accept if it's a valid translation, synonym, or contextually appropriate meaning.

Arabic: {arabic_word}
English: {english_translation}

Answer ONLY "YES" or "NO". YES if the translation is valid or close. NO only if it's clearly wrong."""

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0}
        }, timeout=60)

        result = response.json().get("response", "").strip().upper()
        return "YES" in result
    except Exception as e:
        print(f"  Error calling Ollama: {e}")
        return None


def translate_chunk_numbered(arabic_words, full_verse_ar, full_verse_en, chunk_idx):
    """
    Translate a chunk of words using NUMBERED format for alignment
    Based on repair_misaligned_verses.py approach
    """
    num_words = len(arabic_words)
    word_list = "\n".join([f"{i+1}. {word}" for i, word in enumerate(arabic_words)])

    prompt = f"""Translate each numbered Arabic word to English using verse context.

Arabic verse: {full_verse_ar}
English verse: {full_verse_en}

Words to translate (chunk {chunk_idx+1}):
{word_list}

CRITICAL: Return EXACTLY {num_words} translations, one per line.
Format: NUMBER. TRANSLATION

Your {num_words} translations:"""

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.1, "num_predict": 300}
        }, timeout=120)

        result = response.json().get("response", "").strip()

        # Parse numbered responses
        translations = {}
        for line in result.split('\n'):
            line = line.strip()
            match = re.match(r'^(\d+)[.\):\s]+(.+)$', line)
            if match:
                num = int(match.group(1))
                trans = match.group(2).strip().strip('"\'.,!?')
                # Remove common prefixes Gemma might add
                trans = re.sub(r'^(TRANSLATION:\s*|Translation:\s*)', '', trans, flags=re.IGNORECASE).strip()
                if 1 <= num <= num_words and trans and len(trans) > 0:
                    translations[num] = trans

        # Build result mapping word -> translation
        result_map = {}
        for i, word in enumerate(arabic_words):
            result_map[word] = translations.get(i + 1)

        return result_map
    except Exception as e:
        print(f"      Error translating chunk: {e}")
        return {}


def regenerate_verse_mappings(arabic_verse, english_verse):
    """
    Regenerate mappings using numbered format (proven approach from repair scripts)
    Chunks long verses for better accuracy
    """
    # Extract words with positions
    words_with_pos = []
    current_pos = 0
    for token in re.split(r'(\s+)', arabic_verse):
        if token.strip():
            start = current_pos
            end = current_pos + len(token)
            # Filter: only words >= 3 chars
            if len(token) >= 3:
                words_with_pos.append((token, start, end))
        current_pos += len(token)

    words_only = [w for w, s, e in words_with_pos]
    num_words = len(words_only)

    if num_words == 0:
        return None

    # Chunk if long (>12 words), split evenly
    MAX_CHUNK = 12
    if num_words > MAX_CHUNK:
        # Calculate number of chunks needed, then split evenly
        num_chunks = (num_words + MAX_CHUNK - 1) // MAX_CHUNK  # ceiling division
        chunk_size = (num_words + num_chunks - 1) // num_chunks  # even split
        chunks = []
        for i in range(0, num_words, chunk_size):
            chunks.append(words_only[i:i + chunk_size])
    else:
        chunks = [words_only]

    print(f"      Processing {len(chunks)} chunk(s), {num_words} words total...")

    # Translate all chunks
    all_translations = {}
    for i, chunk in enumerate(chunks):
        print(f"      Chunk {i+1}/{len(chunks)}: {len(chunk)} words...")
        chunk_trans = translate_chunk_numbered(chunk, arabic_verse, english_verse, i)
        all_translations.update(chunk_trans)

    # Build final mappings with positions
    mappings = []
    for word, start, end in words_with_pos:
        translation = all_translations.get(word)
        if translation:
            mappings.append({
                "ar": word,
                "en": translation,
                "start": start,
                "end": end
            })

    if len(mappings) < num_words * 0.85:
        print(f"      Warning: Only got {len(mappings)}/{num_words} mappings")

    return mappings if mappings else None


def detect_and_fix_shift(verse_data):
    """Try to detect if mappings are shifted and fix by realigning."""
    mappings = verse_data.get('mappings', [])
    if len(mappings) < 5:
        return None  # Too short for shift detection

    # Check known words to detect shift
    shifts_detected = []

    for i, m in enumerate(mappings):
        ar_clean = m['ar'].rstrip('،,.؛')
        if ar_clean in COMMON_WORDS:
            expected = COMMON_WORDS[ar_clean]
            current_en = m['en'].lower()

            # Is current translation correct?
            if any(exp in current_en for exp in expected):
                continue  # This one is correct

            # Look for the correct translation in nearby positions
            for offset in range(-5, 6):
                if offset == 0:
                    continue
                check_idx = i + offset
                if 0 <= check_idx < len(mappings):
                    check_en = mappings[check_idx]['en'].lower()
                    if any(exp in check_en for exp in expected):
                        shifts_detected.append(offset)
                        break

    if not shifts_detected:
        return None

    # Find most common shift
    from collections import Counter
    shift_counts = Counter(shifts_detected)
    most_common_shift, count = shift_counts.most_common(1)[0]

    if count < 2:
        return None  # Not enough evidence

    print(f"    Detected shift of {most_common_shift} positions")

    # Apply shift to translations
    new_mappings = []
    for i, m in enumerate(mappings):
        new_m = m.copy()
        source_idx = i + most_common_shift
        if 0 <= source_idx < len(mappings):
            new_m['en'] = mappings[source_idx]['en']
        else:
            new_m['en'] = "[NEEDS_TRANSLATION]"
        new_mappings.append(new_m)

    return new_mappings


def fix_verse(verse_data, book, chapter, verse_num, mappings_dir):
    """Fix a misaligned verse - try shift first, then regenerate."""
    arabic_verse = verse_data['ar']
    english_verse = verse_data['en']

    print(f"    Attempting shift detection...")

    # Try shift detection first
    shifted_mappings = detect_and_fix_shift(verse_data)

    if shifted_mappings:
        # Check if shift fixed it
        needs_regen = any(m['en'] == "[NEEDS_TRANSLATION]" for m in shifted_mappings)
        if not needs_regen:
            # Verify the fix worked
            test_mapping = shifted_mappings[-2]
            if check_mapping_with_ollama(test_mapping['ar'], test_mapping['en']):
                print(f"    Shift fix successful!")
                return shifted_mappings

        # Fill in missing translations
        print(f"    Shift created gaps, regenerating missing...")
        for m in shifted_mappings:
            if m['en'] == "[NEEDS_TRANSLATION]":
                # Get translation for this word
                word_prompt = f"What does the Arabic word '{m['ar']}' mean in English? Reply with ONLY the English translation, 1-3 words."
                try:
                    response = requests.post(OLLAMA_URL, json={
                        "model": MODEL,
                        "prompt": word_prompt,
                        "stream": False,
                        "options": {"temperature": 0}
                    }, timeout=30)
                    m['en'] = response.json().get("response", "").strip()
                except:
                    pass
        return shifted_mappings

    # Shift detection failed, regenerate entire verse
    print(f"    Regenerating entire verse...")
    new_mappings = regenerate_verse_mappings(arabic_verse, english_verse)

    if new_mappings:
        # Validate positions match the Arabic text
        validated_mappings = []
        for m in new_mappings:
            # Verify the Arabic substring exists at the position
            if 'start' in m and 'end' in m:
                expected_ar = arabic_verse[m['start']:m['end']]
                if expected_ar == m['ar']:
                    validated_mappings.append(m)
                else:
                    # Try to find the correct position
                    pos = arabic_verse.find(m['ar'])
                    if pos >= 0:
                        m['start'] = pos
                        m['end'] = pos + len(m['ar'])
                        validated_mappings.append(m)
            else:
                # Find position
                pos = arabic_verse.find(m['ar'])
                if pos >= 0:
                    m['start'] = pos
                    m['end'] = pos + len(m['ar'])
                    validated_mappings.append(m)

        if validated_mappings:
            # Sort by position
            validated_mappings.sort(key=lambda x: x.get('start', 0))
            return validated_mappings

    return None


def validate_verse(verse_data, book, chapter, verse_num):
    """Validate the second-to-last mapping of a verse."""
    mappings = verse_data.get('mappings', [])

    if len(mappings) < 3:
        return None  # Skip short verses

    second_last = mappings[-2]
    ar = second_last['ar']
    en = second_last['en']

    is_valid = check_mapping_with_ollama(ar, en)

    return {
        'ref': f"{book} {chapter}:{verse_num}",
        'book': book,
        'chapter': chapter,
        'verse_num': verse_num,
        'arabic': ar,
        'english': en,
        'valid': is_valid
    }


def validate_and_fix_chapter(book, chapter, mappings_dir, auto_fix=False):
    """Validate and optionally fix a chapter."""
    chapter_file = mappings_dir / book / f"{chapter}.json"

    if not chapter_file.exists():
        print(f"File not found: {chapter_file}")
        return []

    with open(chapter_file, 'r') as f:
        data = json.load(f)

    flagged = []
    fixed_count = 0
    modified = False

    for verse_num in sorted(data.get('verses', {}).keys(), key=int):
        check_pause()  # Check for pause before each verse
        verse_data = data['verses'][verse_num]
        result = validate_verse(verse_data, book, chapter, verse_num)

        if result is None:
            continue

        status = "PASS" if result['valid'] else "FAIL" if result['valid'] is False else "ERROR"
        print(f"  {result['ref']:15} | {result['arabic']:20} → {result['english'][:30]:30} | {status}")

        if result['valid'] is False:
            flagged.append(result)

            if auto_fix:
                print(f"  → Fixing {result['ref']}...")
                new_mappings = fix_verse(verse_data, book, chapter, verse_num, mappings_dir)

                if new_mappings:
                    data['verses'][verse_num]['mappings'] = new_mappings
                    modified = True
                    fixed_count += 1
                    print(f"    Fixed with {len(new_mappings)} mappings")
                else:
                    print(f"    Could not fix automatically")

    # Save if modified
    if modified:
        with open(chapter_file, 'w') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n  Saved {fixed_count} fixes to {chapter_file}")

    return flagged


def validate_book(book, mappings_dir, auto_fix=False):
    """Validate all chapters in a book."""
    book_dir = mappings_dir / book
    if not book_dir.exists():
        return []

    all_flagged = []

    for chapter_file in sorted(book_dir.glob("*.json"), key=lambda x: int(x.stem)):
        check_pause()  # Check for pause before each chapter
        chapter = chapter_file.stem
        print(f"\n  Chapter {chapter}:")
        flagged = validate_and_fix_chapter(book, chapter, mappings_dir, auto_fix)
        all_flagged.extend(flagged)

    return all_flagged


def main():
    mappings_dir = Path("bible-translations/mappings")

    # Start keyboard listener thread
    listener_thread = threading.Thread(target=keyboard_listener, daemon=True)
    listener_thread.start()
    print("🎮 Controls: 'p' = pause, 'r' = resume, 'q' = quit\n")

    # Parse arguments
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python validate_alignment_ollama.py PHP           # Validate book")
        print("  python validate_alignment_ollama.py PHP 1         # Validate chapter")
        print("  python validate_alignment_ollama.py PHP --fix     # Validate and fix book")
        print("  python validate_alignment_ollama.py PHP 1 --fix   # Validate and fix chapter")
        print("  python validate_alignment_ollama.py --nt          # All NT books")
        print("  python validate_alignment_ollama.py --nt --fix    # All NT with fixes")
        sys.exit(1)

    auto_fix = "--fix" in sys.argv
    args = [a for a in sys.argv[1:] if a != "--fix"]

    flagged = []

    if args[0] == "--nt":
        books = NT_BOOKS
        for book in books:
            check_pause()  # Check for pause before each book
            print(f"\n{'='*60}")
            print(f"Validating {book}...")
            print(f"{'='*60}")
            results = validate_book(book, mappings_dir, auto_fix)
            flagged.extend(results)
    elif len(args) >= 2 and args[1].isdigit():
        # Single chapter
        book = args[0]
        chapter = args[1]
        print(f"Validating {book} chapter {chapter}...")
        flagged = validate_and_fix_chapter(book, chapter, mappings_dir, auto_fix)
    else:
        # Single book
        book = args[0]
        print(f"Validating {book}...")
        flagged = validate_book(book, mappings_dir, auto_fix)

    # Summary
    print(f"\n{'='*60}")
    print(f"FLAGGED VERSES: {len(flagged)}")
    print(f"{'='*60}")

    for f in flagged:
        print(f"  {f['ref']:15} | {f['arabic']:20} → {f['english']}")

    # Save flagged to file
    if flagged:
        with open("flagged_misaligned.json", 'w') as out_f:
            json.dump(flagged, out_f, ensure_ascii=False, indent=2)
        print(f"\nSaved to flagged_misaligned.json")


if __name__ == "__main__":
    main()

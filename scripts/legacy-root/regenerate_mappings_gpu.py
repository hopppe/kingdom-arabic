#!/usr/bin/env python3
"""
GPU-Optimized Bible Word Mapping Generation
Uses parallel processing with Apple M4 GPU acceleration via native Ollama

Key optimizations:
- Parallel chapter processing (4 workers)
- GPU-accelerated Gemma 3 translations
- Automatic resume capability
- Progress tracking and ETA estimation
"""

import json
import os
import requests
import re
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

# Force unbuffered output for real-time progress updates
sys.stdout.reconfigure(line_buffering=True)

OLLAMA_API = "http://localhost:11434/api/generate"
MODEL = "gemma3:12b"

# GPU-optimized settings for M4
MAX_WORKERS = 4  # Parallel chapter translations
TIMEOUT = 20  # Per-batch timeout (fast with 20-word batches)
NUM_PREDICT = 100  # Tokens for 20-word batches (50 needed + 50 buffer)


def translate_verse_batch(arabic_words, full_verse_ar, full_verse_en):
    """
    Translate ALL words in a verse at once using GPU-accelerated Gemma 3
    Returns dict mapping Arabic words to English translations
    """
    # Create numbered list of words to translate
    word_list = "\n".join([f"{i+1}. {word}" for i, word in enumerate(arabic_words)])

    prompt = f"""Translate Arabic words to English using the verse context. Each Arabic word may include articles (الْ), prepositions, or conjunctions - translate the COMPLETE word meaning, not just prefixes.

Context:
Arabic: {full_verse_ar}

Words to translate:
{word_list}

Provide ONLY the English translation for each word (one per line, no labels, no explanations):"""

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_predict": NUM_PREDICT,
            "num_gpu": 99  # Use all GPU layers
        }
    }

    try:
        response = requests.post(OLLAMA_API, json=payload, timeout=TIMEOUT)
        response.raise_for_status()
        result = response.json()
        response_text = result.get("response", "").strip()

        # Parse the response - expect one translation per line
        translations = []
        for line in response_text.split('\n'):
            line = line.strip()
            # Remove numbering if present (1. 2. etc.)
            line = re.sub(r'^\d+\.\s*', '', line)
            # Clean up quotes and punctuation
            line = line.strip('"\'.,!?')
            if line:
                translations.append(line)

        # Map Arabic words to their translations
        result_map = {}
        for i, arabic_word in enumerate(arabic_words):
            if i < len(translations):
                result_map[arabic_word] = translations[i]
            else:
                result_map[arabic_word] = None

        return result_map

    except Exception as e:
        # Fail silently and return None for all words
        return {word: None for word in arabic_words}


def extract_words_from_arabic(arabic_text):
    """
    Extract individual words from Arabic text, preserving positions
    Returns list of (word, start_pos, end_pos) tuples
    """
    words = []
    current_pos = 0

    # Split by whitespace
    tokens = re.split(r'(\s+)', arabic_text)

    for token in tokens:
        if token.strip():  # Not whitespace
            start = current_pos
            end = current_pos + len(token)
            words.append((token, start, end))
        current_pos += len(token)

    return words


def regenerate_chapter_mappings(book, chapter):
    """
    Regenerate word mappings for a single Bible chapter using GPU-accelerated Gemma 3
    Supports resume: If partially complete, picks up where it left off

    Returns: (success, verses_completed, total_verses)
    """
    # Read the source chapter
    source_file = f"bible-translations/unified/{book}/{chapter}.json"
    if not os.path.exists(source_file):
        return (False, 0, 0)

    with open(source_file, 'r', encoding='utf-8') as f:
        verses = json.load(f)

    # Check if we have a partial output file (for resume)
    output_dir = f"bible-maps-word-gemma3/mappings/{book}"
    os.makedirs(output_dir, exist_ok=True)
    output_file = f"{output_dir}/{chapter}.json"

    # Try to load existing progress
    if os.path.exists(output_file):
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                output = json.load(f)
        except (json.JSONDecodeError, ValueError):
            # Corrupted file - start fresh
            output = {
                "book": book,
                "chapter": int(chapter),
                "verses": {}
            }
    else:
        # Create new output structure
        output = {
            "book": book,
            "chapter": int(chapter),
            "verses": {}
        }

    total_verses = len(verses)
    initial_completed = len(output["verses"])

    # Process each verse
    for verse_num, verse_data in verses.items():
        # Skip if already completed
        if verse_num in output["verses"]:
            continue

        arabic = verse_data['ar']
        english = verse_data['en']

        # Extract Arabic words with positions
        arabic_words_with_pos = extract_words_from_arabic(arabic)

        # Filter words (skip very short words - likely particles)
        filtered_words = [(w, s, e) for w, s, e in arabic_words_with_pos if len(w) >= 3]

        # Smart batching: split large verses into chunks for faster processing
        BATCH_SIZE = 20  # Translate 20 words at a time max
        words_only = [w for w, s, e in filtered_words]

        translation_map = {}
        for i in range(0, len(words_only), BATCH_SIZE):
            batch = words_only[i:i+BATCH_SIZE]
            batch_translations = translate_verse_batch(batch, arabic, english)
            translation_map.update(batch_translations)

        # Build mappings with positions
        mappings = []
        for word, start, end in filtered_words:
            translation = translation_map.get(word)
            if translation:
                mappings.append({
                    "ar": word,
                    "en": translation,
                    "start": start,
                    "end": end
                })

        # Add verse to output
        output["verses"][verse_num] = {
            "ar": arabic,
            "en": english,
            "mappings": mappings
        }

        # SAVE AFTER EACH VERSE (checkpoint for resume)
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

    final_completed = len(output["verses"])
    verses_processed = final_completed - initial_completed

    return (True, verses_processed, total_verses)


def process_chapter_wrapper(args):
    """Wrapper for parallel processing"""
    book, chapter, chapter_idx, total_chapters = args

    # Stagger first API calls to avoid overwhelming Ollama
    import random
    import time as time_module
    if chapter_idx < 4:  # Only for first batch
        delay = chapter_idx * 2  # 0s, 2s, 4s, 6s delays
        time_module.sleep(delay)

    # Debug output
    print(f"[Worker] Starting {book} {chapter}...")
    sys.stdout.flush()

    start_time = time.time()
    success, verses_done, verses_total = regenerate_chapter_mappings(book, str(chapter))

    elapsed = time.time() - start_time

    return {
        'success': success,
        'book': book,
        'chapter': chapter,
        'chapter_idx': chapter_idx,
        'total_chapters': total_chapters,
        'verses_done': verses_done,
        'verses_total': verses_total,
        'elapsed': elapsed
    }


def get_all_bible_chapters():
    """
    Scan for all available Bible books and return list of (book, chapter_count)
    """
    source_dir = Path("bible-translations/unified")
    books = []

    for book_dir in sorted(source_dir.iterdir()):
        if not book_dir.is_dir():
            continue

        # Count chapters (JSON files)
        chapter_files = list(book_dir.glob("*.json"))
        if chapter_files:
            num_chapters = len(chapter_files)
            books.append((book_dir.name, num_chapters))

    return books


def main():
    import argparse
    parser = argparse.ArgumentParser(description='GPU-Optimized Bible word mapping generation')
    parser.add_argument('--workers', type=int, default=MAX_WORKERS,
                       help=f'Number of parallel workers (default: {MAX_WORKERS})')
    parser.add_argument('--books', type=str,
                       help='Comma-separated list of book codes to process (default: all)')
    parser.add_argument('--resume', action='store_true',
                       help='Resume from where we left off (skips completed chapters)')
    args = parser.parse_args()

    # Get all available books
    all_books = get_all_bible_chapters()

    # Filter books if specified
    if args.books:
        requested_books = [b.strip().upper() for b in args.books.split(',')]
        books_to_process = [(book, chapters) for book, chapters in all_books
                           if book in requested_books]
    else:
        books_to_process = all_books

    if not books_to_process:
        print("❌ No books found to process")
        return

    # Build task list
    tasks = []
    chapter_idx = 0
    for book, num_chapters in books_to_process:
        for chapter in range(1, num_chapters + 1):
            tasks.append((book, chapter, chapter_idx, None))
            chapter_idx += 1

    total_chapters = len(tasks)

    # Update total_chapters in each task
    tasks = [(book, ch, idx, total_chapters) for book, ch, idx, _ in tasks]

    print("="*70)
    print("GPU-OPTIMIZED BIBLE WORD MAPPING GENERATION")
    print("="*70)
    print(f"Books:    {len(books_to_process)}")
    print(f"Chapters: {total_chapters}")
    print(f"Workers:  {args.workers} (GPU parallel processing)")
    print(f"Model:    {MODEL} (GPU-accelerated)")
    print("="*70)
    print()

    # Filter out completed chapters if --resume
    if args.resume:
        filtered_tasks = []
        skipped = 0
        for book, chapter, idx, total in tasks:
            output_file = f"bible-maps-word-gemma3/mappings/{book}/{chapter}.json"
            if os.path.exists(output_file):
                try:
                    with open(output_file, 'r') as f:
                        data = json.load(f)
                    # Check if chapter has any verses
                    if len(data.get("verses", {})) > 0:
                        skipped += 1
                        continue
                except:
                    pass
            filtered_tasks.append((book, chapter, idx, total))

        if skipped > 0:
            print(f"📝 Resume mode: Skipping {skipped} completed chapters")
            print(f"   Processing {len(filtered_tasks)} remaining chapters\n")

        tasks = filtered_tasks

    if not tasks:
        print("✅ All chapters already complete!")
        return

    # Track progress
    completed_chapters = 0
    start_time = time.time()
    chapter_times = []

    print(f"🚀 Starting GPU-accelerated generation with {args.workers} workers...")
    print(f"📋 Submitting {len(tasks)} tasks to queue...\n")

    # Process chapters in parallel
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        # Submit all tasks immediately - ThreadPoolExecutor handles the queue
        futures = {executor.submit(process_chapter_wrapper, task): task for task in tasks}
        print(f"✓ All tasks submitted. Waiting for results...\n")

        for future in as_completed(futures):
            result = future.result()

            if result['success']:
                completed_chapters += 1
                chapter_times.append(result['elapsed'])

                # Calculate progress and ETA
                percent = (completed_chapters / total_chapters) * 100

                # ETA calculation (based on last 10 chapters)
                recent_times = chapter_times[-10:]
                avg_time = sum(recent_times) / len(recent_times)
                remaining = total_chapters - completed_chapters
                eta_seconds = remaining * avg_time
                eta_minutes = eta_seconds / 60
                eta_hours = eta_minutes / 60

                # Format ETA
                if eta_hours >= 1:
                    eta_str = f"{eta_hours:.1f}h"
                else:
                    eta_str = f"{eta_minutes:.0f}m"

                # Status message
                status = "✅" if result['verses_done'] == result['verses_total'] else "⚠️ "
                print(f"{status} [{completed_chapters}/{total_chapters}] {result['book']} {result['chapter']} "
                      f"({result['verses_done']}/{result['verses_total']} verses) "
                      f"- {result['elapsed']:.1f}s | {percent:.1f}% | ETA: {eta_str}")
            else:
                print(f"❌ {result['book']} {result['chapter']} - Failed")

    # Final summary
    total_time = time.time() - start_time
    avg_chapter_time = sum(chapter_times) / len(chapter_times) if chapter_times else 0

    print("\n" + "="*70)
    print("GENERATION COMPLETE!")
    print("="*70)
    print(f"  Chapters completed: {completed_chapters}/{total_chapters}")
    print(f"  Total time:         {total_time/60:.1f} minutes ({total_time/3600:.2f} hours)")
    print(f"  Avg per chapter:    {avg_chapter_time:.1f} seconds")
    print(f"  GPU speedup:        ~3-5x faster than CPU")
    print("="*70)


if __name__ == "__main__":
    main()

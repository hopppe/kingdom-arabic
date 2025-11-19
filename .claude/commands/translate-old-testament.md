# Translate Old Testament - Automated Batch Processing

Automatically translate all Old Testament chapters in the bible-maps-word-haiku directory, skipping chapters that are already complete.

## Instructions

This command will:
1. Scan all Old Testament mapping files in `bible-maps-word-haiku/mappings/`
2. Identify chapters that need translation (have empty "en" fields)
3. Launch haiku agents in parallel batches to translate them

### Steps:

1. **Define Old Testament books and their chapter counts:**
   ```
   GEN: 50, EXO: 40, LEV: 27, NUM: 36, DEU: 34,
   JOS: 24, JDG: 21, RUT: 4, 1SA: 31, 2SA: 24,
   1KI: 22, 2KI: 25, 1CH: 29, 2CH: 36, EZR: 10,
   NEH: 13, EST: 10, JOB: 42, PSA: 150, PRO: 31,
   ECC: 12, SNG: 8, ISA: 66, JER: 52, LAM: 5,
   EZK: 48, DAN: 12, HOS: 14, JOL: 3, AMO: 9,
   OBA: 1, JON: 4, MIC: 7, NAM: 3, HAB: 3,
   ZEP: 3, HAG: 2, ZEC: 14, MAL: 4
   ```

2. **Scan for chapters that need translation:**
   - For each book, check if the mapping file exists
   - Read the first mapping in the first verse
   - If the "en" field is empty (""), mark it for translation
   - Collect all chapters needing translation

3. **Launch haiku agents in batches:**
   - Process up to 20 chapters at a time (to avoid overwhelming the system)
   - For each chapter needing translation, launch a Task agent with:
     - subagent_type: general-purpose
     - model: haiku
     - description: Translate {BOOK} {CHAPTER}
     - The standard translation prompt (see below)

4. **Report progress:**
   - Show total chapters scanned
   - Show chapters already complete
   - Show chapters being translated in this batch
   - Show estimated remaining chapters

### Translation Prompt Template:

Use this prompt for each agent:

```
**Model check**: Confirm you are Claude Haiku.

File: bible-maps-word-haiku/mappings/{BOOK}/{CHAPTER}.json

### EFFICIENCY RULES:
- Use ONLY Read and Write tools - NO bash
- Read ONCE, translate all, Write ONCE
- Work silently, no commentary

### Task:
1. Read file
2. Translate each Arabic word to English (literal translations, not English verse)
3. Fill "en" fields (keep "ar"/"start"/"end" unchanged)
4. Write file

No reports. Begin now.
```

### Implementation Notes:

- Use bash/python to scan directories and check files efficiently
- Launch agents in parallel using multiple Task calls in a single message
- Track progress to resume where you left off
- Prioritize smaller books first for quicker wins
- Report when ALL Old Testament translation is complete

Begin the automated translation process now.

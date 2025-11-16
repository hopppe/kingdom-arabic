# Map Bible Chapters in Parallel

This command launches multiple agents to create vocabulary mappings for Bible chapters in parallel.

## Usage

```
/map-bible-chapters BOOK [chapters]
```

Examples:
```
/map-bible-chapters JHN 1,2,3,4,5    # Map specific chapters
/map-bible-chapters GEN               # Map ALL chapters in Genesis
/map-bible-chapters PSA 1-10          # Map Psalms 1-10
```

## Instructions

When this command is invoked, launch parallel Task agents to process each chapter:

1. **Parse the input:**
   - If chapters are provided (e.g., "1,2,3" or "1-10"), parse them into a list
   - If NO chapters provided (just book name), discover all chapters by listing files in:
     `/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-translations/unified/{BOOK}/`
   - Extract chapter numbers from filenames (e.g., "1.json" → 1, "2.json" → 2)
   - Sort chapters numerically

2. **IMPORTANT: Maximum 10 chapters at a time**
   - If more than 10 chapters need mapping, only process the FIRST 10
   - Inform the user how many remain and they can run the command again for the next batch
   - Example: "Mapping GEN chapters 1-10. Run again for chapters 11-20."

3. For each chapter, launch a Task agent with:
   - `subagent_type`: "general-purpose"
   - `description`: "Map {BOOK} chapter {CHAPTER}"
   - `prompt`: The detailed mapping instructions below

4. **IMPORTANT**: Launch ALL agents (up to 10) in a SINGLE message with multiple Task tool calls to ensure parallel execution.

## Agent Prompt Template

For each chapter, use this prompt:

```
Create Arabic-English word mappings for {BOOK} chapter {CHAPTER}.

## Step 1: Read the chapter
Read the file: /Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-translations/unified/{BOOK}/{CHAPTER}.json

This contains verses in format: {"1": {"en": "...", "ar": "..."}, "2": {...}}

## Step 2: Create word pair mappings
For EACH verse, create a list of [Arabic_word, English_meaning] pairs.

Example for a verse:
Arabic: "فِي الْبَدْءِ كَانَ الْكَلِمَةُ"
English: "In the beginning was the Word"

Word pairs: [
  ["فِي", "In"],
  ["الْبَدْءِ", "the beginning"],
  ["كَانَ", "was"],
  ["الْكَلِمَةُ", "the Word"]
]

**Guidelines:**
- Go through Arabic text LEFT-TO-RIGHT (start to end of string)
- Match each Arabic word/phrase to its English meaning
- Include punctuation attached to words (e.g., "اللهِ." not "اللهِ")
- Cover ALL meaningful words in the verse
- Order matters - list pairs in the order they appear in Arabic text

## Step 3: Build the complete chapter JSON
Create a JSON object with ALL verses:
{
  "1": [["ar1", "en1"], ["ar2", "en2"], ...],
  "2": [["ar1", "en1"], ["ar2", "en2"], ...],
  ...
}

## Step 4: Save using the Python script
Run this command (paste the JSON you created):
```bash
python /Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/scripts/save_verse_mapping.py {BOOK} {CHAPTER} --chapter 'YOUR_JSON_HERE'
```

The script will:
- Calculate exact character positions automatically
- Validate the mappings
- Save to /Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-translations/mappings/{BOOK}/{CHAPTER}.json

## Step 5: Report completion
Return:
- Number of verses processed
- Confirmation that the script ran successfully
- Any warnings from the script

## Common Arabic Words (for reference)
- يَسُوعُ/يَسُوعَ → "Jesus"
- اللهِ/اللهُ/اللهَ → "God"
- الرَّبِّ/الرَّبُّ → "the Lord"
- الْمَسِيحِ/الْمَسِيحَ → "Christ/Messiah"
- يُوحَنَّا → "John"
- وَ → "and"
- فِي → "in"
- مِنْ → "from"
- إِلَى → "to"
```

## Example Executions

### Example 1: Specific chapters
When user runs: `/map-bible-chapters JHN 1,2,3`

Launch THREE Task agents in parallel (single message, multiple tool calls):
1. Task agent for JHN chapter 1
2. Task agent for JHN chapter 2
3. Task agent for JHN chapter 3

### Example 2: Entire book (small book)
When user runs: `/map-bible-chapters MRK`

1. List files in `/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-translations/unified/MRK/`
2. Find: 1.json, 2.json, ..., 16.json (16 chapters total)
3. Since 16 > 10, only process chapters 1-10
4. Inform user: "Mapping MRK chapters 1-10 (10 of 16). Run `/map-bible-chapters MRK 11,12,13,14,15,16` for remaining chapters."
5. Launch 10 Task agents in parallel

### Example 3: Entire book (small book, fits in one batch)
When user runs: `/map-bible-chapters JUD`

1. List files, find only 1 chapter
2. Launch 1 Task agent

Each agent:
1. Reads the chapter JSON file
2. Creates word pair lists for all verses
3. Runs the Python script to save with calculated positions
4. Reports back results

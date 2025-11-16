# Map Bible Chapters in Parallel

This command launches multiple agents to create vocabulary mappings for Bible chapters in parallel.

## Usage

```
/map-bible-chapters BOOK chapters
```

Example:
```
/map-bible-chapters JHN 1,2,3,4,5
```

## Instructions

When this command is invoked, launch parallel Task agents to process each chapter:

1. Parse the book ID (e.g., "JHN") and chapter numbers (e.g., "1,2,3" becomes [1, 2, 3])

2. For each chapter, launch a Task agent with:
   - `subagent_type`: "general-purpose"
   - `description`: "Map {BOOK} chapter {CHAPTER}"
   - `prompt`: The detailed mapping instructions below

3. **IMPORTANT**: Launch ALL agents in a SINGLE message with multiple Task tool calls to ensure parallel execution.

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

## Example Execution

When user runs: `/map-bible-chapters JHN 1,2,3`

Launch THREE Task agents in parallel (single message, multiple tool calls):

1. Task agent for JHN chapter 1
2. Task agent for JHN chapter 2
3. Task agent for JHN chapter 3

Each agent:
1. Reads the chapter JSON file
2. Creates word pair lists for all verses
3. Runs the Python script to save with calculated positions
4. Reports back results

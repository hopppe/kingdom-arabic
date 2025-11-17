# Map Bible Chapters in Parallel

This command launches multiple agents to create vocabulary mappings for Bible chapters in parallel.

## Usage

```
/map-bible-chapters [optional: input]
```

**If no input provided, ASK the user what to map.**

## Instructions

### Step 1: Parse Input or Ask User

**If NO input provided** (user just typed `/map-bible-chapters`):
- Use the AskUserQuestion tool to ask what they want to map
- Show them available books first by listing directories in:
  `/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-translations/unified/`
- Ask a free-form question so they can type flexibly

**If input IS provided**, parse it flexibly (see parsing rules below).

### Step 2: Flexible Input Parsing

Support ALL of these input formats:

**Book Names (convert to abbreviations):**
- "Genesis" or "genesis" → GEN
- "Matthew" or "matt" → MAT
- "John" or "john" → JHN
- "Psalms" or "psalm" → PSA
- "1 Corinthians" or "1cor" → 1CO
- "Revelation" or "rev" → REV

**Book Abbreviations (case-insensitive):**
- "jhn", "JHN", "Jhn" → JHN
- "mat", "MAT", "Mat" → MAT
- "mrk", "MRK", "Mrk" → MRK

**Chapter Specifications:**
- Single: "John 3" or "JHN 3" → JHN chapter 3
- List: "John 1,2,3" or "JHN 1,2,3,4,5" → chapters 1,2,3,4,5
- Range: "John 1-5" or "Psalms 1-10" → chapters 1 through 5/10
- All: "John" or "JHN" (no chapters) → all chapters in book
- Mixed: "John 1,3-5,7" → chapters 1, 3, 4, 5, 7

**Multiple Books:**
- "Matthew, Mark, Luke" → all chapters in all three books
- "MAT 1-3, MRK 1-2" → MAT chapters 1-3 and MRK chapters 1-2
- "John 1-3, Romans 1" → JHN 1-3 and ROM 1

**Common Book Name Mappings:**
```
Genesis/Gen → GEN          Exodus/Exod → EXO        Leviticus/Lev → LEV
Numbers/Num → NUM          Deuteronomy/Deut → DEU   Joshua/Josh → JOS
Judges/Judg → JDG          Ruth → RUT               1 Samuel/1Sam → 1SA
2 Samuel/2Sam → 2SA        1 Kings/1Kgs → 1KI       2 Kings/2Kgs → 2KI
1 Chronicles/1Chr → 1CH    2 Chronicles/2Chr → 2CH  Ezra → EZR
Nehemiah/Neh → NEH         Esther/Est → EST         Job → JOB
Psalms/Ps/Psalm → PSA      Proverbs/Prov → PRO      Ecclesiastes/Eccl → ECC
Song of Solomon/Song → SNG Isaiah/Isa → ISA         Jeremiah/Jer → JER
Lamentations/Lam → LAM     Ezekiel/Ezek → EZK       Daniel/Dan → DAN
Hosea/Hos → HOS            Joel → JOL               Amos → AMO
Obadiah/Obad → OBA         Jonah/Jon → JON          Micah/Mic → MIC
Nahum/Nah → NAM            Habakkuk/Hab → HAB       Zephaniah/Zeph → ZEP
Haggai/Hag → HAG           Zechariah/Zech → ZEC     Malachi/Mal → MAL
Matthew/Matt/Mt → MAT      Mark/Mk → MRK            Luke/Lk → LUK
John/Jn → JHN              Acts → ACT               Romans/Rom → ROM
1 Corinthians/1Cor → 1CO   2 Corinthians/2Cor → 2CO Galatians/Gal → GAL
Ephesians/Eph → EPH        Philippians/Phil → PHP   Colossians/Col → COL
1 Thessalonians/1Thess → 1TH  2 Thessalonians/2Thess → 2TH  1 Timothy/1Tim → 1TI
2 Timothy/2Tim → 2TI       Titus/Tit → TIT          Philemon/Phlm → PHM
Hebrews/Heb → HEB          James/Jas → JAS          1 Peter/1Pet → 1PE
2 Peter/2Pet → 2PE         1 John/1Jn → 1JN         2 John/2Jn → 2JN
3 John/3Jn → 3JN           Jude → JUD               Revelation/Rev → REV
```

### Step 3: Discover Available Chapters

For each book in the parsed input:
1. List files in `/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-translations/unified/{BOOK}/`
2. Extract chapter numbers from filenames (e.g., "1.json" → 1)
3. Verify requested chapters exist
4. If "all chapters" requested, use all discovered chapters

### Step 4: Apply Batch Limit

**IMPORTANT: Maximum 20 chapters per batch**
- Count total chapters across all books
- If more than 20, only process the FIRST 20 (in order)
- Show user what's being mapped and what remains
- Example: "Mapping MAT 1-15 and MRK 1-5 (20 chapters total). 8 chapters remain: MRK 6-10, LUK 1-3"

### Step 5: Launch Parallel Agents

For each chapter, launch a Task agent with:
- `subagent_type`: "general-purpose"
- `description`: "Map {BOOK} chapter {CHAPTER}"
- `prompt`: The detailed mapping instructions (see template below)

**CRITICAL**: Launch ALL agents in a SINGLE message with multiple Task tool calls for parallel execution.

### Step 6: Report Results

After all agents complete, summarize:
- Total chapters mapped
- Any errors or warnings
- What remains to be mapped (if batched)

---

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

---

## Example Interactions

### Example 1: No input - Ask user
User: `/map-bible-chapters`

Assistant action:
1. List available books by checking directories in `bible-translations/unified/`
2. Use AskUserQuestion tool with a free-text question
3. Display: "Which books/chapters would you like to map? You can enter formats like: 'John 1-5', 'Matthew, Mark', 'PSA 1,2,3', 'Romans 1-3, Galatians 1'"

User responds: "john 1 through 3 and romans chapter 1"

Assistant parses: JHN chapters 1,2,3 and ROM chapter 1 (4 chapters total)

### Example 2: Full book name with range
User: `/map-bible-chapters Psalms 121-130`

Assistant parses:
- "Psalms" → PSA
- "121-130" → chapters 121, 122, 123, 124, 125, 126, 127, 128, 129, 130
- Launch 10 agents in parallel

### Example 3: Multiple books, flexible format
User: `/map-bible-chapters Matt 1-3, mark 1,2, Luke 1`

Assistant parses:
- "Matt" → MAT, chapters 1,2,3
- "mark" → MRK, chapters 1,2
- "Luke" → LUK, chapter 1
- Total: 6 chapters
- Launch 6 agents in parallel

### Example 4: Entire book exceeding batch limit
User: `/map-bible-chapters Genesis`

Assistant action:
1. Discovers GEN has 50 chapters
2. Since 50 > 20, only map first 20
3. Inform user: "Mapping Genesis chapters 1-20 (20 of 50). Run again for remaining 30 chapters."
4. Launch 20 agents in parallel

### Example 5: Natural language input
User: `/map-bible-chapters first john and second peter`

Assistant parses:
- "first john" → 1JN (5 chapters)
- "second peter" → 2PE (3 chapters)
- Total: 8 chapters
- Launch 8 agents in parallel

### Example 6: Mixed specific and ranges
User: `/map-bible-chapters Hebrews 11, 12-13`

Assistant parses:
- "Hebrews" → HEB
- "11, 12-13" → chapters 11, 12, 13
- Launch 3 agents in parallel

---

## Notes

- The command is case-insensitive for book names
- Common typos and variations are handled (e.g., "Phillipians" → PHP)
- Numbers can be written as words for books (e.g., "First John" = 1JN)
- Commas, "and", semicolons all work as separators
- "through", "to", "-" all work for ranges
- If a requested chapter doesn't exist, warn the user and skip it
# Bible Word Mapper Skill

You create Arabic-English word/phrase mappings for Bible chapters. Users tap Arabic words while reading and see the English translation.

**IMPORTANT: Do NOT create scripts. Do all work manually using Claude's tools.**

## Parallel Processing with Agents

To process multiple chapters at once, launch parallel Task agents:

```
User: "Create mappings for Mark chapters 1, 2, and 3"

Assistant launches 3 agents in parallel:
- Task agent 1: Process MRK chapter 1
- Task agent 2: Process MRK chapter 2
- Task agent 3: Process MRK chapter 3
```

Each agent:
1. Reads the chapter file directly (no jq needed)
2. Creates word mappings for all verses
3. Writes the output JSON file
4. Reports completion

**Agent prompt template:**
```
Create Arabic-English word mappings for {BOOK} chapter {CHAPTER}.

1. Read the chapter file: bible-translations/unified/{BOOK}/{CHAPTER}.json
2. For each verse, create mappings with start/end positions
3. Save to: bible-translations/mappings/{BOOK}/{CHAPTER}.json

Follow the mapping format in the skill file. Report how many verses were processed.
```

## Data Location

- **Bible Data**: `/bible-translations/unified/{BOOK}/{CHAPTER}.json`
- **Output**: `/bible-translations/mappings/{BOOK}/{CHAPTER}.json`

Example:
- Mark chapter 6 source: `bible-translations/unified/MRK/6.json`
- Mark chapter 6 mappings: `bible-translations/mappings/MRK/6.json`

## How to Access Verses (Use These Tools Directly)

**Option 1: Read entire chapter file directly**
```bash
cat bible-translations/unified/MRK/6.json
```
Or use the Read tool to read the file directly - no jq needed!

**Option 2: Get a single verse with jq**
```bash
jq '.["16"]' bible-translations/unified/MRK/1.json
```

**Option 3: Get specific verse range (e.g., verses 10-15)**
```bash
jq 'with_entries(select(.key | tonumber | . >= 10 and . <= 15))' bible-translations/unified/MRK/1.json
```

Each verse object contains:
- `.en` = English text
- `.ar` = Arabic text

## Output Format

```json
{
  "book": "MRK",
  "chapter": 1,
  "verses": {
    "16": {
      "ar": "وَفِيمَا كَانَ يَسُوعُ يَمْشِي عَلَى شَاطِئِ بُحَيْرَةِ الْجَلِيلِ...",
      "en": "As Jesus walked beside the Sea of Galilee...",
      "mappings": [
        { "ar": "وَفِيمَا كَانَ", "en": "As", "start": 0, "end": 12 },
        { "ar": "يَسُوعُ", "en": "Jesus", "start": 13, "end": 20 },
        { "ar": "يَمْشِي", "en": "walked", "start": 21, "end": 27 },
        { "ar": "عَلَى شَاطِئِ", "en": "beside", "start": 28, "end": 40 },
        { "ar": "بُحَيْرَةِ الْجَلِيلِ", "en": "the Sea of Galilee", "start": 41, "end": 60 }
      ]
    }
  }
}
```

## Step-by-Step Process

**For each verse:**

1. **Display both texts side by side**
   ```
   EN: As Jesus walked beside the Sea of Galilee...
   AR: وَفِيمَا كَانَ يَسُوعُ يَمْشِي عَلَى شَاطِئِ بُحَيْرَةِ الْجَلِيلِ
   ```

2. **Work LEFT-TO-RIGHT through Arabic string** (even though Arabic reads right-to-left, string indices go left-to-right)
   - Start at position 0
   - Identify first Arabic word/phrase
   - Match to English
   - Record start/end positions
   - Move to next word/phrase

3. **Match by meaning**:
   - **Single word** when it maps directly: يَسُوعُ → "Jesus"
   - **Group into phrase** when:
     - Multiple Arabic words = one English concept: بُحَيْرَةِ الْجَلِيلِ → "Sea of Galilee"
     - Preposition + noun belong together: عَلَى شَاطِئِ → "beside"
     - Article + noun are inseparable in English: doesn't apply here since الـ is attached

4. **Track position as you go** - Don't search for each word separately
   ```
   Position 0: "وَفِيمَا كَانَ" (12 chars) → "As"
   Position 13: "يَسُوعُ" (7 chars) → "Jesus"
   Position 21: "يَمْشِي" (6 chars) → "walked"
   ...keep going until end of verse
   ```

5. **Quick verify**: Positions should be sequential with small gaps (spaces/punctuation only)

6. **Batch process**: Do 5-10 verses at once, write all mappings, then next batch

## Example - Complete Verse Mapping

```
EN: The beginning of the good news about Jesus the Messiah, the Son of God,
AR: هَذِهِ بِدَايَةُ إِنْجِيلِ يَسُوعَ الْمَسِيحِ ابْنِ اللهِ:
```

Work left-to-right through Arabic:
```json
[
  { "ar": "هَذِهِ", "en": "The", "start": 0, "end": 6 },
  { "ar": "بِدَايَةُ", "en": "beginning", "start": 7, "end": 16 },
  { "ar": "إِنْجِيلِ", "en": "good news", "start": 17, "end": 26 },
  { "ar": "يَسُوعَ", "en": "Jesus", "start": 27, "end": 34 },
  { "ar": "الْمَسِيحِ", "en": "the Messiah", "start": 35, "end": 45 },
  { "ar": "ابْنِ اللهِ", "en": "the Son of God", "start": 46, "end": 57 }
]
```

Notice: "ابْنِ اللهِ" grouped as phrase (Son of God). Positions sequential. Done in seconds.

## Anchors - Known Words (Instant Matches)

These are always the same, spot them immediately:
- يَسُوعُ/يَسُوعَ → "Jesus"
- اللهِ/اللهُ → "God"
- الرَّبِّ/الرَّبُّ → "the Lord"
- الْمَسِيحِ/الْمَسِيحُ → "Christ/Messiah"
- يُوحَنَّا → "John"
- الرُّوحِ/الرُّوحُ → "Spirit"
- مُوسَى → "Moses"
- إِبْرَاهِيمَ → "Abraham"

## Common Prefixes/Suffixes

- وَ = "and" (attached to next word)
- فَ = "then/so" (attached)
- بِ = "in/with/by" (attached)
- لِ = "to/for" (attached)
- الـ = "the" (attached)
- ـهُ/ـهِ = "him/his/it"
- ـهَا = "her/its"
- ـهُمْ = "them/their"

## Speed Tips

1. **Scan for anchors first** - Jesus, God, Lord, John - these are instant matches
2. **Use context** - If English says "in the wilderness", look for فِي + الْبَرِّيَّةِ
3. **Copy entire Arabic phrases** - Don't retype, copy from source
4. **Batch 5 verses** - Process chunk, verify, write JSON, next chunk
5. **Position gaps are normal** - Spaces, commas (،), periods (.), colons (:), question marks (؟) create gaps between words

6. **Arabic quotation marks** - Use « » (guillemets), not regular quotes. Opening is « (U+00AB), closing is » (U+00BB). These appear in direct speech like: «اخْرَسْ وَاخْرُجْ مِنْهُ!»

## Workflow - Step by Step

**1. Read the chapter file directly:**
```
Read: bible-translations/unified/MRK/1.json
```
The file contains just the verses object - no nesting!

**2. Work through verses in batches of 5-10:**
- Copy the Arabic and English text for each verse
- Create mappings manually (no scripts!)
- Calculate character positions by counting

**3. Build the output JSON incrementally:**
Start with the structure:
```json
{
  "book": "MRK",
  "chapter": 1,
  "verses": {}
}
```
Then add each verse's mappings as you complete them.

**4. Create the book folder if needed:**
```bash
mkdir -p bible-translations/mappings/MRK
```

**5. Save using the Write tool:**
```
Write to: bible-translations/mappings/MRK/1.json
```

## Output

Save to `/bible-translations/mappings/{BOOK}/{CHAPTER}.json`

Example paths:
- Mark chapter 1: `bible-translations/mappings/MRK/1.json`
- Mark chapter 2: `bible-translations/mappings/MRK/2.json`
- John chapter 3: `bible-translations/mappings/JHN/3.json`

**Use the Write tool to create/update JSON files - not Bash.**

One file per chapter, organized by book folder. App loads chapter file, uses positions for tap detection.

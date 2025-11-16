# Bible Word Mapping Agent

Create vocabulary mappings for a single Bible chapter using local JSON files.

## Usage

```
/bible-word-mapping <BOOK> <CHAPTER>
```

Example:
```
/bible-word-mapping MRK 6
```

## Task Instructions

When this command is invoked, perform the following:

1. **Get the chapter verses**:
   ```bash
   jq '.chapters["<CHAPTER>"].verses' bible-translations/unified/<BOOK>.json
   ```

2. **For each verse, create word/phrase mappings** following the skill guidelines:
   - Work LEFT-TO-RIGHT through the Arabic string
   - Match by meaning (single word or phrase)
   - Track character positions as you go
   - Positions should be sequential with small gaps for spaces/punctuation

3. **Create the book folder if it doesn't exist**:
   ```bash
   mkdir -p bible-translations/mappings/<BOOK>
   ```

4. **Save the output** using the Write tool to:
   `bible-translations/mappings/<BOOK>/<CHAPTER>.json`

   Example: Mark chapter 6 saves to `bible-translations/mappings/MRK/6.json`

5. **Report completion** with verse count and sample mappings.

## Output Format

```json
{
  "book": "<BOOK>",
  "chapter": <CHAPTER>,
  "verses": {
    "1": {
      "ar": "Arabic text...",
      "en": "English text...",
      "mappings": [
        { "ar": "word", "en": "translation", "start": 0, "end": 4 }
      ]
    }
  }
}
```

## Quick Reference

**Anchor words** (instant matches):
- يَسُوعُ → "Jesus"
- اللهِ → "God"
- الرَّبِّ → "the Lord"
- الْمَسِيحِ → "Christ/Messiah"

**Common prefixes**:
- وَ = "and"
- فَ = "then/so"
- بِ = "in/with"
- لِ = "to/for"
- الـ = "the"

See `.claude/skills/bible-word-mapper.md` for full instructions.

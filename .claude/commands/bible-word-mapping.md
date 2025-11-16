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

1. **Read the chapter file directly**:
   ```
   bible-translations/unified/<BOOK>/<CHAPTER>.json
   ```
   Each file contains verse objects: `{ "1": { "en": "...", "ar": "..." }, "2": { ... } }`

2. **For each verse, create word/phrase mappings** following these rules:
   - Work LEFT-TO-RIGHT through the Arabic string
   - **Group by semantic meaning** - phrases that belong together stay together
   - Track character positions as you go
   - Ensure complete coverage (no Arabic words left unmapped)

3. **Create the book folder if it doesn't exist**:
   ```bash
   mkdir -p bible-translations/mappings/<BOOK>
   ```

4. **Save the output** using the Write tool to:
   `bible-translations/mappings/<BOOK>/<CHAPTER>.json`

5. **Report completion** with verse count and sample mappings.

## Critical Mapping Rules

**IMPORTANT**: You're mapping between TWO EXISTING BIBLE TRANSLATIONS, not creating literal word translations. The Arabic and English Bibles are independent translations of the same source text.

### Core Principle: Match Corresponding Content

Map Arabic segments to their **corresponding English segments** in the translations, even if:
- The literal meaning differs (فِي = "in" literally, but map to "of" if English says "of")
- Word order differs between translations
- One translation has words the other doesn't

**Goal**: When a learner taps an Arabic word, they see what it corresponds to in the English translation.

### Phrase Grouping - FOR LEARNER CLARITY

Group words when it helps the learner understand:

| Group These | Why? |
|-------------|------|
| بُحَيْرَةِ الْجَلِيلِ → "Sea of Galilee" | Proper noun, meaningless if split |
| ابْنِ اللهِ → "Son of God" | Compound concept |
| لَا أَحَدَ → "no one" | Single word is meaningless |
| يُوحَنَّا الْمَعْمَدَانِ → "John the Baptist" | Name + title |

BUT you CAN split if both parts are clear:
- فِي → "in", الْبَيْتِ → "the house" (both understandable)
- وَقَالَ → "and said" (clear as is)

### Unhelpful Mappings to Avoid

These single-word mappings don't help learners:
- ❌ لَا → "no" (what does "no" mean alone?)
- ❌ أَنْ → "to" (which "to"?)
- ❌ مَا → "what" (vague)

Instead, group with adjacent words:
- ✅ لَا أَحَدَ → "no one"
- ✅ أَنْ يَعْمَلَ → "to do"
- ✅ مَا تَعْمَلُ → "what you are doing"

### Attached Prefixes - INCLUDE IN WORD

These are attached and should NOT be split off:
- الـ (the) - attached to noun: الْبَيْتِ = "the house"
- وَ (and) - attached: وَقَالَ = "and said"
- فَ (then/so) - attached: فَذَهَبَ = "then he went"

### Common Issues to Check

1. **DON'T leave words unmapped**:
   - Every Arabic word/phrase must have a mapping
   - Check that positions cover entire verse (except spaces/punctuation)

2. **DON'T create unhelpful single-word mappings**:
   - If tapping a word shows something meaningless, group it better
   - Ask: "Does this help a learner?"

3. **DO match the English translation exactly**:
   - If English says "of the council", map فِي to "of" (even though فِي = "in")
   - Follow the actual translation, not literal meanings

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

## Anchor Words (instant matches)

- يَسُوعُ/يَسُوعَ → "Jesus"
- اللهِ/اللهُ → "God"
- الرَّبِّ/الرَّبُّ → "the Lord"
- الْمَسِيحِ/الْمَسِيحُ → "Christ/Messiah"
- يُوحَنَّا → "John"
- مُوسَى → "Moses"

## Quality Checklist

Before saving, verify:
- [ ] All Arabic text is covered (no unmapped words)
- [ ] Positions are sequential (no overlaps)
- [ ] Mappings match the English translation text (not literal meanings)
- [ ] Phrases grouped for learner clarity (proper nouns, compound concepts together)
- [ ] No unhelpful single-word mappings (لَا alone, أَنْ alone, etc.)

## Validation

After creating mappings, recommend user run:
```bash
python3 scripts/validate_mappings.py <BOOK> <CHAPTER>
```

See `.claude/skills/bible-word-mapper.md` for full technical instructions.

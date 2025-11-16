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

## Critical Semantic Rules

### Phrase Grouping - KEEP TOGETHER

These multi-word constructions must be mapped as single units:

| Arabic | English | Why group? |
|--------|---------|-----------|
| إِلّا إِذَا | "unless" or "except if" | Conditional exception phrase |
| غَيْرَ أَنَّ | "But" or "However" | Adversative conjunction |
| لَا يَقْدِرُ أَحَدٌ | "no one could" | Negation + verb + indefinite |
| لَا يُمْكِنُ أَحَدٌ | "no one can" | Same pattern |
| مَا دَامَ | "as long as" | Temporal phrase |
| بِمَا أَنَّ | "since" or "because" | Causal conjunction |
| حَتَّى لَوْ | "even if" | Concessive phrase |
| عَلَى الرَّغْمِ مِنْ | "despite" | Prepositional phrase |

### Prepositions - CORRECT MEANINGS

**NEVER confuse these:**

| Arabic | Correct | Wrong |
|--------|---------|-------|
| فِي | "in" | ❌ "of" |
| مِنْ | "from" | (sometimes "of" in genitive) |
| عَلَى | "on/upon" | ❌ "in" |
| إِلَى | "to/toward" | ❌ "for" |
| بِ | "with/by/in" | context-dependent |
| لِ | "to/for" | context-dependent |

### Attached Prefixes - INCLUDE IN WORD

These are attached and should NOT be split off:
- الـ (the) - attached to noun: الْبَيْتِ = "the house"
- وَ (and) - attached: وَقَالَ = "and said"
- فَ (then/so) - attached: فَذَهَبَ = "then he went"

### Common Errors to Avoid

1. **DON'T split negation phrases**:
   - ❌ لَا → "no", أَحَدٌ → "one"
   - ✅ لَا...أَحَدٌ together contribute to "no one"

2. **DON'T mistranslate فِي**:
   - ❌ فِي الْمَجْلِسِ → "of the council"
   - ✅ فِي الْمَجْلِسِ → "in the council"

3. **DON'T separate conditional pairs**:
   - ❌ إِلّا → "unless", إِذَا → "if"
   - ✅ إِلّا إِذَا → "unless"

4. **DON'T leave words unmapped**:
   - Every Arabic word/phrase must have a mapping
   - Check that positions cover entire verse (except spaces/punctuation)

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
- [ ] Phrases grouped correctly (idioms stay together)
- [ ] Prepositions translated accurately (فِي = "in", not "of")
- [ ] Negations handled properly (لَا...أَحَدٌ = "no one")

## Validation

After creating mappings, recommend user run:
```bash
python3 scripts/validate_mappings.py <BOOK> <CHAPTER>
```

See `.claude/skills/bible-word-mapper.md` for full technical instructions.

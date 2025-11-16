# Bible Word Mapping Workflow

This document explains how to generate Arabic-English word mappings for Bible chapters using Claude Code agents.

## Quick Start

```bash
/map-bible-chapters JHN 1,2,3,4,5
```

This launches 5 parallel agents to map John chapters 1-5.

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Slash Command │ --> │  Claude Agents   │ --> │  Python Script  │
│  (orchestrator) │     │ (semantic match) │     │ (position calc) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                        │
         │                       │                        │
         v                       v                        v
   Parses input            Reads verses              Calculates exact
   Launches agents         Creates word pairs        character positions
   in parallel             [ar, en] format           Saves to JSON
```

### Components

1. **Slash Command** (`.claude/commands/map-bible-chapters.md`)
   - User-facing interface
   - Parses book and chapter arguments
   - Launches parallel agents with detailed instructions

2. **Claude Agents** (`general-purpose` type)
   - Read chapter JSON files
   - Perform semantic Arabic-English matching
   - Output word pairs in simple format: `[["arabic", "english"], ...]`
   - Call Python script to save results

3. **Python Script** (`scripts/save_verse_mapping.py`)
   - Handles file I/O
   - Calculates exact character positions (start/end indices)
   - Validates mappings
   - Saves to correct directory structure

---

## Data Structure

### Input: Bible Text
Location: `bible-translations/unified/{BOOK}/{CHAPTER}.json`

```json
{
  "1": {
    "en": "In the beginning was the Word...",
    "ar": "فِي الْبَدْءِ كَانَ الْكَلِمَةُ..."
  },
  "2": {
    "en": "He was with God...",
    "ar": "هَذَا كَانَ فِي الْبَدْءِ..."
  }
}
```

### Output: Word Mappings
Location: `bible-translations/mappings/{BOOK}/{CHAPTER}.json`

```json
{
  "book": "JHN",
  "chapter": 1,
  "verses": {
    "1": {
      "ar": "فِي الْبَدْءِ كَانَ الْكَلِمَةُ...",
      "en": "In the beginning was the Word...",
      "mappings": [
        { "ar": "فِي", "en": "In", "start": 0, "end": 2 },
        { "ar": "الْبَدْءِ", "en": "the beginning", "start": 4, "end": 10 },
        { "ar": "كَانَ", "en": "was", "start": 12, "end": 16 }
      ]
    }
  }
}
```

---

## Step-by-Step Process

### 1. Run the Command
```bash
/map-bible-chapters BOOK CHAPTERS
```

Examples:
- `/map-bible-chapters JHN 1` - Single chapter
- `/map-bible-chapters MRK 1,2,3,4,5` - Multiple chapters
- `/map-bible-chapters PSA 1,23,119` - Non-sequential chapters

### 2. What the Agents Do

Each agent:

1. **Reads** the chapter file
2. **Analyzes** each verse
3. **Creates word pairs** - matching Arabic words to English meanings
4. **Runs** the Python script with the mappings
5. **Reports** success/errors

Example word pairs created by agent:
```json
{
  "1": [
    ["فِي", "In"],
    ["الْبَدْءِ", "the beginning"],
    ["كَانَ", "was"],
    ["الْكَلِمَةُ،", "the Word"]
  ],
  "2": [
    ["هَذَا", "He"],
    ["كَانَ", "was"],
    ["فِي", "with"],
    ["الْبَدْءِ", "the beginning"]
  ]
}
```

### 3. Python Script Execution

Agent runs:
```bash
python scripts/save_verse_mapping.py JHN 1 --chapter '{"1": [["فِي", "In"], ...], ...}'
```

Script automatically:
- Finds each Arabic word in the original text
- Records start/end character positions
- Validates positions are correct
- Saves to `bible-translations/mappings/JHN/1.json`

---

## Customizing the Workflow

### Changing Agent Type

In `.claude/commands/map-bible-chapters.md`, modify:
```
subagent_type: "general-purpose"
```

Options:
- `general-purpose` - Best for flexible tasks (recommended)
- `ai-engineer` - Good for language/NLP tasks
- `prompt-engineer` - Optimized for text processing

### Adjusting Mapping Guidelines

Edit the "Guidelines" section in the command to change how agents map words:

```markdown
**Guidelines:**
- Go through Arabic text LEFT-TO-RIGHT
- Match each Arabic word/phrase to its English meaning
- Include punctuation attached to words
- Cover ALL meaningful words
```

Add rules like:
- "Group common phrases together"
- "Keep articles with nouns"
- "Split compound verbs"

### Adding New Common Words

Add to the reference section:
```markdown
## Common Arabic Words
- يَسُوعُ → "Jesus"
- اللهِ → "God"
- NEW_WORD → "translation"
```

### Modifying Output Format

Edit `scripts/save_verse_mapping.py` to change:
- JSON structure
- Validation rules
- File naming
- Additional metadata

---

## Troubleshooting

### Agent Errors

**"File not found"**
- Check book ID exists in `bible-translations/unified/`
- Verify chapter number is correct

**"Word not found in text"**
- Agent may have mistyped Arabic word
- Check for missing diacritics or punctuation
- Script will show warning but continue

**Session limits**
- Agents may hit token limits on long chapters
- Split into smaller batches: `/map-bible-chapters PSA 1,2,3` then `4,5,6`

### Validation Failures

The Python script validates:
- Word exists in text at specified position
- Positions don't go out of bounds
- Start <= End

Check script output for warnings.

---

## Manual Mapping

For single verses or corrections:

```bash
python scripts/save_verse_mapping.py JHN 1 1 '[["فِي", "In"], ["الْبَدْءِ", "the beginning"]]'
```

This adds/updates verse 1 only.

---

## File Locations

```
LearnArabic/
├── .claude/commands/
│   └── map-bible-chapters.md      # Slash command definition
├── scripts/
│   ├── save_verse_mapping.py      # Position calculator & saver
│   ├── create_bible_mappings.py   # Helper utilities
│   └── generate_verse_mappings.py # Alternative generator
├── bible-translations/
│   ├── unified/                   # Source text (input)
│   │   ├── JHN/
│   │   │   ├── 1.json
│   │   │   └── ...
│   │   └── ...
│   └── mappings/                  # Generated mappings (output)
│       ├── JHN/
│       │   ├── 1.json
│       │   └── ...
│       └── ...
└── docs/
    └── BIBLE_MAPPING_WORKFLOW.md  # This file
```

---

## Performance Notes

- Each agent processes one chapter independently
- Agents run in parallel for speed
- John chapter 1 (51 verses) takes ~2-3 minutes per agent
- Python script is instant (< 1 second)
- Recommended: 3-5 chapters at once to avoid overwhelming system

---

## Future Improvements

1. **Batch validation** - Script to verify all mappings in a book
2. **Coverage report** - Track which words are mapped vs skipped
3. **Consistency checker** - Ensure same Arabic word maps to same English
4. **Reverse lookup** - Find all occurrences of a word across books
5. **Interactive review** - UI to approve/edit mappings before save

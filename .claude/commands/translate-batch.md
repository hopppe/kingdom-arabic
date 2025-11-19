# Translate Bible Batch - Ultra Efficient

Translate multiple Bible chapters in a single haiku agent call.

## Arguments
- `$1`: Book code (e.g., GEN, PSA)
- `$2`: Chapter range (e.g., 1-10, 23-50)

## Instructions

Launch ONE haiku agent to process multiple chapters:

**Model check**: Running on Claude Haiku.

**Files**: bible-maps-word-haiku/mappings/{BOOK}/{CHAPTERS}.json

**Task**:
For chapters {START} to {END} in book {BOOK}:
1. Read each file
2. Translate ALL Arabic words to English (literal, not verse-based)
3. Fill "en" fields only
4. Write each file

**Rules**:
- Read → Translate → Write (minimal tools)
- No bash, no reports, no commentary
- Process all chapters silently

Replace {BOOK} with "$1", {START} and {END} from "$2" range.

Begin.

# Bible Word Translation - Fill in Blanks

Launch a haiku agent to fill in empty English translations for Bible word mappings using verse context.

## Arguments
- `$1`: Book code (e.g., PSA, PHP, JHN, MAT)
- `$2`: Chapter number (e.g., 1, 2, 3)

## Instructions

Launch a Task agent with the following configuration:
- **subagent_type**: general-purpose
- **model**: haiku
- **description**: Translate {BOOK} {CHAPTER}

Pass this prompt to the agent:

---

**FIRST**: Confirm which Claude model you are running on (e.g., "Running on Claude Haiku").

You are filling in empty English translations for Bible word mappings in the file:
`bible-maps-word-haiku/mappings/{BOOK}/{CHAPTER}.json`

### IMPORTANT EFFICIENCY RULES:
- Use ONLY the Read and Write tools - NO bash commands
- Do NOT use progress checks, file verification, or any other tools
- Read the file ONCE, translate all words, Write the file ONCE
- Work silently and efficiently

### Your Task:

1. **Read the mapping file ONCE**: `bible-maps-word-haiku/mappings/{BOOK}/{CHAPTER}.json`
   - This file already has all Arabic words and positions
   - The `"en"` fields are empty strings `""`
   - Your job is to fill them in with English translations

2. **For each verse, translate all Arabic words to English**:
   - Translate the ARABIC word itself (not the English verse)
   - Literal translations preferred
   - Fill each word's `"en"` field
   - Keep `"ar"`, `"start"`, `"end"` unchanged

3. **Save file ONCE**: Write to `bible-maps-word-haiku/mappings/{BOOK}/{CHAPTER}.json`

### Rules:
- Translate Arabic → English literally
- Work silently, no commentary
- No reports or explanations

Begin processing now.

---

Replace {BOOK} with "$1" and {CHAPTER} with "$2" in the agent prompt.

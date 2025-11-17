# Fix Mapping Semantics

Systematically check and fix Arabic-English Bible word mappings by analyzing semantic correctness in context.

## Usage

```
/fix-mapping-semantics <BOOK> <CHAPTER>
```

Example:
```
/fix-mapping-semantics PHP 1
```

## Your Task

You will systematically go through each verse in the chapter, validate the current mappings against both Arabic and English translations, and fix any incorrect mappings.

## Step-by-Step Process

### 1. Load the Data

Read both files:
- **Source text**: `bible-translations/unified/<BOOK>/<CHAPTER>.json`
  - Contains: `{ "1": { "en": "...", "ar": "..." }, "2": { ... } }`
- **Current mappings**: `bible-translations/mappings/<BOOK>/<CHAPTER>.json`
  - Contains: `{ "book": "...", "chapter": ..., "verses": { "1": { "ar": "...", "en": "...", "mappings": [...] } } }`

### 2. Process Each Verse

For EVERY verse in the chapter:

1. **Quick scan the mappings** - Do they look reasonable at a glance?
2. **Check for red flags** - Any obvious drift? (verb→preposition, wrong nouns)
3. **If looks OK → KEEP IT** - Don't overthink, move to next verse
4. **If clear errors → FIX IT** - Only fix the broken parts

**Goal: Correspondence, not perfect literal translation.**

When a learner taps النِّعْمَةُ and sees "Grace", that's what matters - they learn this word means grace. Whether it's "the grace" or just "grace" doesn't matter. What DOES matter is that النِّعْمَةُ doesn't show "to you" (which is what broken mappings do).

### 3. Validation Criteria

**IMPORTANT: Don't over-correct! Most mappings are probably fine.**

A mapping is CORRECT (KEEP IT) if:
- The Arabic word/phrase corresponds to the English in the translation
- It makes sense in context - even if not perfectly literal
- A learner would understand the relationship
- The word types roughly match (noun→noun, verb→verb)

**Examples of FINE mappings to KEEP:**
- فِي → "of" (even though فِي literally means "in", translation uses "of")
- عَلَى → "for" (preposition flexibility is normal)
- الْقِدِّيسِينَ → "God's holy people" (good semantic grouping)
- لِتَكُنْ لَكُمُ → "to you" (grouping implicit words is fine)

A mapping is WRONG (FIX IT) only if:
- **Clear sequential drift** - words paired by position without understanding
- **Type mismatch** - Arabic verb mapped to English article/preposition
- **Wrong content word** - اللهِ (God) mapped to "Father", يَسُوعَ (Jesus) mapped to "Christ"
- **Particles to nouns** - إِلّا (except) mapped to "the cross"
- **Would confuse learners** - النِّعْمَةُ (grace) showing "to you"

### 4. How to Fix a Mapping

When you find incorrect mappings, create new ones by:

1. **Identify all Arabic words/phrases** (work left-to-right)
2. **For each Arabic word/phrase**, find what it corresponds to in the English
3. **Track character positions** (start and end indices)
4. **Group when helpful** for learner clarity (proper nouns, compound concepts)

#### Arabic Word Identification Guide

**Verbs** (must map to verbs/verb phrases):
- Past: فَعَلَ pattern - قَالَ (said), جَاءَ (came), أَحَبَّ (loved)
- Present: يَفْعَلُ pattern - يَقُولُ (says), يَجِيءُ (comes)
- أَفْتَخِرَ (I boast) - NEVER maps to "in" or "the"

**Nouns** (must map to nouns/noun phrases):
- With الـ: الله (God), الْعَالَم (the world), الصَّلِيبِ (the cross)
- Proper names: يَسُوعُ (Jesus), الْمَسِيحُ (Christ), بُولُسُ (Paul)

**Particles/Function Words**:
- إِنَّ/أَنَّ - "that/indeed" (NEVER a noun)
- لأَنَّ - "because/for" (NEVER a noun)
- إِلّا - "except/unless" (NEVER "the cross")
- لَا - "not/no"
- وَ - "and"
- فَ - "then/so"

**Prepositions**:
- فِي - "in/at/among"
- مِنْ - "from/of"
- إِلَى - "to/toward"
- عَلَى - "on/upon"
- بِ - "by/with"
- لِ - "to/for"

**Pronouns**:
- لِي - "for me"
- لَكُمْ - "to you"
- هُوَ - "he"
- نَحْنُ - "we"

### 5. Output Format

Save the fixed mappings to the same file:
`bible-translations/mappings/<BOOK>/<CHAPTER>.json`

```json
{
  "book": "<BOOK>",
  "chapter": <CHAPTER>,
  "verses": {
    "1": {
      "ar": "Arabic text from unified file...",
      "en": "English text from unified file...",
      "mappings": [
        { "ar": "word", "en": "translation", "start": 0, "end": 4 },
        ...
      ]
    },
    "2": {
      ...
    }
  }
}
```

## Common Error Patterns to Fix

### Sequential Drift (Most Common)

**WRONG** (Galatians 6:14):
```
Arabic: أَمَّا أَنَا فَحَاشَا لِي أَنْ أَفْتَخِرَ إِلّا بِصَلِيبِ
English: May I never boast except in the cross

أَمَّا → "May" ❌ (means "as for")
فَحَاشَا → "never" ❌ (means "far be it")
لِي → "boast" ❌ (means "for me")
أَفْتَخِرَ → "in" ❌ (means "I boast")
إِلّا → "the cross" ❌ (means "except")
```

**CORRECT**:
```
أَمَّا أَنَا فَحَاشَا لِي أَنْ أَفْتَخِرَ → "May I never boast"
إِلّا → "except"
بِصَلِيبِ → "in the cross"
```

### Word Splitting Errors

**WRONG**:
```
فِ → "in"
ي → "the"
```

**CORRECT**:
```
فِي → "in"
```

Arabic characters should not be split mid-word.

### Proper Noun Confusion

**WRONG** (Romans 1:4):
```
إِنَّهُ → "Jesus" ❌ (means "He is")
يَسُوعُ → "Christ" ❌ (means "Jesus")
الْمَسِيحُ → "our" ❌ (means "Christ")
```

**CORRECT**:
```
إِنَّهُ → "He is" or group with יَسُوعُ
يَسُوعُ → "Jesus"
الْمَسِيحُ → "Christ"
```

## Processing Report

As you process each verse, track:

1. **Verse number**
2. **Status**: KEPT (mappings were correct) or FIXED (mappings were corrected)
3. **Issues found** (if any)
4. **Changes made** (if any)

After processing all verses, provide:

```
## Summary for <BOOK> Chapter <CHAPTER>

- Total verses: X
- Verses kept as-is: Y (Z%)
- Verses fixed: A (B%)
- Common issues: [list]

### Verses Fixed:
- Verse 1: [what was wrong, what was fixed]
- Verse 4: [what was wrong, what was fixed]
...
```

## Quality Checklist

Before saving, verify each verse:
- [ ] All Arabic text is covered (no unmapped words)
- [ ] Positions are sequential (no gaps, no overlaps)
- [ ] Start position = character index in Arabic string
- [ ] End position = start + length of Arabic text
- [ ] Each Arabic word actually means its mapped English (semantic correctness)
- [ ] Verbs map to verbs, nouns to nouns, particles to particles
- [ ] No sequential drift (position-based pairing without understanding)

## Important Notes

- **Be conservative** - If it looks reasonable, it probably is. Don't fix what isn't broken.
- **Match the translation** - Your job is to show how THIS Arabic text corresponds to THIS English translation
- **Translation differences are OK** - Prepositions, word order, implicit words - all normal translation variation
- **Trust the context** - If the mapping makes sense when you read both texts, keep it
- **Only fix clear errors** - Sequential drift where verb→preposition, noun→wrong noun, particle→content word
- **Preserve what works** - Most mappings are likely fine. Only change obvious mistakes.
- **Group for clarity** - Proper nouns and compound concepts stay together
- **Simple is good** - Sometimes just putting the translation is exactly right, even if not literal

## Parallel Processing for Speed

To fix multiple chapters quickly, launch parallel agents:

### Fix Multiple Chapters in Parallel

```
/fix-mapping-semantics PHP 1,2,3,4
```

When given multiple chapters (comma-separated), launch a Task agent for EACH chapter simultaneously:

```javascript
// Launch all agents in parallel (single message with multiple tool calls)
Task(subagent_type="general-purpose", prompt="Fix PHP Chapter 1 mappings using /fix-mapping-semantics PHP 1")
Task(subagent_type="general-purpose", prompt="Fix PHP Chapter 2 mappings using /fix-mapping-semantics PHP 2")
Task(subagent_type="general-purpose", prompt="Fix PHP Chapter 3 mappings using /fix-mapping-semantics PHP 3")
Task(subagent_type="general-purpose", prompt="Fix PHP Chapter 4 mappings using /fix-mapping-semantics PHP 4")
```

### Fix Entire Book in Parallel

```
/fix-mapping-semantics PHP all
```

When "all" is specified:
1. First, list all chapter files in `bible-translations/mappings/<BOOK>/`
2. Launch a parallel agent for each chapter (up to 10-15 at a time for efficiency)
3. Each agent processes one chapter independently

Example for Philippians (4 chapters):
```
Launch 4 agents simultaneously:
- Agent 1: Fix PHP Chapter 1
- Agent 2: Fix PHP Chapter 2
- Agent 3: Fix PHP Chapter 3
- Agent 4: Fix PHP Chapter 4
```

### Batch Processing Multiple Books

For processing multiple problematic books:

```
/fix-mapping-semantics ROM,PHP,GAL all
```

1. For each book, determine number of chapters
2. Launch agents for each chapter across all books
3. Maximize parallelism (e.g., 10+ agents at once)

### Performance Tips

- **Parallel agents are stateless** - Each gets its own context
- **No dependencies between chapters** - Perfect for parallelization
- **Include full instructions** in each agent prompt
- **Collect results** - Each agent reports back what it fixed
- **Verify after** - Run validation script on entire book when done

### Example Agent Prompt

When launching a parallel agent, include:
```
Fix the Arabic-English mappings for <BOOK> Chapter <CHAPTER>.

1. Read unified translations from: bible-translations/unified/<BOOK>/<CHAPTER>.json
2. Read current mappings from: bible-translations/mappings/<BOOK>/<CHAPTER>.json
3. For each verse, validate Arabic words actually mean their mapped English
4. Fix any sequential drift or semantic errors
5. Save corrected mappings back to the same file
6. Report: number of verses fixed, common issues found

Key rules:
- Verbs must map to verbs (not prepositions)
- يَسُوعُ must map to "Jesus" (not "Christ" or other)
- الْمَسِيحُ must map to "Christ/Messiah" (not "our" or other)
- إِلّا means "except" (not "the cross")
- No sequential word-for-word pairing
```

## After Fixing

Recommend running validation:
```bash
python3 scripts/validate_mappings.py <BOOK> <CHAPTER>
```

This checks technical validity (positions, overlaps) after semantic fixes are complete.

For entire book:
```bash
# Check all chapters
for i in {1..4}; do python3 scripts/validate_mappings.py PHP $i; done
```

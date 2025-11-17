# Semantic Mapping Validator

Validate Arabic-English Bible word mappings by analyzing semantic correctness in context.

## Usage

```
/validate-mapping-semantics <BOOK> [SAMPLE_SIZE]
```

Example:
```
/validate-mapping-semantics ROM 20
```

## Your Task

You are validating whether Arabic words are correctly mapped to their English counterparts. This requires UNDERSTANDING Arabic, not pattern matching.

**CRITICAL**: You must actually READ and UNDERSTAND the Arabic text, not just check if specific keywords appear.

## What Makes a Mapping GOOD vs BAD

### GOOD Mapping (John 3:16)
```
Arabic: لأَنَّهُ هكَذَا أَحَبَّ اللهُ الْعَالَمَ
English: For God so loved the world

Mappings:
- لأَنَّهُ → "For" ✅ (لأَنَّ means "because/for")
- هكَذَا → "so" ✅ (means "thus/so")
- أَحَبَّ → "loved" ✅ (verb form فَعَّلَ = "he loved")
- اللهُ → "God" ✅ (means "God")
- الْعَالَمَ → "the world" ✅ (means "the world")
```

Each Arabic word ACTUALLY MEANS what it's mapped to.

### BAD Mapping (Galatians 6:14)
```
Arabic: أَمَّا أَنَا فَحَاشَا لِي أَنْ أَفْتَخِرَ إِلّا بِصَلِيبِ
English: May I never boast except in the cross

Mappings:
- أَمَّا → "May" ❌ (means "as for", not "May")
- فَحَاشَا → "never" ❌ (means "far be it", not "never")
- لِي → "boast" ❌ (means "for me", not "boast")
- أَفْتَخِرَ → "in" ❌ (means "I boast", not "in")
- إِلّا → "the cross" ❌ (means "except", not "the cross")
```

This is SEQUENTIAL WORD-FOR-WORD pairing without understanding. The AI just matched Arabic word 1 to English word 1, word 2 to word 2, etc.

## How to Validate a Verse

### Step 1: Read the Arabic Text
Actually understand what the Arabic says. Key things to identify:
- **Verbs**: Look for patterns like فَعَلَ (he did), يَفْعَلُ (he does), فَعَّلَ (he caused to do)
- **Nouns**: Often have الـ prefix (the), case endings (ـُ, ـِ, ـَ)
- **Prepositions**: فِي (in), مِنْ (from), إِلَى (to), عَلَى (on), بِ (by/with), لِ (to/for)
- **Conjunctions**: وَ (and), فَ (then/so), لأَنَّ (because), أَنَّ (that), إِنَّ (indeed)
- **Pronouns**: هُوَ (he), هِيَ (she), أَنَا (I), أَنْتَ (you), نَحْنُ (we), هُمْ (they)
- **Particles**: لَا (not), أَنْ (to), إِلّا (except), قَدْ (already/indeed)

### Step 2: Read the English Translation
Understand the English sentence structure and meaning.

### Step 3: Check Each Mapping
For each Arabic word/phrase mapped to English:
1. **Does the Arabic word actually mean this English word?**
   - Not "is it close enough" but "does it actually mean this"
2. **Is the word TYPE correct?**
   - Arabic verb → English verb (or verb phrase)
   - Arabic noun → English noun (or noun phrase)
   - Arabic preposition → English preposition/function word
3. **Does it make sense in context?**
   - Would a learner understand the Arabic correctly from this mapping?

### Step 4: Identify Error Patterns

**Sequential Drift** (Most Common Error):
When Arabic and English have different sentence structures, bad mappings just pair words in order:
```
Arabic word 1 → English word 1
Arabic word 2 → English word 2
Arabic word 3 → English word 3
```
This fails when word order differs.

**Signs of Sequential Drift:**
- Prepositions mapped to nouns (إِلّا → "the cross")
- Verbs mapped to prepositions (أَفْتَخِرَ → "in")
- Nouns mapped to wrong nouns (يَسُوعَ → "Christ" when both Jesus and Christ appear)
- Particles mapped to content words (أَنْ → "except")

**Pronoun vs Proper Noun:**
- If Arabic says يَسُوعَ (Jesus) but mapping shows "him", check English
- If English ALSO says "Jesus", then يَسُوعَ must map to "Jesus", not "him"
- If English says "him" (no "Jesus"), then يَسُوعَ → "him" is correct (translation difference)

## Arabic Linguistic Patterns to Check

### Verb Forms
- **فَعَلَ** (fa'ala) - Past tense: قَالَ (said), جَاءَ (came), أَحَبَّ (loved)
- **يَفْعَلُ** (yaf'alu) - Present: يَقُولُ (says), يَجِيءُ (comes)
- **فَعَّلَ** (fa''ala) - Causative: عَلَّمَ (taught)
- **أَفْعَلَ** (af'ala) - Causative: أَرْسَلَ (sent)

If an Arabic verb form is mapped to a preposition or article, that's WRONG.

### Noun Patterns
- Definite nouns have الـ: الله (God), الْعَالَم (the world)
- Genitive constructions: X الـ Y = "X of Y" or "Y's X"
  - ابْنِ اللهِ = "Son of God" (literally "son of-the-God")
- Plural patterns: مُؤْمِنِينَ (believers), رُسُل (apostles)

If a definite noun is mapped to a verb or preposition, that's WRONG.

### Sentence Structure
Arabic is typically VSO (Verb-Subject-Object):
- Arabic: قَالَ يَسُوعُ... (Said Jesus...)
- English: Jesus said...

The mappings should account for this reordering. If they don't, and just pair sequentially, you'll see errors.

## Validation Report Format

For each verse analyzed, report:

```
### [BOOK] [CHAPTER]:[VERSE] - [RATING]

**Arabic**: [Full Arabic text]
**English**: [Full English text]

**Analysis**:
- Verse structure: [VSO/other pattern in Arabic]
- Key elements: [Main verbs, nouns, particles identified]

**Mapping Check**:
- [Arabic word] → [English mapping] - [CORRECT/WRONG] - [Why]
- [Arabic word] → [English mapping] - [CORRECT/WRONG] - [Why]
...

**Overall**: [GOOD/MIXED/BAD]
**Issues Found**: [List specific problems]
**Would Mislead Learners**: [Yes/No and how]
```

## Rating Scale

- **GOOD**: All or nearly all mappings are semantically correct. Learners will understand Arabic correctly.
- **MIXED**: Some mappings correct, some wrong. Partially helpful but has errors.
- **BAD**: Multiple incorrect mappings. Would teach wrong Arabic.
- **TERRIBLE**: Complete sequential drift. Almost every word is wrong.

## Sampling Strategy

When validating a book:

1. **Sample across chapters**: Don't just check chapter 1
2. **Sample different verse types**:
   - Narrative (Jesus said...)
   - Theological discourse (For God so loved...)
   - Lists/genealogies
   - Direct speech
3. **Check longer verses**: More likely to have drift issues
4. **Check verses with complex Arabic structures**: Embedded clauses, relative pronouns, etc.

## Final Report

After sampling, provide:

1. **Overall Book Quality**: GOOD / MIXED / BAD
2. **Percentage of verses with issues**: Estimate based on sample
3. **Common error patterns**: What types of mistakes appear
4. **Specific verses needing fixes**: List exact references
5. **Recommendation**: Safe to use / Needs remapping / Needs spot fixes

## Important Notes

- **Translation differences are OK**: If Arabic says "Jesus" but English translation uses "Lord", mapping يَسُوعَ → "Lord" is correct for that translation
- **Flexible prepositions are OK**: فِي can mean "in/at/among/by" depending on context
- **Sequential drift is NOT OK**: When words are just paired in order without semantic correspondence
- **You must know Arabic**: This validation requires understanding Arabic morphology and syntax, not just pattern matching

## Example Validation

```
### ROM 1:4 - TERRIBLE

**Arabic**: وَمِنْ نَاحِيَةِ رُوحِ الْقَدَاسَةِ، تَبَيَّنَ بِقُوَّةٍ أَنَّهُ ابْنُ اللهِ بِالْقِيَامَةِ مِنْ بَيْنِ الأَمْوَاتِ. إِنَّهُ يَسُوعُ الْمَسِيحُ رَبُّنَا

**English**: and who through the Spirit of holiness was appointed the Son of God in power by his resurrection from the dead: Jesus Christ our Lord.

**Analysis**:
The Arabic ends with "إِنَّهُ يَسُوعُ الْمَسِيحُ رَبُّنَا" which means "He is Jesus the Christ our Lord".
The English ends with "Jesus Christ our Lord".

**Mapping Check**:
- إِنَّهُ → "Jesus" - WRONG - إِنَّهُ means "Indeed he is" or "He is", not "Jesus"
- يَسُوعُ → "Christ" - WRONG - يَسُوعُ means "Jesus", not "Christ"
- الْمَسِيحُ → "our" - WRONG - الْمَسِيحُ means "the Christ/Messiah", not "our"
- رَبُّنَا → "Lord" - PARTIALLY CORRECT - رَبُّنَا means "our Lord"

**Overall**: TERRIBLE
**Issues Found**: Complete sequential drift at end of verse. Arabic has "He is Jesus Christ" but algorithm paired words in sequence.
**Would Mislead Learners**: YES - Learner would think يَسُوعُ means "Christ" (wrong) and الْمَسِيحُ means "our" (wrong)
```

## When Done

Provide:
1. Summary of findings
2. List of verses that need remapping (exact references)
3. Assessment of whether the book is safe to use or needs work
4. Recommendation for next steps

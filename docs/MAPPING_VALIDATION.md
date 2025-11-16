# Bible Mapping Validation Guide

This document describes the validation system for Arabic-English word mappings.

## Overview

The validation system checks three aspects of mapping quality:
1. **Technical accuracy** - positions match actual text, no gaps or overlaps
2. **Semantic correctness** - translations are accurate and phrases grouped properly
3. **Coverage completeness** - all Arabic words are mapped

## Validation Tools

### 1. Automated Technical Validation

```bash
python3 scripts/validate_mappings.py <BOOK> <CHAPTER>
```

**What it checks:**
- Position accuracy: `start`/`end` match actual Arabic substring
- Coverage: No unmapped Arabic words (except spaces/punctuation)
- Order: Mappings are sequential (no overlaps)
- Consistency: Known words have expected translations

**Example output:**
```
MRK Chapter 2:
  Verses with issues: 1/28
    unmapped_gap: 1 occurrences
      v21: Gap ' تَنْكَمِشُ ' not mapped
```

### 2. Visual Spot-Check

```bash
python3 scripts/spot_check_mappings.py <BOOK> <CHAPTER> [VERSE]
```

**What it shows:**
- Side-by-side Arabic and English text
- Each mapping with position verification
- Coverage analysis with gap detection
- Visual ✓ or ✗ for position matches

**Example:**
```bash
# Random sample of 3 verses
python3 scripts/spot_check_mappings.py JHN 3

# Check specific verse
python3 scripts/spot_check_mappings.py JHN 3 16

# More random samples
python3 scripts/spot_check_mappings.py MRK 1 random
```

### 3. Semantic Review Prompt Generator

```bash
python3 scripts/semantic_review_prompt.py <BOOK> <CHAPTER> [NUM_VERSES]
```

Generates a structured prompt for LLM-based semantic review. Copy the output and paste into Claude to verify:
- Arabic words actually mean their English translations
- Phrases are grouped correctly
- Prepositions are translated accurately

### 4. Integrated Validation Command

```
/validate-bible-mappings <BOOK> <CHAPTER>
```

Runs both technical and semantic validation, providing:
- Technical issue report
- Semantic accuracy review
- Phrase grouping analysis
- Suggested fixes

## Issue Types

### Technical Issues

| Issue Type | Description | Example |
|------------|-------------|---------|
| `position_mismatch` | Start/end don't match Arabic text | Expected "يَسُوعَ" but got "يَسُو" |
| `unmapped_gap` | Arabic word not covered | Gap 'الْبَيْتِ' not mapped |
| `overlap` | Mappings overlap in position | Two mappings cover same characters |
| `out_of_order` | Mappings not sequential | Mapping 5 starts before mapping 4 ends |
| `empty_translation` | English translation is empty | Arabic word has no translation |

### Semantic Issues

| Issue Type | Description | Example |
|------------|-------------|---------|
| Wrong preposition | فِي translated as "of" | فِي = "in", NOT "of" |
| Split phrase | Idiom broken into parts | إِلّا إِذَا split as "unless" + "if" |
| Wrong meaning | Arabic doesn't mean English | غَيْرَ → "Now" (should be "But/However") |
| Missing context | Single word doesn't make sense | لَا alone instead of with verb |

## Common Semantic Errors

### Phrases That MUST Stay Together

```
إِلّا إِذَا     → "unless" (NOT "unless" + "if")
غَيْرَ أَنَّ      → "But/However" (NOT "Now" + "that")
لَا يَقْدِرُ أَحَدٌ → "no one could" (negation phrase)
مَا دَامَ        → "as long as"
حَتَّى لَوْ      → "even if"
بِمَا أَنَّ      → "since/because"
```

### Preposition Accuracy

```
فِي  = "in"        ❌ NEVER "of"
مِنْ  = "from"      (sometimes "of" in genitive)
عَلَى = "on/upon"   ❌ NEVER "in"
إِلَى = "to/toward" ❌ NEVER "for"
```

### Negation Handling

Arabic negation often spans multiple words:
```
لَا يَقْدِرُ أَحَدٌ = "no one could"
لَا يُمْكِنُ        = "cannot"
لَا...أَحَدٌ       = "no one"
```

Don't split these as separate words with partial meanings.

## Validation Workflow

### After Creating Mappings

1. **Run technical validation**:
   ```bash
   python3 scripts/validate_mappings.py MRK 6
   ```
   Fix any position mismatches or gaps.

2. **Spot-check random verses**:
   ```bash
   python3 scripts/spot_check_mappings.py MRK 6
   ```
   Visually verify mappings look correct.

3. **Semantic review** (for important chapters):
   ```
   /validate-bible-mappings MRK 6
   ```
   Have Claude verify translations are accurate.

### Batch Validation

Validate an entire book:
```bash
python3 scripts/validate_mappings.py MRK
```

This will report issues across all chapters with a summary.

## Fixing Issues

### Position Mismatch
Recalculate character positions by counting from start of Arabic string.

### Unmapped Gap
Add a mapping for the missing Arabic word. Ensure positions are continuous.

### Wrong Preposition
Edit the English translation:
- فِي الْمَجْلِسِ → "in the council" (not "of the council")

### Split Phrase
Combine the mappings:
```json
// WRONG
{ "ar": "إِلّا", "en": "unless", "start": 0, "end": 5 },
{ "ar": "إِذَا", "en": "if", "start": 6, "end": 11 }

// CORRECT
{ "ar": "إِلّا إِذَا", "en": "unless", "start": 0, "end": 11 }
```

## Quality Standards

A good mapping should:
- ✅ Cover 100% of Arabic words (no unmapped content)
- ✅ Have accurate character positions
- ✅ Use correct preposition translations
- ✅ Group semantic phrases together
- ✅ Provide meaningful translations for learners

## File Locations

- **Validation scripts**: `scripts/validate_mappings.py`, `scripts/spot_check_mappings.py`
- **Mapping data**: `bible-translations/mappings/<BOOK>/<CHAPTER>.json`
- **Source text**: `bible-translations/unified/<BOOK>/<CHAPTER>.json`
- **Validation command**: `.claude/commands/validate-bible-mappings.md`

# Validate Bible Mappings

Comprehensive validation of Arabic-English word mappings for a Bible chapter.

## Usage

```
/validate-bible-mappings <BOOK> <CHAPTER>
```

Examples:
```
/validate-bible-mappings JHN 3
/validate-bible-mappings MRK 1
/validate-bible-mappings MAT 5
```

## Task Instructions

When this command is invoked, perform these steps:

### 1. Run Technical Validation

Execute the validation script:
```bash
python3 scripts/validate_mappings.py <BOOK> <CHAPTER>
```

Report:
- Total verses and verses with issues
- Issue types found (position_mismatch, unmapped_gap, etc.)
- Specific examples of problems

### 2. Load the Mapping File

Read: `bible-translations/mappings/<BOOK>/<CHAPTER>.json`

Extract first 5-10 verses for semantic review.

### 3. Semantic Analysis

**IMPORTANT**: You're mapping between TWO EXISTING TRANSLATIONS, not creating literal translations. The Arabic Bible and English Bible are independent translations. Focus on:

For each verse in the sample, check:

**A. Mapping Correspondence**
- Does the Arabic segment correspond to the English segment in meaning/position?
- Example: If English says "of the council", map فِي to "of" even though فِي literally means "in"
- The goal: When user taps Arabic word, they see what it corresponds to in the English translation

**B. Phrase Grouping for Clarity**
- Group when single words don't help the learner:
  - بُحَيْرَةِ الْجَلِيلِ → "Sea of Galilee" (proper noun)
  - ابْنِ اللهِ → "Son of God" (compound concept)
- BUT: Can split if individual words are clear:
  - فِي → "in", الْبَيْتِ → "the house" (both understandable alone)

**C. Learner Usefulness**
- Will tapping this word show something helpful?
- Avoid: لَا → "no" (meaningless alone)
- Better: لَا أَحَدَ → "no one" (complete concept)

**D. Coverage Alignment**
- Do the mappings cover the full Arabic verse?
- Do they account for the full English verse?
- Some words may not have direct counterparts (that's OK)

### 4. Generate Report

Format your findings as:

```markdown
## Technical Validation Results

**File**: bible-translations/mappings/<BOOK>/<CHAPTER>.json
**Total verses**: X
**Verses with issues**: Y

### Technical Issues Found
- [List specific issues with verse numbers]

## Semantic Analysis (Sample of N verses)

### Verse X
✓ All mappings correct
OR
⚠️ Issues found:
- Mapping N: [Arabic] → [English]
  - Problem: [description]
  - Fix: [suggested correction]

### Phrase Grouping Problems
- [List any split idioms or incorrectly grouped phrases]

### Mapping Clarity Issues
- [List any mappings that won't help the learner]

## Summary

- Technical issues: X
- Semantic issues: Y
- Overall quality: [Excellent/Good/Needs Review/Poor]

## Recommended Actions
- [List specific fixes needed]
```

### 5. Offer Fixes

If issues are found, ask:
> "I found X issues. Would you like me to fix them automatically?"

If user agrees:
- Use Edit tool to correct mappings
- Recalculate positions if needed
- Combine split phrases
- Fix preposition translations

### 6. Re-validate

After fixes, run validation again to confirm all issues resolved:
```bash
python3 scripts/validate_mappings.py <BOOK> <CHAPTER>
```

## Quick Reference

### Must-Group Phrases
| Arabic | English |
|--------|---------|
| إِلّا إِذَا | "unless" |
| غَيْرَ أَنَّ | "But/However" |
| لَا يَقْدِرُ أَحَدٌ | "no one could" |
| مَا دَامَ | "as long as" |
| حَتَّى لَوْ | "even if" |

### Mapping Strategy
- Match Arabic to corresponding English in the translation
- Group for learner clarity, not linguistic purity
- Cover all Arabic words (some English words may not have Arabic counterparts)
- Focus on: "Is this helpful when tapped?"

### Anchor Words
- يَسُوعَ/يَسُوعُ = "Jesus"
- اللهِ/اللهُ = "God"
- الرَّبِّ = "the Lord"
- الْمَسِيحِ = "Christ/Messiah"

## Important Notes

- Always run technical validation first (fastest)
- Semantic review catches meaning errors automation misses
- Focus on user experience: will tapping this word show helpful translation?
- Document any recurring issues to improve the mapping command

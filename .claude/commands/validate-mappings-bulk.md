# Bulk Validate Bible Mappings

Validate word mappings for multiple books or all mapped books at once.

## Usage

```
/validate-mappings-bulk [BOOKS...]
/validate-mappings-bulk --all
```

Examples:
```
/validate-mappings-bulk MRK JHN MAT LUK
/validate-mappings-bulk --all
/validate-mappings-bulk ACT ROM 1CO 2CO GAL EPH
```

## Task Instructions

When this command is invoked:

### 1. Determine Scope

- If `--all` is specified, validate all books in `bible-translations/mappings/`
- Otherwise, validate the specified books

### 2. Run Technical Validation

Execute the validation script:
```bash
python3 scripts/validate_mappings.py <BOOKS...>
```

Or for all:
```bash
python3 scripts/validate_mappings.py --all
```

### 3. Analyze Results

The script provides:
- Summary of issues per book
- Total issues across all books
- Detailed breakdown by chapter

### 4. Report Findings

Format as:

```markdown
## Bulk Validation Results

**Books validated**: X
**Total issues found**: Y

### Summary by Book (sorted by issues)
| Book | Chapters with Issues | Total Issues |
|------|---------------------|--------------|
| MAT  | 28/28               | 23,576       |
| MRK  | 16/16               | 8,226        |
| JHN  | 21/21               | 1,109        |

### Issue Type Breakdown
- position_mismatch: Most common - indicates character position calculation errors
- unmapped_gap: Arabic words not covered by mappings
- potentially_unhelpful: Single words that may not help learners

### Priority Actions
1. [Book with most issues] - Needs remapping
2. [Books with many unmapped_gap] - Missing words
3. [Books with potentially_unhelpful] - Consider regrouping phrases
```

### 5. Recommend Next Steps

Based on findings:
- **Many position_mismatch**: Likely need to recalculate positions or remap chapter
- **Many unmapped_gap**: Add missing word mappings
- **Many potentially_unhelpful**: Regroup single words into phrases
- **Clean books**: Mark as validated

### 6. Offer Targeted Fixes

If user wants to fix issues:
```
Would you like me to:
1. Deep-dive into the worst book (MAT)?
2. Fix unmapped gaps in specific chapters?
3. Remap chapters with position errors?
4. Review potentially unhelpful mappings?
```

## Quick Commands

```bash
# Validate single book
python3 scripts/validate_mappings.py MRK

# Validate multiple books
python3 scripts/validate_mappings.py MRK JHN MAT LUK

# Validate ALL mapped books
python3 scripts/validate_mappings.py --all

# Get just the summary (pipe to head)
python3 scripts/validate_mappings.py --all 2>&1 | head -30
```

## Understanding Results

### Position Mismatch
```
Expected 'هَذِهِ' but got 'هَذِه'
```
The start/end positions don't extract the expected Arabic text. Often caused by:
- Diacritic (harakat) counting issues
- Wrong character offset calculation
- Copy/paste errors in original mapping

### Unmapped Gap
```
Gap ' تَنْكَمِشُ ' not mapped
```
An Arabic word was skipped during mapping. The learner won't be able to tap this word.

### Potentially Unhelpful
```
لَا → "no"
```
A single Arabic word mapped to a translation that doesn't help learners understand. Consider grouping with adjacent words.

## NT Books Reference

```
Gospels:     MAT MRK LUK JHN
History:     ACT
Paul:        ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM
General:     HEB JAS 1PE 2PE 1JN 2JN 3JN JUD
Prophecy:    REV
```

Example - validate all Paul's letters:
```bash
python3 scripts/validate_mappings.py ROM 1CO 2CO GAL EPH PHP COL
```

# Bible Word Mapping Status

## Overview

Creating word-level Arabic-English mappings for the entire Bible using Gemma 3 (12b) via Ollama.

---

## Scripts

### 1. **Generation Scripts** (Create new mappings)

#### `regenerate_mappings_gemma3.py`
- **Purpose**: Generate word mappings for New Testament
- **Books**: Matthew, Mark, Luke, John, Acts, Romans, 1-2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1-2 Thessalonians, 1-2 Timothy, Titus, Philemon, Hebrews, James, 1-2 Peter, 1-3 John, Jude, Revelation
- **Total**: 27 books, 260 chapters
- **Status**: ✅ **COMPLETE** (ran earlier)
- **Method**: Fast batch translation (works ~75% of time)
- **Fallback**: Robust numbered chunked method for misaligned verses

#### `regenerate_mappings_ot_gemma3.py`
- **Purpose**: Generate word mappings for Old Testament
- **Books**: All 39 OT books (Genesis → Malachi)
- **Total**: 39 books, 929 chapters
- **Status**: 🔄 **IN PROGRESS** (currently on 1 Kings chapter 1)
  - Completed: ~291 chapters
  - Remaining: ~638 chapters
  - Estimated completion: ~122 hours
- **Method**: Fast batch translation with robust fallback
- **Command**: `caffeinate -i python3 regenerate_mappings_ot_gemma3.py`

---

### 2. **Repair Scripts** (Fix existing misaligned mappings)

#### `repair_shifted_verses.py` ⚡ **FAST**
- **Purpose**: Fix verses missing exactly 1 word (shifted mappings)
- **Strategy**:
  - Detect which word position is missing
  - Translate only the missing word (~5-10 seconds)
  - Reuse all existing translations
- **Speed**: ~5-10 seconds per verse (vs ~50 seconds for full repair)
- **Target**: Verses with exactly 1 missing word
- **Found**: 1,230 verses
- **Status**: ✅ **TESTED** (10/10 success in test run)
- **Estimated time**: ~2-3 hours for all 1,230 verses
- **Command**: `caffeinate -i python3 repair_shifted_verses.py`
- **Resume**: Yes (automatically skips completed verses)

#### `repair_misaligned_verses.py` 🐌 **THOROUGH**
- **Purpose**: Fix all misaligned verses (any number of missing words)
- **Strategy**:
  - Re-translate entire verse using numbered format
  - Split long verses (>20 words) into chunks
  - Ensure alignment with strict validation
- **Speed**: ~50 seconds per verse
- **Target**: All verses with missing mappings
- **Found**: 3,530 total verses (before shift repair)
- **Status**: 🔄 **PARTIALLY COMPLETE** (~572/3,530 done overnight)
- **Remaining**: ~2,300 verses after shift repair completes
- **Estimated time**: ~32 hours for remaining verses
- **Command**: `caffeinate -i python3 repair_misaligned_verses.py`
- **Resume**: Yes (automatically skips completed verses)

#### `fill_missing_mappings.py`
- **Purpose**: Fill empty mapping arrays (Luke 3-24, John gaps, Acts 15)
- **Status**: ⚠️ **NOT STARTED** (may be obsolete - full repair handles this)

---

## Current Status Summary

### Completed ✅
- **New Testament generation**: 27 books, 260 chapters
- **Quality**: ~78.9% perfectly aligned, ~10.4% missing 1 word (shifted)

### In Progress 🔄
1. **OT Generation**: ~291/929 chapters complete (1 Kings chapter 1)
   - Estimated: ~122 hours remaining

2. **Misalignment Repair**: ~572/3,530 verses repaired
   - Running overnight with slow repair script
   - Should switch to fast shift repair for remaining single-word shifts

### Next Steps 📋
1. ✅ Test fast shift repair script (DONE - 100% success)
2. ⏭️ Run fast shift repair on 1,230 single-word shifts (~3 hours)
3. ⏭️ Run full repair on remaining ~1,100 multi-word misalignments (~15 hours)
4. ⏭️ Let OT generation complete (~122 hours / 5 days)
5. ⏭️ Run repair scripts on OT mappings as needed

---

## Statistics

### New Testament (Complete)
| Book | Chapters | Verses | Status |
|------|----------|--------|--------|
| Matthew | 28 | 1,071 | ✅ 100% |
| Mark | 16 | 678 | ✅ 100% |
| Luke | 24 | ~1,151 | ⚠️ 11% (chapters 3-24 empty) |
| John | 21 | 879 | ⚠️ 83% |
| Acts | 28 | 1,007 | ⚠️ 99% |
| Romans | 16 | Complete | ✅ |
| 1 Corinthians | 16 | Complete | ✅ |
| ... | ... | ... | ✅ |
| Revelation | 22 | Complete | ✅ |

### Old Testament (In Progress)
| Section | Books | Chapters | Status |
|---------|-------|----------|--------|
| Pentateuch | 5 | 187 | ✅ Complete |
| Historical | 12 | 249 | 🔄 In progress (1 Kings) |
| Wisdom/Poetry | 5 | 243 | ⏭️ Pending |
| Prophets | 17 | 250 | ⏭️ Pending |

### Misalignment Issues
- **Total misaligned**: 3,530 verses (before repair)
- **Single-word shifts**: 1,230 verses (35%)
- **Multi-word issues**: 2,300 verses (65%)
- **Repaired so far**: ~572 verses

---

## Recommended Workflow

### Immediate (Today)
1. Run fast shift repair: `caffeinate -i python3 repair_shifted_verses.py`
   - Time: ~3 hours
   - Fixes: 1,230 verses

### Short-term (Tomorrow)
2. Run full repair on remaining verses: `caffeinate -i python3 repair_misaligned_verses.py`
   - Time: ~15 hours (for remaining ~1,100 verses)
   - Fixes: Multi-word misalignments

### Long-term (This Week)
3. Let OT generation complete: `caffeinate -i python3 regenerate_mappings_ot_gemma3.py`
   - Time: ~122 hours (~5 days)
   - Creates: 638 remaining OT chapters

4. Scan OT for misalignments and run repair scripts as needed

---

## Quality Notes

- **Translation accuracy**: ~85-90% based on sample checks
- **Alignment accuracy**: ~79% perfect, ~21% with missing words
- **Fast shift repair**: 100% success rate in testing (10/10)
- **Full repair**: ~90% success rate (accepts partial on second attempt)

---

## File Locations

### Scripts
- `/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/regenerate_mappings_gemma3.py`
- `/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/regenerate_mappings_ot_gemma3.py`
- `/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/repair_shifted_verses.py`
- `/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/repair_misaligned_verses.py`

### Data
- Source verses: `/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-translations/unified/{BOOK}/{CHAPTER}.json`
- Generated mappings: `/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-maps-word-gemma3/mappings/{BOOK}/{CHAPTER}.json`

---

## Time Estimates

| Task | Time | Status |
|------|------|--------|
| OT Generation (remaining) | ~122 hours | 🔄 In progress |
| Fast shift repair | ~3 hours | ⏭️ Ready to run |
| Full repair (remaining) | ~15 hours | ⏭️ After shift repair |
| **Total remaining** | **~140 hours** | **~6 days** |

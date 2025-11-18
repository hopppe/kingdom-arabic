# Bible Mapping Types Guide

## Overview

The app now supports two translation styles that can be switched via Settings:

### 1. **Interpretive (Natural)** - Default
- Uses contextual, natural English translations
- Example: "good news" for إِنْجِيلِ
- Best for understanding meaning in context
- Source: `bible-translations/mappings/`

### 2. **Literal (Word-for-Word)**
- Uses literal, word-for-word translations
- Example: "run" for إِنْجِيلِ
- Best for learning exact word meanings
- Source: `bible-maps-word/mappings/`

## Architecture

### Data Sources

1. **Unified Verses** (`bible-translations/unified/{BOOK}/{CHAPTER}.json`)
   - Contains proper English Bible text (NIV/similar)
   - Contains Arabic text
   - **Always loaded first** - single source of truth for verse text

2. **Interpretive Mappings** (`bible-translations/mappings/{BOOK}/{CHAPTER}.json`)
   - Word mappings with natural translations
   - Includes verse text (same as unified)

3. **Literal Mappings** (`bible-maps-word/mappings/{BOOK}/{CHAPTER}.json`)
   - Word mappings with literal translations
   - May have crude/missing English verse text (ignored)

### How It Works

When loading a chapter:
1. Load unified verses for proper English + Arabic text
2. Load selected mapping type (interpretive or literal) for word translations
3. Merge at runtime: unified verse text + selected word mappings
4. Result: Proper Bible text + selected translation style

```javascript
// Example merged result (Literal mode)
{
  "1": {
    "ar": "هَذِهِ بِدَايَةُ إِنْجِيلِ...",
    "en": "The beginning of the good news about Jesus...", // from unified
    "mappings": [
      { "ar": "هَذِهِ", "en": "Here", ... },  // literal word mapping
      { "ar": "إِنْجِيلِ", "en": "Run", ... }  // literal (may be inaccurate)
    ]
  }
}
```

## Benefits

- **No data duplication**: English verse text stored once in unified
- **Flexible**: Easy to add more mapping types
- **Performance**: Minimal overhead (2 small JSON files vs 1)
- **Maintainable**: Update English text in one place

## Usage

Users can switch translation types in Settings:
1. Tap Settings icon (⚙️) in Bible Reader
2. Toggle "Word Translation Style"
3. Chapter reloads with new mapping type

Setting persists across app sessions via AsyncStorage.

## File Format

**Literal mappings don't need English verse text:**
```json
{
  "book": "MRK",
  "chapter": 1,
  "verses": {
    "1": {
      "ar": "Arabic text...",
      "en": "",  // Can be empty or missing - will use unified
      "mappings": [
        { "ar": "word", "en": "literal", "start": 0, "end": 5 }
      ]
    }
  }
}
```

The system automatically pulls proper English from unified source.

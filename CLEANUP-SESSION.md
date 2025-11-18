# App Cleanup & Performance Recovery Session

**Date:** November 18, 2024
**Goal:** Remove TTS/audio code while keeping flashcard improvements, restore app performance

---

## Problem

The app had become slow and laggy after attempting to add TTS/audio functionality. Changes were mixed with flashcard improvements that needed to be kept.

---

## Solution Overview

1. Created salvage commit with all changes
2. Reset to last clean commit (e8f6f20)
3. Selectively restored non-TTS changes
4. Removed performance-blocking code
5. Simplified navigation and screen logic

---

## What Was Kept

### ✅ Flashcard Improvements
- `Flashcards/utils/ankiScheduler.js` - Better "Hard" rating algorithm for Anki
- `src/context/FlashcardContext.js` - Groups management system (createGroup, addCardToGroup, etc.)
- `src/screens/components/AnkiRatingButtons.js` - Improved interval display formatting
- `src/screens/components/QuickSettingsModal.js` - Group management UI
- `src/screens/components/Dropdown.js` - Generic dropdown component (used for groups)

### ✅ Bible Mapping Scripts & Data
- `bible-maps-word/` - All 1000+ word mapping files across all Bible books
- `count-characters.js` - Character counting utility
- `count-unique-words.js` - Unique word analysis
- `remove-english.js` - English text removal utility
- `test-translation.js` - Translation testing script
- `translate-mappings.js` - Main mapping translation script

### ✅ App Configuration
- `app.json` - Bundle ID changed to `com.ingenuitylabs.kingdomarabic`, splash colors updated
- `EXPO-TTS-IMPLEMENTATION.md` - Documentation for future TTS implementation

---

## What Was Removed

### ❌ TTS/Audio Code
- `src/context/TTSContext.js` - TTS state management
- `src/context/SessionContext.js` - Screen tracking (removed for performance)
- `src/services/TTSService.js` - TTS service implementation
- `src/screens/components/Dropdown.js` - (kept, but TTS usage removed)
- All TTS play buttons from screens
- `react-native-sherpa-onnx-offline-tts` dependency

### ❌ TTS Assets (~1500 files)
- `assets/tts/` - Entire TTS asset directory including:
  - `ar_JO-kareem-medium.onnx` - Arabic voice model
  - `espeak-ng-data/` - All language dictionaries and phoneme data
- `PIPER-TTS-ARABIC.md`
- `REACT-NATIVE-TTS-INTEGRATION.md`
- `test-arabic.wav`

### ❌ Performance-Blocking Code
- **InteractionManager wrappers** - Removed deferred initialization that caused delays
- **Complex debouncing logic** - Removed over-engineered state management
- **Multiple useRef tracking** - Removed flashcardCountRef, sessionCardsRef, selectedGroupRef, lastInitTimeRef
- **SessionContext** - Removed screen tracking that was slowing navigation

---

## Performance Optimizations Made

### Navigation (AppNavigator.js)
```javascript
// Added these options for instant navigation:
detachInactiveScreens: false,  // Keep screens mounted (no reload)
animationEnabled: false,        // Instant screen switching
```

### BibleReaderScreen
- Removed `InteractionManager` wrapper from chapter loading
- Chapter data now loads immediately instead of being deferred

### FlashcardScreen
- **Reverted to clean version** after breaking changes
- Original animation timings restored (250ms slide animations)
- Complex group initialization logic removed
- Simple, fast initialization

---

## Files Modified

### Core App Files
- `App.js` - Removed TTSProvider and SessionProvider, kept ThemeProvider + FlashcardProvider
- `src/navigation/AppNavigator.js` - Simplified navigation, added performance options
- `src/screens/BibleReaderScreen.js` - Removed InteractionManager delays
- `src/screens/FlashcardScreen.js` - Reverted to clean version

### Preserved Improvements
- `Flashcards/utils/ankiScheduler.js` - Anki algorithm improvements kept
- `src/context/FlashcardContext.js` - Groups functionality kept
- `src/screens/components/AnkiRatingButtons.js` - Display improvements kept
- `src/screens/components/QuickSettingsModal.js` - Group UI kept

---

## Git History

**Salvage Commit:** `d88189b` - "SALVAGE: All changes before TTS revert (flashcards + TTS)"
**Clean Commit:** `e8f6f20` - "Update fix-mapping-semantics command"

The salvage commit preserves all TTS work in git history for future reference.

---

## Current State

### App Structure
```
LearnArabic/
├── App.js                          # ThemeProvider → FlashcardProvider → AppNavigator
├── src/
│   ├── context/
│   │   ├── ThemeContext.js        # Theme colors
│   │   └── FlashcardContext.js    # Flashcards + Groups (groups UI not active)
│   ├── navigation/
│   │   └── AppNavigator.js        # Simple, fast navigation
│   └── screens/
│       ├── BibleReaderScreen.js   # Clean version, no delays
│       └── FlashcardScreen.js     # Clean version, fast
├── bible-maps-word/               # 1000+ mapping files
└── Scripts/                       # Translation utilities
```

### Performance Characteristics
- **Navigation:** Instant (screens stay mounted, no animations)
- **Chapter Loading:** Immediate (no InteractionManager delays)
- **Button Response:** Fast (no blocking code)
- **Initialization:** Simple (no complex debouncing or ref tracking)

---

## Known Issues / Next Steps

### Groups Functionality
- Groups are stored in `FlashcardContext` but UI is removed from `FlashcardScreen`
- If groups UI needed, add back simple dropdown without complex initialization logic

### Future TTS Implementation
- See `EXPO-TTS-IMPLEMENTATION.md` for plan
- Consider simpler approach using Expo AV or React Native TTS
- Avoid InteractionManager and complex deferrals

---

## Lessons Learned

1. **Keep it simple** - Complex performance optimizations often hurt more than help
2. **InteractionManager** - Deferring initialization creates perceived lag
3. **useEffect dependencies** - Animated values shouldn't be in dependency arrays
4. **Selective commits** - Having salvage commit made selective restoration possible
5. **Test incrementally** - Each change should be tested for performance impact

---

## Commands for Reference

```bash
# View salvage commit
git show d88189b

# View clean commit
git show e8f6f20

# Revert a file to clean version
git checkout e8f6f20 -- path/to/file

# Check current changes
git status --short
```

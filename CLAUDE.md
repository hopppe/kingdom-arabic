# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: LearnArabic

A simplified React Native app for learning Arabic, featuring reading and flashcard activities. This app was created by integrating activities from an existing English learning app while maintaining a minimal, focused architecture.

## Development Commands

```bash
npm start         # Start Expo development server
npm run android   # Run on Android emulator/device
npm run ios       # Run on iOS simulator/device
npm run web       # Run in web browser (use port 8082 if 8081 is taken)
```

## Missing Dependencies

If activities don't work, install these packages:
```bash
npm install react-native-sound expo-av @react-native-community/slider
```

## Architecture Overview

```
src/
├── screens/                    # App screens
│   ├── BibleReaderScreen.js         # Main screen - Bible reading with word mappings
│   ├── FlashcardScreen.js           # Flashcard review system with Anki scheduling
│   └── components/                  # Screen-specific components
│       ├── AnkiRatingButtons.js          # Rating buttons for flashcard review
│       ├── AnkiCardCounts.js             # Card count display (new/learning/review)
│       └── QuickSettingsModal.js         # Settings modal for flashcards
├── context/                    # React contexts
│   ├── ThemeContext.js              # Theme colors and styling
│   └── FlashcardContext.js          # Flashcard state management and persistence
├── data/
│   └── bibleData.js                 # Bible book/chapter definitions and data loading
└── navigation/                 # Navigation setup
    └── AppNavigator.js              # Stack navigator configuration
```

## Bible Data Structure (Local JSON)

All Bible content is stored locally in JSON files, split by chapter for optimal agent performance:

```
bible-translations/
├── unified/                    # Source Bible text (66 books, split by chapter)
│   ├── MRK/                        # Mark
│   │   ├── 1.json                      # Chapter 1 verses
│   │   ├── 2.json                      # Chapter 2 verses
│   │   └── ...16.json
│   ├── JHN/                        # John (21 chapters)
│   ├── MAT/                        # Matthew (28 chapters)
│   ├── PSA/                        # Psalms (150 chapters)
│   └── ...                         # All 66 books
└── mappings/                   # Word mappings (generated)
    ├── MRK/                        # Mark book folder
    │   ├── 1.json                      # Mark chapter 1 mappings
    │   ├── 2.json                      # Mark chapter 2 mappings
    │   └── ...
    ├── JHN/                        # John book folder
    │   ├── 1.json
    │   └── ...
    └── ...
```

### Bible JSON Format

**Chapter File** (`bible-translations/unified/{BOOK}/{CHAPTER}.json`):
```json
{
  "1": {
    "en": "The beginning of the good news...",
    "ar": "هَذِهِ بِدَايَةُ إِنْجِيلِ..."
  },
  "2": {
    "en": "as it is written in Isaiah...",
    "ar": "كَمَا هُوَ مَكْتُوبٌ فِي..."
  }
}
```
Each chapter file contains just the verses object - simple and fast to read!

**Mapping File** (`bible-translations/mappings/{BOOK}/{CHAPTER}.json`):
```json
{
  "book": "MRK",
  "chapter": 1,
  "verses": {
    "1": {
      "ar": "Arabic text...",
      "en": "English text...",
      "mappings": [
        { "ar": "word", "en": "translation", "start": 0, "end": 4 }
      ]
    }
  }
}
```

## Key Conventions

- **Expo for React Native development** - Simple setup and deployment
- **React Navigation Stack** - Simple 2-screen navigation (Reader → Flashcards)
- **Local JSON Storage** - Bible content and mappings stored in local JSON files
- **AsyncStorage** - For flashcard data, user progress, and preferences
- **Anki-style SRS** - Spaced repetition system for flashcard scheduling
- **Minimal Context Providers** - Only ThemeContext and FlashcardContext
- **Two main screens** - BibleReaderScreen (home) and FlashcardScreen

## Bible Word Mapping Commands

Use these Claude Code commands to create word mappings for Bible chapters:

```bash
# Map a single chapter
/bible-word-mapping MRK 6

# Map multiple chapters in parallel (launches agents)
/map-bible-chapters MRK 1,2,3
```

See `.claude/skills/bible-word-mapper.md` for detailed mapping instructions.

## Important Implementation Notes

1. **Two-Screen App**: BibleReaderScreen is the home screen where users read Arabic Bible text and save words. FlashcardScreen provides Anki-style spaced repetition review.

2. **Word Saving Flow**: Users tap Arabic words in BibleReaderScreen to see translations. Tapped words are automatically saved to a session list, which can be added to flashcards.

3. **Local Storage**: All Bible content and mappings are stored in local JSON files under `bible-translations/`. Flashcard data and progress is persisted via AsyncStorage.

4. **Anki Algorithm**: FlashcardContext uses a proper Anki-style spaced repetition algorithm with ease factors, intervals, and card states (new/learning/review).

5. **Navigation**: Simple stack navigation with 2 screens. Reader is the initial route.

6. **External Dependencies**: The app uses utilities from `/Flashcards/utils/` directory (ankiScheduler.js, localQueueManager.js) for SRS logic.

7. **RTL Support**: Arabic text is displayed right-to-left with proper styling.

## Development Workflow

1. Content is Arabic Bible text with RTL support
2. Add new Bible books/chapters by creating JSON files in `bible-translations/`
3. Generate word mappings using the `/bible-word-mapping` command
4. Flashcard progress and preferences are stored in AsyncStorage
5. Keep the architecture simple - currently just 2 screens and 2 contexts

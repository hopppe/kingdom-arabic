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
│   ├── HomeScreen.js                # Main menu with activity buttons
│   ├── ReadingActivity.js           # Story reading (from StoryListScreen.js)
│   ├── FlashcardActivity.js         # Flashcard system with Anki scheduling
│   ├── SettingsScreen.js            # Basic app settings
│   ├── StoryReader.js               # Individual story reading interface
│   ├── StoryContext.js              # Story state management
│   ├── components/                  # Activity-specific components
│   │   ├── AnkiRatingButtons.js
│   │   ├── FlashcardItem.js
│   │   ├── ProgressIndicator.js
│   │   └── QuickSettingsModal.js
│   ├── hooks/
│   │   └── useFlashcardAnimations.js
│   └── utils/
│       └── ankiScheduler.js
├── context/                    # React contexts (simplified versions)
│   ├── ThemeContext.js              # Basic theme colors and styling
│   ├── LanguageContext.js           # Simple translation function
│   ├── FlashcardContext.js          # Flashcard state management
│   └── HelpContext.js               # Help overlay system
├── components/                 # Shared UI components
│   ├── ui/                          # Basic UI components
│   │   ├── Card.js                  # Activity cards
│   │   ├── HelpOverlay.js           # Help system
│   │   ├── HelpButton.js
│   │   └── index.js
│   ├── ActivityPickerScreen.js     # Generic activity list screen
│   └── UnifiedActivityWrapper.js   # Activity tracking wrapper
├── services/                   # External services
│   ├── UnifiedAudioService.js       # Text-to-speech functionality
│   └── posthogService.js            # Analytics (optional)
├── utils/                      # Utility functions
│   ├── logger.js                    # Logging utility
│   ├── imageMapping.js              # Image utility for flashcards
│   └── imagePreloader.js            # Image preloading
├── data/
│   └── helpContent.js               # Help content definitions
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
- **React Navigation Stack** - Basic screen navigation
- **Local JSON Storage** - All data stored in local JSON files
- **AsyncStorage** - For user preferences and progress
- **No Learning Stages** - Removed complexity, all content available
- **Minimal Context Providers** - Only essential contexts, no complex state management
- **Activity-focused** - Just 2 main activities: Stories and Flashcards

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

1. **No Learning Stages**: All references to learning stages have been removed. Stories and flashcards show all available content.

2. **Local Storage**: All Bible content and mappings are stored in local JSON files, not a database.

3. **Activity Integration**: Both activities were copied from the English learning app and adapted for Arabic content.

4. **File Organization**: Original files are in `/oldsourcefiles/` for reference. The `/Stories/` and `/Flashcards/` directories contain the original activity code.

5. **Navigation**: App uses simple stack navigation with 4 main screens: Home, Reading, Flashcard, Settings.

6. **Audio Support**: UnifiedAudioService provides text-to-speech for Arabic content.

7. **Image Assets**: Activities support images through imageMapping utility.

## Development Workflow

1. Content should be Arabic-focused (RTL support may be needed)
2. Activities are self-contained with their own components
3. Data is stored in local JSON files
4. User progress stored in AsyncStorage
5. Keep the architecture simple - avoid adding complex state management

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: LearnArabic

A **local-first** React Native app for learning Arabic through Bible reading and spaced repetition flashcards. All content is stored locally—no backend, no cloud services, no authentication. The app features a minimal architecture with just 2 screens and uses an Anki-style algorithm for vocabulary review.

## Development Commands

```bash
npm start         # Start Expo development server
npm run android   # Run on Android emulator/device
npm run ios       # Run on iOS simulator/device
npm run web       # Run in web browser (use port 8082 if 8081 is taken)
```

## Core Dependencies

The app uses a minimal set of dependencies:
- **React Native (0.81.4)** with **Expo (~54.0.9)** for development
- **@react-navigation** - Stack navigation between screens
- **@react-native-async-storage/async-storage** - Local data persistence
- **@expo/vector-icons** - Icon library

## Architecture Overview

**100% Local, No Cloud Services**
- No Supabase, Firebase, or backend APIs
- No authentication or user accounts
- All Bible content bundled as local JSON files
- Flashcard data stored in device AsyncStorage
- Completely offline-capable

**Directory Structure**
```
src/
├── screens/                         # App screens
│   ├── BibleReaderScreen/
│   │   ├── index.js                      # Main screen - Bible reading
│   │   ├── ChapterSelector.js            # Book/chapter navigation dropdown
│   │   ├── SavedWordsPanel.js            # Manage session words
│   │   └── SettingsModal.js              # User preferences
│   ├── FlashcardScreen/
│   │   ├── index.js                      # Flashcard review with Anki SRS
│   │   ├── FlashcardCard.js              # Animated flip card
│   │   ├── AnkiRatingButtons.js          # Again/Hard/Good/Easy buttons
│   │   ├── AnkiCardCounts.js             # New/learning/review counters
│   │   ├── QuickSettingsModal.js         # Study preferences
│   │   └── FlashcardListModal.js         # View/manage all flashcards
│   └── components/
│       └── Dropdown.js                   # Shared dropdown component
├── context/                         # React contexts
│   ├── ThemeContext.js                   # Design system (colors, typography, spacing)
│   └── FlashcardContext.js               # Flashcard CRUD + Anki scheduling
├── data/
│   └── bibleData.js                      # Bible metadata + chapter loader
├── hooks/                           # Custom React hooks
│   ├── useBibleReader.js                 # Word selection logic
│   ├── useFlashcardPreferences.js        # Preference persistence
│   ├── useFlashcardAnimations.js         # Card flip animations
│   └── useFlashcardSession.js            # Queue management
├── utils/                           # Helper utilities
│   ├── bibleLoader.js                    # Simplified chapter loading
│   └── textUtils.js                      # Text processing
└── navigation/
    └── AppNavigator.js                   # Stack navigator (2 screens)

Flashcards/utils/                    # External SRS utilities
├── ankiScheduler.js                      # Core Anki algorithm
└── localQueueManager.js                  # Card queue + timer management

bible-translations/                  # Local Bible data
├── unified/{BOOK}/{CHAPTER}.json         # 66 books, chapter-split verses
└── mappings/{BOOK}/{CHAPTER}.json        # Word-level translations
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

## Key Features

### 1. Bible Reader (Home Screen)
- Read complete Arabic Bible (all 66 books) with English translations
- **Interactive Word Learning**:
  - Tap any Arabic word to see its English translation
  - Tapped words auto-save to a session list
  - Edit translations inline
  - View verse context for each word
- **Navigation**:
  - Previous/Next chapter buttons
  - Dropdown selectors for book and chapter
- **Session Management**:
  - View all saved words in session panel
  - Bulk add session words to flashcards
  - Clear individual words or entire session
- **RTL Support**: Proper right-to-left text rendering for Arabic

### 2. Flashcard Study (Anki SRS)
- **Spaced Repetition System**:
  - New cards → Learning (1min, 10min) → Review (1+ days)
  - Ease factor adjustment (1.3-2.5)
  - Interval multiplication on successful reviews
  - Lapse handling (failed cards → relearning)
  - Midnight scheduling for ≥1 day reviews
  - ±5% fuzzing to spread review load
- **Study Interface**:
  - Flip animation to reveal answer
  - 4 rating buttons: Again (1), Hard (2), Good (3), Easy (4)
  - Next review timing hints
  - Card counters (new/learning/review)
- **Card Management**:
  - View all flashcards in list modal
  - Edit translations and verse context
  - Delete individual cards
  - Reset card progress to "new" state
- **Groups**:
  - Organize cards into custom groups
  - Filter study session by group
  - Create/delete groups
- **Preferences**:
  - Toggle Arabic-first vs English-first display
  - Toggle verse context on card front
  - Preferences persist in AsyncStorage

### 3. Local Data Storage
- **Bible Content**: 66 books × multiple chapters stored as local JSON files
  - `/bible-translations/unified/{BOOK}/{CHAPTER}.json` - Raw verses
  - `/bible-translations/mappings/{BOOK}/{CHAPTER}.json` - Word mappings
- **Flashcard Data**: AsyncStorage (device-local)
  - `@learnarabic_flashcards` - Card array
  - `@learnarabic_flashcard_progress` - Anki scheduling data
  - `@learnarabic_flashcard_groups` - Group names
- **No Cloud**: All data stored locally, no sync, no auth

## Key Conventions

- **Local-First Architecture** - No backend, no API calls, no cloud services
- **Expo + React Native** - Cross-platform mobile development
- **React Navigation Stack** - 2 screens: BibleReaderScreen ↔ FlashcardScreen
- **AsyncStorage** - Device-local persistence for flashcards and preferences
- **Anki Algorithm** - Production-grade SRS via `/Flashcards/utils/ankiScheduler.js`
- **Minimal Contexts** - ThemeContext (design system) + FlashcardContext (data)
- **Custom Hooks** - Separated concerns (animations, preferences, session, reader)
- **Chapter Caching** - In-memory cache to avoid repeated file reads

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

1. **100% Local, Offline-First**:
   - No Supabase, Firebase, or any backend services
   - No authentication or user accounts
   - No network requests or API calls
   - Bible content bundled with app as local JSON
   - Flashcard data persisted to device AsyncStorage only

2. **Two-Screen Architecture**:
   - **BibleReaderScreen** (home): Read Bible, tap words, save to session
   - **FlashcardScreen**: Anki-style spaced repetition review
   - Stack navigation with fast switching (no animations)

3. **Word Learning Flow**:
   - Tap Arabic word → See translation tooltip
   - Word auto-saved to session list
   - View/edit all session words in panel
   - Bulk add to flashcards → Appear in FlashcardScreen

4. **Anki SRS Implementation**:
   - Core algorithm: `/Flashcards/utils/ankiScheduler.js` (343 lines)
   - Queue management: `/Flashcards/utils/localQueueManager.js`
   - FlashcardContext orchestrates scheduling + persistence
   - Card states: new → learning → review (or relearning on lapse)
   - Every 5 seconds, timer checks for cards becoming due

5. **Data Loading Strategy**:
   - Bible chapters loaded on-demand via `require()`
   - Chapter data cached in-memory after first load
   - FlashcardContext loads from AsyncStorage lazily (on first use)
   - No loading spinners needed—data is always local and fast

6. **Component Organization**:
   - Each screen has its own `/index.js` + child components folder
   - Shared components in `/src/screens/components/`
   - Custom hooks in `/src/hooks/` for reusable logic
   - Contexts provide global state (theme, flashcards)

7. **Styling Approach**:
   - ThemeContext provides design tokens (colors, spacing, typography)
   - All components use `useTheme()` hook for consistency
   - RTL support for Arabic text with `textAlign: 'right'` and proper styling

8. **AsyncStorage Keys**:
   - `@learnarabic_flashcards` - Flashcard array (id, arabic, english, reference, etc.)
   - `@learnarabic_flashcard_progress` - Object mapping card IDs to Anki progress
   - `@learnarabic_flashcard_groups` - Array of group names
   - Preferences keys managed by `useFlashcardPreferences` hook

## Development Workflow

1. **Run the app**: `npm start` then `npm run ios` or `npm run android`
2. **Add Bible content**: Create JSON files in `bible-translations/unified/{BOOK}/{CHAPTER}.json`
3. **Generate mappings**: Use `/bible-word-mapping {BOOK} {CHAPTER}` command
4. **Test word saving**: Tap words in BibleReaderScreen → Check session panel
5. **Test flashcards**: Add session words → Navigate to FlashcardScreen → Review with ratings
6. **Debug data**: Check AsyncStorage via React Native debugger
7. **Keep it simple**: Maintain 2-screen, 2-context architecture

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Kingdom Arabic (LearnArabic)

A **local-first** React Native (Expo) app for learning Arabic through the Arabic Bible. No backend, no accounts, no network calls: Bible text ships inside the app and all user data lives in AsyncStorage on the device. Four tabs: **Bible** (read, tap words for glosses), **Flashcards** (Anki-style SRS), **Memorize** (whole-verse memorization), **Progress** (streaks, stats, reading progress, backup).

## Development Commands

```bash
npm start               # Expo dev server (builds the Bible DB first)
npm run ios             # Build + run on iOS simulator (Xcode 27 with scene support; see app.json)
npm run android         # Build + run on Android emulator/device
npm test                # Jest (jest-expo preset)
npm run build:bible-db  # Rebuild assets/bible/bible.db from bible-translations/ JSON
```

`prestart`/`preios`/`preandroid`/`preweb` and `eas-build-post-install` run `build:bible-db` automatically. `assets/bible/bible.db` and `src/data/bibleDbVersion.js` are generated and gitignored — rebuild after changing any mapping/unified JSON.

## Stack

Expo SDK 57 / React Native 0.86 / React 19.2 (New Architecture only). Key modules: `expo-sqlite` (bundled Bible DB), `@react-navigation/bottom-tabs`, AsyncStorage, `expo-speech` + `expo-audio` (Arabic TTS), `expo-notifications` (daily reminder), `expo-sharing` / `expo-document-picker` / `expo-file-system` (backup), `@expo-google-fonts/*` (Arabic fonts), `expo-build-properties` (`ios.enableSceneSupport` — required to build with Xcode 27; remove after upgrading to SDK 58).

## Architecture

**Data flow**
- Bible text + word glosses: `scripts/build_bible_db.py` compiles `bible-translations/unified` (verse text; source of truth for which verses exist) and `bible-translations/mappings` (word glosses) into SQLite tables `verses`, `glosses`, `forms` (vowel-less word forms with Light10 stems). The app ships it gzipped (`assets/bible/bible.db.gz`, ~16 MB) and `BibleDbProvider` unpacks it once on first launch (`src/utils/bibleDbInstall.js`), so the phone holds one 43 MB copy instead of two; the file name carries a content hash, so updates re-unpack. Don't switch back to `SQLiteProvider`'s `assetSource`: it copies the bundled DB, doubling on-device size. Query only through `src/data/bibleRepository.js` (functions take `db` from `useBibleDb()`).
- User data: one context per domain, each persisting to AsyncStorage under the `@learnarabic_` prefix. **Every key must use that prefix** — backup/restore exports exactly those keys.
- `AppDataBoundary` (App.js) remounts all providers after a backup restore so they re-read storage.

**Provider order (App.js):** SafeArea → AppDataBoundary → Theme → BibleDb → Activity → Flashcard → MemoryVerse → ReadingProgress → navigator.

```
src/
├── context/            ThemeContext (palettes + Arabic font prefs), BibleDbContext, ActivityContext
│                       (daily activity log), FlashcardContext, MemoryVerseContext, ReadingProgressContext,
│                       AppDataContext
├── data/               bibleData.js (book metadata, ids), bibleRepository.js (SQL queries)
├── theme/              palettes.js (light/dark, identical keys), arabicFonts.js
├── navigation/         AppNavigator.js (bottom tabs), routes.js (route names)
├── screens/
│   ├── BibleReaderScreen/   reader, chapter picker, settings (+ AppearanceSection), search,
│   │                        verse actions sheet, WordStudy/ (occurrences + related forms)
│   ├── FlashcardScreen/     review session
│   ├── MemoryScreen/        home / add verse / practice session, steps/ (Learn, Fade, First letters, Build, Recall)
│   ├── ProgressScreen/      streak, activity chart, flashcard + memory stats, reading progress
│   └── components/          shared flashcard UI
├── components/backup/  BackupSection + useBackup
├── hooks/              reader, bookmarks, flashcard session/animations/prefs, notifications
└── utils/              pure, tested logic: activityStats, readingProgress, flashcardStats, backup, memory/*
Flashcards/utils/       ankiScheduler.js + localQueueManager.js (card SRS; tested)
scripts/                build_bible_db.py, mapping pipeline scripts; legacy-root/ holds old one-off scripts
```

## Conventions

- **Theme everything.** Never hardcode colors; use `useTheme().theme.colors.*` and build styles with `useMemo(() => createStyles(theme), [theme])`. New tokens go in both palettes. In dark mode `primary` is light, so content on it uses `textOnPrimary*` tokens.
- **Arabic text uses `theme.arabic.body | large | small | scaled(n)`** — these carry the user's font and a line height that keeps harakat (vowel marks) from clipping. Never set a smaller lineHeight on Arabic. Never strip harakat for display (only for comparisons).
- Pure logic goes in `src/utils/` with Jest tests next to it (or in `__tests__/`); keep screens thin and files small.
- Immutable state updates; contexts use refs for latest state in stable callbacks.
- Verse numbers: use `chapter.data.verse_numbers[i]` rather than assuming `i + 1`.

## Features (where to look)

- **Reader:** tap a word → gloss tooltip + saved to session; tap the tooltip or long-press a word → word study; long-press a verse number → bookmark / memorize / listen; tap a verse number → TTS. Reaching the end of a chapter (or pressing Next) marks it read.
- **Flashcards:** Anki algorithm (new → learning 1m/10m → review; lapses → relearning; ease 1.3–2.5; fuzz). `recordAnswer` also logs activity.
- **Memorize:** chunked meaning → fading words (25/50/75/100%) → first-letter cues → rebuild from tiles → free recall with self-grading; day-level SM-2 in `utils/memory/scheduler.js` (learning → reviewing → mastered at ≥21 days).
- **Progress:** streak counts days with any activity (not broken until the day after a miss).

## AsyncStorage keys

`@learnarabic_flashcards`, `_flashcard_progress`, `_flashcard_groups`, `_memory_verses`, `_reading_progress`, `_activity_log`, `_bookmarks`, `_reading_position`, `_display_prefs`, `_notifications_enabled`, `_reminder_time`, `_help_seen`, plus flashcard preference keys; `_last_backup_at` is device-only and excluded from backups.

## Bible Source Data (JSON → SQLite)

Source JSON, split by chapter (compiled into the app DB by `npm run build:bible-db`):

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


## Bible Word Mapping Commands

```bash
/bible-word-mapping MRK 6          # map a single chapter
/map-bible-chapters MRK 1,2,3      # map several chapters in parallel
```

See `.claude/skills/bible-word-mapper.md`. Some chapters' mapping files stop early (e.g. much of 1 Chronicles); those verses still display (text from `unified/`) but have no tap-to-translate until mapped. Rebuild the DB after mapping.

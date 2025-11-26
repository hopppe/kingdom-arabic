# LearnArabic

A **local-first** React Native mobile app for learning Arabic through Bible reading and spaced repetition flashcards.

## Features

### Bible Reader
- Read the complete Arabic Bible (66 books, all chapters) with English translations
- Tap any Arabic word to see its English translation
- Auto-save tapped words to a study session
- Navigate between books and chapters with dropdown selectors
- Edit word translations inline
- Bulk add session words to flashcards

### Flashcard Study System
- **Anki-style spaced repetition** with scientifically-proven scheduling
- Card states: New → Learning → Review
- 4 rating buttons: Again, Hard, Good, Easy
- Real-time card counters (new/learning/review)
- Organize cards into custom groups
- Edit or delete flashcards
- Preferences: Arabic-first vs English-first, show/hide verse context

### 100% Local & Offline
- **No cloud services** - No Supabase, Firebase, or backend
- **No authentication** - No user accounts or sign-in
- **No network requests** - All data stored locally
- Bible content bundled as JSON files
- Flashcard progress saved to device storage (AsyncStorage)
- Works completely offline

## Screenshots

*(Add screenshots here)*

## Installation

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (Mac only) or iOS Simulator
- Android: Android Studio or Android Emulator

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/LearnArabic.git
cd LearnArabic

# Install dependencies
npm install

# Start the development server
npm start
```

### Run on Device/Emulator

```bash
# iOS (Mac only)
npm run ios

# Android
npm run android

# Web (use port 8082 if 8081 is taken)
npm run web
```

## Project Structure

```
LearnArabic/
├── src/
│   ├── screens/
│   │   ├── BibleReaderScreen/       # Home screen - Bible reading
│   │   │   ├── index.js
│   │   │   ├── ChapterSelector.js
│   │   │   ├── SavedWordsPanel.js
│   │   │   └── SettingsModal.js
│   │   ├── FlashcardScreen/         # Flashcard review
│   │   │   ├── index.js
│   │   │   ├── FlashcardCard.js
│   │   │   ├── AnkiRatingButtons.js
│   │   │   ├── AnkiCardCounts.js
│   │   │   ├── QuickSettingsModal.js
│   │   │   └── FlashcardListModal.js
│   │   └── components/              # Shared components
│   ├── context/
│   │   ├── ThemeContext.js          # Design system
│   │   └── FlashcardContext.js      # Flashcard data & scheduling
│   ├── hooks/                       # Custom React hooks
│   ├── utils/                       # Helper utilities
│   ├── data/
│   │   └── bibleData.js             # Bible metadata & loader
│   └── navigation/
│       └── AppNavigator.js          # Stack navigation
├── Flashcards/utils/                # Anki SRS utilities
│   ├── ankiScheduler.js             # Spaced repetition algorithm
│   └── localQueueManager.js         # Card queue management
├── bible-translations/              # Local Bible data (JSON)
│   ├── unified/{BOOK}/{CHAPTER}.json     # Raw verses
│   └── mappings/{BOOK}/{CHAPTER}.json    # Word-level translations
├── App.js                           # Entry point
└── package.json
```

## How It Works

### Bible Reading Flow
1. Open app → BibleReaderScreen displays Mark 1 by default
2. Tap any Arabic word → Translation tooltip appears
3. Word automatically saved to session list
4. Open session panel → View all tapped words
5. Click "Add to Flashcards" → Words become flashcards

### Flashcard Study Flow
1. Navigate to FlashcardScreen
2. See card front (Arabic or English, based on preference)
3. Tap card to flip and reveal answer
4. Rate your recall: Again, Hard, Good, or Easy
5. Next card appears based on Anki scheduling
6. Cards move through states: New → Learning → Review

### Anki Spaced Repetition System
- **New cards**: Appear for the first time
- **Learning**: Reviewed at 1 minute, then 10 minutes intervals
- **Review**: Reviewed at increasing intervals (1 day, 2 days, 5 days, etc.)
- **Ease factor**: Multiplier (1.3-2.5) that adjusts based on your ratings
- **Lapses**: Failed cards move to relearning state
- **Midnight scheduling**: All ≥1 day reviews scheduled for midnight UTC
- **Fuzzing**: ±5% randomization to spread out review load

### Data Storage

**Bible Content** (bundled with app):
- `/bible-translations/unified/{BOOK}/{CHAPTER}.json` - Verse text
- `/bible-translations/mappings/{BOOK}/{CHAPTER}.json` - Word mappings

**Flashcard Data** (AsyncStorage - device local):
- `@learnarabic_flashcards` - All flashcard objects
- `@learnarabic_flashcard_progress` - Anki scheduling data per card
- `@learnarabic_flashcard_groups` - Custom group names

**No Cloud Sync**:
- Data is stored only on your device
- No backup to cloud services
- Export/import feature coming soon

## Bible Data Format

### Verse File (`unified/MRK/1.json`)
```json
{
  "1": {
    "en": "The beginning of the good news of Jesus Christ, the Son of God.",
    "ar": "هَذِهِ بِدَايَةُ إِنْجِيلِ يَسُوعَ الْمَسِيحِ ابْنِ اللهِ:"
  },
  "2": {
    "en": "as it is written in the prophet Isaiah...",
    "ar": "كَمَا كُتِبَ فِي النَّبِيِّ إِشَعْيَاءَ..."
  }
}
```

### Mapping File (`mappings/MRK/1.json`)
```json
{
  "book": "MRK",
  "chapter": 1,
  "verses": {
    "1": {
      "ar": "هَذِهِ بِدَايَةُ إِنْجِيلِ يَسُوعَ الْمَسِيحِ ابْنِ اللهِ:",
      "en": "The beginning of the good news of Jesus Christ, the Son of God.",
      "mappings": [
        { "ar": "هَذِهِ", "en": "This", "start": 0, "end": 6 },
        { "ar": "بِدَايَةُ", "en": "beginning", "start": 7, "end": 16 },
        { "ar": "إِنْجِيلِ", "en": "good news", "start": 17, "end": 26 },
        { "ar": "يَسُوعَ", "en": "Jesus", "start": 27, "end": 34 },
        { "ar": "الْمَسِيحِ", "en": "Christ", "start": 35, "end": 45 },
        { "ar": "ابْنِ", "en": "Son", "start": 46, "end": 51 },
        { "ar": "اللهِ", "en": "God", "start": 52, "end": 58 }
      ]
    }
  }
}
```

Each mapping includes:
- `ar`: Arabic word
- `en`: English translation
- `start`: Character position (start)
- `end`: Character position (end)

## Development

### Tech Stack
- **React Native 0.81.4** - Cross-platform mobile framework
- **Expo ~54.0.9** - Development tooling
- **React Navigation** - Screen navigation
- **AsyncStorage** - Local data persistence
- **No external services** - 100% local

### Key Dependencies
```json
{
  "react": "19.1.0",
  "react-native": "0.81.4",
  "expo": "~54.0.9",
  "@react-navigation/native": "^7.1.17",
  "@react-navigation/stack": "^7.4.8",
  "@react-native-async-storage/async-storage": "^2.2.0"
}
```

### Architecture Principles
- **Local-first**: No cloud dependencies
- **Offline-capable**: Works without internet
- **Minimal complexity**: 2 screens, 2 contexts
- **Performance**: Chapter caching, lazy loading
- **RTL support**: Proper Arabic text rendering

### Adding Bible Books/Chapters

1. Create verse file: `bible-translations/unified/{BOOK}/{CHAPTER}.json`
2. Generate word mappings using Claude Code:
   ```bash
   /bible-word-mapping {BOOK} {CHAPTER}
   ```
3. Mappings auto-saved to: `bible-translations/mappings/{BOOK}/{CHAPTER}.json`
4. Add book metadata to `src/data/bibleData.js` if needed

## Roadmap

- [ ] Export/import flashcard data
- [ ] Audio pronunciation for Arabic words
- [ ] Dark mode theme
- [ ] More Bible translations (Arabic variants)
- [ ] Verse highlighting and note-taking
- [ ] Advanced study statistics
- [ ] Custom flashcard creation (not from Bible)
- [ ] Tablet/iPad optimized layout

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

[MIT License](LICENSE) - Feel free to use this code for your own projects.

## Credits

- Arabic Bible text: [Source]
- English Bible text: [Source]
- Anki algorithm inspired by the original Anki flashcard app

## Support

For issues, questions, or feature requests, please [open an issue](https://github.com/yourusername/LearnArabic/issues).

---

**Built with ❤️ for Arabic learners**

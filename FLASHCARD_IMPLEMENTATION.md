# Flashcard System Implementation - Local Storage Only

## Overview
Successfully copied the advanced Anki-based flashcard system from Englishlearning project and adapted it for **local-only storage** using AsyncStorage (no Supabase).

## What Was Implemented

### 1. Core Anki Algorithm
**Location**: `src/screens/utils/ankiScheduler.js`

Features:
- ✅ Full Anki SRS (Spaced Repetition System) algorithm
- ✅ 4 rating buttons: Again (1), Hard (2), Good (3), Easy (4)
- ✅ Card states: new → learning → review (with relearning on failure)
- ✅ Learning steps: 1 minute, 10 minutes, then graduate to 1 day
- ✅ Ease factor adjustments based on performance
- ✅ Fuzzing for review intervals (±5%)
- ✅ Proper scheduling with midnight alignment for 1+ day intervals

### 2. Local Queue Manager
**Location**: `src/screens/utils/localQueueManager.js`

Features:
- ✅ Manages card rotation during study sessions
- ✅ Timer-based card reappearance (learning cards with <1 day intervals)
- ✅ Waiting queue for cards with future due times
- ✅ Automatic queue updates every 5 seconds
- ✅ Prevents session end if cards have intervals < 1 day

### 3. Components

#### AnkiRatingButtons
**Location**: `src/screens/components/AnkiRatingButtons.js`

- 4-button interface (Again/Hard/Good/Easy)
- Color-coded: Red/Orange/Green/Blue
- Responsive sizing for different screen sizes

#### useFlashcardAnimations Hook
**Location**: `src/screens/hooks/useFlashcardAnimations.js`

- Card flip animations
- Swipe gesture support
- Dual card system (A/B) for smooth transitions
- Scale effects during interaction

### 4. FlashcardContext (Local Storage)
**Location**: `src/context/FlashcardContext.js`

**IMPORTANT**: Completely rewritten to use **AsyncStorage only** - NO Supabase!

Features:
- ✅ Stores flashcards in `@learnarabic_flashcards`
- ✅ Stores progress in `@learnarabic_flashcard_progress`
- ✅ Includes 3 sample flashcards (hello, water, book)
- ✅ Full Anki scheduling integration
- ✅ Add custom flashcards
- ✅ Reset progress functionality
- ✅ Compatible with existing code

Storage Keys:
```javascript
const FLASHCARDS_KEY = '@learnarabic_flashcards';
const PROGRESS_KEY = '@learnarabic_flashcard_progress';
```

## File Structure

```
src/
├── screens/
│   ├── components/
│   │   ├── AnkiRatingButtons.js          ✅ NEW
│   │   └── FlashcardItem.js              (existing)
│   ├── hooks/
│   │   └── useFlashcardAnimations.js     ✅ NEW
│   ├── utils/
│   │   ├── ankiScheduler.js              ✅ NEW
│   │   └── localQueueManager.js          ✅ NEW
│   └── FlashcardActivity.js              (needs update)
└── context/
    └── FlashcardContext.js                ✅ UPDATED (local-only)
```

## Next Steps

### To Fully Integrate:

1. **Update FlashcardActivity.js**
   - Import and use `LocalQueueManager` from `./utils/localQueueManager`
   - Import and use `AnkiRatingButtons` from `./components/AnkiRatingButtons`
   - Import `useFlashcardAnimations` from `./hooks/useFlashcardAnimations`
   - Replace simple button logic with Anki rating system
   - Integrate timer-based card rotation

2. **Add More Flashcards**
   - Edit `INITIAL_FLASHCARDS` in `FlashcardContext.js`
   - Or implement a way to import from JSON files
   - Or use the `createAndAddCustomFlashcard` function

3. **Test the System**
   - Study a few cards
   - Verify timers work (1 min, 10 min intervals)
   - Check progress persists across app restarts
   - Verify cards graduate properly (new → learning → review)

## Sample Flashcard Data Structure

```javascript
{
  id: '1',                              // Unique ID
  word: 'hello',                        // English word
  arabic_translation: 'مرحبا',          // Arabic translation
  english_text: 'hello',                // English text (duplicate for compatibility)
  arabic_text: 'مرحبا',                 // Arabic text (duplicate for compatibility)
  definition: 'A greeting...',          // Definition/explanation
  example_sentence: 'Hello, how are you?', // Example usage
  image_url: null                       // Optional image URL
}
```

## Progress Data Structure

```javascript
{
  ease_factor: 2.50,           // Ease multiplier (1.30 min, 2.50 default)
  interval_days: 0.000694,     // Days until next review (can be fractional)
  step_index: 0,               // Current learning step (0 or 1)
  card_state: 'learning',      // new | learning | review | relearning
  lapses: 0,                   // Number of times failed
  reviews_count: 1,            // Total number of reviews
  next_review_at: '2025-...',  // ISO timestamp of next review
  last_reviewed_at: '2025-...', // ISO timestamp of last review
  last_rating: 3,              // Last button pressed (1-4)
  scheduled_days_before_lapse: null // Used for relearning graduation
}
```

## Key Differences from Englishlearning

1. **No Supabase** - Everything stored locally in AsyncStorage
2. **Simplified** - Removed user authentication dependency
3. **Sample Data** - Includes 3 starter flashcards
4. **Mock User** - Uses `{ id: 'local-user' }` instead of real user object

## How the Anki Algorithm Works

1. **New Card** → Press "Good" → Learning (1 min)
2. **Learning (1 min)** → Press "Good" → Learning (10 min)  
3. **Learning (10 min)** → Press "Good" → Review (1 day)
4. **Review (1 day)** → Press "Good" → Review (2.5 days)
5. **Review (2.5 days)** → Press "Good" → Review (6.25 days)
6. **Review (6.25 days)** → Press "Easy" → Review (~18 days)

If you press "Again" on a review card, it goes to "Relearning" state and restarts the learning steps.

## Testing Checklist

- [ ] App loads without errors
- [ ] 3 sample flashcards appear
- [ ] Can flip cards (tap to flip)
- [ ] 4 rating buttons work (Again/Hard/Good/Easy)
- [ ] Card disappears after rating
- [ ] Next card appears
- [ ] Timer works (learning cards reappear after 1 min)
- [ ] Progress persists after closing/reopening app
- [ ] Can add custom flashcards
- [ ] Reset progress works

## Resources

- Anki Algorithm: https://faqs.ankiweb.net/what-spaced-repetition-algorithm.html
- AsyncStorage: https://react-native-async-storage.github.io/async-storage/

---

**Status**: Core implementation complete ✅  
**Next**: Update FlashcardActivity.js to use the new system

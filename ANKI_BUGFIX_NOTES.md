# Anki Flashcard Bug Analysis

## Bug #1: Good Button Shows Wrong Time (1min vs 10min)

### Symptoms
- Good button shows "1m" when it should show "10m"
- Happens "often" but not always (intermittent)

### Root Cause Analysis
In `FlashcardScreen/index.js`, the cardProgress fallback chain:
```javascript
const currentCardProgress = currentCard ? (currentCard.cardProgress || localUserProgress[currentCard.id] || {
  card_state: 'new',  // DEFAULT IS 'new'!
  ...
}) : null;
```

When a card returns from the waiting queue:
1. `currentCard.cardProgress` should have the correct state
2. But if it's undefined (race condition), falls back to `localUserProgress`
3. If that's also not synced yet, falls back to defaults with `card_state: 'new'`
4. For 'new' cards, Good shows 1m (first learning step)

### The Timing Display Logic (AnkiRatingButtons.js)
For a LEARNING card at step_index 0:
- Good should advance to step 1 (10m)
- `nextInterval = LEARNING_STEPS[nextStepIndex]` = `LEARNING_STEPS[1]` = 10m

But if card erroneously shows as 'new':
- Good shows LEARNING_STEPS[0] = 1m

### Fix
Ensure `cardProgress` is always properly propagated on the card object when it moves through the queue system.

---

## Bug #2: Cards Interrupt Current Card When Timer Expires

### Symptoms
- User is looking at a card
- Suddenly the card changes to a different card
- Very disruptive UX

### Root Cause
In `localQueueManager.js`, `checkAndUpdateQueue()`:
```javascript
// Card is due - add to TOP of queue (highest priority)
this.queue.unshift(waitingCard.card);  // <-- INTERRUPTS!
```

Then the callback fires:
```javascript
queueManagerRef.current.setQueueUpdateCallback((queueState) => {
  setSessionCards([...queueState.queue]);  // State updates, re-renders
  setCardCounts(queueState.counts);
});
```

Since `currentIndex` is always 0, and the new card is at index 0, the displayed card changes immediately!

### How Anki Actually Works
From Anki source code (rslib/src/scheduler/queue/mod.rs):
> "newly-due learning cards are queued for the next position rather than interrupting the current card"

Cards become available when:
1. User finishes answering current card
2. Queue counts become zero (all done)

They do NOT interrupt the current card.

### Fix
1. Don't add due cards to TOP of queue
2. Mark them as "ready" but don't disrupt current card
3. Only show newly-due card after user answers current card
4. Or: Add to END of queue, not beginning

---

## Implementation Plan

### Fix #1: Timing Display
- In FlashcardScreen, ensure `cardProgress` is always available from the card object
- The card object in queue should always have `cardProgress` set
- Remove reliance on `localUserProgress` fallback for timing display

### Fix #2: No Interruption
Option A: Add due cards to END of queue, not TOP
```javascript
// Instead of: this.queue.unshift(waitingCard.card);
this.queue.push(waitingCard.card);  // Add to end
```

Option B: Use separate "readyQueue" that only gets processed after current card
- More complex but more correct
- Current card stays at position 0 until answered
- Ready cards get inserted at position 1+ or after answer

### Recommended: Option B (Anki-correct behavior) ✅ IMPLEMENTED
- When a waiting card becomes due, mark it as "ready" but don't add to queue
- When user answers current card, check for ready cards and add them to queue
- This prevents any mid-review interruptions

---

## Fixes Applied

### localQueueManager.js
1. Added `readyCards` Map to hold cards that became due while user is reviewing
2. `checkAndUpdateQueue()` now moves due cards to `readyCards` instead of queue
3. `answerCard()` incorporates ready cards after user finishes answering
4. Updated `getQueueState()` to include ready cards in counts
5. Updated `shouldContinueSession()` to check ready cards
6. Updated `cleanup()` and `initialize()` to handle ready cards

### useFlashcardSession.js
1. Queue update callback now only updates counts, not the displayed card
2. Uses functional update to prevent interrupting current card
3. Only updates sessionCards when queue was empty and cards were auto-pulled

### AnkiRatingButtons.js
1. Added safeguard to prefer `currentCard.cardProgress` as primary source
2. Uses `??` operator for step_index to correctly handle 0 as valid value
3. Falls back to passed cardProgress prop, then defaults

### Expected Behavior After Fix
- Cards becoming due will show in learning count immediately
- But the displayed card won't change until user answers
- After answering, ready cards are incorporated and shown next
- No more mid-review interruptions

---

## Additional Issues Found and Fixed

### Issue 3: UTC Midnight vs Local Midnight (HIGH PRIORITY)
**Problem**: Cards with intervals ≥1 day were scheduled for midnight UTC instead of local midnight.
- For users in UTC+5, a card "due tomorrow" would be due at 5 AM local time
- For users in UTC-8, a card "due tomorrow" would be due at 4 PM the previous day

**Fix**: Changed midnight scheduling to use LOCAL midnight:
```javascript
// Before: UTC midnight
nextReviewFormatted = `${dateStr}T00:00:00.000Z`;

// After: Local midnight
targetDate.setHours(0, 0, 0, 0);
nextReviewFormatted = targetDate.toISOString();
```

### Issue 4: Fuzzing Could Break Midnight Scheduling (MEDIUM)
**Problem**: The ±5% fuzzing could push a 1-day interval to 0.95 days, which would then NOT get midnight scheduling.

**Fix**:
1. Check if interval is "daily" (≥1 day) BEFORE fuzzing
2. Ensure fuzzed interval stays ≥1 day with `Math.max(1, ...)`

### Issue 5: No Maximum Ease Factor (LOW)
**Problem**: Ease factor could grow unbounded with repeated Easy presses (2.5 → 2.6 → 2.7 → ... → infinity).

**Fix**: Added `MAX_EASE_FACTOR = 3.00` constant and capped ease increases:
```javascript
newEaseFactor = Math.min(MAX_EASE_FACTOR, newEaseFactor + 0.10);
```

---

## Summary of All Files Modified

### Flashcards/utils/ankiScheduler.js
- Added `MAX_EASE_FACTOR = 3.00`
- Fixed fuzzing to not break daily scheduling
- Fixed midnight scheduling to use local time instead of UTC
- Capped ease factor increases at maximum

### Flashcards/utils/localQueueManager.js
- Added `readyCards` Map for Anki-correct queue behavior
- `checkAndUpdateQueue()` moves due cards to ready state, not queue
- `answerCard()` incorporates ready cards after user answers
- Updated counts to include ready cards

### src/hooks/useFlashcardSession.js
- Queue callback only updates counts, not displayed card
- Uses functional state update to prevent interruptions

### src/screens/components/AnkiRatingButtons.js
- Prefers `currentCard.cardProgress` as primary source
- Uses `??` for step_index to correctly handle 0

---

## Issue 6: Queue Sorting Bug (Found During Testing)

**Problem**: In `sortQueue()`, the line:
```javascript
return (stateOrder[aState] || 3) - (stateOrder[bState] || 3);
```

Since `stateOrder['relearning'] = 0` and `0` is falsy in JavaScript, `0 || 3` evaluates to `3`. This meant relearning cards were sorted as lowest priority instead of highest!

**Fix**: Use nullish coalescing (`??`) instead of logical OR (`||`):
```javascript
return (stateOrder[aState] ?? 3) - (stateOrder[bState] ?? 3);
```

Now `0 ?? 3` correctly evaluates to `0`, preserving the relearning priority.

---

## Test Coverage

Created test files to verify implementation:

### Flashcards/utils/ankiScheduler.test.js (25 tests)
- New card behavior (Again, Hard, Good, Easy)
- Learning card step progression
- Review card interval calculations
- Relearning card behavior
- Ease factor bounds
- Fuzzing and midnight scheduling

### Flashcards/utils/localQueueManager.test.js (12 tests)
- Queue initialization and sorting
- No-interruption behavior (readyCards)
- Ready cards incorporation after answering
- Queue state counts
- Empty queue behavior

Run tests with:
```bash
node Flashcards/utils/ankiScheduler.test.js
node Flashcards/utils/localQueueManager.test.js
```

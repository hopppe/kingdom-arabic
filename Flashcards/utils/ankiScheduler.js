// Anki Spaced Repetition Algorithm Utility

// Anki learning steps (in minutes): 1m, 10m
export const LEARNING_STEPS = [1, 10];

// Anki graduating interval (in days)
export const GRADUATING_INTERVAL = 1;

// Easy interval for new/learning cards (in days)
// Set to 2 days for gentler progression
export const EASY_INTERVAL = 2;

// Maximum interval (in days)
export const MAX_INTERVAL = 36500; // ~100 years

// Minimum ease factor
export const MIN_EASE_FACTOR = 1.30;

// Default ease factor for new cards
export const DEFAULT_EASE_FACTOR = 2.50;

// New interval after lapse (percentage of previous interval)
// Anki default is 0% (resets to 1 day), but we'll use 50% to be more forgiving
export const LAPSE_NEW_INTERVAL_MULTIPLIER = 0.50;

/**
 * Calculate next review schedule using Anki algorithm
 *
 * ANKI SPACED REPETITION BEHAVIOR:
 * - New cards: Start at learning step 1 (1min), then step 2 (10min), then graduate to 1 day
 * - Learning cards: Progress through steps (1min, 10min) until graduating to review state
 * - Review cards: Intervals multiply by ease factor (default 2.5) on each correct review
 * - Failed cards: Move to relearning state with short intervals, then re-graduate
 *
 * BUTTON EFFECTS:
 * - Again (1): Reset to first learning step, decrease ease (review cards only)
 * - Hard (2): Repeat current step or multiply interval by 1.2, decrease ease slightly
 * - Good (3): Move to next step or multiply interval by ease factor (ease unchanged)
 * - Easy (4): New/Learning → 2 days; Review → multiply by ease * 1.15, increase ease
 *
 * DAILY DECK BEHAVIOR:
 * - New cards: Always available for study
 * - Learning/Relearning cards: Hidden until next_review_at time passes (1min, 10min, etc.)
 * - Review cards: Hidden until next_review_at date arrives (1+ days)
 * - User sees empty deck if no cards are due (must wait for intervals to pass)
 *
 * INTERVAL PROGRESSION (example):
 * 1. New card → "Good" → Learning (1min) → wait 1min
 * 2. Learning → "Good" → Learning (10min) → wait 10min
 * 3. Learning → "Good" → Review (1 day) → wait 1 day
 * 4. Review (1d) → "Good" → Review (2.5 days) → wait 2.5 days
 * 5. Review (2.5d) → "Good" → Review (6.25 days) → wait 6.25 days
 * 6. Review (6.25d) → "Easy" → Review (18 days = 6.25 * 2.5 * 1.15) → wait 18 days
 * 7. New card → "Easy" → Review (2 days) → wait 2 days (faster for confident learners)
 * 8. Review (6.25d) → "Again" → Relearning (1min) → wait 1min
 * 9. Relearning → "Good" → Relearning (10min) → wait 10min
 * 10. Relearning → "Good" → Review (3.125 days = 6.25 * 0.5) → wait 3.125 days
 *
 * @param {Object} currentProgress - Current card progress
 * @param {number} rating - User rating (1=Again, 2=Hard, 3=Good, 4=Easy)
 * @returns {Object} New schedule data with updated interval, ease, state
 */
export const calculateAnkiSchedule = (currentProgress, rating) => {
  // Rating: 1=Again, 2=Hard, 3=Good, 4=Easy
  const {
    ease_factor = DEFAULT_EASE_FACTOR,
    interval_days = 1,
    step_index = 0,
    card_state = 'new',
    lapses = 0,
    reviews_count = 0,
    scheduled_days_before_lapse = null // Store scheduled_days before lapse for relearning graduation
  } = currentProgress;

  const now = new Date();
  let newEaseFactor = parseFloat(ease_factor);
  let newInterval = parseFloat(interval_days);
  let newStepIndex = parseInt(step_index);
  let newCardState = card_state;
  let newLapses = parseInt(lapses);
  let newScheduledDaysBeforeLapse = scheduled_days_before_lapse;

  if (card_state === 'new') {
    // New cards
    if (rating === 1) { // Again
      newCardState = 'learning';
      newStepIndex = 0;
      newInterval = parseFloat((LEARNING_STEPS[0] / (24 * 60)).toFixed(6)); // Convert minutes to days
    } else if (rating === 2) { // Hard
      newCardState = 'learning';
      newStepIndex = 0;
      newInterval = parseFloat((LEARNING_STEPS[0] / (24 * 60)).toFixed(6));
    } else if (rating === 3) { // Good
      newCardState = 'learning';
      newStepIndex = 0;
      newInterval = parseFloat((LEARNING_STEPS[0] / (24 * 60)).toFixed(6));
    } else if (rating === 4) { // Easy
      newCardState = 'review';
      newInterval = parseFloat(EASY_INTERVAL.toFixed(6));
      newEaseFactor = parseFloat(DEFAULT_EASE_FACTOR.toFixed(2));
    }
  } else if (card_state === 'learning') {
    // Learning cards
    if (rating === 1) { // Again
      newStepIndex = 0;
      newInterval = parseFloat((LEARNING_STEPS[0] / (24 * 60)).toFixed(6));
    } else if (rating === 2) { // Hard
      // Repeat current step
      const stepMinutes = LEARNING_STEPS[Math.min(newStepIndex, LEARNING_STEPS.length - 1)];
      newInterval = parseFloat((stepMinutes / (24 * 60)).toFixed(6));
    } else if (rating === 3) { // Good
      newStepIndex++;
      if (newStepIndex >= LEARNING_STEPS.length) {
        // Graduate to review
        newCardState = 'review';
        newInterval = parseFloat(GRADUATING_INTERVAL.toFixed(6));
        newEaseFactor = parseFloat(DEFAULT_EASE_FACTOR.toFixed(2));
      } else {
        const stepMinutes = LEARNING_STEPS[newStepIndex];
        newInterval = parseFloat((stepMinutes / (24 * 60)).toFixed(6));
      }
    } else if (rating === 4) { // Easy
      newCardState = 'review';
      newInterval = parseFloat(EASY_INTERVAL.toFixed(6));
      newEaseFactor = parseFloat(DEFAULT_EASE_FACTOR.toFixed(2));
    }
  } else if (card_state === 'review') {
    // Review cards (already graduated)
    if (rating === 1) { // Again - move to relearning
      newCardState = 'relearning';
      newStepIndex = 0;
      newInterval = parseFloat((LEARNING_STEPS[0] / (24 * 60)).toFixed(6));
      newLapses++;
      newEaseFactor = parseFloat(Math.max(MIN_EASE_FACTOR, newEaseFactor - 0.20).toFixed(2));
      // Store the SCHEDULED_DAYS (not current tiny interval) before lapse for relearning graduation
      // This matches Anki's approach where RelearnState contains the full ReviewState
      newScheduledDaysBeforeLapse = parseFloat(interval_days);
    } else if (rating === 2) { // Hard
      newInterval = parseFloat(Math.max(1, newInterval * 1.2).toFixed(6));
      newEaseFactor = parseFloat(Math.max(MIN_EASE_FACTOR, newEaseFactor - 0.15).toFixed(2));
    } else if (rating === 3) { // Good
      newInterval = parseFloat((newInterval * newEaseFactor).toFixed(6));
      // Ease factor stays the same on Good
    } else if (rating === 4) { // Easy
      // For review cards, use a gentler multiplier for Easy
      // Instead of ease * 1.3 (which is ~3.25x), use ease * 1.15 (~2.88x)
      newInterval = parseFloat((newInterval * newEaseFactor * 1.15).toFixed(6));
      newEaseFactor = parseFloat((newEaseFactor + 0.10).toFixed(2));
    }

    // Ensure minimum 1 day interval for review cards (only if staying in review state)
    if (newCardState === 'review' && newInterval < 1) {
      newInterval = 1;
    }

    // Apply maximum interval cap (only if staying in review state)
    if (newCardState === 'review') {
      newInterval = Math.min(newInterval, MAX_INTERVAL);
    }
  } else if (card_state === 'relearning') {
    // Relearning cards (failed review cards)
    if (rating === 1) { // Again
      newStepIndex = 0;
      newInterval = parseFloat((LEARNING_STEPS[0] / (24 * 60)).toFixed(6));
    } else if (rating === 2) { // Hard
      // Repeat current step
      const stepMinutes = LEARNING_STEPS[Math.min(newStepIndex, LEARNING_STEPS.length - 1)];
      newInterval = parseFloat((stepMinutes / (24 * 60)).toFixed(6));
    } else if (rating === 3) { // Good
      newStepIndex++;
      if (newStepIndex >= LEARNING_STEPS.length) {
        // Graduate back to review using the SCHEDULED_DAYS before lapse (with multiplier)
        newCardState = 'review';
        // Use stored scheduled_days before lapse, with safe fallback to 1 day minimum
        // This matches Anki's behavior where review state is preserved in RelearnState
        const baseInterval = newScheduledDaysBeforeLapse || 1;
        // Apply lapse new interval multiplier (Anki default 0%, we use 50%)
        const lapseInterval = baseInterval * LAPSE_NEW_INTERVAL_MULTIPLIER;
        newInterval = parseFloat(Math.max(1, lapseInterval).toFixed(6));
        newScheduledDaysBeforeLapse = null; // Clear the stored interval
      } else {
        const stepMinutes = LEARNING_STEPS[newStepIndex];
        newInterval = parseFloat((stepMinutes / (24 * 60)).toFixed(6));
      }
    } else if (rating === 4) { // Easy
      // Graduate back to review using the SCHEDULED_DAYS before lapse
      newCardState = 'review';
      // Use stored scheduled_days before lapse, with safe fallback to 1 day minimum
      const baseInterval = newScheduledDaysBeforeLapse || 1;
      // Easy button on relearning: more forgiving, use 70% of previous interval
      const lapseInterval = baseInterval * Math.min(0.70, LAPSE_NEW_INTERVAL_MULTIPLIER * 1.4);
      newInterval = parseFloat(Math.max(1, lapseInterval).toFixed(6));
      newScheduledDaysBeforeLapse = null; // Clear the stored interval
    }
  }

  // Add fuzzing for intervals >= 1 day (±5% randomization)
  if (newInterval >= 1) {
    const fuzzRange = Math.max(0.01, newInterval * 0.05);
    const fuzz = (Math.random() - 0.5) * 2 * fuzzRange;
    newInterval = parseFloat(Math.max(0.001, newInterval + fuzz).toFixed(6));
  }

  // Calculate next review time
  const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

  // IMPORTANT: For intervals >= 1 day, set review time to midnight (start of day)
  // This makes all flashcards due on a specific date become available at the same time
  // Example: Review card at 3PM Monday with 3-day interval → Due at 12:00AM Thursday
  let nextReviewFormatted;
  if (newInterval >= 1) {
    // Get the date in YYYY-MM-DD format
    const dateStr = nextReview.toISOString().split('T')[0];
    // Set time to midnight UTC
    nextReviewFormatted = `${dateStr}T00:00:00.000Z`;
  } else {
    // For learning intervals (< 1 day), use exact time
    nextReviewFormatted = nextReview.toISOString();
  }

  return {
    ease_factor: newEaseFactor,
    interval_days: newInterval,
    step_index: newStepIndex,
    card_state: newCardState,
    lapses: newLapses,
    next_review_at: nextReviewFormatted,
    reviews_count: reviews_count + 1,
    scheduled_days_before_lapse: newScheduledDaysBeforeLapse // Preserve for relearning graduation
  };
};

/**
 * Calculate Anki scheduled cards for study
 * SINGLE SOURCE OF TRUTH for determining which cards should be available
 * @param {Array} deckCards - All cards in deck
 * @param {Object} progress - User progress data
 * @returns {Object} { scheduledCards: [], counts: { new, learning, review, total } }
 */
export const calculateAnkiScheduledCards = (deckCards, progress) => {
  if (!deckCards || deckCards.length === 0) {
    return {
      scheduledCards: [],
      counts: { new: 0, learning: 0, review: 0, total: 0 }
    };
  }

  const now = new Date();
  const newCards = [];
  const learningCards = [];
  const reviewCards = [];
  const relearningCards = [];

  deckCards.forEach(card => {
    // Use progress from userProgress if available, otherwise use embedded card data
    const cardProgress = progress[card.id] || {
      card_state: card.card_state,
      next_review_at: card.next_review_at,
      reviews_count: card.reviews_count || 0
    };

    // If no progress and no embedded data, it's a new card
    if (!cardProgress.card_state && cardProgress.reviews_count === 0) {
      newCards.push(card);
      return;
    }

    const { card_state, next_review_at, reviews_count } = cardProgress;
    const dueTime = next_review_at ? new Date(next_review_at) : null;

    switch (card_state) {
      case 'new':
        // New cards - available for study ONLY if never reviewed
        if (reviews_count === 0) {
          newCards.push(card);
        } else {
          // Card has been reviewed but still in 'new' state - this is wrong!
          console.warn(`⚠️ Card "${card.word}" has state='new' but reviews_count=${reviews_count} - should be 'learning'`);
        }
        break;

      case 'learning':
        // Learning cards - due when their step interval has elapsed
        const isLearningDue = !dueTime || dueTime <= now;
        if (isLearningDue) {
          learningCards.push({...card, dueTime});
        }
        break;

      case 'review':
        // Review cards - due when their interval has elapsed
        if (!dueTime || dueTime <= now) {
          reviewCards.push({...card, dueTime});
        }
        break;

      case 'relearning':
        // Relearning cards - due when their step interval has elapsed
        if (!dueTime || dueTime <= now) {
          relearningCards.push({...card, dueTime});
        }
        break;
    }
  });

  // Sort learning/relearning by due time (earliest first)
  learningCards.sort((a, b) => (a.dueTime || new Date()) - (b.dueTime || new Date()));
  relearningCards.sort((a, b) => (a.dueTime || new Date()) - (b.dueTime || new Date()));

  // Combine in Anki priority order
  const scheduledCards = [
    ...relearningCards,  // Highest priority - failed cards
    ...learningCards,    // Second priority - cards being learned
    ...reviewCards,      // Third priority - cards due for review
    ...newCards          // Lowest priority - new cards
  ];

  // Return both the cards AND the counts (single source of truth)
  return {
    scheduledCards,
    counts: {
      new: newCards.length,
      learning: learningCards.length + relearningCards.length, // Combine for display
      review: reviewCards.length,
      total: scheduledCards.length
    }
  };
};
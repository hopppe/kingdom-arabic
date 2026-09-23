// Pure helpers for summarizing Anki flashcard progress into dashboard buckets.
// See src/context/FlashcardContext.js for the `userProgress` shape this reads.

export const MATURE_INTERVAL_DAYS = 21;

/**
 * Buckets every card's progress into new / learning (incl. relearning) /
 * young review / mature review, plus how many are due right now.
 * `userProgress`: { [cardId]: { card_state, interval_days, next_review_at } }
 */
export function bucketFlashcardProgress(userProgress, now = new Date()) {
  const counts = { new: 0, learning: 0, young: 0, mature: 0, dueToday: 0 };
  Object.values(userProgress || {}).forEach((progress) => {
    if (!progress) return;
    const { card_state: state, interval_days: intervalDays = 0, next_review_at: nextReviewAt } = progress;

    if (state === 'new') {
      counts.new += 1;
    } else if (state === 'learning' || state === 'relearning') {
      counts.learning += 1;
    } else if (state === 'review') {
      if (intervalDays >= MATURE_INTERVAL_DAYS) {
        counts.mature += 1;
      } else {
        counts.young += 1;
      }
    }

    if (nextReviewAt) {
      const dueAt = new Date(nextReviewAt).getTime();
      if (!Number.isNaN(dueAt) && dueAt <= now.getTime()) {
        counts.dueToday += 1;
      }
    }
  });
  return counts;
}

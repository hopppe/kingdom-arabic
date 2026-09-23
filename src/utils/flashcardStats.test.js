import { bucketFlashcardProgress, MATURE_INTERVAL_DAYS } from './flashcardStats';

const NOW = new Date(2026, 8, 23, 10, 0);
const past = (msAgo) => new Date(NOW.getTime() - msAgo).toISOString();
const future = (msAhead) => new Date(NOW.getTime() + msAhead).toISOString();

describe('bucketFlashcardProgress', () => {
  it('returns all zeros for empty progress', () => {
    expect(bucketFlashcardProgress({}, NOW)).toEqual({ new: 0, learning: 0, young: 0, mature: 0, dueToday: 0 });
  });

  it('ignores nullish entries', () => {
    expect(bucketFlashcardProgress({ a: null, b: undefined }, NOW).new).toBe(0);
  });

  it('buckets new, learning, relearning, young review, and mature review', () => {
    const progress = {
      a: { card_state: 'new', next_review_at: future(1000) },
      b: { card_state: 'learning', next_review_at: past(1000) },
      c: { card_state: 'relearning', next_review_at: past(1000) },
      d: { card_state: 'review', interval_days: 5, next_review_at: future(1000) },
      e: { card_state: 'review', interval_days: MATURE_INTERVAL_DAYS, next_review_at: future(1000) },
    };
    const result = bucketFlashcardProgress(progress, NOW);
    expect(result.new).toBe(1);
    expect(result.learning).toBe(2);
    expect(result.young).toBe(1);
    expect(result.mature).toBe(1);
  });

  it('counts cards due at or before now as dueToday', () => {
    const progress = {
      due: { card_state: 'review', interval_days: 3, next_review_at: past(1000) },
      exactlyNow: { card_state: 'review', interval_days: 3, next_review_at: NOW.toISOString() },
      notYetDue: { card_state: 'review', interval_days: 3, next_review_at: future(1000) },
    };
    expect(bucketFlashcardProgress(progress, NOW).dueToday).toBe(2);
  });

  it('handles missing or invalid next_review_at without throwing', () => {
    const progress = { a: { card_state: 'new' }, b: { card_state: 'new', next_review_at: 'nope' } };
    expect(() => bucketFlashcardProgress(progress, NOW)).not.toThrow();
    expect(bucketFlashcardProgress(progress, NOW).dueToday).toBe(0);
  });
});

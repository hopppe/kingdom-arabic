// Day-level SM-2 style scheduler for memory verses (separate from the
// minute-level Anki flashcard scheduler in Flashcards/utils/ankiScheduler.js
// — verses are reviewed at most a few times a day, not every few minutes).
//
// Pure functions; every function that depends on "today" takes `now`
// explicitly so behavior is deterministic in tests.

export const RATINGS = { AGAIN: 'again', HARD: 'hard', GOOD: 'good', EASY: 'easy' };
export const STATUS = { LEARNING: 'learning', REVIEWING: 'reviewing', MASTERED: 'mastered' };

export const DEFAULT_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;
export const MASTERED_INTERVAL_DAYS = 21;

const HARD_MULTIPLIER = 1.2;
const HARD_EASE_DELTA = -0.15;
const EASY_MULTIPLIER = 1.3;
const EASY_EASE_DELTA = 0.15;
const SECOND_STEP_DAYS = 3;

const localMidnight = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date, days) => {
  const next = localMidnight(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** Fresh scheduling fields for a verse that hasn't passed Recall yet. */
export function createInitialSchedule() {
  return {
    status: STATUS.LEARNING,
    intervalDays: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    reviewCount: 0,
    lapses: 0,
    dueAt: null,
  };
}

/**
 * Apply a Recall-step grade to a verse's schedule. Returns a new schedule
 * object; never mutates `schedule`.
 *
 * Progression on Good: 1 day -> 3 days -> previousInterval * ease.
 * Hard: previousInterval * 1.2, ease -= 0.15 (floor MIN_EASE_FACTOR).
 * Easy: previousInterval * ease * 1.3, ease += 0.15.
 * Again: back to `learning`, lapses += 1, due again today (same-day re-practice).
 */
export function scheduleReview(schedule, rating, now = new Date()) {
  const ease = schedule?.easeFactor ?? DEFAULT_EASE_FACTOR;
  const interval = schedule?.intervalDays ?? 0;
  const reviewCount = schedule?.reviewCount ?? 0;
  const lapses = schedule?.lapses ?? 0;

  if (rating === RATINGS.AGAIN) {
    return {
      ...schedule,
      status: STATUS.LEARNING,
      intervalDays: 0,
      easeFactor: ease,
      reviewCount,
      lapses: lapses + 1,
      dueAt: localMidnight(now).toISOString(),
    };
  }

  if (![RATINGS.HARD, RATINGS.GOOD, RATINGS.EASY].includes(rating)) {
    throw new Error(`Unknown memory verse rating: ${rating}`);
  }

  // Intervals of 0 (first review) still need a base to multiply from.
  const effectiveInterval = interval > 0 ? interval : 1;
  let nextInterval;
  let nextEase = ease;

  if (rating === RATINGS.HARD) {
    nextInterval = effectiveInterval * HARD_MULTIPLIER;
    nextEase = Math.max(MIN_EASE_FACTOR, ease + HARD_EASE_DELTA);
  } else if (rating === RATINGS.EASY) {
    nextInterval = effectiveInterval * ease * EASY_MULTIPLIER;
    nextEase = ease + EASY_EASE_DELTA;
  } else if (reviewCount === 0) {
    nextInterval = 1;
  } else if (reviewCount === 1) {
    nextInterval = SECOND_STEP_DAYS;
  } else {
    nextInterval = effectiveInterval * ease;
  }

  const intervalDays = Math.max(1, Math.round(nextInterval));
  const status = intervalDays >= MASTERED_INTERVAL_DAYS ? STATUS.MASTERED : STATUS.REVIEWING;

  return {
    ...schedule,
    status,
    intervalDays,
    easeFactor: nextEase,
    reviewCount: reviewCount + 1,
    lapses,
    dueAt: addDays(now, intervalDays).toISOString(),
  };
}

/** Is this verse due for review on `now`'s calendar day (or earlier)? */
export function isDue(schedule, now = new Date()) {
  if (!schedule) return true;
  if (!schedule.dueAt) return schedule.status === STATUS.LEARNING;
  return localMidnight(new Date(schedule.dueAt)).getTime() <= localMidnight(now).getTime();
}

/** Aggregate counts the Progress tab and Memorize home screen both use. */
export function computeMemoryStats(verses, now = new Date()) {
  const list = Array.isArray(verses) ? verses : [];
  let learning = 0;
  let reviewing = 0;
  let mastered = 0;
  let dueToday = 0;

  list.forEach((verse) => {
    if (verse.status === STATUS.MASTERED) {
      mastered += 1;
      if (isDue(verse, now)) dueToday += 1;
    } else if (verse.status === STATUS.REVIEWING) {
      reviewing += 1;
      if (isDue(verse, now)) dueToday += 1;
    } else {
      learning += 1;
    }
  });

  return { total: list.length, learning, reviewing, mastered, dueToday };
}

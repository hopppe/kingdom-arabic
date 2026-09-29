// Pure helpers for the daily activity log that powers streaks and study stats.
// Log shape: { 'YYYY-MM-DD': { cardReviews, cardCorrect, verseReviews, versePractice, chaptersRead,
//                               wordLookups, cardsAdded, versesAdded } }

export const ACTIVITY_TYPES = {
  CARD_REVIEW: 'cardReviews',
  CARD_CORRECT: 'cardCorrect',
  VERSE_REVIEW: 'verseReviews',
  VERSE_PRACTICE: 'versePractice',
  CHAPTER_READ: 'chaptersRead',
  // Recorded for future stats; they don't make a day count toward the streak.
  WORD_LOOKUP: 'wordLookups',
  CARD_ADDED: 'cardsAdded',
  VERSE_ADDED: 'versesAdded',
};

const ACTIVITY_KEYS = Object.values(ACTIVITY_TYPES);
const STUDY_KEYS = [
  ACTIVITY_TYPES.CARD_REVIEW,
  ACTIVITY_TYPES.CARD_CORRECT,
  ACTIVITY_TYPES.VERSE_REVIEW,
  ACTIVITY_TYPES.VERSE_PRACTICE,
  ACTIVITY_TYPES.CHAPTER_READ,
];

// Days kept in the log (about three years); older entries are dropped on write.
export const ACTIVITY_RETENTION_DAYS = 1100;

const pad = (value) => String(value).padStart(2, '0');

/** Local-time calendar day key, so a streak follows the user's own midnight. */
export const toDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const fromDateKey = (key) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (date, days) => {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
};

export const emptyDay = () => Object.fromEntries(ACTIVITY_KEYS.map((key) => [key, 0]));

// A streak day needs real study; looking words up or adding cards alone doesn't count.
const isActiveDay = (day) => Boolean(day) && STUDY_KEYS.some((key) => (day[key] || 0) > 0);

/** Returns a new log with `count` added to `type` on the given day. */
export function addActivity(log, type, count = 1, date = new Date()) {
  if (!ACTIVITY_KEYS.includes(type)) {
    throw new Error(`Unknown activity type: ${type}`);
  }
  const key = toDateKey(date);
  const day = { ...emptyDay(), ...(log[key] || {}) };
  return pruneActivity({ ...log, [key]: { ...day, [type]: day[type] + count } }, date);
}

export function pruneActivity(log, today = new Date()) {
  const cutoff = toDateKey(addDays(today, -ACTIVITY_RETENTION_DAYS));
  return Object.fromEntries(Object.entries(log).filter(([key]) => key >= cutoff));
}

/**
 * Current streak: consecutive active days ending today. If today has no activity
 * yet, the streak still counts through yesterday (it is not broken until midnight).
 */
export function computeCurrentStreak(log, today = new Date()) {
  let cursor = isActiveDay(log[toDateKey(today)]) ? today : addDays(today, -1);
  let streak = 0;
  while (isActiveDay(log[toDateKey(cursor)])) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function computeLongestStreak(log) {
  const activeKeys = Object.keys(log).filter((key) => isActiveDay(log[key])).sort();
  let longest = 0;
  let run = 0;
  let previous = null;
  activeKeys.forEach((key) => {
    const date = fromDateKey(key);
    run = previous && toDateKey(addDays(previous, 1)) === key ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  });
  return longest;
}

/** Oldest-first list of the last `days` days, including empty ones. */
export function lastNDays(log, days, today = new Date()) {
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(today, index - days + 1);
    const key = toDateKey(date);
    return { key, date, ...emptyDay(), ...(log[key] || {}) };
  });
}

export function sumActivity(log, days, today = new Date()) {
  return lastNDays(log, days, today).reduce((totals, day) => {
    const next = { ...totals };
    ACTIVITY_KEYS.forEach((key) => {
      next[key] += day[key];
    });
    return next;
  }, emptyDay());
}

/** Share of flashcard answers that were not "Again", or null with no reviews. */
export function computeRetention(log, days = 30, today = new Date()) {
  const totals = sumActivity(log, days, today);
  if (totals.cardReviews === 0) return null;
  return totals.cardCorrect / totals.cardReviews;
}

export const countActiveDays = (log, days, today = new Date()) =>
  lastNDays(log, days, today).filter((day) => isActiveDay(day)).length;

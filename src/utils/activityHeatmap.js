// GitHub-style activity grid: one column per week (Sunday at the top), ending with
// the current week. Days after today are null so the last column stays ragged.
import { ACTIVITY_TYPES, lastNDays } from './activityStats';

// Minimum study actions in a day for each shade (index = level).
export const HEATMAP_THRESHOLDS = [0, 1, 5, 15, 30];

const dayTotal = (day) =>
  (day[ACTIVITY_TYPES.CARD_REVIEW] || 0) +
  (day[ACTIVITY_TYPES.VERSE_REVIEW] || 0) +
  (day[ACTIVITY_TYPES.VERSE_PRACTICE] || 0) +
  (day[ACTIVITY_TYPES.CHAPTER_READ] || 0);

/** 0 (no activity) to 4 (a lot). */
export function activityLevel(day) {
  const total = dayTotal(day);
  return HEATMAP_THRESHOLDS.filter((min) => total >= min).length - 1;
}

/** `weeks` columns of 7 cells: { key, level } or null for days after today. */
export function buildHeatmap(log, weeks, today = new Date()) {
  const daysShown = (weeks - 1) * 7 + today.getDay() + 1;
  const days = lastNDays(log, daysShown, today).map((day) => ({ key: day.key, level: activityLevel(day) }));
  return Array.from({ length: weeks }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => days[week * 7 + weekday] ?? null)
  );
}

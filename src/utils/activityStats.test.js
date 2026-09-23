import {
  ACTIVITY_TYPES,
  ACTIVITY_RETENTION_DAYS,
  addActivity,
  addDays,
  computeCurrentStreak,
  computeLongestStreak,
  computeRetention,
  countActiveDays,
  lastNDays,
  sumActivity,
  toDateKey,
} from './activityStats';

const TODAY = new Date(2026, 8, 23, 15, 0);

const logOnDays = (offsets, type = ACTIVITY_TYPES.CARD_REVIEW) =>
  offsets.reduce((log, offset) => addActivity(log, type, 1, addDays(TODAY, offset)), {});

describe('toDateKey', () => {
  it('uses the local calendar day with zero padding', () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('addActivity', () => {
  it('adds counts without mutating the original log', () => {
    const original = {};
    const next = addActivity(original, ACTIVITY_TYPES.CARD_REVIEW, 3, TODAY);
    expect(original).toEqual({});
    expect(next['2026-09-23'].cardReviews).toBe(3);
    expect(next['2026-09-23'].chaptersRead).toBe(0);
  });

  it('accumulates on the same day', () => {
    const log = addActivity(addActivity({}, ACTIVITY_TYPES.CHAPTER_READ, 1, TODAY), ACTIVITY_TYPES.CHAPTER_READ, 2, TODAY);
    expect(log['2026-09-23'].chaptersRead).toBe(3);
  });

  it('rejects unknown activity types', () => {
    expect(() => addActivity({}, 'bogus', 1, TODAY)).toThrow('Unknown activity type');
  });

  it('drops entries older than the retention window', () => {
    const old = { [toDateKey(addDays(TODAY, -ACTIVITY_RETENTION_DAYS - 5))]: { cardReviews: 1 } };
    const next = addActivity(old, ACTIVITY_TYPES.CARD_REVIEW, 1, TODAY);
    expect(Object.keys(next)).toEqual(['2026-09-23']);
  });
});

describe('computeCurrentStreak', () => {
  it('is zero with no activity', () => {
    expect(computeCurrentStreak({}, TODAY)).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    expect(computeCurrentStreak(logOnDays([0, -1, -2, -4]), TODAY)).toBe(3);
  });

  it('keeps the streak alive through yesterday when today is still empty', () => {
    expect(computeCurrentStreak(logOnDays([-1, -2]), TODAY)).toBe(2);
  });

  it('is broken by a missed day before yesterday', () => {
    expect(computeCurrentStreak(logOnDays([-2, -3]), TODAY)).toBe(0);
  });

  it('ignores days whose counts are all zero', () => {
    const log = { [toDateKey(TODAY)]: { cardReviews: 0, chaptersRead: 0 } };
    expect(computeCurrentStreak(log, TODAY)).toBe(0);
  });
});

describe('computeLongestStreak', () => {
  it('finds the longest run anywhere in the log', () => {
    expect(computeLongestStreak(logOnDays([0, -1, -5, -6, -7, -8, -20]))).toBe(4);
  });

  it('handles month boundaries', () => {
    const log = [new Date(2026, 0, 31), new Date(2026, 1, 1)].reduce(
      (acc, date) => addActivity(acc, ACTIVITY_TYPES.CARD_REVIEW, 1, date),
      {}
    );
    expect(computeLongestStreak(log)).toBe(2);
  });
});

describe('lastNDays / sumActivity', () => {
  it('returns oldest-first days including empty ones', () => {
    const days = lastNDays(logOnDays([0]), 3, TODAY);
    expect(days.map((day) => day.key)).toEqual(['2026-09-21', '2026-09-22', '2026-09-23']);
    expect(days[2].cardReviews).toBe(1);
    expect(days[0].cardReviews).toBe(0);
  });

  it('sums a window', () => {
    const log = logOnDays([0, -1, -10]);
    expect(sumActivity(log, 7, TODAY).cardReviews).toBe(2);
    expect(countActiveDays(log, 30, TODAY)).toBe(3);
  });
});

describe('computeRetention', () => {
  it('is null without reviews', () => {
    expect(computeRetention({}, 30, TODAY)).toBeNull();
  });

  it('is correct answers over reviews', () => {
    let log = addActivity({}, ACTIVITY_TYPES.CARD_REVIEW, 10, TODAY);
    log = addActivity(log, ACTIVITY_TYPES.CARD_CORRECT, 8, TODAY);
    expect(computeRetention(log, 30, TODAY)).toBeCloseTo(0.8);
  });
});

import {
  RATINGS,
  STATUS,
  DEFAULT_EASE_FACTOR,
  MIN_EASE_FACTOR,
  MASTERED_INTERVAL_DAYS,
  createInitialSchedule,
  scheduleReview,
  isDue,
  computeMemoryStats,
} from '../scheduler';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('createInitialSchedule', () => {
  it('starts in learning with default ease', () => {
    const schedule = createInitialSchedule();
    expect(schedule.status).toBe(STATUS.LEARNING);
    expect(schedule.easeFactor).toBe(DEFAULT_EASE_FACTOR);
    expect(schedule.intervalDays).toBe(0);
    expect(schedule.reviewCount).toBe(0);
    expect(schedule.lapses).toBe(0);
  });
});

describe('scheduleReview', () => {
  const now = new Date(2026, 0, 1); // Jan 1, 2026, local midnight

  it('first Good sets a 1-day interval and moves to reviewing', () => {
    const schedule = scheduleReview(createInitialSchedule(), RATINGS.GOOD, now);
    expect(schedule.intervalDays).toBe(1);
    expect(schedule.status).toBe(STATUS.REVIEWING);
    expect(schedule.reviewCount).toBe(1);
    expect(new Date(schedule.dueAt).getDate()).toBe(2);
  });

  it('second Good sets a 3-day interval', () => {
    let schedule = scheduleReview(createInitialSchedule(), RATINGS.GOOD, now);
    schedule = scheduleReview(schedule, RATINGS.GOOD, now);
    expect(schedule.intervalDays).toBe(3);
    expect(schedule.reviewCount).toBe(2);
  });

  it('third+ Good multiplies interval by ease', () => {
    let schedule = scheduleReview(createInitialSchedule(), RATINGS.GOOD, now); // 1
    schedule = scheduleReview(schedule, RATINGS.GOOD, now); // 3
    schedule = scheduleReview(schedule, RATINGS.GOOD, now); // 3 * 2.5 = 7.5 -> 8
    expect(schedule.intervalDays).toBe(Math.round(3 * DEFAULT_EASE_FACTOR));
  });

  it('Hard multiplies by 1.2 and lowers ease, floored at MIN_EASE_FACTOR', () => {
    const schedule = scheduleReview(createInitialSchedule(), RATINGS.HARD, now);
    expect(schedule.intervalDays).toBe(1); // effectiveInterval(1) * 1.2 = 1.2 -> round 1
    expect(schedule.easeFactor).toBeCloseTo(DEFAULT_EASE_FACTOR - 0.15);
  });

  it('Hard ease never drops below MIN_EASE_FACTOR', () => {
    let schedule = { ...createInitialSchedule(), easeFactor: MIN_EASE_FACTOR };
    schedule = scheduleReview(schedule, RATINGS.HARD, now);
    expect(schedule.easeFactor).toBe(MIN_EASE_FACTOR);
  });

  it('Easy multiplies by ease * 1.3 and raises ease', () => {
    const schedule = scheduleReview(createInitialSchedule(), RATINGS.EASY, now);
    expect(schedule.intervalDays).toBe(Math.round(1 * DEFAULT_EASE_FACTOR * 1.3));
    expect(schedule.easeFactor).toBeCloseTo(DEFAULT_EASE_FACTOR + 0.15);
  });

  it('Again resets to learning, increments lapses, and is due today', () => {
    let schedule = scheduleReview(createInitialSchedule(), RATINGS.GOOD, now);
    schedule = scheduleReview(schedule, RATINGS.GOOD, now);
    const lapsed = scheduleReview(schedule, RATINGS.AGAIN, now);
    expect(lapsed.status).toBe(STATUS.LEARNING);
    expect(lapsed.intervalDays).toBe(0);
    expect(lapsed.lapses).toBe(1);
    expect(new Date(lapsed.dueAt).getTime()).toBe(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime());
  });

  it('marks mastered once interval reaches MASTERED_INTERVAL_DAYS', () => {
    let schedule = createInitialSchedule();
    // Drive enough Good reviews to cross the mastery threshold.
    for (let i = 0; i < 10 && schedule.intervalDays < MASTERED_INTERVAL_DAYS; i += 1) {
      schedule = scheduleReview(schedule, RATINGS.GOOD, now);
    }
    expect(schedule.intervalDays).toBeGreaterThanOrEqual(MASTERED_INTERVAL_DAYS);
    expect(schedule.status).toBe(STATUS.MASTERED);
  });

  it('throws on an unknown rating', () => {
    expect(() => scheduleReview(createInitialSchedule(), 'bogus', now)).toThrow();
  });

  it('never produces an interval below 1 day', () => {
    const schedule = scheduleReview({ ...createInitialSchedule(), easeFactor: MIN_EASE_FACTOR }, RATINGS.HARD, now);
    expect(schedule.intervalDays).toBeGreaterThanOrEqual(1);
  });
});

describe('isDue', () => {
  const now = new Date(2026, 0, 10);

  it('a fresh learning verse (no dueAt) is due', () => {
    expect(isDue(createInitialSchedule(), now)).toBe(true);
  });

  it('a reviewing verse due in the future is not due', () => {
    const future = new Date(now.getTime() + 5 * DAY_MS).toISOString();
    expect(isDue({ status: STATUS.REVIEWING, dueAt: future }, now)).toBe(false);
  });

  it('a reviewing verse due today is due', () => {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    expect(isDue({ status: STATUS.REVIEWING, dueAt: today }, now)).toBe(true);
  });

  it('a reviewing verse overdue from the past is due', () => {
    const past = new Date(now.getTime() - 5 * DAY_MS).toISOString();
    expect(isDue({ status: STATUS.REVIEWING, dueAt: past }, now)).toBe(true);
  });

  it('handles missing schedule as due', () => {
    expect(isDue(null, now)).toBe(true);
  });
});

describe('computeMemoryStats', () => {
  const now = new Date(2026, 0, 10);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const future = new Date(now.getTime() + 30 * DAY_MS).toISOString();

  it('tallies status buckets and due-today count', () => {
    const verses = [
      { status: STATUS.LEARNING },
      { status: STATUS.LEARNING },
      { status: STATUS.REVIEWING, dueAt: today },
      { status: STATUS.REVIEWING, dueAt: future },
      { status: STATUS.MASTERED, dueAt: today },
    ];
    const stats = computeMemoryStats(verses, now);
    expect(stats).toEqual({ total: 5, learning: 2, reviewing: 2, mastered: 1, dueToday: 2 });
  });

  it('returns zeros for an empty list', () => {
    expect(computeMemoryStats([], now)).toEqual({ total: 0, learning: 0, reviewing: 0, mastered: 0, dueToday: 0 });
  });

  it('handles non-array input', () => {
    expect(computeMemoryStats(undefined, now)).toEqual({ total: 0, learning: 0, reviewing: 0, mastered: 0, dueToday: 0 });
  });
});

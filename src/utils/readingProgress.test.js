import {
  chapterKey,
  computeOverallProgress,
  getBookProgress,
  isChapterRead,
  markChapterRead,
  sanitizeReadChapters,
  unmarkChapterRead,
} from './readingProgress';

const NOW = new Date(2026, 8, 23, 10, 0);

describe('chapterKey', () => {
  it('joins book and chapter with a colon', () => {
    expect(chapterKey('JHN', 3)).toBe('JHN:3');
  });
});

describe('sanitizeReadChapters', () => {
  it('returns an empty object for non-object input', () => {
    expect(sanitizeReadChapters(null)).toEqual({});
    expect(sanitizeReadChapters(undefined)).toEqual({});
    expect(sanitizeReadChapters([])).toEqual({});
    expect(sanitizeReadChapters('nope')).toEqual({});
  });

  it('keeps valid entries', () => {
    const stored = { 'JHN:3': '2026-09-23T10:00:00.000Z' };
    expect(sanitizeReadChapters(stored)).toEqual(stored);
  });

  it('drops unknown books', () => {
    expect(sanitizeReadChapters({ 'ZZZ:1': NOW.toISOString() })).toEqual({});
  });

  it('drops out-of-range chapters', () => {
    expect(sanitizeReadChapters({ 'JHN:999': NOW.toISOString() })).toEqual({});
    expect(sanitizeReadChapters({ 'JHN:0': NOW.toISOString() })).toEqual({});
  });

  it('drops malformed keys and timestamps', () => {
    expect(sanitizeReadChapters({ JHN: NOW.toISOString() })).toEqual({});
    expect(sanitizeReadChapters({ 'JHN:3': 'not-a-date' })).toEqual({});
    expect(sanitizeReadChapters({ 'JHN:3': 12345 })).toEqual({});
  });
});

describe('isChapterRead / markChapterRead / unmarkChapterRead', () => {
  it('is unread by default', () => {
    expect(isChapterRead({}, 'JHN', 3)).toBe(false);
  });

  it('marks a chapter read without mutating the original', () => {
    const original = {};
    const next = markChapterRead(original, 'JHN', 3, NOW);
    expect(original).toEqual({});
    expect(isChapterRead(next, 'JHN', 3)).toBe(true);
    expect(next['JHN:3']).toBe(NOW.toISOString());
  });

  it('is idempotent: marking again keeps the original timestamp and returns the same reference', () => {
    const first = markChapterRead({}, 'JHN', 3, NOW);
    const later = new Date(2026, 8, 24, 10, 0);
    const second = markChapterRead(first, 'JHN', 3, later);
    expect(second).toBe(first);
    expect(second['JHN:3']).toBe(NOW.toISOString());
  });

  it('unmarks a chapter without mutating the original', () => {
    const marked = markChapterRead({}, 'JHN', 3, NOW);
    const next = unmarkChapterRead(marked, 'JHN', 3);
    expect(marked['JHN:3']).toBeDefined();
    expect(next['JHN:3']).toBeUndefined();
  });

  it('unmarking an already-unread chapter returns the same reference', () => {
    const original = {};
    expect(unmarkChapterRead(original, 'JHN', 3)).toBe(original);
  });
});

describe('getBookProgress', () => {
  it('reports zero progress for an unread book', () => {
    expect(getBookProgress({}, 'JHN')).toEqual({ read: 0, total: 21, fraction: 0 });
  });

  it('counts read chapters and computes a fraction', () => {
    let progress = markChapterRead({}, 'JHN', 1, NOW);
    progress = markChapterRead(progress, 'JHN', 2, NOW);
    const result = getBookProgress(progress, 'JHN');
    expect(result.read).toBe(2);
    expect(result.total).toBe(21);
    expect(result.fraction).toBeCloseTo(2 / 21);
  });

  it('returns zeroes for an unknown book', () => {
    expect(getBookProgress({}, 'ZZZ')).toEqual({ read: 0, total: 0, fraction: 0 });
  });
});

describe('computeOverallProgress', () => {
  it('is all zero with no progress', () => {
    const result = computeOverallProgress({});
    expect(result.read).toBe(0);
    expect(result.booksCompleted).toBe(0);
    expect(result.oldTestament.read).toBe(0);
    expect(result.newTestament.read).toBe(0);
    expect(result.total).toBeGreaterThan(0);
  });

  it('splits progress between testaments and counts completed books', () => {
    // Obadiah (OT) has exactly 1 chapter.
    let progress = markChapterRead({}, 'OBA', 1, NOW);
    // John 1 (NT) is one of 21 chapters, not a complete book.
    progress = markChapterRead(progress, 'JHN', 1, NOW);

    const result = computeOverallProgress(progress);
    expect(result.read).toBe(2);
    expect(result.oldTestament.read).toBe(1);
    expect(result.newTestament.read).toBe(1);
    expect(result.booksCompleted).toBe(1);
    expect(result.fraction).toBeCloseTo(2 / result.total);
  });
});

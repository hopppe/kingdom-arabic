import { activityLevel, buildHeatmap } from './activityHeatmap';
import { toDateKey } from './activityStats';

describe('activityLevel', () => {
  it('shades by total study actions', () => {
    expect(activityLevel({})).toBe(0);
    expect(activityLevel({ cardReviews: 1 })).toBe(1);
    expect(activityLevel({ cardReviews: 3, versePractice: 2 })).toBe(2);
    expect(activityLevel({ verseReviews: 20 })).toBe(3);
    expect(activityLevel({ cardReviews: 40, chaptersRead: 1 })).toBe(4);
  });
});

describe('buildHeatmap', () => {
  // Wednesday 2026-09-30.
  const today = new Date(2026, 8, 30, 12);

  it('ends with the current week, Sunday first, future days null', () => {
    const grid = buildHeatmap({}, 3, today);
    expect(grid).toHaveLength(3);
    grid.forEach((week) => expect(week).toHaveLength(7));
    expect(grid[0][0].key).toBe('2026-09-13');
    expect(grid[2][0].key).toBe('2026-09-27');
    expect(grid[2][3].key).toBe(toDateKey(today));
    expect(grid[2][4]).toBeNull();
    expect(grid[2][6]).toBeNull();
  });

  it('carries each day\'s level', () => {
    const grid = buildHeatmap({ [toDateKey(today)]: { cardReviews: 6 } }, 1, today);
    expect(grid[0][3]).toEqual({ key: '2026-09-30', level: 2 });
    expect(grid[0][2].level).toBe(0);
  });
});

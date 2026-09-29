import { summarizeFlashcards, summarizeMemoryVerses } from './progressSummary';

describe('summarizeFlashcards', () => {
  it('counts graduated cards as learned out of every card', () => {
    expect(summarizeFlashcards({ new: 4, learning: 2, young: 3, mature: 1, dueToday: 5 })).toEqual({
      done: 4,
      total: 10,
      due: 5,
      fraction: 0.4,
    });
  });

  it('handles no cards', () => {
    expect(summarizeFlashcards(undefined)).toEqual({ done: 0, total: 0, due: 0, fraction: 0 });
  });
});

describe('summarizeMemoryVerses', () => {
  it('counts reviewing and mastered verses as memorized', () => {
    expect(summarizeMemoryVerses({ total: 8, learning: 3, reviewing: 4, mastered: 1, dueToday: 2 })).toEqual({
      done: 5,
      total: 8,
      due: 2,
      fraction: 0.625,
    });
  });

  it('handles no stats yet', () => {
    expect(summarizeMemoryVerses(null)).toEqual({ done: 0, total: 0, due: 0, fraction: 0 });
  });
});

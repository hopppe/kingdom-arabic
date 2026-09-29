import { getAdjacentChapter } from './chapterNavigation';
import { BOOKS } from '../data/bibleData';

const MINI = [
  { id: 'A', chapters: [1, 2] },
  { id: 'B', chapters: [1, 2, 3] },
];

describe('getAdjacentChapter', () => {
  it('steps within a book', () => {
    expect(getAdjacentChapter(MINI, 'B', 2, 1)).toEqual({ book: 'B', chapter: 3 });
    expect(getAdjacentChapter(MINI, 'B', 2, -1)).toEqual({ book: 'B', chapter: 1 });
  });

  it('crosses into the next book at its first chapter', () => {
    expect(getAdjacentChapter(MINI, 'A', 2, 1)).toEqual({ book: 'B', chapter: 1 });
  });

  it('crosses back into the previous book at its last chapter', () => {
    expect(getAdjacentChapter(MINI, 'B', 1, -1)).toEqual({ book: 'A', chapter: 2 });
  });

  it('stops at the ends of the Bible and on bad input', () => {
    expect(getAdjacentChapter(MINI, 'A', 1, -1)).toBeNull();
    expect(getAdjacentChapter(MINI, 'B', 3, 1)).toBeNull();
    expect(getAdjacentChapter(MINI, 'Z', 1, 1)).toBeNull();
    expect(getAdjacentChapter(MINI, 'A', 1, 0)).toBeNull();
  });

  it('goes from Malachi to Matthew in the real canon', () => {
    expect(getAdjacentChapter(BOOKS, 'MAL', 4, 1)).toEqual({ book: 'MAT', chapter: 1 });
    expect(getAdjacentChapter(BOOKS, 'MAT', 1, -1)).toEqual({ book: 'MAL', chapter: 4 });
  });

  it('returns null for a chapter the book does not have', () => {
    expect(getAdjacentChapter(MINI, 'A', 9, 1)).toBeNull();
    expect(getAdjacentChapter(MINI, 'A', 9, -1)).toBeNull();
  });
});

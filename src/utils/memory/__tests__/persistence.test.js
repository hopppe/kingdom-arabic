import { buildVerseId, isValidMemoryVerse, sanitizeMemoryVerses } from '../persistence';
import { STATUS } from '../scheduler';

const validVerse = {
  id: 'JHN-3-16',
  book: 'JHN',
  chapter: 3,
  verse: 16,
  ar: 'نص عربي',
  en: 'English text',
  status: STATUS.LEARNING,
};

describe('buildVerseId', () => {
  it('formats book-chapter-verse', () => {
    expect(buildVerseId('JHN', 3, 16)).toBe('JHN-3-16');
  });
});

describe('isValidMemoryVerse', () => {
  it('accepts a well-formed entry', () => {
    expect(isValidMemoryVerse(validVerse)).toBe(true);
  });

  it.each([
    ['missing id', { ...validVerse, id: undefined }],
    ['missing book', { ...validVerse, book: '' }],
    ['non-integer chapter', { ...validVerse, chapter: 'three' }],
    ['zero verse', { ...validVerse, verse: 0 }],
    ['missing ar', { ...validVerse, ar: '' }],
    ['missing en', { ...validVerse, en: null }],
    ['bad status', { ...validVerse, status: 'bogus' }],
    ['null entry', null],
    ['non-object entry', 'nope'],
  ])('rejects %s', (_label, entry) => {
    expect(isValidMemoryVerse(entry)).toBe(false);
  });
});

describe('sanitizeMemoryVerses', () => {
  it('filters out malformed entries', () => {
    const result = sanitizeMemoryVerses([validVerse, { id: 'bad' }, null, { ...validVerse, id: 'JHN-14-6' }]);
    expect(result).toHaveLength(2);
  });

  it('returns [] for non-array input', () => {
    expect(sanitizeMemoryVerses(null)).toEqual([]);
    expect(sanitizeMemoryVerses(undefined)).toEqual([]);
    expect(sanitizeMemoryVerses('nope')).toEqual([]);
  });
});

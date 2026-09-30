import {
  clearChapterCache,
  getChapter,
  getRelatedForms,
  getVerse,
  searchVerses,
  MIN_RELATED_STEM_LENGTH,
  mergeGlossCounts,
} from './bibleRepository';

// Minimal stand-in for expo-sqlite's SQLiteDatabase: routes queries by SQL prefix.
const createFakeDb = (handlers) => {
  const route = (sql) => {
    const handler = handlers.find(([pattern]) => pattern.test(sql));
    if (!handler) throw new Error(`Unexpected query: ${sql}`);
    return handler[1];
  };
  return {
    getAllAsync: jest.fn(async (sql, params) => route(sql)(params)),
    getFirstAsync: jest.fn(async (sql, params) => route(sql)(params)),
  };
};

beforeEach(() => clearChapterCache());

describe('getChapter', () => {
  const makeDb = () => createFakeDb([
    [/FROM verses WHERE book = \? AND chapter = \? ORDER BY verse/, () => [
      { verse: 1, ar: 'فِي الْبَدْءِ', en: 'In the beginning' },
      { verse: 2, ar: 'هَذَا كَانَ', en: 'This was' },
    ]],
    [/FROM glosses WHERE book = \? AND chapter = \?/, () => [
      { verse: 1, ar: 'فِي', en: 'in', formId: 10 },
      { verse: 1, ar: 'الْبَدْءِ', en: 'the beginning', formId: 11 },
      { verse: 2, ar: 'هَذَا', en: 'this', formId: 12 },
    ]],
  ]);

  it('builds the reader shape with vocab and gloss entries per verse', async () => {
    const db = makeDb();
    const chapter = await getChapter(db, 'JHN', 1);
    expect(chapter.data.title_english).toBe('John 1');
    expect(chapter.data.content_arabic).toHaveLength(2);
    expect(chapter.data.verse_numbers).toEqual([1, 2]);
    expect(chapter.vocab.verse_1).toEqual({ 'فِي': 'in', 'الْبَدْءِ': 'the beginning' });
    expect(chapter.glosses.verse_2).toEqual([{ ar: 'هَذَا', en: 'this', formId: 12 }]);
  });

  it('passes the numeric book id and caches repeat loads', async () => {
    const db = makeDb();
    await getChapter(db, 'JHN', 1);
    await getChapter(db, 'JHN', 1);
    expect(db.getAllAsync.mock.calls[0][1]).toEqual([43, 1]);
    expect(db.getAllAsync).toHaveBeenCalledTimes(2);
  });

  it('returns null for unknown books without querying', async () => {
    const emptyDb = createFakeDb([]);
    expect(await getChapter(emptyDb, 'XXX', 1)).toBeNull();
  });
});

describe('getVerse', () => {
  it('maps the book number back to its code', async () => {
    const db = createFakeDb([[/FROM verses WHERE book/, () => ({ book: 43, chapter: 3, verse: 16, ar: 'ا', en: 'e' })]]);
    expect(await getVerse(db, 'JHN', 3, 16)).toEqual({ book: 'JHN', chapter: 3, verse: 16, ar: 'ا', en: 'e' });
  });
});

describe('searchVerses', () => {
  const rows = [
    { book: 43, chapter: 3, verse: 16, ar: '', en: 'For God so loved the world' },
    { book: 62, chapter: 4, verse: 8, ar: '', en: 'God is love; he who loves' },
  ];

  it('returns nothing for blank queries', async () => {
    expect(await searchVerses(createFakeDb([]), '   ')).toEqual({ results: [], totalCount: 0 });
  });

  it('uses one escaped LIKE per word for substring search', async () => {
    const db = createFakeDb([
      [/SELECT COUNT\(\*\) AS total FROM verses/, () => ({ total: 2 })],
      [/SELECT book, chapter, verse, ar, en FROM verses/, () => rows],
    ]);
    const { results, totalCount } = await searchVerses(db, 'Lov 100%', 15);
    expect(totalCount).toBe(2);
    expect(results[0]).toMatchObject({ book: 'JHN', bookName: 'John', chapter: 3, verse: 16 });
    expect(db.getFirstAsync.mock.calls[0][1]).toEqual(['%lov%', '%100\\%%']);
  });

  it('filters to whole words when the query ends with a space', async () => {
    const db = createFakeDb([[/SELECT book, chapter, verse, ar, en FROM verses/, () => rows]]);
    const { results, totalCount } = await searchVerses(db, 'love ', 15);
    expect(totalCount).toBe(1);
    expect(results[0].book).toBe('1JN');
  });

  it('searches the normalized Arabic column for Arabic queries', async () => {
    const db = createFakeDb([
      [/SELECT COUNT\(\*\) AS total FROM verses WHERE ar_search LIKE/, () => ({ total: 1 })],
      [/SELECT book, chapter, verse, ar, en FROM verses WHERE ar_search LIKE/, () => [rows[0]]],
    ]);
    const { results, totalCount } = await searchVerses(db, 'أَحَبَّ الْعَالَمَ', 15);
    expect(totalCount).toBe(1);
    expect(results[0].book).toBe('JHN');
    expect(db.getFirstAsync.mock.calls[0][1]).toEqual(['%احب%', '%العالم%']);
  });

  it('pads Arabic whole-word searches with spaces instead of filtering in JS', async () => {
    const db = createFakeDb([
      [/SELECT COUNT\(\*\) AS total FROM verses WHERE ar_search LIKE/, () => ({ total: 0 })],
      [/SELECT book, chapter, verse, ar, en FROM verses WHERE ar_search LIKE/, () => []],
    ]);
    await searchVerses(db, 'محبة ', 15);
    expect(db.getFirstAsync.mock.calls[0][1]).toEqual(['% محبه %']);
  });

  it('returns nothing for Arabic queries that normalize to no letters', async () => {
    expect(await searchVerses(createFakeDb([]), 'ـــ')).toEqual({ results: [], totalCount: 0 });
  });
});

describe('getRelatedForms', () => {
  it('skips very short stems', async () => {
    const db = createFakeDb([[/SELECT stem FROM forms/, () => ({ stem: 'x'.repeat(MIN_RELATED_STEM_LENGTH - 1) })]]);
    expect(await getRelatedForms(db, 1)).toEqual([]);
  });

  it('queries forms sharing the stem, excluding the form itself', async () => {
    const db = createFakeDb([
      [/SELECT stem FROM forms/, () => ({ stem: 'عالم' })],
      [/FROM forms f JOIN glosses g/, (params) => [{ formId: 2, count: 5, sample: 'عَالِمٌ', gloss: 'knowing', params }]],
    ]);
    const related = await getRelatedForms(db, 1, 10);
    expect(related[0].params).toEqual(['عالم', 1, 10]);
    expect(related[0].sample).toBe('عَالِمٌ');
  });
});

describe('mergeGlossCounts', () => {
  it('merges glosses differing by case, apostrophe style and punctuation', () => {
    const merged = mergeGlossCounts([
      { gloss: 'word', count: 5 },
      { gloss: 'word:', count: 2 },
      { gloss: 'Word', count: 1 },
      { gloss: 'Abraham’s', count: 3 },
      { gloss: "Abraham's", count: 1 },
    ]);
    expect(merged).toEqual([
      { gloss: 'word', count: 8 },
      { gloss: "Abraham's", count: 4 },
    ]);
  });

  it('drops empty glosses and respects the limit', () => {
    expect(mergeGlossCounts([{ gloss: ':', count: 1 }, { gloss: 'a', count: 1 }, { gloss: 'b', count: 1 }], 1)).toHaveLength(1);
  });
});

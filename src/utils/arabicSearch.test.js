import {
  getArabicPreviewText,
  isArabicQuery,
  normalizeArabicSearch,
  normalizeArabicWord,
} from './arabicSearch';

describe('isArabicQuery', () => {
  it('detects Arabic letters, including mixed input', () => {
    expect(isArabicQuery('محبة')).toBe(true);
    expect(isArabicQuery('love محبة')).toBe(true);
  });

  it('is false for English, digits and empty input', () => {
    expect(isArabicQuery('love')).toBe(false);
    expect(isArabicQuery('3:16')).toBe(false);
    expect(isArabicQuery('')).toBe(false);
    expect(isArabicQuery(undefined)).toBe(false);
  });
});

describe('normalizeArabicWord', () => {
  // Same outputs as search_text in scripts/build_bible_db.py.
  it.each([
    ['الْكَلِمَةُ،', 'الكلمه'],
    ['«أَنَا', 'انا'],
    ['إِلَى', 'الي'],
    ['مُوسَى', 'موسي'],
    ['آمَنَ', 'امن'],
    ['ٱللهِ', 'الله'],
    ['يَسُوعُ:', 'يسوع'],
    ['ســلام', 'سلام'],
  ])('%s → %s', (word, expected) => {
    expect(normalizeArabicWord(word)).toBe(expected);
  });
});

describe('normalizeArabicSearch', () => {
  it('splits into normalized terms and drops empty ones', () => {
    expect(normalizeArabicSearch('  فِي  الْبَدْءِ ، ')).toEqual(['في', 'البدء']);
  });

  it('matches unvowelled input against vowelled text', () => {
    expect(normalizeArabicSearch('محبة')).toEqual(normalizeArabicSearch('مَحَبَّةٌ'));
  });
});

describe('getArabicPreviewText', () => {
  const verse = 'فِي الْبَدْءِ كَانَ الْكَلِمَةُ، وَالْكَلِمَةُ كَانَ عِنْدَ اللهِ، وَكَانَ الْكَلِمَةُ اللهَ.';

  it('keeps the full verse when the match is near the start', () => {
    expect(getArabicPreviewText(verse, 'كان')).toBe(verse);
  });

  it('starts a few words before a later match, keeping harakat', () => {
    expect(getArabicPreviewText(verse, 'عند')).toBe('…الْكَلِمَةُ، وَالْكَلِمَةُ كَانَ عِنْدَ اللهِ، وَكَانَ الْكَلِمَةُ اللهَ.');
  });

  it('requires an exact word when the query ends with a space', () => {
    expect(getArabicPreviewText(verse, 'الله ')).toBe('…وَالْكَلِمَةُ كَانَ عِنْدَ اللهِ، وَكَانَ الْكَلِمَةُ اللهَ.');
  });

  it('returns the verse unchanged for a query with no Arabic terms', () => {
    expect(getArabicPreviewText(verse, '')).toBe(verse);
  });
});

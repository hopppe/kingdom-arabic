import { getGlossKeyForVerse, getGlossesForVerse } from '../verseGlosses';

const chapterData = {
  data: { verse_numbers: [1, 2, 3, 4] },
  glosses: {
    verse_1: [{ ar: 'في', en: 'in' }],
    verse_3: [{ ar: 'كان', en: 'was' }],
  },
};

describe('getGlossKeyForVerse', () => {
  it('resolves the position-based key for a verse number', () => {
    expect(getGlossKeyForVerse(chapterData, 3)).toBe('verse_3');
  });

  it('returns null for a verse not in the chapter', () => {
    expect(getGlossKeyForVerse(chapterData, 99)).toBeNull();
  });

  it('returns null for malformed chapter data', () => {
    expect(getGlossKeyForVerse(null, 1)).toBeNull();
    expect(getGlossKeyForVerse({}, 1)).toBeNull();
  });

  it('handles a chapter with a gap in verse numbers', () => {
    const gapChapter = { data: { verse_numbers: [1, 5, 6] } };
    expect(getGlossKeyForVerse(gapChapter, 5)).toBe('verse_2');
  });
});

describe('getGlossesForVerse', () => {
  it('returns the glosses for a verse', () => {
    expect(getGlossesForVerse(chapterData, 1)).toEqual([{ ar: 'في', en: 'in' }]);
  });

  it('returns [] when the verse has no glosses entry', () => {
    expect(getGlossesForVerse(chapterData, 2)).toEqual([]);
  });

  it('returns [] for an unknown verse', () => {
    expect(getGlossesForVerse(chapterData, 99)).toEqual([]);
  });
});

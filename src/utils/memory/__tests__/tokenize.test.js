import { stripHarakat, stripPunctuation, normalizeForCompare, tokenizeVerse, isShortParticle } from '../tokenize';

describe('stripHarakat', () => {
  it('removes diacritics but keeps base letters', () => {
    expect(stripHarakat('بِدَايَةُ')).toBe('بداية');
  });
  it('handles empty input', () => {
    expect(stripHarakat('')).toBe('');
    expect(stripHarakat(undefined)).toBe('');
  });
});

describe('stripPunctuation', () => {
  it('removes trailing punctuation', () => {
    expect(stripPunctuation('إِنْجِيلِ،')).toBe('إِنْجِيلِ');
    expect(stripPunctuation('اللهُ.')).toBe('اللهُ');
  });
});

describe('normalizeForCompare', () => {
  it('strips both punctuation and harakat', () => {
    expect(normalizeForCompare('اللهُ.')).toBe('الله');
  });
  it('trims whitespace', () => {
    expect(normalizeForCompare('  كلمة  ')).toBe('كلمة');
  });
});

describe('tokenizeVerse', () => {
  it('splits on whitespace and keeps raw + core forms', () => {
    const tokens = tokenizeVerse('هَذِهِ بِدَايَةُ إِنْجِيلِ.');
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toEqual({ index: 0, raw: 'هَذِهِ', core: 'هذه' });
    expect(tokens[2].raw).toBe('إِنْجِيلِ.');
    expect(tokens[2].core).toBe('إنجيل');
  });

  it('returns [] for empty/invalid input', () => {
    expect(tokenizeVerse('')).toEqual([]);
    expect(tokenizeVerse(null)).toEqual([]);
    expect(tokenizeVerse(undefined)).toEqual([]);
  });

  it('collapses multiple spaces', () => {
    const tokens = tokenizeVerse('كلمة    أخرى');
    expect(tokens).toHaveLength(2);
  });
});

describe('isShortParticle', () => {
  it('flags known particles', () => {
    expect(isShortParticle({ core: 'في' })).toBe(true);
    expect(isShortParticle({ core: 'من' })).toBe(true);
    expect(isShortParticle({ core: 'التي' })).toBe(true);
  });
  it('flags very short words by length fallback', () => {
    expect(isShortParticle({ core: 'لا' })).toBe(true);
  });
  it('does not flag longer content words', () => {
    expect(isShortParticle({ core: 'إنجيل' })).toBe(false);
    expect(isShortParticle({ core: 'بداية' })).toBe(false);
  });
  it('handles missing token gracefully', () => {
    expect(isShortParticle(null)).toBe(false);
    expect(isShortParticle({})).toBe(false);
  });
});

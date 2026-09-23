import { tokenizeVerse } from '../tokenize';
import { alignGlossesToTokens, buildPhraseGloss } from '../glossBuilder';

describe('alignGlossesToTokens', () => {
  it('matches glosses 1:1 when order and count line up', () => {
    const tokens = tokenizeVerse('في البدء كان الكلمة');
    const glosses = [
      { ar: 'في', en: 'in' },
      { ar: 'البدء', en: 'the beginning' },
      { ar: 'كان', en: 'was' },
      { ar: 'الكلمة', en: 'the Word' },
    ];
    const aligned = alignGlossesToTokens(tokens, glosses);
    expect(aligned.map((t) => t.gloss)).toEqual(['in', 'the beginning', 'was', 'the Word']);
  });

  it('skips an unmatched gloss within the lookahead window', () => {
    const tokens = tokenizeVerse('في البدء كان');
    const glosses = [
      { ar: 'في', en: 'in' },
      { ar: 'شيء', en: 'something (extra, unrelated)' }, // stray gloss
      { ar: 'البدء', en: 'the beginning' },
      { ar: 'كان', en: 'was' },
    ];
    const aligned = alignGlossesToTokens(tokens, glosses);
    expect(aligned.map((t) => t.gloss)).toEqual(['in', 'the beginning', 'was']);
  });

  it('leaves gloss null when nothing matches', () => {
    const tokens = tokenizeVerse('كلمة غريبة');
    const aligned = alignGlossesToTokens(tokens, [{ ar: 'مختلف', en: 'different' }]);
    expect(aligned.every((t) => t.gloss === null)).toBe(true);
  });

  it('handles empty glosses/tokens', () => {
    expect(alignGlossesToTokens([], [])).toEqual([]);
    const tokens = tokenizeVerse('كلمة');
    expect(alignGlossesToTokens(tokens, undefined)[0].gloss).toBeNull();
  });
});

describe('buildPhraseGloss', () => {
  it('joins resolved glosses with spaces, skipping nulls', () => {
    const aligned = [{ gloss: 'in' }, { gloss: null }, { gloss: 'the beginning' }];
    expect(buildPhraseGloss(aligned)).toBe('in the beginning');
  });

  it('returns "" for no glosses', () => {
    expect(buildPhraseGloss([])).toBe('');
    expect(buildPhraseGloss(undefined)).toBe('');
  });
});

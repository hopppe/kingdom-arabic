import { alignGlosses } from './interlinear';

const entry = (ar, en) => ({ ar, en, formId: null });

describe('alignGlosses', () => {
  it('pairs tokens with glosses position by position', () => {
    const tokens = ['فِي ', 'الْبَدْءِ ', 'كَانَ'];
    const glosses = [entry('فِي', 'In'), entry('الْبَدْءِ', 'the beginning'), entry('كَانَ', 'was')];
    expect(alignGlosses(tokens, glosses).map((g) => g?.en)).toEqual(['In', 'the beginning', 'was']);
  });

  it('ignores attached punctuation when matching', () => {
    const tokens = ['الْوَحِيدَ، ', 'لِكَيْ'];
    const glosses = [entry('الْوَحِيدَ', 'only'), entry('لِكَيْ', 'so that')];
    expect(alignGlosses(tokens, glosses).map((g) => g?.en)).toEqual(['only', 'so that']);
  });

  it('leaves a word blank when its gloss is missing and keeps later words aligned', () => {
    const tokens = ['أ', 'ب', 'ج'];
    const glosses = [entry('أ', 'a'), entry('ج', 'c')];
    expect(alignGlosses(tokens, glosses).map((g) => g?.en ?? null)).toEqual(['a', null, 'c']);
  });

  it('skips an extra gloss that has no word in the verse', () => {
    const tokens = ['أ', 'ج'];
    const glosses = [entry('أ', 'a'), entry('ب', 'b'), entry('ج', 'c')];
    expect(alignGlosses(tokens, glosses).map((g) => g?.en)).toEqual(['a', 'c']);
  });

  it('falls back to position when the spelling differs but counts match', () => {
    const tokens = ['اللهُ'];
    const glosses = [entry('الله', 'God')];
    expect(alignGlosses(tokens, glosses).map((g) => g?.en)).toEqual(['God']);
  });

  it('returns blanks for a verse with no glosses', () => {
    expect(alignGlosses(['أ', 'ب'], [])).toEqual([null, null]);
    expect(alignGlosses(['أ'], undefined)).toEqual([null]);
  });
});

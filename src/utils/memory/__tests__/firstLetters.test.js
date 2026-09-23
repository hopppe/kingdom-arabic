import { firstLetterCue, firstLetterCueTokens } from '../firstLetters';

describe('firstLetterCue', () => {
  it('reveals the first letter and hides the rest', () => {
    expect(firstLetterCue('بداية')).toBe('ب————');
  });

  it('keeps the first letter\'s own harakat', () => {
    expect(firstLetterCue('بِدَايَةُ')).toBe('بِ———————');
  });

  it('keeps trailing punctuation attached', () => {
    const cue = firstLetterCue('إِنْجِيلِ،');
    expect(cue.endsWith('،')).toBe(true);
    expect(cue.startsWith('إِ')).toBe(true);
  });

  it('uses a custom placeholder', () => {
    expect(firstLetterCue('كتب', '_')).toBe('ك__');
  });

  it('returns a single-character word unchanged (no hidden letters)', () => {
    expect(firstLetterCue('و')).toBe('و');
  });

  it('handles empty input', () => {
    expect(firstLetterCue('')).toBe('');
    expect(firstLetterCue(null)).toBe('');
  });

  it('handles punctuation-only tokens', () => {
    expect(firstLetterCue('،')).toBe('،');
  });
});

describe('firstLetterCueTokens', () => {
  it('maps over a token list', () => {
    const cues = firstLetterCueTokens([{ raw: 'بداية' }, { raw: 'كتاب' }]);
    expect(cues).toHaveLength(2);
    expect(cues[0].startsWith('ب')).toBe(true);
  });

  it('handles empty/missing input', () => {
    expect(firstLetterCueTokens([])).toEqual([]);
    expect(firstLetterCueTokens(undefined)).toEqual([]);
  });
});

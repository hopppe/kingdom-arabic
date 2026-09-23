import { createSeededRandom, selectHiddenIndices, toHiddenSet, hashSeed, FADE_FRACTIONS } from '../hideSelection';
import { tokenizeVerse } from '../tokenize';

describe('createSeededRandom', () => {
  it('is deterministic for the same seed', () => {
    const a = createSeededRandom(42);
    const b = createSeededRandom(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces values in [0, 1)', () => {
    const rng = createSeededRandom(7);
    for (let i = 0; i < 50; i += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('different seeds produce different sequences', () => {
    const a = createSeededRandom(1)();
    const b = createSeededRandom(2)();
    expect(a).not.toBe(b);
  });
});

describe('selectHiddenIndices', () => {
  const tokens = tokenizeVerse('في البدء كان الكلمة والكلمة كان عند الله وكان الكلمة الله');

  it('hides roughly the requested fraction', () => {
    const rng = createSeededRandom(1);
    const indices = selectHiddenIndices(tokens, 0.5, rng);
    expect(indices.length).toBe(Math.round(tokens.length * 0.5));
  });

  it('hides nothing for fraction 0', () => {
    expect(selectHiddenIndices(tokens, 0, createSeededRandom(1))).toEqual([]);
  });

  it('hides everything for fraction 1', () => {
    const indices = selectHiddenIndices(tokens, 1, createSeededRandom(1));
    expect(indices).toEqual(tokens.map((_, i) => i));
  });

  it('returns a sorted array of unique indices', () => {
    const indices = selectHiddenIndices(tokens, 0.75, createSeededRandom(3));
    const sorted = [...indices].sort((a, b) => a - b);
    expect(indices).toEqual(sorted);
    expect(new Set(indices).size).toBe(indices.length);
  });

  it('is deterministic for the same seed', () => {
    const first = selectHiddenIndices(tokens, 0.5, createSeededRandom(99));
    const second = selectHiddenIndices(tokens, 0.5, createSeededRandom(99));
    expect(first).toEqual(second);
  });

  it('prefers hiding content words before particles at low fractions', () => {
    // "في" and "عند" are particles; content words should be chosen first.
    const indices = selectHiddenIndices(tokens, 0.2, createSeededRandom(5));
    const particleIndex = tokens.findIndex((t) => t.core === 'في');
    expect(indices).not.toContain(particleIndex);
  });

  it('handles empty token list', () => {
    expect(selectHiddenIndices([], 0.5)).toEqual([]);
  });

  it('FADE_FRACTIONS increases monotonically to 1', () => {
    expect(FADE_FRACTIONS[FADE_FRACTIONS.length - 1]).toBe(1);
    for (let i = 1; i < FADE_FRACTIONS.length; i += 1) {
      expect(FADE_FRACTIONS[i]).toBeGreaterThan(FADE_FRACTIONS[i - 1]);
    }
  });
});

describe('toHiddenSet', () => {
  it('builds a Set from an index array', () => {
    const set = toHiddenSet([1, 3, 5]);
    expect(set.has(3)).toBe(true);
    expect(set.has(2)).toBe(false);
  });
});

describe('hashSeed', () => {
  it('is deterministic for the same string', () => {
    expect(hashSeed('JHN-3-16-0')).toBe(hashSeed('JHN-3-16-0'));
  });

  it('differs for different strings', () => {
    expect(hashSeed('JHN-3-16-0')).not.toBe(hashSeed('JHN-3-16-1'));
  });

  it('returns a non-negative integer', () => {
    const value = hashSeed('anything');
    expect(Number.isInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(0);
  });

  it('handles empty/missing input', () => {
    expect(hashSeed('')).toBe(0);
    expect(() => hashSeed(undefined)).not.toThrow();
  });
});

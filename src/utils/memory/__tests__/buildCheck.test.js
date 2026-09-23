import { tokenizeVerse } from '../tokenize';
import { chunkVerse } from '../chunking';
import {
  pickBuildUnits,
  createTileBank,
  isCorrectNextUnit,
  isBuildComplete,
  BUILD_WORD_COUNT_THRESHOLD,
} from '../buildCheck';
import { createSeededRandom } from '../hideSelection';

describe('pickBuildUnits', () => {
  it('uses whole words for short verses', () => {
    const tokens = tokenizeVerse('في البدء كان الكلمة');
    const units = pickBuildUnits(tokens, chunkVerse(tokens));
    expect(units).toEqual(['في', 'البدء', 'كان', 'الكلمة']);
  });

  it('uses phrases for verses over the threshold', () => {
    const words = Array.from({ length: BUILD_WORD_COUNT_THRESHOLD + 5 }, (_, i) => `كلمة${i + 1}`).join(' ');
    const tokens = tokenizeVerse(words);
    const chunks = chunkVerse(tokens);
    const units = pickBuildUnits(tokens, chunks);
    expect(units.length).toBe(chunks.length);
    expect(units.length).toBeLessThan(tokens.length);
  });

  it('returns [] for empty tokens', () => {
    expect(pickBuildUnits([], [])).toEqual([]);
  });
});

describe('createTileBank', () => {
  it('contains every unit exactly once, shuffled', () => {
    const units = ['a', 'b', 'c', 'd'];
    const bank = createTileBank(units, createSeededRandom(1));
    expect(bank.map((t) => t.text).sort()).toEqual([...units].sort());
    expect(bank).toHaveLength(4);
  });

  it('is deterministic for the same seed', () => {
    const units = ['a', 'b', 'c', 'd', 'e'];
    const bankA = createTileBank(units, createSeededRandom(9));
    const bankB = createTileBank(units, createSeededRandom(9));
    expect(bankA).toEqual(bankB);
  });
});

describe('isCorrectNextUnit', () => {
  const units = ['في', 'البدء', 'كان،', 'الكلمة'];

  it('matches ignoring punctuation and harakat', () => {
    expect(isCorrectNextUnit(units, 2, 'كان')).toBe(true);
  });

  it('rejects a wrong unit', () => {
    expect(isCorrectNextUnit(units, 0, 'البدء')).toBe(false);
  });

  it('rejects once all units are placed', () => {
    expect(isCorrectNextUnit(units, 4, 'anything')).toBe(false);
  });
});

describe('isBuildComplete', () => {
  it('is true once placedCount reaches unit count', () => {
    expect(isBuildComplete(['a', 'b'], 2)).toBe(true);
    expect(isBuildComplete(['a', 'b'], 1)).toBe(false);
  });
});

import { tokenizeVerse } from '../tokenize';
import { chunkVerse, chunkText } from '../chunking';

describe('chunkVerse', () => {
  it('breaks at Arabic punctuation', () => {
    const tokens = tokenizeVerse('هَذِهِ بِدَايَةُ إِنْجِيلِ، يَسُوعَ الْمَسِيحِ.');
    const chunks = chunkVerse(tokens);
    expect(chunks).toHaveLength(2);
    expect(chunkText(chunks[0])).toBe('هَذِهِ بِدَايَةُ إِنْجِيلِ،');
    expect(chunkText(chunks[1])).toBe('يَسُوعَ الْمَسِيحِ.');
  });

  it('splits long unpunctuated runs into ~3-5 word chunks', () => {
    // 12 words -> 5 + 5 + 2; the undersized 2-word remainder merges into the
    // previous chunk (5 + 2 = 7) rather than standing alone below minWords.
    const words = Array.from({ length: 12 }, (_, i) => `كلمة${i + 1}`).join(' ');
    const tokens = tokenizeVerse(words);
    const chunks = chunkVerse(tokens, { minWords: 3, maxWords: 5 });
    expect(chunks).toEqual([expect.any(Array), expect.any(Array)]);
    expect(chunks[0]).toHaveLength(5);
    expect(chunks[1]).toHaveLength(7);
    // Total words preserved.
    expect(chunks.reduce((sum, c) => sum + c.length, 0)).toBe(12);
  });

  it('keeps chunks within maxWords when the total divides evenly', () => {
    const words = Array.from({ length: 10 }, (_, i) => `كلمة${i + 1}`).join(' ');
    const tokens = tokenizeVerse(words);
    const chunks = chunkVerse(tokens, { minWords: 3, maxWords: 5 });
    chunks.forEach((chunk) => expect(chunk.length).toBeLessThanOrEqual(5));
    expect(chunks.reduce((sum, c) => sum + c.length, 0)).toBe(10);
  });

  it('merges an undersized trailing remainder into the previous chunk', () => {
    const words = Array.from({ length: 11 }, (_, i) => `كلمة${i + 1}`).join(' '); // 5 + 5 + 1
    const tokens = tokenizeVerse(words);
    const chunks = chunkVerse(tokens, { minWords: 3, maxWords: 5 });
    expect(chunks[chunks.length - 1].length).toBeGreaterThanOrEqual(3);
    expect(chunks.reduce((sum, c) => sum + c.length, 0)).toBe(11);
  });

  it('returns [] for empty input', () => {
    expect(chunkVerse([])).toEqual([]);
    expect(chunkVerse(null)).toEqual([]);
  });

  it('returns a single chunk for a short verse with no punctuation', () => {
    const tokens = tokenizeVerse('كلمة واحدة هنا');
    const chunks = chunkVerse(tokens);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toHaveLength(3);
  });
});

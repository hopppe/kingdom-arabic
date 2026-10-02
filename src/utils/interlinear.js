// Word-by-word (interlinear) reading: pair each word of a verse with its gloss.
// Glosses are stored one per word in verse order, so nearly every verse lines up
// by position. A few mapping files drop or add a word; matching on the vowel-less
// form re-syncs after those gaps instead of shifting every later gloss.

import { normalizeArabicWord } from './arabicSearch';

// How far ahead to look for the word (or gloss) that re-syncs a gap.
const RESYNC_WINDOW = 3;

const findAhead = (keys, from, key) => {
  const end = Math.min(keys.length, from + RESYNC_WINDOW + 1);
  for (let k = from; k < end; k += 1) {
    if (keys[k] === key) return k;
  }
  return -1;
};

/**
 * One gloss entry ({ ar, en, formId }) or null per token, in token order.
 * `tokens` are the verse's words (trailing whitespace allowed); `glosses` the verse's entries.
 */
export function alignGlosses(tokens, glosses) {
  const entries = glosses || [];
  const tokenKeys = tokens.map(normalizeArabicWord);
  const glossKeys = entries.map((entry) => normalizeArabicWord(entry.ar));

  const aligned = [];
  let next = 0;
  tokenKeys.forEach((key, i) => {
    if (next >= entries.length) {
      aligned.push(null);
      return;
    }
    if (glossKeys[next] === key) {
      aligned.push(entries[next]);
      next += 1;
      return;
    }
    // An extra gloss with no word here: skip ahead to this word's gloss.
    const glossAt = findAhead(glossKeys, next + 1, key);
    if (glossAt >= 0) {
      aligned.push(entries[glossAt]);
      next = glossAt + 1;
      return;
    }
    // This word has no gloss: the next gloss belongs to a later word.
    if (findAhead(tokenKeys, i + 1, glossKeys[next]) >= 0) {
      aligned.push(null);
      return;
    }
    // Spelled differently in the two sources: trust the position.
    aligned.push(entries[next]);
    next += 1;
  });
  return aligned;
}

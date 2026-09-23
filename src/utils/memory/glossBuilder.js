// Build an English "meaning" line for a verse or phrase from the Bible DB's
// per-word glosses (see src/data/bibleRepository.js `getChapter().glosses`).
//
// Gloss rows are produced by a separate mapping pipeline and don't always
// line up 1:1 with whitespace tokens (a gloss can cover a multi-word idiom,
// or a token can be punctuation-only). We align them with a small
// lookahead window instead of assuming a strict zip.

import { normalizeForCompare } from './tokenize';

const LOOKAHEAD = 3;

/**
 * @param {Array<{raw:string, core:string}>} tokens
 * @param {Array<{ar:string, en:string}>} glosses in verse order
 * @returns {Array<{raw:string, core:string, gloss:string|null}>} tokens with a matched gloss attached
 */
export function alignGlossesToTokens(tokens, glosses) {
  const glossList = Array.isArray(glosses) ? glosses : [];
  let glossPointer = 0;

  return (tokens || []).map((token) => {
    if (!token.core) return { ...token, gloss: null };

    for (let lookahead = 0; lookahead < LOOKAHEAD && glossPointer + lookahead < glossList.length; lookahead += 1) {
      const candidate = glossList[glossPointer + lookahead];
      if (normalizeForCompare(candidate.ar) === token.core) {
        glossPointer += lookahead + 1;
        return { ...token, gloss: candidate.en };
      }
    }
    return { ...token, gloss: null };
  });
}

/** Join the resolved glosses for a run of tokens into a readable phrase meaning. */
export function buildPhraseGloss(alignedTokens) {
  return (alignedTokens || [])
    .map((token) => token.gloss)
    .filter(Boolean)
    .join(' ');
}

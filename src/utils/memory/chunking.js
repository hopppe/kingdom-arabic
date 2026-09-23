// Split a tokenized verse into short phrases for the Learn step and for the
// Build step's tile bank on longer verses.
//
// Rule: break at Arabic punctuation (، ؛ : .) when present; otherwise break
// every ~3-5 words. Long punctuation-delimited segments are further split so
// no chunk exceeds `maxWords`, and a too-short trailing remainder is merged
// into the previous chunk rather than left as a 1-word chunk.

const CHUNK_BREAK_REGEX = /[،؛:.]/;

/**
 * @param {Array<{raw:string, core:string, index:number}>} tokens
 * @param {{minWords?: number, maxWords?: number}} [opts]
 * @returns {Array<Array<object>>} chunks, each an array of tokens
 */
export function chunkVerse(tokens, opts = {}) {
  const minWords = opts.minWords ?? 3;
  const maxWords = opts.maxWords ?? 5;
  if (!Array.isArray(tokens) || tokens.length === 0) return [];

  // 1. Split into segments at natural punctuation breaks.
  const segments = [];
  let current = [];
  tokens.forEach((token) => {
    current.push(token);
    if (CHUNK_BREAK_REGEX.test(token.raw)) {
      segments.push(current);
      current = [];
    }
  });
  if (current.length > 0) segments.push(current);

  // 2. Split any segment longer than maxWords into maxWords-sized pieces,
  //    merging an undersized remainder into the previous piece.
  const chunks = [];
  segments.forEach((segment) => {
    if (segment.length <= maxWords) {
      chunks.push(segment);
      return;
    }
    let rest = segment;
    const pieces = [];
    while (rest.length > maxWords) {
      pieces.push(rest.slice(0, maxWords));
      rest = rest.slice(maxWords);
    }
    if (rest.length > 0) {
      if (rest.length < minWords && pieces.length > 0) {
        pieces[pieces.length - 1] = [...pieces[pieces.length - 1], ...rest];
      } else {
        pieces.push(rest);
      }
    }
    chunks.push(...pieces);
  });

  return chunks;
}

/** Join a chunk's tokens back into displayable Arabic text. */
export const chunkText = (chunk) => chunk.map((token) => token.raw).join(' ');

// Reconstruction ("Build") step: rebuild a verse by tapping tiles in order
// from a shuffled bank. Words are used as tiles for short verses; phrases
// (chunks) are used for longer ones so the bank stays manageable.

import { normalizeForCompare } from './tokenize';

export const BUILD_WORD_COUNT_THRESHOLD = 14;

/** Decide tile granularity and return the ordered list of correct tile texts. */
export function pickBuildUnits(tokens, chunks, threshold = BUILD_WORD_COUNT_THRESHOLD) {
  if (!Array.isArray(tokens) || tokens.length === 0) return [];
  if (tokens.length <= threshold) {
    return tokens.map((token) => token.raw);
  }
  return (chunks || []).map((chunk) => chunk.map((token) => token.raw).join(' '));
}

/**
 * Build a shuffled tile bank from the correct unit texts. Each tile keeps a
 * stable `id` (its correct-order position) so callers can track duplicates.
 */
export function createTileBank(units, rng = Math.random) {
  const tiles = units.map((text, id) => ({ id, text }));
  for (let i = tiles.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  return tiles;
}

/** Does `candidateText` match the unit expected at `placedCount` (0-based)? */
export function isCorrectNextUnit(units, placedCount, candidateText) {
  const expected = units[placedCount];
  if (expected === undefined) return false;
  return normalizeForCompare(expected) === normalizeForCompare(candidateText);
}

/** True once every unit has been placed in order. */
export const isBuildComplete = (units, placedCount) => placedCount >= units.length;

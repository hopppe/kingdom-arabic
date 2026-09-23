// Seedable RNG + hidden-word selection for the Fade (vanishing cues) step.
//
// A seedable RNG keeps Fade rounds testable and lets a resumed practice
// session reproduce the same hidden set for a given verse + round.

import { isShortParticle } from './tokenize';

/** The four Fade rounds, as the fraction of words hidden in each. */
export const FADE_FRACTIONS = [0.25, 0.5, 0.75, 1];

/** mulberry32: small, fast, deterministic PRNG. Returns a `() => number in [0,1)` function. */
export function createSeededRandom(seed) {
  let state = (seed >>> 0) || 1;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const shuffled = (indices, rng) => {
  const copy = [...indices];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/**
 * Choose which token indices to hide for a given fraction of a verse.
 * Content words are hidden before short particles; order within each group
 * is randomized by `rng`. Returns a sorted array of indices into `tokens`.
 */
export function selectHiddenIndices(tokens, fraction, rng = Math.random) {
  if (!Array.isArray(tokens) || tokens.length === 0) return [];
  const total = tokens.length;
  const count = Math.round(total * Math.max(0, Math.min(1, fraction)));
  if (count <= 0) return [];
  if (count >= total) return tokens.map((_, i) => i);

  const contentIndices = [];
  const particleIndices = [];
  tokens.forEach((token, i) => {
    (isShortParticle(token) ? particleIndices : contentIndices).push(i);
  });

  const ordered = [...shuffled(contentIndices, rng), ...shuffled(particleIndices, rng)];
  return ordered.slice(0, count).sort((a, b) => a - b);
}

/** Build a Set for O(1) "is this index hidden" lookups. */
export const toHiddenSet = (indices) => new Set(indices);

/** Deterministic 32-bit hash of a string, for turning e.g. a verse id + round into a seed. */
export function hashSeed(text) {
  let hash = 0;
  const input = text || '';
  for (let i = 0; i < input.length; i += 1) {
    hash = (Math.imul(hash, 31) + input.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

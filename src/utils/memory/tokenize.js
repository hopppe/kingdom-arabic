// Tokenizing and text-normalization for Arabic verse text.
//
// Tokenize on whitespace. Punctuation stays attached to its word for display
// (تَشْكُلُ., etc.) but is stripped for comparisons. Harakat (vowel marks) are
// stripped only for comparisons — never for anything the user sees.

// Arabic diacritics (fatha, damma, kasra, sukun, shadda, tanwin, etc.).
const HARAKAT_REGEX = /[ً-ٰٟۖ-ۭ]/g;

// Punctuation that can appear attached to an Arabic word: comma, semicolon,
// colon, period, guillemets, exclamation/question marks, quotes.
export const PUNCTUATION_CHARS = '،؛:.«»!؟"';
const PUNCTUATION_REGEX = new RegExp(`[${PUNCTUATION_CHARS}]`, 'g');

/** Remove Arabic diacritics. Never use this for display text. */
export const stripHarakat = (text) => (text ? text.replace(HARAKAT_REGEX, '') : '');

/** Remove punctuation used for chunking/display. */
export const stripPunctuation = (text) => (text ? text.replace(PUNCTUATION_REGEX, '') : '');

/** Normalize text for equality checks: strip punctuation, strip harakat, trim. */
export const normalizeForCompare = (text) => stripHarakat(stripPunctuation(text || '')).trim();

/**
 * Split verse Arabic text into whitespace-delimited tokens.
 * Each token keeps its raw (displayable) form and a normalized `core` used
 * for comparisons in the Fade/Build/Recall steps.
 */
export function tokenizeVerse(arabicText) {
  if (!arabicText || typeof arabicText !== 'string') return [];
  return arabicText
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((raw, index) => ({ index, raw, core: normalizeForCompare(raw) }));
}

// A short list of very common short Arabic function words/particles, plus a
// length fallback. Used to hide content words before particles in Fade.
const SHORT_PARTICLES = new Set([
  'و', 'ف', 'ثم', 'أو', 'بل', 'لا', 'لم', 'لن', 'إن', 'أن', 'ما', 'من', 'في', 'إلى',
  'على', 'عن', 'مع', 'قد', 'كان', 'هو', 'هي', 'ال', 'لك', 'له', 'لها', 'لهم', 'بها',
  'به', 'كل', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'لكن', 'حتى', 'إذا', 'كما', 'أم',
]);

/** True for short function words/particles (hidden after content words in Fade). */
export function isShortParticle(token) {
  if (!token || !token.core) return false;
  return SHORT_PARTICLES.has(token.core) || token.core.length <= 2;
}

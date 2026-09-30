// Arabic verse search: query normalization and result previews.
// Normalization must match search_text in scripts/build_bible_db.py, which fills
// the verses.ar_search column the query runs against.

// Harakat, tanween, shadda, sukun, superscript alef, Quranic annotation marks, tatweel.
const DIACRITICS_RE = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const ALEF_VARIANTS_RE = /[أإآٱ]/g;
const NON_ARABIC_LETTER_RE = /[^ء-ي]/g;
const ARABIC_LETTER_RE = /[ء-ي]/;

// Words shown before the first match in a preview, for context.
const PREVIEW_LEAD_WORDS = 3;

/** True when the query contains any Arabic letter, so it should search the Arabic text. */
export const isArabicQuery = (text) => ARABIC_LETTER_RE.test(text || '');

/** Normalize one Arabic word for comparison: no vowels, punctuation or alef/ya/ta marbuta variants. */
export const normalizeArabicWord = (word) => (word || '')
  .replace(DIACRITICS_RE, '')
  .replace(ALEF_VARIANTS_RE, 'ا')
  .replace(/ى/g, 'ي')
  .replace(NON_ARABIC_LETTER_RE, '')
  .replace(/ة/g, 'ه');

/** Split a query into normalized Arabic search terms, dropping anything that normalizes away. */
export const normalizeArabicSearch = (text) => (text || '')
  .split(/\s+/)
  .map(normalizeArabicWord)
  .filter(Boolean);

/**
 * Vowelled verse text starting a few words before the first word matching the query,
 * so the match is visible in a two-line preview. Never strips harakat from the display text.
 */
export function getArabicPreviewText(arabic, query) {
  const text = arabic || '';
  const [firstTerm] = normalizeArabicSearch(query);
  if (!firstTerm) return text;

  const wholeWord = (query || '').trimStart().endsWith(' ');
  const words = text.split(/\s+/).filter(Boolean);
  const matchIndex = words.findIndex((word) => {
    const normalized = normalizeArabicWord(word);
    return wholeWord ? normalized === firstTerm : normalized.includes(firstTerm);
  });
  if (matchIndex <= PREVIEW_LEAD_WORDS) return text;

  return `…${words.slice(matchIndex - PREVIEW_LEAD_WORDS).join(' ')}`;
}

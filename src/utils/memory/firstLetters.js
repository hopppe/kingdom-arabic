// First-letter recall cues: each word is replaced by its first letter (with
// that letter's own vowel mark, if present) plus a placeholder for the rest,
// keeping any leading/trailing punctuation attached exactly as in the raw
// token so the cue still reads naturally in context.

const HARAKAT_REGEX = /^[ً-ٰٟۖ-ۭ]$/;
const PUNCTUATION_REGEX = /^[،؛:.«»!؟"]$/;

const DEFAULT_PLACEHOLDER = '—'; // em dash, one per hidden letter

/**
 * @param {string} raw the token's displayable text (punctuation/harakat intact)
 * @param {string} [placeholder] character repeated for each hidden letter
 */
export function firstLetterCue(raw, placeholder = DEFAULT_PLACEHOLDER) {
  if (!raw) return '';
  const chars = Array.from(raw);

  let start = 0;
  while (start < chars.length && PUNCTUATION_REGEX.test(chars[start])) start += 1;
  if (start >= chars.length) return raw; // token was punctuation-only

  let end = chars.length;
  while (end > start && PUNCTUATION_REGEX.test(chars[end - 1])) end -= 1;

  const prefix = chars.slice(0, start).join('');
  const suffix = chars.slice(end).join('');

  let cueEnd = start + 1;
  let cue = chars[start];
  if (cueEnd < end && HARAKAT_REGEX.test(chars[cueEnd])) {
    cue += chars[cueEnd];
    cueEnd += 1;
  }

  // One placeholder per hidden letter; vowel marks don't get their own.
  const hiddenCount = chars.slice(cueEnd, end).filter((char) => !HARAKAT_REGEX.test(char)).length;
  const hidden = hiddenCount > 0 ? placeholder.repeat(hiddenCount) : '';

  return `${prefix}${cue}${hidden}${suffix}`;
}

/** Apply firstLetterCue to a whole list of tokens (for rendering a verse). */
export const firstLetterCueTokens = (tokens, placeholder) =>
  (tokens || []).map((token) => firstLetterCue(token.raw, placeholder));

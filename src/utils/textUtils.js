import React from 'react';
import { Text } from 'react-native';

const PUNCTUATION_RE = /[.,،؛:;؟?!«»"“”'‘’()]/g;
const normalizeToken = (token) => token.replace(PUNCTUATION_RE, '').toLowerCase();

/**
 * Find the first run of whole words in `text` equal to `phrase` (ignoring
 * punctuation and case). Returns { start, end } indexes into the array from
 * `text.split(/(\s+)/)`, or null. Substrings inside longer words never match.
 */
export function findWholeWordMatch(text, phrase) {
  if (!text || !phrase) return null;
  const target = phrase.split(/\s+/).map(normalizeToken).filter(Boolean);
  if (target.length === 0) return null;

  const parts = text.split(/(\s+)/);
  const wordPositions = parts
    .map((part, index) => ({ part, index }))
    .filter(({ part }) => part.trim() !== '');

  for (let i = 0; i + target.length <= wordPositions.length; i += 1) {
    const candidate = wordPositions.slice(i, i + target.length);
    if (candidate.every(({ part }, k) => normalizeToken(part) === target[k])) {
      return { start: candidate[0].index, end: candidate[candidate.length - 1].index };
    }
  }
  return null;
}

/**
 * Render a verse with the flashcard's word highlighted. The highlight only
 * changes the background: custom Arabic fonts ship one weight, and a nested
 * bold span would break letter joining.
 */
export const highlightWordInVerse = (verseText, word, textStyle, highlightStyle) => {
  const match = findWholeWordMatch(verseText, word);
  if (!match) return <Text style={textStyle}>{verseText}</Text>;

  const parts = verseText.split(/(\s+)/);
  return (
    <Text style={textStyle}>
      {parts.slice(0, match.start).join('')}
      <Text style={highlightStyle}>{parts.slice(match.start, match.end + 1).join('')}</Text>
      {parts.slice(match.end + 1).join('')}
    </Text>
  );
};

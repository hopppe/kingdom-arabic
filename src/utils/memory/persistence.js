// Validation for records stored under AsyncStorage key @learnarabic_memory_verses.
// Malformed entries are dropped rather than crashing the app.

import { STATUS } from './scheduler';

export const buildVerseId = (book, chapter, verse) => `${book}-${chapter}-${verse}`;

const VALID_STATUSES = new Set([STATUS.LEARNING, STATUS.REVIEWING, STATUS.MASTERED]);

export function isValidMemoryVerse(entry) {
  if (!entry || typeof entry !== 'object') return false;
  const { id, book, chapter, verse, ar, en, status } = entry;
  if (typeof id !== 'string' || !id) return false;
  if (typeof book !== 'string' || !book) return false;
  if (!Number.isInteger(chapter) || chapter < 1) return false;
  if (!Number.isInteger(verse) || verse < 1) return false;
  if (typeof ar !== 'string' || !ar) return false;
  if (typeof en !== 'string' || !en) return false;
  if (!VALID_STATUSES.has(status)) return false;
  return true;
}

export function sanitizeMemoryVerses(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.filter(isValidMemoryVerse);
}

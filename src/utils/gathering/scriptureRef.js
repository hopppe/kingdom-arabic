// Compact scripture references used by the Gathering resources, e.g. 'JHN 4:1-26',
// 'PSA 23', 'NUM 6:24-26'. A reference stays inside one chapter.
import { getBookName, BOOK_ARABIC_NAMES } from '../../data/bibleData';

const REF_RE = /^([1-3]?[A-Z]{2,3})\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/;

/** Parses 'BOOK ch[:v[-v]]' into { book, chapter, verse, endVerse }, or null if malformed. */
export function parseScriptureRef(ref) {
  const match = typeof ref === 'string' ? REF_RE.exec(ref.trim()) : null;
  if (!match) return null;
  const [, book, chapterText, verseText, endText] = match;
  const chapter = Number(chapterText);
  const verse = verseText ? Number(verseText) : null;
  const endVerse = endText ? Number(endText) : verse;
  if (chapter < 1 || (verse !== null && (verse < 1 || endVerse < verse))) return null;
  return { book, chapter, verse, endVerse };
}

/** 'John 4:1-26', 'Psalms 23', 'Numbers 6:24' for a parsed reference. */
export function formatScriptureRef({ book, chapter, verse, endVerse }) {
  const base = `${getBookName(book)} ${chapter}`;
  if (!verse) return base;
  return endVerse && endVerse !== verse ? `${base}:${verse}-${endVerse}` : `${base}:${verse}`;
}

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** 23 → '٢٣' (Arabic-Indic digits, as in the Arabic Bible). */
export const toArabicDigits = (value) => String(value).replace(/\d/g, (d) => ARABIC_DIGITS[d]);

// The Psalms are named one at a time in Arabic references ("المزمور ٢٣").
const arabicBookName = (book) => (book === 'PSA' ? 'المزمور' : BOOK_ARABIC_NAMES[book] || book);

/** 'متى ٢٨:١٨-٢٠', 'المزمور ٢٣' for a parsed reference. */
export function formatScriptureRefArabic({ book, chapter, verse, endVerse }) {
  const base = `${arabicBookName(book)} ${toArabicDigits(chapter)}`;
  if (!verse) return base;
  const verses = endVerse && endVerse !== verse ? `${verse}-${endVerse}` : `${verse}`;
  return `${base}:${toArabicDigits(verses)}`;
}

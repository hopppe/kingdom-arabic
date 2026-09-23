// Pure helpers for tracking which Bible chapters have been read.
//
// Stored shape (AsyncStorage key `@learnarabic_reading_progress`):
//   { 'JHN:3': '2026-09-23T10:00:00.000Z', ... }
// Each key is `${bookId}:${chapter}` and the value is the ISO timestamp the
// chapter was first marked read. `sanitizeReadChapters` drops anything that
// doesn't look like a valid, known book/chapter/timestamp so a corrupted or
// hand-edited backup can never crash the app.
//
// See src/context/ReadingProgressContext.js for the stateful wrapper
// (useReadingProgress) built on top of these functions.

import { BOOKS, OLD_TESTAMENT_BOOK_COUNT } from '../data/bibleData';

const CHAPTERS_BY_BOOK = Object.fromEntries(BOOKS.map((book) => [book.id, book.chapters.length]));

export const chapterKey = (book, chapter) => `${book}:${chapter}`;

const isValidTimestamp = (value) => typeof value === 'string' && !Number.isNaN(new Date(value).getTime());

/** Drops unknown books, out-of-range chapters, and malformed timestamps. */
export function sanitizeReadChapters(stored) {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
  return Object.fromEntries(
    Object.entries(stored).filter(([key, value]) => {
      if (!isValidTimestamp(value)) return false;
      const separatorIndex = key.indexOf(':');
      if (separatorIndex === -1) return false;
      const book = key.slice(0, separatorIndex);
      const chapter = Number(key.slice(separatorIndex + 1));
      const totalChapters = CHAPTERS_BY_BOOK[book];
      if (!totalChapters) return false;
      return Number.isInteger(chapter) && chapter >= 1 && chapter <= totalChapters;
    })
  );
}

export const isChapterRead = (readChapters, book, chapter) =>
  Boolean(readChapters[chapterKey(book, chapter)]);

/** Returns a new map with the chapter marked read (idempotent: keeps the original timestamp). */
export function markChapterRead(readChapters, book, chapter, now = new Date()) {
  const key = chapterKey(book, chapter);
  if (readChapters[key]) return readChapters;
  return { ...readChapters, [key]: now.toISOString() };
}

export function unmarkChapterRead(readChapters, book, chapter) {
  const key = chapterKey(book, chapter);
  if (!(key in readChapters)) return readChapters;
  const next = { ...readChapters };
  delete next[key];
  return next;
}

/** { read, total, fraction } for one book. */
export function getBookProgress(readChapters, book) {
  const total = CHAPTERS_BY_BOOK[book] || 0;
  if (total === 0) return { read: 0, total: 0, fraction: 0 };
  let read = 0;
  for (let chapter = 1; chapter <= total; chapter += 1) {
    if (isChapterRead(readChapters, book, chapter)) read += 1;
  }
  return { read, total, fraction: read / total };
}

const safeFraction = (read, total) => (total > 0 ? read / total : 0);

/**
 * Whole-Bible summary: overall progress, OT/NT splits, and how many books
 * are fully read.
 */
export function computeOverallProgress(readChapters) {
  let totalRead = 0;
  let totalChapters = 0;
  let oldTestamentRead = 0;
  let oldTestamentTotal = 0;
  let newTestamentRead = 0;
  let newTestamentTotal = 0;
  let booksCompleted = 0;

  BOOKS.forEach((book, index) => {
    const { read, total } = getBookProgress(readChapters, book.id);
    totalRead += read;
    totalChapters += total;
    if (index < OLD_TESTAMENT_BOOK_COUNT) {
      oldTestamentRead += read;
      oldTestamentTotal += total;
    } else {
      newTestamentRead += read;
      newTestamentTotal += total;
    }
    if (total > 0 && read === total) booksCompleted += 1;
  });

  return {
    read: totalRead,
    total: totalChapters,
    fraction: safeFraction(totalRead, totalChapters),
    oldTestament: { read: oldTestamentRead, total: oldTestamentTotal },
    newTestament: { read: newTestamentRead, total: newTestamentTotal },
    booksCompleted,
  };
}

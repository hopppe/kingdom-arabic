// Read-only queries against the bundled Bible database (assets/bible/bible.db).
// Every function takes the SQLiteDatabase from useBibleDb() as its first argument.

import { BOOK_ARABIC_NAMES, getBookCode, getBookName, getBookNumber } from './bibleData';

const chapterCache = new Map();
const MAX_CACHED_CHAPTERS = 20;

// Related-form lookups on 1-2 letter stems match almost everything, so skip them.
export const MIN_RELATED_STEM_LENGTH = 3;

const toVerseRow = (row) => ({
  book: getBookCode(row.book),
  chapter: row.chapter,
  verse: row.verse,
  ar: row.ar,
  en: row.en,
});

const cacheChapter = (key, value) => {
  if (chapterCache.size >= MAX_CACHED_CHAPTERS) {
    chapterCache.delete(chapterCache.keys().next().value);
  }
  chapterCache.set(key, value);
};

/**
 * Load a chapter in the shape the reader expects:
 * { data: { title_arabic, title_english, content_arabic[], content_english[], verse_numbers[] },
 *   vocab: { verse_1: { [arabicWord]: gloss } }, glosses: { verse_1: [{ ar, en, formId }] } }
 */
export async function getChapter(db, bookCode, chapter) {
  const cacheKey = `${bookCode}_${chapter}`;
  if (chapterCache.has(cacheKey)) {
    return chapterCache.get(cacheKey);
  }

  const bookNumber = getBookNumber(bookCode);
  if (!bookNumber) return null;

  const [verses, glossRows] = await Promise.all([
    db.getAllAsync(
      'SELECT verse, ar, en FROM verses WHERE book = ? AND chapter = ? ORDER BY verse',
      [bookNumber, chapter]
    ),
    db.getAllAsync(
      'SELECT verse, ar, en, form_id AS formId FROM glosses WHERE book = ? AND chapter = ? ORDER BY verse, idx',
      [bookNumber, chapter]
    ),
  ]);
  if (verses.length === 0) return null;

  const vocab = {};
  const glosses = {};
  verses.forEach((row, index) => {
    vocab[`verse_${index + 1}`] = {};
    glosses[`verse_${index + 1}`] = [];
  });
  const indexByVerse = new Map(verses.map((row, index) => [row.verse, index + 1]));
  glossRows.forEach((row) => {
    const key = `verse_${indexByVerse.get(row.verse)}`;
    if (!vocab[key]) return;
    vocab[key][row.ar] = row.en;
    glosses[key].push({ ar: row.ar, en: row.en, formId: row.formId });
  });

  const result = {
    data: {
      title_arabic: `${BOOK_ARABIC_NAMES[bookCode] || bookCode} ${chapter}`,
      title_english: `${getBookName(bookCode)} ${chapter}`,
      content_arabic: verses.map((row) => row.ar),
      content_english: verses.map((row) => row.en),
      verse_numbers: verses.map((row) => row.verse),
    },
    vocab,
    glosses,
  };
  cacheChapter(cacheKey, result);
  return result;
}

export async function getVerse(db, bookCode, chapter, verse) {
  const row = await db.getFirstAsync(
    'SELECT book, chapter, verse, ar, en FROM verses WHERE book = ? AND chapter = ? AND verse = ?',
    [getBookNumber(bookCode), chapter, verse]
  );
  return row ? toVerseRow(row) : null;
}

export async function getVerseNumbers(db, bookCode, chapter) {
  const rows = await db.getAllAsync(
    'SELECT verse FROM verses WHERE book = ? AND chapter = ? ORDER BY verse',
    [getBookNumber(bookCode), chapter]
  );
  return rows.map((row) => row.verse);
}

const escapeLike = (text) => text.replace(/[\\%_]/g, (char) => `\\${char}`);
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Word-boundary searches are filtered in JS, so fetch enough LIKE candidates to fill a page.
const SEARCH_CANDIDATE_LIMIT = 5000;

/**
 * English full-text search. All words must appear; a trailing space in the query
 * means "match whole words only". Returns { results, totalCount }.
 */
export async function searchVerses(db, query, limit = 15) {
  if (!query || !query.trim()) {
    return { results: [], totalCount: 0 };
  }
  const wholeWords = query.trimStart().endsWith(' ');
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return { results: [], totalCount: 0 };
  }

  const where = words.map(() => "lower(en) LIKE ? ESCAPE '\\'").join(' AND ');
  const params = words.map((word) => `%${escapeLike(word)}%`);

  if (!wholeWords) {
    const [countRow, rows] = await Promise.all([
      db.getFirstAsync(`SELECT COUNT(*) AS total FROM verses WHERE ${where}`, params),
      db.getAllAsync(
        `SELECT book, chapter, verse, ar, en FROM verses WHERE ${where} ORDER BY book, chapter, verse LIMIT ?`,
        [...params, limit]
      ),
    ]);
    return { results: rows.map(toSearchResult), totalCount: countRow?.total || 0 };
  }

  const candidates = await db.getAllAsync(
    `SELECT book, chapter, verse, ar, en FROM verses WHERE ${where} ORDER BY book, chapter, verse LIMIT ?`,
    [...params, SEARCH_CANDIDATE_LIMIT]
  );
  const patterns = words.map((word) => new RegExp(`\\b${escapeRegex(word)}\\b`, 'i'));
  const matches = candidates.filter((row) => patterns.every((pattern) => pattern.test(row.en)));
  return { results: matches.slice(0, limit).map(toSearchResult), totalCount: matches.length };
}

const toSearchResult = (row) => {
  const book = getBookCode(row.book);
  return { ...toVerseRow(row), bookName: getBookName(book) };
};

const GLOSS_EDGE_PUNCTUATION_RE = /^[\s.,;:!?"“”()«»]+|[\s.,;:!?"“”()«»]+$/g;
const ARABIC_PUNCTUATION_RE = /[.,،؛:؟!«»"()[\]]/g;
const MAX_MEANINGS = 8;

export const cleanGloss = (gloss) => gloss.replace(/[‘’]/g, "'").replace(GLOSS_EDGE_PUNCTUATION_RE, '');

/**
 * Merge gloss counts that differ only by case, curly vs straight apostrophes or
 * stray punctuation ("word:" / "Word"), keeping the most common spelling.
 */
export function mergeGlossCounts(rows, limit = MAX_MEANINGS) {
  const merged = new Map();
  rows.forEach(({ gloss, count }) => {
    const text = cleanGloss(gloss || '');
    if (!text) return;
    const key = text.toLowerCase();
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, { gloss: text, count, best: count });
    } else {
      merged.set(key, {
        gloss: count > existing.best ? text : existing.gloss,
        count: existing.count + count,
        best: Math.max(existing.best, count),
      });
    }
  });
  return [...merged.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ gloss, count }) => ({ gloss, count }));
}

/**
 * Every place this exact word form (ignoring vowels) appears, plus the glosses it
 * was given, most frequent first.
 */
export async function getWordOccurrences(db, formId, limit = 100) {
  const [countRow, rows, glossRows] = await Promise.all([
    db.getFirstAsync('SELECT COUNT(*) AS total FROM glosses WHERE form_id = ?', [formId]),
    db.getAllAsync(
      `SELECT g.book, g.chapter, g.verse, g.ar AS word, g.en AS gloss, v.ar, v.en
         FROM glosses g JOIN verses v USING (book, chapter, verse)
        WHERE g.form_id = ?
        ORDER BY g.book, g.chapter, g.verse
        LIMIT ?`,
      [formId, limit]
    ),
    db.getAllAsync(
      'SELECT en AS gloss, COUNT(*) AS count FROM glosses WHERE form_id = ? GROUP BY en ORDER BY count DESC LIMIT 50',
      [formId]
    ),
  ]);
  return {
    totalCount: countRow?.total || 0,
    glosses: mergeGlossCounts(glossRows),
    occurrences: rows.map((row) => ({ ...toVerseRow(row), word: row.word, gloss: row.gloss })),
  };
}

/**
 * Other word forms that share this form's light stem (e.g. كتاب / الكتاب / كتابه),
 * with a sample spelling, count and most common gloss for each.
 */
export async function getRelatedForms(db, formId, limit = 30) {
  const form = await db.getFirstAsync('SELECT stem FROM forms WHERE id = ?', [formId]);
  if (!form || form.stem.length < MIN_RELATED_STEM_LENGTH) {
    return [];
  }
  const rows = await db.getAllAsync(
    `SELECT f.id AS formId, COUNT(*) AS count,
            (SELECT g2.ar FROM glosses g2 WHERE g2.form_id = f.id LIMIT 1) AS sample,
            (SELECT g3.en FROM glosses g3 WHERE g3.form_id = f.id
              GROUP BY lower(g3.en) ORDER BY COUNT(*) DESC LIMIT 1) AS gloss
       FROM forms f JOIN glosses g ON g.form_id = f.id
      WHERE f.stem = ? AND f.id != ?
      GROUP BY f.id
      ORDER BY count DESC
      LIMIT ?`,
    [form.stem, formId, limit]
  );
  return rows.map((row) => ({
    ...row,
    sample: (row.sample || '').replace(ARABIC_PUNCTUATION_RE, ''),
    gloss: cleanGloss(row.gloss || ''),
  }));
}

// Test hook.
export const clearChapterCache = () => chapterCache.clear();

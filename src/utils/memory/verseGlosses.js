// Locate a single verse's word glosses inside a chapter loaded via
// bibleRepository.getChapter(). Glosses are keyed `verse_N` where N is the
// verse's 1-based *position* within the chapter (not its verse number), so
// we resolve that position from `data.verse_numbers` first.

export function getGlossKeyForVerse(chapterData, verseNumber) {
  const numbers = chapterData?.data?.verse_numbers;
  if (!Array.isArray(numbers)) return null;
  const position = numbers.indexOf(verseNumber);
  return position === -1 ? null : `verse_${position + 1}`;
}

export function getGlossesForVerse(chapterData, verseNumber) {
  const key = getGlossKeyForVerse(chapterData, verseNumber);
  if (!key) return [];
  return chapterData?.glosses?.[key] || [];
}

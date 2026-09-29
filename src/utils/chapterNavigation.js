// Stepping through the Bible one chapter at a time, continuing into the next
// (or previous) book at a book's edge.

/** The chapter `direction` (+1 / -1) steps from `bookId` `chapter`: { book, chapter } or null at either end. */
export function getAdjacentChapter(books, bookId, chapter, direction) {
  const bookIndex = books.findIndex((b) => b.id === bookId);
  if (bookIndex < 0 || (direction !== 1 && direction !== -1)) return null;
  const { chapters } = books[bookIndex];
  const currentIndex = chapters.indexOf(chapter);
  // An unknown chapter (e.g. a stale saved position) has no neighbours.
  if (currentIndex < 0) return null;
  const nextIndex = currentIndex + direction;
  if (nextIndex >= 0 && nextIndex < chapters.length) {
    return { book: bookId, chapter: chapters[nextIndex] };
  }
  const nextBook = books[bookIndex + direction];
  if (!nextBook || nextBook.chapters.length === 0) return null;
  const edgeChapter = direction > 0 ? nextBook.chapters[0] : nextBook.chapters[nextBook.chapters.length - 1];
  return { book: nextBook.id, chapter: edgeChapter };
}

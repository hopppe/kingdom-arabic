// Helpers for displaying English verse search results.
// The search itself runs in SQLite: see searchVerses in src/data/bibleRepository.js.

// Truncate text for preview, preserving the match context
export function getPreviewText(text, query, maxLength = 80) {
  if (!text || !query) return text || '';

  const searchTerm = query.trim().toLowerCase();
  const lowerText = text.toLowerCase();
  const matchIndex = lowerText.indexOf(searchTerm);

  if (text.length <= maxLength) {
    return text;
  }

  if (matchIndex === -1 || matchIndex < maxLength / 2) {
    // Match near start or not found - truncate from end
    return text.slice(0, maxLength).trim() + '...';
  }

  // Match in middle/end - show context around match
  const start = Math.max(0, matchIndex - 20);
  const end = Math.min(text.length, start + maxLength);
  let preview = text.slice(start, end).trim();

  if (start > 0) preview = '...' + preview;
  if (end < text.length) preview = preview + '...';

  return preview;
}

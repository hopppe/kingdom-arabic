// Verse search utility for searching English Bible text
// Uses pre-built search index from searchData.js (no runtime loading)

import { searchIndex } from '../data/searchData';

// Search verses - supports multiple words (all must be in verse)
// If query ends with space, do word-boundary match for exact words
// Returns { results: [...], totalCount: number }
export function searchVerses(query, limit = 15) {
  if (!query || !query.trim()) {
    return { results: [], totalCount: 0 };
  }

  const trimmed = query.trimStart();
  const isWordBoundary = trimmed.endsWith(' ');
  const searchTerm = trimmed.trim().toLowerCase();

  if (!searchTerm) {
    return { results: [], totalCount: 0 };
  }

  // Split into words for multi-word search
  const words = searchTerm.split(/\s+/).filter(w => w.length > 0);

  let matches;

  if (isWordBoundary) {
    // Word boundary match - all words must be complete words
    const wordRegexes = words.map(w => new RegExp(`\\b${escapeRegex(w)}\\b`, 'i'));
    matches = searchIndex.filter(v => wordRegexes.every(regex => regex.test(v.en)));
  } else {
    // Substring match - all words must appear somewhere in the verse
    matches = searchIndex.filter(v => {
      const lowerText = v.en.toLowerCase();
      return words.every(word => lowerText.includes(word));
    });
  }

  return {
    results: matches.slice(0, limit),
    totalCount: matches.length,
  };
}

// Escape special regex characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

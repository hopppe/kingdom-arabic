/**
 * Bible data loader
 * Loads natural/contextual word translations
 */

import { loadChapterData } from '../data/bibleData';

/**
 * Load chapter data
 * (Simplified - always uses natural translations from bibleData)
 */
export const loadChapterWithMappingType = async (book, chapter) => {
  // Load the chapter data with natural translations
  const chapterData = await loadChapterData(book, chapter);
  return chapterData;
};

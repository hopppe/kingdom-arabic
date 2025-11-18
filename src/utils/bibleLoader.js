/**
 * Dynamic Bible data loader
 * Supports multiple mapping sources (interpretive vs literal)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mapping type constants
export const MAPPING_TYPES = {
  INTERPRETIVE: 'interpretive',
  LITERAL: 'literal'
};

const MAPPING_TYPE_KEY = '@bible_mapping_type';

/**
 * Get current mapping type setting
 */
export const getMappingType = async () => {
  try {
    const type = await AsyncStorage.getItem(MAPPING_TYPE_KEY);
    return type || MAPPING_TYPES.INTERPRETIVE;
  } catch (error) {
    console.error('Error loading mapping type:', error);
    return MAPPING_TYPES.INTERPRETIVE;
  }
};

/**
 * Set mapping type setting
 */
export const setMappingType = async (type) => {
  try {
    await AsyncStorage.setItem(MAPPING_TYPE_KEY, type);
  } catch (error) {
    console.error('Error saving mapping type:', error);
  }
};

import { loadChapterData } from '../data/bibleData';
import { getLiteralMapping } from './literalMappingsRegistry';

/**
 * Load complete chapter data with selected mapping type
 */
export const loadChapterWithMappingType = async (book, chapter, mappingType = null) => {
  // Get mapping type from settings if not provided
  if (!mappingType) {
    mappingType = await getMappingType();
  }

  // Always load the base chapter data (for UI display)
  const chapterData = await loadChapterData(book, chapter);

  // If literal mode, rebuild vocab with literal translations
  if (mappingType === MAPPING_TYPES.LITERAL) {
    try {
      const literalMapping = getLiteralMapping(book, chapter);

      if (literalMapping && literalMapping.verses) {
        // Rebuild vocab object with literal translations
        const newVocab = {};

        Object.keys(literalMapping.verses).forEach((verseNum) => {
          const verse = literalMapping.verses[verseNum];
          const verseKey = `verse_${verseNum}`;
          const verseVocab = {};

          if (verse.mappings) {
            verse.mappings.forEach(mapping => {
              verseVocab[mapping.ar] = mapping.en;
            });
          }

          newVocab[verseKey] = verseVocab;
        });

        return {
          ...chapterData,
          vocab: newVocab
        };
      }
    } catch (error) {
      console.warn(`Could not load literal mappings for ${book} ${chapter}:`, error);
    }
  }

  // Return interpretive data as-is
  return chapterData;
};

/**
 * Preload both mapping types for quick switching
 */
export const preloadBothMappingTypes = async (book, chapter) => {
  const interpretive = await loadChapterWithMappingType(book, chapter, MAPPING_TYPES.INTERPRETIVE);
  const literal = await loadChapterWithMappingType(book, chapter, MAPPING_TYPES.LITERAL);

  return {
    [MAPPING_TYPES.INTERPRETIVE]: interpretive,
    [MAPPING_TYPES.LITERAL]: literal
  };
};

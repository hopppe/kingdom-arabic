import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Auto-generated from bible-translations/mappings folder
// Run: node scripts/generate-book-imports.js
const BOOKS = [
  {
    id: 'MRK',
    name: 'Mark',
    arabicName: 'مرقس',
    chapters: [1, 2, 3, 5, 6]
  },
  {
    id: 'JHN',
    name: 'John',
    arabicName: 'يوحنا',
    chapters: [2, 3]
  }
];

// Book name mapping for Arabic titles
const BOOK_ARABIC_NAMES = {
  'MRK': 'مرقس',
  'JHN': 'يوحنا'
};

// Transform function moved to be called on-demand
const transformMappingData = (rawData, bookName, bookCode) => {
  const verseKeys = Object.keys(rawData.verses).sort((a, b) => parseInt(a) - parseInt(b));

  const content_arabic = verseKeys.map(key => rawData.verses[key].ar);
  const content_english = verseKeys.map(key => rawData.verses[key].en);

  // Transform mappings to verse_N format
  const vocab = {};
  verseKeys.forEach((key, index) => {
    const verseMappings = rawData.verses[key].mappings || [];
    const verseVocab = {};
    verseMappings.forEach(mapping => {
      verseVocab[mapping.ar] = mapping.en;
    });
    vocab[`verse_${index + 1}`] = verseVocab;
  });

  const arabicName = BOOK_ARABIC_NAMES[bookCode] || bookCode;

  return {
    data: {
      title_arabic: `${arabicName} ${rawData.chapter}`,
      title_english: `${bookName} ${rawData.chapter}`,
      content_arabic,
      content_english,
    },
    vocab,
  };
};

// Cache for loaded chapters
const chapterCache = {};

// Lazy loader function - returns a promise
const loadChapterData = async (book, chapter) => {
  const cacheKey = `${book}_${chapter}`;

  if (chapterCache[cacheKey]) {
    return chapterCache[cacheKey];
  }

  // Dynamic import based on book and chapter
  let rawData;
  let bookName;

  if (false) {
    // placeholder
  } else if (book === 'MRK') {
    bookName = 'Mark';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/MRK/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/MRK/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/MRK/3.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/MRK/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/MRK/6.json'); break;
    }
  } else if (book === 'JHN') {
    bookName = 'John';
    switch (chapter) {
      case 2: rawData = require('../../bible-translations/mappings/JHN/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/JHN/3.json'); break;
    }
  }

  if (rawData) {
    const transformed = transformMappingData(rawData, bookName, book);
    chapterCache[cacheKey] = transformed;
    return transformed;
  }

  return null;
};

export default function ChapterListScreen({ navigation }) {
  const { theme } = useTheme();
  const [expandedBook, setExpandedBook] = useState(null);

  const handleBookPress = (bookId) => {
    setExpandedBook(expandedBook === bookId ? null : bookId);
  };

  const handleChapterPress = (book, chapter) => {
    navigation.navigate('Reader', {
      chapterMeta: {
        id: `${book.id}_${chapter}`,
        title: `${book.name} ${chapter}`,
        book: book.id,
        chapter: chapter,
      },
      loadChapterData,
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: 16,
    },
    bookRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    bookRowExpanded: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 0,
    },
    bookName: {
      fontSize: 18,
      fontWeight: '500',
      color: theme.colors.text,
    },
    bookNameExpanded: {
      fontWeight: '700',
    },
    chevron: {
      marginLeft: 8,
    },
    chapterGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 8,
      paddingBottom: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    chapterButton: {
      width: '20%',
      aspectRatio: 1,
      padding: 4,
    },
    chapterButtonInner: {
      flex: 1,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chapterNumber: {
      fontSize: 18,
      fontWeight: '500',
      color: theme.colors.text,
    },
  });

  const renderBook = (book) => {
    const isExpanded = expandedBook === book.id;

    return (
      <View key={book.id}>
        <TouchableOpacity
          style={[styles.bookRow, isExpanded && styles.bookRowExpanded]}
          onPress={() => handleBookPress(book.id)}
        >
          <Text style={[styles.bookName, isExpanded && styles.bookNameExpanded]}>
            {book.name}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={theme.colors.textSecondary}
            style={styles.chevron}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.chapterGrid}>
            {book.chapters.map((chapter) => (
              <View key={chapter} style={styles.chapterButton}>
                <TouchableOpacity
                  style={styles.chapterButtonInner}
                  onPress={() => handleChapterPress(book, chapter)}
                >
                  <Text style={styles.chapterNumber}>{chapter}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {BOOKS.map(renderBook)}
    </ScrollView>
  );
}

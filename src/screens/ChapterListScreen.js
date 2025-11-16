import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Auto-generated from bible-translations/mappings folder
// Run: node scripts/generate-book-imports.js
const BOOKS = [
  {
    id: 'GEN',
    name: 'Genesis',
    arabicName: 'التكوين',
    chapters: [1, 2, 3, 4, 5]
  },
  {
    id: 'MAT',
    name: 'Matthew',
    arabicName: 'متى',
    chapters: [1, 2, 3, 4, 5]
  },
  {
    id: 'MRK',
    name: 'Mark',
    arabicName: 'مرقس',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'LUK',
    name: 'Luke',
    arabicName: 'لوقا',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
  },
  {
    id: 'JHN',
    name: 'John',
    arabicName: 'يوحنا',
    chapters: [1, 2, 3, 4, 5, 7, 8, 9, 10]
  },
  {
    id: 'ROM',
    name: 'Romans',
    arabicName: 'رومية',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'PHP',
    name: 'Philippians',
    arabicName: 'فيلبي',
    chapters: [1, 2, 3, 4]
  }
];

// Book name mapping for Arabic titles
const BOOK_ARABIC_NAMES = {
  'GEN': 'التكوين',
  'MAT': 'متى',
  'MRK': 'مرقس',
  'LUK': 'لوقا',
  'JHN': 'يوحنا',
  'ROM': 'رومية',
  'PHP': 'فيلبي'
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
  } else if (book === 'GEN') {
    bookName = 'Genesis';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/GEN/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/GEN/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/GEN/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/GEN/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/GEN/5.json'); break;
    }
  } else if (book === 'MAT') {
    bookName = 'Matthew';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/MAT/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/MAT/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/MAT/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/MAT/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/MAT/5.json'); break;
    }
  } else if (book === 'MRK') {
    bookName = 'Mark';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/MRK/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/MRK/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/MRK/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/MRK/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/MRK/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/MRK/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/MRK/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/MRK/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/MRK/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/MRK/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/MRK/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/MRK/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/MRK/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/MRK/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/MRK/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/MRK/16.json'); break;
    }
  } else if (book === 'LUK') {
    bookName = 'Luke';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/LUK/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/LUK/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/LUK/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/LUK/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/LUK/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/LUK/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/LUK/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/LUK/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/LUK/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/LUK/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/LUK/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/LUK/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/LUK/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/LUK/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/LUK/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/LUK/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/LUK/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/LUK/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/LUK/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/LUK/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/LUK/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/LUK/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/LUK/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/LUK/24.json'); break;
    }
  } else if (book === 'JHN') {
    bookName = 'John';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/JHN/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/JHN/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/JHN/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/JHN/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/JHN/5.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/JHN/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/JHN/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/JHN/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/JHN/10.json'); break;
    }
  } else if (book === 'ROM') {
    bookName = 'Romans';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/ROM/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/ROM/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/ROM/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/ROM/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/ROM/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/ROM/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/ROM/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/ROM/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/ROM/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/ROM/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/ROM/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/ROM/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/ROM/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/ROM/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/ROM/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/ROM/16.json'); break;
    }
  } else if (book === 'PHP') {
    bookName = 'Philippians';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/PHP/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/PHP/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/PHP/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/PHP/4.json'); break;
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

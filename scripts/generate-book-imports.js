#!/usr/bin/env node

/**
 * Script to scan the bible-translations/mappings folder and generate
 * the ChapterListScreen.js file with all available books and chapters.
 *
 * Run with: node scripts/generate-book-imports.js
 */

const fs = require('fs');
const path = require('path');

// Book code to name mapping
const BOOK_NAMES = {
  // Old Testament
  GEN: { en: 'Genesis', ar: 'التكوين' },
  EXO: { en: 'Exodus', ar: 'الخروج' },
  LEV: { en: 'Leviticus', ar: 'اللاويين' },
  NUM: { en: 'Numbers', ar: 'العدد' },
  DEU: { en: 'Deuteronomy', ar: 'التثنية' },
  JOS: { en: 'Joshua', ar: 'يشوع' },
  JDG: { en: 'Judges', ar: 'القضاة' },
  RUT: { en: 'Ruth', ar: 'راعوث' },
  '1SA': { en: '1 Samuel', ar: 'صموئيل الأول' },
  '2SA': { en: '2 Samuel', ar: 'صموئيل الثاني' },
  '1KI': { en: '1 Kings', ar: 'الملوك الأول' },
  '2KI': { en: '2 Kings', ar: 'الملوك الثاني' },
  '1CH': { en: '1 Chronicles', ar: 'أخبار الأيام الأول' },
  '2CH': { en: '2 Chronicles', ar: 'أخبار الأيام الثاني' },
  EZR: { en: 'Ezra', ar: 'عزرا' },
  NEH: { en: 'Nehemiah', ar: 'نحميا' },
  EST: { en: 'Esther', ar: 'أستير' },
  JOB: { en: 'Job', ar: 'أيوب' },
  PSA: { en: 'Psalms', ar: 'المزامير' },
  PRO: { en: 'Proverbs', ar: 'الأمثال' },
  ECC: { en: 'Ecclesiastes', ar: 'الجامعة' },
  SNG: { en: 'Song of Solomon', ar: 'نشيد الأنشاد' },
  ISA: { en: 'Isaiah', ar: 'إشعياء' },
  JER: { en: 'Jeremiah', ar: 'إرميا' },
  LAM: { en: 'Lamentations', ar: 'مراثي إرميا' },
  EZK: { en: 'Ezekiel', ar: 'حزقيال' },
  DAN: { en: 'Daniel', ar: 'دانيال' },
  HOS: { en: 'Hosea', ar: 'هوشع' },
  JOL: { en: 'Joel', ar: 'يوئيل' },
  AMO: { en: 'Amos', ar: 'عاموس' },
  OBA: { en: 'Obadiah', ar: 'عوبديا' },
  JON: { en: 'Jonah', ar: 'يونان' },
  MIC: { en: 'Micah', ar: 'ميخا' },
  NAM: { en: 'Nahum', ar: 'ناحوم' },
  HAB: { en: 'Habakkuk', ar: 'حبقوق' },
  ZEP: { en: 'Zephaniah', ar: 'صفنيا' },
  HAG: { en: 'Haggai', ar: 'حجي' },
  ZEC: { en: 'Zechariah', ar: 'زكريا' },
  MAL: { en: 'Malachi', ar: 'ملاخي' },
  // New Testament
  MAT: { en: 'Matthew', ar: 'متى' },
  MRK: { en: 'Mark', ar: 'مرقس' },
  LUK: { en: 'Luke', ar: 'لوقا' },
  JHN: { en: 'John', ar: 'يوحنا' },
  ACT: { en: 'Acts', ar: 'أعمال الرسل' },
  ROM: { en: 'Romans', ar: 'رومية' },
  '1CO': { en: '1 Corinthians', ar: 'كورنثوس الأولى' },
  '2CO': { en: '2 Corinthians', ar: 'كورنثوس الثانية' },
  GAL: { en: 'Galatians', ar: 'غلاطية' },
  EPH: { en: 'Ephesians', ar: 'أفسس' },
  PHP: { en: 'Philippians', ar: 'فيلبي' },
  COL: { en: 'Colossians', ar: 'كولوسي' },
  '1TH': { en: '1 Thessalonians', ar: 'تسالونيكي الأولى' },
  '2TH': { en: '2 Thessalonians', ar: 'تسالونيكي الثانية' },
  '1TI': { en: '1 Timothy', ar: 'تيموثاوس الأولى' },
  '2TI': { en: '2 Timothy', ar: 'تيموثاوس الثانية' },
  TIT: { en: 'Titus', ar: 'تيطس' },
  PHM: { en: 'Philemon', ar: 'فليمون' },
  HEB: { en: 'Hebrews', ar: 'العبرانيين' },
  JAS: { en: 'James', ar: 'يعقوب' },
  '1PE': { en: '1 Peter', ar: 'بطرس الأولى' },
  '2PE': { en: '2 Peter', ar: 'بطرس الثانية' },
  '1JN': { en: '1 John', ar: 'يوحنا الأولى' },
  '2JN': { en: '2 John', ar: 'يوحنا الثانية' },
  '3JN': { en: '3 John', ar: 'يوحنا الثالثة' },
  JUD: { en: 'Jude', ar: 'يهوذا' },
  REV: { en: 'Revelation', ar: 'رؤيا يوحنا' },
};

// Scan the mappings directory
const mappingsDir = path.join(__dirname, '..', 'bible-translations', 'mappings');

function scanMappings() {
  const books = {};

  if (!fs.existsSync(mappingsDir)) {
    console.error('Mappings directory not found:', mappingsDir);
    process.exit(1);
  }

  const bookDirs = fs.readdirSync(mappingsDir).filter(f => {
    const stat = fs.statSync(path.join(mappingsDir, f));
    return stat.isDirectory();
  });

  for (const bookCode of bookDirs) {
    const bookPath = path.join(mappingsDir, bookCode);
    const chapterFiles = fs.readdirSync(bookPath)
      .filter(f => f.endsWith('.json'))
      .map(f => parseInt(f.replace('.json', ''), 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);

    if (chapterFiles.length > 0) {
      books[bookCode] = chapterFiles;
    }
  }

  return books;
}

function generateChapterListScreen(books) {
  const bookCodes = Object.keys(books).sort((a, b) => {
    // Sort by canonical order if possible
    const orderA = Object.keys(BOOK_NAMES).indexOf(a);
    const orderB = Object.keys(BOOK_NAMES).indexOf(b);
    if (orderA !== -1 && orderB !== -1) return orderA - orderB;
    if (orderA !== -1) return -1;
    if (orderB !== -1) return 1;
    return a.localeCompare(b);
  });

  // Generate BOOKS array
  const booksArray = bookCodes.map(code => {
    const name = BOOK_NAMES[code]?.en || code;
    const arabicName = BOOK_NAMES[code]?.ar || code;
    const chapters = books[code];
    return `  {
    id: '${code}',
    name: '${name}',
    arabicName: '${arabicName}',
    chapters: [${chapters.join(', ')}]
  }`;
  }).join(',\n');

  // Generate switch cases for each book
  const switchCases = bookCodes.map(code => {
    const name = BOOK_NAMES[code]?.en || code;
    const cases = books[code].map(ch =>
      `      case ${ch}: rawData = require('../../bible-translations/mappings/${code}/${ch}.json'); break;`
    ).join('\n');
    return `  } else if (book === '${code}') {
    bookName = '${name}';
    switch (chapter) {
${cases}
    }`;
  }).join('\n');

  // Generate the full file
  return `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Auto-generated from bible-translations/mappings folder
// Run: node scripts/generate-book-imports.js
const BOOKS = [
${booksArray}
];

// Book name mapping for Arabic titles
const BOOK_ARABIC_NAMES = {
${bookCodes.map(code => `  '${code}': '${BOOK_NAMES[code]?.ar || code}'`).join(',\n')}
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
    vocab[\`verse_\${index + 1}\`] = verseVocab;
  });

  const arabicName = BOOK_ARABIC_NAMES[bookCode] || bookCode;

  return {
    data: {
      title_arabic: \`\${arabicName} \${rawData.chapter}\`,
      title_english: \`\${bookName} \${rawData.chapter}\`,
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
  const cacheKey = \`\${book}_\${chapter}\`;

  if (chapterCache[cacheKey]) {
    return chapterCache[cacheKey];
  }

  // Dynamic import based on book and chapter
  let rawData;
  let bookName;

  if (false) {
    // placeholder
${switchCases}
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
        id: \`\${book.id}_\${chapter}\`,
        title: \`\${book.name} \${chapter}\`,
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
`;
}

// Main execution
console.log('Scanning mappings directory...');
const books = scanMappings();
console.log('Found books:', Object.keys(books).join(', '));

const outputPath = path.join(__dirname, '..', 'src', 'screens', 'ChapterListScreen.js');
const generatedCode = generateChapterListScreen(books);

fs.writeFileSync(outputPath, generatedCode);
console.log(`Generated ${outputPath}`);
console.log('Books with chapters:');
for (const [book, chapters] of Object.entries(books)) {
  const name = BOOK_NAMES[book]?.en || book;
  console.log(`  ${name} (${book}): chapters ${chapters.join(', ')}`);
}

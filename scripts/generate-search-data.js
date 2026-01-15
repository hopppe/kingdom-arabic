#!/usr/bin/env node

/**
 * Script to generate searchData.js that imports all unified Bible files
 * and exports them as a searchable array. No duplicate data - just imports.
 *
 * Run with: node scripts/generate-search-data.js
 */

const fs = require('fs');
const path = require('path');

const BOOK_NAMES = {
  GEN: 'Genesis', EXO: 'Exodus', LEV: 'Leviticus', NUM: 'Numbers',
  DEU: 'Deuteronomy', JOS: 'Joshua', JDG: 'Judges', RUT: 'Ruth',
  '1SA': '1 Samuel', '2SA': '2 Samuel', '1KI': '1 Kings', '2KI': '2 Kings',
  '1CH': '1 Chronicles', '2CH': '2 Chronicles', EZR: 'Ezra', NEH: 'Nehemiah',
  EST: 'Esther', JOB: 'Job', PSA: 'Psalms', PRO: 'Proverbs',
  ECC: 'Ecclesiastes', SNG: 'Song of Solomon', ISA: 'Isaiah', JER: 'Jeremiah',
  LAM: 'Lamentations', EZK: 'Ezekiel', DAN: 'Daniel', HOS: 'Hosea',
  JOL: 'Joel', AMO: 'Amos', OBA: 'Obadiah', JON: 'Jonah',
  MIC: 'Micah', NAM: 'Nahum', HAB: 'Habakkuk', ZEP: 'Zephaniah',
  HAG: 'Haggai', ZEC: 'Zechariah', MAL: 'Malachi',
  MAT: 'Matthew', MRK: 'Mark', LUK: 'Luke', JHN: 'John',
  ACT: 'Acts', ROM: 'Romans', '1CO': '1 Corinthians', '2CO': '2 Corinthians',
  GAL: 'Galatians', EPH: 'Ephesians', PHP: 'Philippians', COL: 'Colossians',
  '1TH': '1 Thessalonians', '2TH': '2 Thessalonians', '1TI': '1 Timothy', '2TI': '2 Timothy',
  TIT: 'Titus', PHM: 'Philemon', HEB: 'Hebrews', JAS: 'James',
  '1PE': '1 Peter', '2PE': '2 Peter', '1JN': '1 John', '2JN': '2 John',
  '3JN': '3 John', JUD: 'Jude', REV: 'Revelation'
};

const BOOK_ORDER = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
  'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
  '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
];

const unifiedDir = path.join(__dirname, '..', 'bible-translations', 'unified');

function scanUnifiedFiles() {
  const chapters = [];

  for (const bookCode of BOOK_ORDER) {
    const bookPath = path.join(unifiedDir, bookCode);
    if (!fs.existsSync(bookPath)) continue;

    const chapterFiles = fs.readdirSync(bookPath)
      .filter(f => f.endsWith('.json'))
      .map(f => parseInt(f.replace('.json', ''), 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);

    for (const ch of chapterFiles) {
      chapters.push({ book: bookCode, chapter: ch });
    }
  }

  return chapters;
}

function generateSearchData(chapters) {
  // Generate the processing code that runs at import time
  const chapterEntries = chapters.map(({ book, chapter }) => {
    const bookName = BOOK_NAMES[book] || book;
    return `  { book: '${book}', name: '${bookName}', chapter: ${chapter}, data: require('../../bible-translations/unified/${book}/${chapter}.json') }`;
  }).join(',\n');

  return `// Auto-generated search data - imports all unified Bible files
// Run: node scripts/generate-search-data.js

const chapters = [
${chapterEntries}
];

// Build search index from imported data
const searchIndex = [];
for (const { book, name, chapter, data } of chapters) {
  const verseNums = Object.keys(data)
    .map(n => parseInt(n, 10))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);

  for (const v of verseNums) {
    if (data[v]?.en) {
      searchIndex.push({
        book,
        bookName: name,
        chapter,
        verse: v,
        en: data[v].en,
      });
    }
  }
}

export { searchIndex };
`;
}

// Main
console.log('Scanning unified directory...');
const chapters = scanUnifiedFiles();
console.log(`Found ${chapters.length} chapters`);

const output = generateSearchData(chapters);
const outputPath = path.join(__dirname, '..', 'src', 'data', 'searchData.js');
fs.writeFileSync(outputPath, output);

console.log(`Generated ${outputPath}`);

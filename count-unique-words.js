// count-unique-words.js
// Count unique Arabic words in mappings

const fs = require('fs');
const path = require('path');

const MAPPINGS_DIR = '/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-maps-word/mappings';

const uniqueWords = new Set();
let totalWordMappings = 0;

const books = fs.readdirSync(MAPPINGS_DIR).filter(f =>
  fs.statSync(path.join(MAPPINGS_DIR, f)).isDirectory()
);

for (const book of books) {
  const chapters = fs.readdirSync(path.join(MAPPINGS_DIR, book))
    .filter(f => f.endsWith('.json'));

  for (const chapter of chapters) {
    const filePath = path.join(MAPPINGS_DIR, book, chapter);
    const mapping = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const verseNum in mapping.verses) {
      const verse = mapping.verses[verseNum];

      if (verse.mappings) {
        for (const wordMapping of verse.mappings) {
          if (wordMapping.ar) {
            uniqueWords.add(wordMapping.ar);
            totalWordMappings++;
          }
        }
      }
    }
  }
}

console.log('='.repeat(60));
console.log('UNIQUE ARABIC WORD COUNT');
console.log('='.repeat(60));
console.log(`Total word mappings:    ${totalWordMappings.toLocaleString()}`);
console.log(`Unique Arabic words:    ${uniqueWords.size.toLocaleString()}`);
console.log(`Deduplication ratio:    ${(totalWordMappings / uniqueWords.size).toFixed(1)}x`);
console.log('='.repeat(60));

// Audio storage estimates
console.log('\nAUDIO STORAGE ESTIMATES:');
console.log('='.repeat(60));

// Assumptions:
// - Average word pronunciation: 1 second
// - MP3 64kbps: ~8KB per second = 8KB per word
// - MP3 128kbps: ~16KB per second = 16KB per word
// - Opus 32kbps: ~4KB per second = 4KB per word

const estimates = [
  { format: 'Opus 32kbps (low quality)', kbPerWord: 4 },
  { format: 'MP3 64kbps (good quality)', kbPerWord: 8 },
  { format: 'MP3 96kbps (high quality)', kbPerWord: 12 },
  { format: 'MP3 128kbps (very high)', kbPerWord: 16 }
];

for (const est of estimates) {
  const totalKB = uniqueWords.size * est.kbPerWord;
  const totalMB = totalKB / 1024;
  console.log(`${est.format.padEnd(30)} ${totalMB.toFixed(1)} MB`);
}

console.log('='.repeat(60));
console.log('\nNote: Assumes 1 second average per word pronunciation');

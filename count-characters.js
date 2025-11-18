// count-characters.js
// Count total Arabic characters that need translation

const fs = require('fs');
const path = require('path');

const MAPPINGS_DIR = '/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-maps-word/mappings';

let stats = {
  totalVerses: 0,
  totalWords: 0,
  verseChars: 0,
  wordChars: 0,
  files: 0
};

function countFile(bookCode, chapterFile) {
  const filePath = path.join(MAPPINGS_DIR, bookCode, chapterFile);
  const mapping = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const verseNum in mapping.verses) {
    const verse = mapping.verses[verseNum];

    // Count verse-level text
    if (verse.ar) {
      stats.totalVerses++;
      stats.verseChars += verse.ar.length;
    }

    // Count word-level text
    if (verse.mappings) {
      for (const wordMapping of verse.mappings) {
        if (wordMapping.ar) {
          stats.totalWords++;
          stats.wordChars += wordMapping.ar.length;
        }
      }
    }
  }
}

const books = fs.readdirSync(MAPPINGS_DIR).filter(f =>
  fs.statSync(path.join(MAPPINGS_DIR, f)).isDirectory()
);

console.log('Counting Arabic characters in mappings...\n');

for (const book of books) {
  const chapters = fs.readdirSync(path.join(MAPPINGS_DIR, book))
    .filter(f => f.endsWith('.json'));

  for (const chapter of chapters) {
    countFile(book, chapter);
    stats.files++;
  }
}

console.log('='.repeat(60));
console.log('ARABIC CHARACTER COUNT');
console.log('='.repeat(60));
console.log(`Files processed:        ${stats.files.toLocaleString()}`);
console.log(`\nVerses:`);
console.log(`  Count:                ${stats.totalVerses.toLocaleString()}`);
console.log(`  Characters:           ${stats.verseChars.toLocaleString()}`);
console.log(`\nWords:`);
console.log(`  Count:                ${stats.totalWords.toLocaleString()}`);
console.log(`  Characters:           ${stats.wordChars.toLocaleString()}`);
console.log(`\nTOTAL CHARACTERS:       ${(stats.verseChars + stats.wordChars).toLocaleString()}`);
console.log('='.repeat(60));

// Google Cloud Translation pricing
const totalChars = stats.verseChars + stats.wordChars;
const freeChars = 500000;
const costPerMillion = 20;

if (totalChars <= freeChars) {
  console.log(`\n✅ Within Google Cloud free tier (500,000 chars/month)`);
} else {
  const paidChars = totalChars - freeChars;
  const cost = (paidChars / 1000000) * costPerMillion;
  console.log(`\n⚠️  Exceeds free tier by ${paidChars.toLocaleString()} characters`);
  console.log(`   Estimated cost: $${cost.toFixed(2)}`);
}

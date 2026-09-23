// remove-english.js
// Removes all English translations from mapping files to prepare for LibreTranslate

const fs = require('fs');
const path = require('path');

const MAPPINGS_DIR = '/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-maps-word/mappings';

function removeEnglishFromFile(bookCode, chapterFile) {
  const filePath = path.join(MAPPINGS_DIR, bookCode, chapterFile);

  // Read the mapping file
  const mapping = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let removedCount = 0;

  // Remove English from each verse
  for (const verseNum in mapping.verses) {
    const verse = mapping.verses[verseNum];

    // Clear verse-level English translation
    if (verse.en) {
      verse.en = "";
      removedCount++;
    }

    // Clear English from each word mapping
    if (verse.mappings) {
      for (const wordMapping of verse.mappings) {
        if (wordMapping.en) {
          wordMapping.en = "";
          removedCount++;
        }
      }
    }
  }

  // Save back
  fs.writeFileSync(filePath, JSON.stringify(mapping, null, 2));
  console.log(`✓ ${bookCode}/${chapterFile}: Removed ${removedCount} English translations`);
}

function removeAllEnglish() {
  console.log('Removing English translations from all mapping files...\n');

  const books = fs.readdirSync(MAPPINGS_DIR).filter(f =>
    fs.statSync(path.join(MAPPINGS_DIR, f)).isDirectory()
  );

  let totalFiles = 0;

  for (const book of books) {
    const chapters = fs.readdirSync(path.join(MAPPINGS_DIR, book))
      .filter(f => f.endsWith('.json'));

    for (const chapter of chapters) {
      removeEnglishFromFile(book, chapter);
      totalFiles++;
    }
  }

  console.log(`\n✓ Done! Processed ${totalFiles} files.`);
  console.log('Ready for LibreTranslate translation.');
}

removeAllEnglish();

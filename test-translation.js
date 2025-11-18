// test-translation.js
// Test translation on ONE chapter (Mark 1) to verify it works

const fs = require('fs');
const path = require('path');

const MAPPINGS_DIR = '/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-maps-word/mappings';
const LIBRETRANSLATE_URL = 'http://localhost:5001/translate';
const CONCURRENCY_LIMIT = 50;

let stats = {
  totalWords: 0,
  totalVerses: 0,
  errors: 0,
  startTime: Date.now()
};

// Semaphore for concurrency control
class Semaphore {
  constructor(max) {
    this.max = max;
    this.current = 0;
    this.queue = [];
  }

  async acquire() {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    await new Promise(resolve => this.queue.push(resolve));
  }

  release() {
    this.current--;
    const resolve = this.queue.shift();
    if (resolve) {
      this.current++;
      resolve();
    }
  }
}

const semaphore = new Semaphore(CONCURRENCY_LIMIT);

async function translateWord(arabicWord) {
  await semaphore.acquire();

  try {
    const response = await fetch(LIBRETRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: arabicWord,
        source: 'ar',
        target: 'en'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.translatedText || arabicWord;
  } catch (error) {
    stats.errors++;
    return arabicWord;
  } finally {
    semaphore.release();
  }
}

async function testTranslation() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  TEST: Translating Mark Chapter 1 (Parallel)          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Test connection
  console.log('Testing LibreTranslate...');
  const test = await translateWord('مرحبا');
  console.log(`✓ Connection OK: مرحبا → ${test}\n`);

  // Load Mark 1
  const filePath = path.join(MAPPINGS_DIR, 'MRK', '1.json');
  console.log(`Reading: ${filePath}`);

  const mapping = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Count what needs translation
  let toTranslate = 0;
  for (const verseNum in mapping.verses) {
    const verse = mapping.verses[verseNum];
    if (verse.ar && verse.en === "") toTranslate++;
    if (verse.mappings) {
      for (const wordMapping of verse.mappings) {
        if (wordMapping.ar && wordMapping.en === "") toTranslate++;
      }
    }
  }

  console.log(`Found ${toTranslate} items to translate\n`);
  console.log(`Starting translation with ${CONCURRENCY_LIMIT} concurrent requests...\n`);

  // Collect all translations
  const translationPromises = [];

  for (const verseNum in mapping.verses) {
    const verse = mapping.verses[verseNum];

    if (verse.ar && verse.en === "") {
      const promise = translateWord(verse.ar).then(translation => {
        verse.en = translation;
        stats.totalVerses++;
        console.log(`  Verse ${verseNum}: ✓`);
      });
      translationPromises.push(promise);
    }

    if (verse.mappings) {
      for (const wordMapping of verse.mappings) {
        if (wordMapping.ar && wordMapping.en === "") {
          const promise = translateWord(wordMapping.ar).then(translation => {
            wordMapping.en = translation;
            stats.totalWords++;
          });
          translationPromises.push(promise);
        }
      }
    }
  }

  // Wait for all translations
  await Promise.all(translationPromises);

  // Save the file
  fs.writeFileSync(filePath, JSON.stringify(mapping, null, 2));

  const elapsed = Math.floor((Date.now() - stats.startTime) / 1000);

  console.log('\n' + '='.repeat(60));
  console.log('✅ TEST COMPLETE');
  console.log('='.repeat(60));
  console.log(`Verses translated:  ${stats.totalVerses}`);
  console.log(`Words translated:   ${stats.totalWords}`);
  console.log(`Total:              ${stats.totalVerses + stats.totalWords}`);
  console.log(`Errors:             ${stats.errors}`);
  console.log(`Time:               ${elapsed}s`);
  console.log(`Rate:               ${Math.round((stats.totalVerses + stats.totalWords) / elapsed)} trans/sec`);
  console.log(`File saved to:      ${filePath}`);
  console.log('='.repeat(60));

  // Show a sample
  console.log('\nSample translations from verse 1:');
  const verse1 = mapping.verses['1'];
  console.log(`\nVerse: ${verse1.ar}`);
  console.log(`→ ${verse1.en}\n`);

  if (verse1.mappings) {
    console.log('Word mappings:');
    verse1.mappings.slice(0, 5).forEach(m => {
      console.log(`  "${m.ar}" → "${m.en}"`);
    });
  }
}

testTranslation().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

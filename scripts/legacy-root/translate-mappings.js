// translate-mappings.js
// Translates all Arabic words in mapping files using LibreTranslate (PARALLEL)

const fs = require('fs');
const path = require('path');

const MAPPINGS_DIR = '/Users/ethanhoppe/Documents/Cursor_Code/LearnArabic/bible-maps-word/mappings';
// Load balance across 3 working LibreTranslate instances!
const LIBRETRANSLATE_URLS = [
  'http://localhost:5002/translate',
  'http://localhost:5003/translate',
  'http://localhost:5004/translate'
];
let urlIndex = 0; // Round-robin counter
const CONCURRENCY_LIMIT = 200; // Number of parallel translations (increased!)
const FILE_PARALLELISM = 40;   // Number of files to process simultaneously (increased!)

// Stats tracking
let stats = {
  totalFiles: 0,
  totalWords: 0,
  totalVerses: 0,
  errors: 0,
  startTime: Date.now(),
  inProgress: 0
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

async function translateWord(arabicWord, context = '') {
  await semaphore.acquire();
  stats.inProgress++;

  // Round-robin load balancing across all LibreTranslate instances
  const url = LIBRETRANSLATE_URLS[urlIndex % LIBRETRANSLATE_URLS.length];
  urlIndex++;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: arabicWord,
        source: 'ar',
        target: 'en'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.translatedText || arabicWord;
  } catch (error) {
    stats.errors++;
    return arabicWord;
  } finally {
    stats.inProgress--;
    semaphore.release();
  }
}

async function translateMappingFile(bookCode, chapterFile) {
  const filePath = path.join(MAPPINGS_DIR, bookCode, chapterFile);

  // Read the mapping file
  const mapping = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let translatedCount = 0;
  const translationPromises = [];

  // Collect all translations to run in parallel (WORDS ONLY, skip verses)
  for (const verseNum in mapping.verses) {
    const verse = mapping.verses[verseNum];

    // Skip verse-level translation - only translate individual words
    // (Full verses already exist in the original mappings)

    // Translate each word mapping in parallel
    if (verse.mappings) {
      for (const wordMapping of verse.mappings) {
        if (wordMapping.ar && wordMapping.en === "") {
          const promise = translateWord(wordMapping.ar, `${bookCode}:${verseNum}`).then(translation => {
            wordMapping.en = translation;
            stats.totalWords++;
            translatedCount++;
          });
          translationPromises.push(promise);
        }
      }
    }
  }

  // Wait for all translations in this file to complete
  await Promise.all(translationPromises);

  // Save translated mapping
  fs.writeFileSync(filePath, JSON.stringify(mapping, null, 2));

  return translatedCount;
}

// Process multiple files in parallel with progress updates
async function processFilesInParallel(files) {
  const fileQueue = [...files];
  const workers = [];

  // Progress display interval
  const progressInterval = setInterval(() => {
    const completed = stats.totalFiles;
    const total = files.length;
    const pct = ((completed / total) * 100).toFixed(1);
    const rate = completed / ((Date.now() - stats.startTime) / 1000 / 60); // files per minute
    const eta = Math.ceil((total - completed) / rate);

    process.stdout.write(`\r📊 Progress: ${completed}/${total} files (${pct}%) | ${stats.totalWords.toLocaleString()} words | ${stats.inProgress} active | ETA: ${eta}m    `);
  }, 1000);

  // Create worker pool
  for (let i = 0; i < FILE_PARALLELISM; i++) {
    workers.push((async () => {
      while (fileQueue.length > 0) {
        const { book, chapter } = fileQueue.shift();
        const count = await translateMappingFile(book, chapter);
        stats.totalFiles++;
      }
    })());
  }

  await Promise.all(workers);
  clearInterval(progressInterval);
  process.stdout.write('\n');
}

async function translateAllMappings() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Bible Translation - PARALLEL MODE                     ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Test connection first
  console.log('Testing LibreTranslate connection...');
  try {
    const testTranslation = await translateWord('مرحبا');
    console.log(`✓ Connection successful! Test: مرحبا → ${testTranslation}\n`);
  } catch (error) {
    console.error('❌ Cannot connect to LibreTranslate at http://localhost:5001');
    console.error('Please ensure LibreTranslate is running\n');
    process.exit(1);
  }

  const books = fs.readdirSync(MAPPINGS_DIR).filter(f =>
    fs.statSync(path.join(MAPPINGS_DIR, f)).isDirectory()
  );

  // Collect all files to process
  const allFiles = [];
  for (const book of books) {
    const chapters = fs.readdirSync(path.join(MAPPINGS_DIR, book))
      .filter(f => f.endsWith('.json'))
      .sort((a, b) => parseInt(a.replace('.json', '')) - parseInt(b.replace('.json', '')));

    for (const chapter of chapters) {
      allFiles.push({ book, chapter });
    }
  }

  console.log(`Configuration:`);
  console.log(`  LibreTranslate instances: ${LIBRETRANSLATE_URLS.length} (ports 5001-${5000 + LIBRETRANSLATE_URLS.length})`);
  console.log(`  Files to process:         ${allFiles.length}`);
  console.log(`  Concurrent requests:      ${CONCURRENCY_LIMIT}`);
  console.log(`  Parallel files:           ${FILE_PARALLELISM}`);
  console.log(`  Words to translate:       ~461,843`);
  console.log(`  Estimated chars:          ~3.8 million (words only)`);
  console.log(`\nStarting parallel translation across ${LIBRETRANSLATE_URLS.length} instances...\n`);

  await processFilesInParallel(allFiles);

  // Print final stats
  const elapsedSeconds = Math.floor((Date.now() - stats.startTime) / 1000);
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  console.log('\n' + '='.repeat(60));
  console.log('🎉 TRANSLATION COMPLETE!');
  console.log('='.repeat(60));
  console.log(`Files processed:    ${stats.totalFiles.toLocaleString()}`);
  console.log(`Verses translated:  ${stats.totalVerses.toLocaleString()}`);
  console.log(`Words translated:   ${stats.totalWords.toLocaleString()}`);
  console.log(`Total translations: ${(stats.totalVerses + stats.totalWords).toLocaleString()}`);
  console.log(`Errors:             ${stats.errors.toLocaleString()}`);
  console.log(`Time elapsed:       ${hours}h ${minutes}m ${seconds}s`);
  console.log(`Average rate:       ${Math.round((stats.totalVerses + stats.totalWords) / elapsedSeconds)} translations/sec`);
  console.log('='.repeat(60));
}

// Run the translation
translateAllMappings().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

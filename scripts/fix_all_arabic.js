#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Book mappings: Standard code -> [NIV name, Arabic folder name]
const BOOKS = {
  'GEN': ['Genesis', 'التكوين'],
  'EXO': ['Exodus', 'الخروج'],
  'LEV': ['Leviticus', 'اللاويين'],
  'NUM': ['Numbers', 'العدد'],
  'DEU': ['Deuteronomy', 'التثنية'],
  'JOS': ['Joshua', 'يشوع'],
  'JDG': ['Judges', 'القضاة'],
  'RUT': ['Ruth', 'راعوث'],
  '1SA': ['1 Samuel', 'صموئيلالأول'],
  '2SA': ['2 Samuel', 'صموئيلالثاني'],
  '1KI': ['1 Kings', 'ملوكالأول'],
  '2KI': ['2 Kings', 'ملوكالثاني'],
  '1CH': ['1 Chronicles', 'أخبارالأيامالأول'],
  '2CH': ['2 Chronicles', 'أخبارالأيامالثاني'],
  'EZR': ['Ezra', 'عزرا'],
  'NEH': ['Nehemiah', 'نحميا'],
  'EST': ['Esther', 'أستير'],
  'JOB': ['Job', 'أيوب'],
  'PSA': ['Psalm', 'مزمور'],
  'PRO': ['Proverbs', 'الأمثال'],
  'ECC': ['Ecclesiastes', 'الجامعة'],
  'SNG': ['Song Of Solomon', 'نشيدالأنشاد'],
  'ISA': ['Isaiah', 'إشعياء'],
  'JER': ['Jeremiah', 'إرميا'],
  'LAM': ['Lamentations', 'مراثيإرميا'],
  'EZK': ['Ezekiel', 'حزقيال'],
  'DAN': ['Daniel', 'دانيال'],
  'HOS': ['Hosea', 'هوشع'],
  'JOL': ['Joel', 'يوئيل'],
  'AMO': ['Amos', 'عاموس'],
  'OBA': ['Obadiah', 'عوبديا'],
  'JON': ['Jonah', 'يونان'],
  'MIC': ['Micah', 'ميخا'],
  'NAM': ['Nahum', 'ناحوم'],
  'HAB': ['Habakkuk', 'حبقوق'],
  'ZEP': ['Zephaniah', 'صفنيا'],
  'HAG': ['Haggai', 'حجي'],
  'ZEC': ['Zechariah', 'زكريا'],
  'MAL': ['Malachi', 'ملاخي'],
  'MAT': ['Matthew', 'إنجيلمتى'],
  'MRK': ['Mark', 'إنجيلمرقس'],
  'LUK': ['Luke', 'إنجيللوقا'],
  'JHN': ['John', 'إنجيليوحنا'],
  'ACT': ['Acts', 'أعمال'],
  'ROM': ['Romans', 'روما'],
  '1CO': ['1 Corinthians', 'كورنثوسالأولى'],
  '2CO': ['2 Corinthians', 'كورنثوسالثانية'],
  'GAL': ['Galatians', 'غلاطية'],
  'EPH': ['Ephesians', 'أفسس'],
  'PHP': ['Philippians', 'فيلبي'],
  'COL': ['Colossians', 'كولوسي'],
  '1TH': ['1 Thessalonians', 'تسالونيكيالأولى'],
  '2TH': ['2 Thessalonians', 'تسالونيكيالثانية'],
  '1TI': ['1 Timothy', 'تيموثاوسالأولى'],
  '2TI': ['2 Timothy', 'تيموثاوسالثانية'],
  'TIT': ['Titus', 'تيطس'],
  'PHM': ['Philemon', 'فليمون'],
  'HEB': ['Hebrews', 'العبرانيين'],
  'JAS': ['James', 'يعقوب'],
  '1PE': ['1 Peter', 'بطرسالأولى'],
  '2PE': ['2 Peter', 'بطرسالثانية'],
  '1JN': ['1 John', 'يوحناالأولى'],
  '2JN': ['2 John', 'يوحناالثانية'],
  '3JN': ['3 John', 'يوحناالثالثة'],
  'JUD': ['Jude', 'يهوذا'],
  'REV': ['Revelation', 'رؤيايوحنا']
};

const ARB_BASE = 'https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/arb-kehm/books';
const UNIFIED_DIR = './bible-translations/unified';

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Check for ANY problematic characters - broader pattern
function hasCorruption(text) {
  // Check for replacement character or any byte sequences that indicate corruption
  return /[\ufffd]|�/.test(text);
}

function findCorruptedChapters() {
  const corrupted = [];

  for (const bookCode of Object.keys(BOOKS)) {
    const bookDir = path.join(UNIFIED_DIR, bookCode);
    if (!fs.existsSync(bookDir)) continue;

    const chapterFiles = fs.readdirSync(bookDir).filter(f => f.endsWith('.json'));

    for (const chapterFile of chapterFiles) {
      const filePath = path.join(bookDir, chapterFile);
      const content = fs.readFileSync(filePath, 'utf-8');

      if (hasCorruption(content)) {
        const chapterNum = chapterFile.replace('.json', '');
        corrupted.push({ bookCode, chapterNum, filePath });
      }
    }
  }

  return corrupted;
}

async function fixChapter(bookCode, chapterNum, filePath) {
  const [, arbName] = BOOKS[bookCode];

  // Read current file to preserve English text
  const currentData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Fetch fresh Arabic data
  const arbUrl = `${ARB_BASE}/${encodeURIComponent(arbName)}/chapters/${chapterNum}.json`;

  let arabicData;
  try {
    arabicData = JSON.parse(await fetch(arbUrl));
  } catch (e) {
    console.error(`  ERROR: Failed to fetch Arabic for ${bookCode} ${chapterNum}: ${e.message}`);
    return false;
  }

  // Update ALL Arabic text for each verse (not just corrupted ones)
  let fixedCount = 0;
  if (arabicData.data) {
    for (const verse of arabicData.data) {
      const verseNum = String(verse.verse);
      if (currentData[verseNum]) {
        const oldAr = currentData[verseNum].ar || '';
        // Replace ALL Arabic text if the verse has ANY corruption
        if (hasCorruption(oldAr)) {
          currentData[verseNum].ar = verse.text;
          fixedCount++;
        }
      }
    }
  }

  // Save fixed file
  fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));

  return fixedCount;
}

async function main() {
  console.log('Scanning for corrupted Unicode characters (broader search)...\n');

  const corrupted = findCorruptedChapters();
  console.log(`Found ${corrupted.length} chapters with corrupted text.\n`);

  if (corrupted.length === 0) {
    console.log('No corruption found!');
    return;
  }

  let totalFixed = 0;
  let failedChapters = [];

  for (let i = 0; i < corrupted.length; i++) {
    const { bookCode, chapterNum, filePath } = corrupted[i];

    process.stdout.write(`[${i + 1}/${corrupted.length}] Fixing ${bookCode} ${chapterNum}... `);

    const fixed = await fixChapter(bookCode, chapterNum, filePath);

    if (fixed > 0) {
      console.log(`${fixed} verses fixed`);
      totalFixed += fixed;
    } else if (fixed === false) {
      console.log('FAILED');
      failedChapters.push(`${bookCode} ${chapterNum}`);
    } else {
      console.log('no fixes needed');
    }

    // Small delay to be nice to GitHub
    await new Promise(r => setTimeout(r, 50));
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Total chapters processed: ${corrupted.length}`);
  console.log(`Total verses fixed: ${totalFixed}`);
  if (failedChapters.length > 0) {
    console.log(`Failed chapters (${failedChapters.length}): ${failedChapters.join(', ')}`);
  }
}

main().catch(console.error);

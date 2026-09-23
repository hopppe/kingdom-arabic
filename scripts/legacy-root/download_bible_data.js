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

const NIV_BASE = 'https://raw.githubusercontent.com/jadenzaleski/bible-translations/master/NIV/NIV_books';
const ARB_BASE = 'https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/arb-kehm/books';
const OUTPUT_DIR = './bible-translations/unified';

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function downloadBook(code) {
  const [nivName, arbName] = BOOKS[code];
  console.log(`Downloading ${code} (${nivName})...`);

  // Skip if already have good data (MRK, JHN, PSA)
  const bookDir = path.join(OUTPUT_DIR, code);
  if (fs.existsSync(bookDir) && fs.readdirSync(bookDir).some(f => f.endsWith('.json'))) {
    console.log(`  Skipping ${code} - already exists`);
    return;
  }

  try {
    // Download English
    const nivUrl = `${NIV_BASE}/${encodeURIComponent(nivName)}.json`;
    const nivData = JSON.parse(await fetch(nivUrl));
    // The key in the JSON might have spaces removed, so try both
    const bookData = nivData[nivName] || nivData[nivName.replace(/ /g, '')];

    if (!bookData) {
      console.error(`  ERROR: No data found for ${nivName} in NIV`);
      return;
    }

    // Create book directory
    if (!fs.existsSync(bookDir)) {
      fs.mkdirSync(bookDir, { recursive: true });
    }

    // Process each chapter
    const chapters = Object.keys(bookData).sort((a, b) => parseInt(a) - parseInt(b));

    for (const chapterNum of chapters) {
      const englishVerses = bookData[chapterNum];

      // Download Arabic chapter
      const arbUrl = `${ARB_BASE}/${encodeURIComponent(arbName)}/chapters/${chapterNum}.json`;
      let arabicData;
      try {
        arabicData = JSON.parse(await fetch(arbUrl));
      } catch (e) {
        console.error(`  ERROR: Failed to fetch Arabic chapter ${chapterNum} for ${code}`);
        continue;
      }

      // Build unified chapter object
      const unifiedChapter = {};

      // Add English verses
      for (const verseNum of Object.keys(englishVerses)) {
        unifiedChapter[verseNum] = {
          en: englishVerses[verseNum],
          ar: ''
        };
      }

      // Add Arabic verses
      if (arabicData.data) {
        for (const verse of arabicData.data) {
          if (unifiedChapter[verse.verse]) {
            unifiedChapter[verse.verse].ar = verse.text;
          }
        }
      }

      // Save chapter file
      const chapterFile = path.join(bookDir, `${chapterNum}.json`);
      fs.writeFileSync(chapterFile, JSON.stringify(unifiedChapter, null, 2));
    }

    console.log(`  ${code}: ${chapters.length} chapters saved`);
  } catch (e) {
    console.error(`  ERROR downloading ${code}: ${e.message}`);
  }
}

async function main() {
  console.log('Downloading Bible data...\n');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Download all books
  const codes = Object.keys(BOOKS);
  for (const code of codes) {
    await downloadBook(code);
    // Small delay to be nice to GitHub
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\nDone!');
}

main().catch(console.error);

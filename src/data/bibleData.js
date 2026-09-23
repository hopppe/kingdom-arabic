// Bible book metadata (names, chapter lists, canonical order).
// Verse text and word glosses live in the bundled SQLite DB; see src/data/bibleRepository.js.

export const BOOKS = [
  {
    id: 'GEN',
    name: 'Genesis',
    arabicName: 'التكوين',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]
  },
  {
    id: 'EXO',
    name: 'Exodus',
    arabicName: 'الخروج',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]
  },
  {
    id: 'LEV',
    name: 'Leviticus',
    arabicName: 'اللاويين',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]
  },
  {
    id: 'NUM',
    name: 'Numbers',
    arabicName: 'العدد',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]
  },
  {
    id: 'DEU',
    name: 'Deuteronomy',
    arabicName: 'التثنية',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]
  },
  {
    id: 'JOS',
    name: 'Joshua',
    arabicName: 'يشوع',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
  },
  {
    id: 'JDG',
    name: 'Judges',
    arabicName: 'القضاة',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
  },
  {
    id: 'RUT',
    name: 'Ruth',
    arabicName: 'راعوث',
    chapters: [1, 2, 3, 4]
  },
  {
    id: '1SA',
    name: '1 Samuel',
    arabicName: 'صموئيل الأول',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
  },
  {
    id: '2SA',
    name: '2 Samuel',
    arabicName: 'صموئيل الثاني',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
  },
  {
    id: '1KI',
    name: '1 Kings',
    arabicName: 'الملوك الأول',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
  },
  {
    id: '2KI',
    name: '2 Kings',
    arabicName: 'الملوك الثاني',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
  },
  {
    id: '1CH',
    name: '1 Chronicles',
    arabicName: 'أخبار الأيام الأول',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
  },
  {
    id: '2CH',
    name: '2 Chronicles',
    arabicName: 'أخبار الأيام الثاني',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]
  },
  {
    id: 'EZR',
    name: 'Ezra',
    arabicName: 'عزرا',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'NEH',
    name: 'Nehemiah',
    arabicName: 'نحميا',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  },
  {
    id: 'EST',
    name: 'Esther',
    arabicName: 'أستير',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'JOB',
    name: 'Job',
    arabicName: 'أيوب',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42]
  },
  {
    id: 'PSA',
    name: 'Psalms',
    arabicName: 'المزامير',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150]
  },
  {
    id: 'PRO',
    name: 'Proverbs',
    arabicName: 'الأمثال',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
  },
  {
    id: 'ECC',
    name: 'Ecclesiastes',
    arabicName: 'الجامعة',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'SNG',
    name: 'Song of Solomon',
    arabicName: 'نشيد الأنشاد',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8]
  },
  {
    id: 'ISA',
    name: 'Isaiah',
    arabicName: 'إشعياء',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66]
  },
  {
    id: 'JER',
    name: 'Jeremiah',
    arabicName: 'إرميا',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52]
  },
  {
    id: 'LAM',
    name: 'Lamentations',
    arabicName: 'مراثي إرميا',
    chapters: [1, 2, 3, 4, 5]
  },
  {
    id: 'EZK',
    name: 'Ezekiel',
    arabicName: 'حزقيال',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48]
  },
  {
    id: 'DAN',
    name: 'Daniel',
    arabicName: 'دانيال',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'HOS',
    name: 'Hosea',
    arabicName: 'هوشع',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  },
  {
    id: 'JOL',
    name: 'Joel',
    arabicName: 'يوئيل',
    chapters: [1, 2, 3]
  },
  {
    id: 'AMO',
    name: 'Amos',
    arabicName: 'عاموس',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9]
  },
  {
    id: 'OBA',
    name: 'Obadiah',
    arabicName: 'عوبديا',
    chapters: [1]
  },
  {
    id: 'JON',
    name: 'Jonah',
    arabicName: 'يونان',
    chapters: [1, 2, 3, 4]
  },
  {
    id: 'MIC',
    name: 'Micah',
    arabicName: 'ميخا',
    chapters: [1, 2, 3, 4, 5, 6, 7]
  },
  {
    id: 'NAM',
    name: 'Nahum',
    arabicName: 'ناحوم',
    chapters: [1, 2, 3]
  },
  {
    id: 'HAB',
    name: 'Habakkuk',
    arabicName: 'حبقوق',
    chapters: [1, 2, 3]
  },
  {
    id: 'ZEP',
    name: 'Zephaniah',
    arabicName: 'صفنيا',
    chapters: [1, 2, 3]
  },
  {
    id: 'HAG',
    name: 'Haggai',
    arabicName: 'حجي',
    chapters: [1, 2]
  },
  {
    id: 'ZEC',
    name: 'Zechariah',
    arabicName: 'زكريا',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  },
  {
    id: 'MAL',
    name: 'Malachi',
    arabicName: 'ملاخي',
    chapters: [1, 2, 3, 4]
  },
  {
    id: 'MAT',
    name: 'Matthew',
    arabicName: 'متى',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]
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
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
  },
  {
    id: 'ACT',
    name: 'Acts',
    arabicName: 'أعمال الرسل',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]
  },
  {
    id: 'ROM',
    name: 'Romans',
    arabicName: 'رومية',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: '1CO',
    name: '1 Corinthians',
    arabicName: 'كورنثوس الأولى',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: '2CO',
    name: '2 Corinthians',
    arabicName: 'كورنثوس الثانية',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  },
  {
    id: 'GAL',
    name: 'Galatians',
    arabicName: 'غلاطية',
    chapters: [1, 2, 3, 4, 5, 6]
  },
  {
    id: 'EPH',
    name: 'Ephesians',
    arabicName: 'أفسس',
    chapters: [1, 2, 3, 4, 5, 6]
  },
  {
    id: 'PHP',
    name: 'Philippians',
    arabicName: 'فيلبي',
    chapters: [1, 2, 3, 4]
  },
  {
    id: 'COL',
    name: 'Colossians',
    arabicName: 'كولوسي',
    chapters: [1, 2, 3, 4]
  },
  {
    id: '1TH',
    name: '1 Thessalonians',
    arabicName: 'تسالونيكي الأولى',
    chapters: [1, 2, 3, 4, 5]
  },
  {
    id: '2TH',
    name: '2 Thessalonians',
    arabicName: 'تسالونيكي الثانية',
    chapters: [1, 2, 3]
  },
  {
    id: '1TI',
    name: '1 Timothy',
    arabicName: 'تيموثاوس الأولى',
    chapters: [1, 2, 3, 4, 5, 6]
  },
  {
    id: '2TI',
    name: '2 Timothy',
    arabicName: 'تيموثاوس الثانية',
    chapters: [1, 2, 3, 4]
  },
  {
    id: 'TIT',
    name: 'Titus',
    arabicName: 'تيطس',
    chapters: [1, 2, 3]
  },
  {
    id: 'PHM',
    name: 'Philemon',
    arabicName: 'فليمون',
    chapters: [1]
  },
  {
    id: 'HEB',
    name: 'Hebrews',
    arabicName: 'العبرانيين',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  },
  {
    id: 'JAS',
    name: 'James',
    arabicName: 'يعقوب',
    chapters: [1, 2, 3, 4, 5]
  },
  {
    id: '1PE',
    name: '1 Peter',
    arabicName: 'بطرس الأولى',
    chapters: [1, 2, 3, 4, 5]
  },
  {
    id: '2PE',
    name: '2 Peter',
    arabicName: 'بطرس الثانية',
    chapters: [1, 2, 3]
  },
  {
    id: '1JN',
    name: '1 John',
    arabicName: 'يوحنا الأولى',
    chapters: [1, 2, 3, 4, 5]
  },
  {
    id: '2JN',
    name: '2 John',
    arabicName: 'يوحنا الثانية',
    chapters: [1]
  },
  {
    id: '3JN',
    name: '3 John',
    arabicName: 'يوحنا الثالثة',
    chapters: [1]
  },
  {
    id: 'JUD',
    name: 'Jude',
    arabicName: 'يهوذا',
    chapters: [1]
  },
  {
    id: 'REV',
    name: 'Revelation',
    arabicName: 'رؤيا يوحنا',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
  }
];

export const BOOK_ARABIC_NAMES = {
  'GEN': 'التكوين',
  'EXO': 'الخروج',
  'LEV': 'اللاويين',
  'NUM': 'العدد',
  'DEU': 'التثنية',
  'JOS': 'يشوع',
  'JDG': 'القضاة',
  'RUT': 'راعوث',
  '1SA': 'صموئيل الأول',
  '2SA': 'صموئيل الثاني',
  '1KI': 'الملوك الأول',
  '2KI': 'الملوك الثاني',
  '1CH': 'أخبار الأيام الأول',
  '2CH': 'أخبار الأيام الثاني',
  'EZR': 'عزرا',
  'NEH': 'نحميا',
  'EST': 'أستير',
  'JOB': 'أيوب',
  'PSA': 'المزامير',
  'PRO': 'الأمثال',
  'ECC': 'الجامعة',
  'SNG': 'نشيد الأنشاد',
  'ISA': 'إشعياء',
  'JER': 'إرميا',
  'LAM': 'مراثي إرميا',
  'EZK': 'حزقيال',
  'DAN': 'دانيال',
  'HOS': 'هوشع',
  'JOL': 'يوئيل',
  'AMO': 'عاموس',
  'OBA': 'عوبديا',
  'JON': 'يونان',
  'MIC': 'ميخا',
  'NAM': 'ناحوم',
  'HAB': 'حبقوق',
  'ZEP': 'صفنيا',
  'HAG': 'حجي',
  'ZEC': 'زكريا',
  'MAL': 'ملاخي',
  'MAT': 'متى',
  'MRK': 'مرقس',
  'LUK': 'لوقا',
  'JHN': 'يوحنا',
  'ACT': 'أعمال الرسل',
  'ROM': 'رومية',
  '1CO': 'كورنثوس الأولى',
  '2CO': 'كورنثوس الثانية',
  'GAL': 'غلاطية',
  'EPH': 'أفسس',
  'PHP': 'فيلبي',
  'COL': 'كولوسي',
  '1TH': 'تسالونيكي الأولى',
  '2TH': 'تسالونيكي الثانية',
  '1TI': 'تيموثاوس الأولى',
  '2TI': 'تيموثاوس الثانية',
  'TIT': 'تيطس',
  'PHM': 'فليمون',
  'HEB': 'العبرانيين',
  'JAS': 'يعقوب',
  '1PE': 'بطرس الأولى',
  '2PE': 'بطرس الثانية',
  '1JN': 'يوحنا الأولى',
  '2JN': 'يوحنا الثانية',
  '3JN': 'يوحنا الثالثة',
  'JUD': 'يهوذا',
  'REV': 'رؤيا يوحنا'
};

export const getBookName = (bookCode) => {
  const bookNames = {
    'GEN': 'Genesis', 'EXO': 'Exodus', 'LEV': 'Leviticus', 'NUM': 'Numbers',
    'DEU': 'Deuteronomy', 'JOS': 'Joshua', 'JDG': 'Judges', 'RUT': 'Ruth',
    '1SA': '1 Samuel', '2SA': '2 Samuel', '1KI': '1 Kings', '2KI': '2 Kings',
    '1CH': '1 Chronicles', '2CH': '2 Chronicles', 'EZR': 'Ezra', 'NEH': 'Nehemiah',
    'EST': 'Esther', 'JOB': 'Job', 'PSA': 'Psalms', 'PRO': 'Proverbs',
    'ECC': 'Ecclesiastes', 'SNG': 'Song of Solomon', 'ISA': 'Isaiah', 'JER': 'Jeremiah',
    'LAM': 'Lamentations', 'EZK': 'Ezekiel', 'DAN': 'Daniel', 'HOS': 'Hosea',
    'JOL': 'Joel', 'AMO': 'Amos', 'OBA': 'Obadiah', 'JON': 'Jonah',
    'MIC': 'Micah', 'NAM': 'Nahum', 'HAB': 'Habakkuk', 'ZEP': 'Zephaniah',
    'HAG': 'Haggai', 'ZEC': 'Zechariah', 'MAL': 'Malachi',
    'MAT': 'Matthew', 'MRK': 'Mark', 'LUK': 'Luke', 'JHN': 'John',
    'ACT': 'Acts', 'ROM': 'Romans', '1CO': '1 Corinthians', '2CO': '2 Corinthians',
    'GAL': 'Galatians', 'EPH': 'Ephesians', 'PHP': 'Philippians', 'COL': 'Colossians',
    '1TH': '1 Thessalonians', '2TH': '2 Thessalonians', '1TI': '1 Timothy', '2TI': '2 Timothy',
    'TIT': 'Titus', 'PHM': 'Philemon', 'HEB': 'Hebrews', 'JAS': 'James',
    '1PE': '1 Peter', '2PE': '2 Peter', '1JN': '1 John', '2JN': '2 John',
    '3JN': '3 John', 'JUD': 'Jude', 'REV': 'Revelation'
  };
  return bookNames[bookCode] || bookCode;
};

// DB book ids are 1-based canonical positions (see scripts/build_bible_db.py).
const BOOK_NUMBERS = Object.fromEntries(BOOKS.map((book, index) => [book.id, index + 1]));

export const getBookNumber = (bookCode) => BOOK_NUMBERS[bookCode] || null;

export const getBookCode = (bookNumber) => BOOKS[bookNumber - 1]?.id || null;

export const OLD_TESTAMENT_BOOK_COUNT = 39;

export const isNewTestament = (bookCode) => getBookNumber(bookCode) > OLD_TESTAMENT_BOOK_COUNT;

export const TOTAL_CHAPTERS = BOOKS.reduce((sum, book) => sum + book.chapters.length, 0);

export const formatReference = (bookCode, chapter, verse) =>
  verse ? `${getBookName(bookCode)} ${chapter}:${verse}` : `${getBookName(bookCode)} ${chapter}`;

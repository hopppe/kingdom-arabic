// Shared Bible data and loader functions
// Auto-generated from bible-translations/mappings folder
// Run: node scripts/generate-bible-data.js

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

const transformMappingData = (rawData, bookName, bookCode) => {
  const verseKeys = Object.keys(rawData.verses).sort((a, b) => parseInt(a) - parseInt(b));

  const content_arabic = verseKeys.map(key => rawData.verses[key].ar);
  const content_english = verseKeys.map(key => rawData.verses[key].en);

  const vocab = {};
  verseKeys.forEach((key, index) => {
    const verseMappings = rawData.verses[key].mappings || [];
    const verseVocab = {};
    verseMappings.forEach(mapping => {
      verseVocab[mapping.ar] = mapping.en;
    });
    vocab[`verse_${index + 1}`] = verseVocab;
  });

  const arabicName = BOOK_ARABIC_NAMES[bookCode] || bookCode;

  return {
    data: {
      title_arabic: `${arabicName} ${rawData.chapter}`,
      title_english: `${bookName} ${rawData.chapter}`,
      content_arabic,
      content_english,
    },
    vocab,
  };
};

const chapterCache = {};

export const loadChapterData = async (book, chapter) => {
  const cacheKey = `${book}_${chapter}`;

  if (chapterCache[cacheKey]) {
    return chapterCache[cacheKey];
  }

  let rawData;
  let bookName;

    if (book === 'GEN') {
    bookName = 'Genesis';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/GEN/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/GEN/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/GEN/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/GEN/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/GEN/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/GEN/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/GEN/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/GEN/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/GEN/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/GEN/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/GEN/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/GEN/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/GEN/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/GEN/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/GEN/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/GEN/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/GEN/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/GEN/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/GEN/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/GEN/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/GEN/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/GEN/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/GEN/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/GEN/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/GEN/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/GEN/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/GEN/27.json'); break;
      case 28: rawData = require('../../bible-translations/mappings/GEN/28.json'); break;
      case 29: rawData = require('../../bible-translations/mappings/GEN/29.json'); break;
      case 30: rawData = require('../../bible-translations/mappings/GEN/30.json'); break;
      case 31: rawData = require('../../bible-translations/mappings/GEN/31.json'); break;
      case 32: rawData = require('../../bible-translations/mappings/GEN/32.json'); break;
      case 33: rawData = require('../../bible-translations/mappings/GEN/33.json'); break;
      case 34: rawData = require('../../bible-translations/mappings/GEN/34.json'); break;
      case 35: rawData = require('../../bible-translations/mappings/GEN/35.json'); break;
      case 36: rawData = require('../../bible-translations/mappings/GEN/36.json'); break;
      case 37: rawData = require('../../bible-translations/mappings/GEN/37.json'); break;
      case 38: rawData = require('../../bible-translations/mappings/GEN/38.json'); break;
      case 39: rawData = require('../../bible-translations/mappings/GEN/39.json'); break;
      case 40: rawData = require('../../bible-translations/mappings/GEN/40.json'); break;
      case 41: rawData = require('../../bible-translations/mappings/GEN/41.json'); break;
      case 42: rawData = require('../../bible-translations/mappings/GEN/42.json'); break;
      case 43: rawData = require('../../bible-translations/mappings/GEN/43.json'); break;
      case 44: rawData = require('../../bible-translations/mappings/GEN/44.json'); break;
      case 45: rawData = require('../../bible-translations/mappings/GEN/45.json'); break;
      case 46: rawData = require('../../bible-translations/mappings/GEN/46.json'); break;
      case 47: rawData = require('../../bible-translations/mappings/GEN/47.json'); break;
      case 48: rawData = require('../../bible-translations/mappings/GEN/48.json'); break;
      case 49: rawData = require('../../bible-translations/mappings/GEN/49.json'); break;
      case 50: rawData = require('../../bible-translations/mappings/GEN/50.json'); break;
    }
  } else   if (book === 'EXO') {
    bookName = 'Exodus';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/EXO/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/EXO/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/EXO/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/EXO/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/EXO/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/EXO/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/EXO/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/EXO/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/EXO/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/EXO/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/EXO/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/EXO/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/EXO/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/EXO/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/EXO/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/EXO/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/EXO/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/EXO/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/EXO/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/EXO/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/EXO/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/EXO/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/EXO/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/EXO/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/EXO/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/EXO/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/EXO/27.json'); break;
      case 28: rawData = require('../../bible-translations/mappings/EXO/28.json'); break;
      case 29: rawData = require('../../bible-translations/mappings/EXO/29.json'); break;
      case 30: rawData = require('../../bible-translations/mappings/EXO/30.json'); break;
      case 31: rawData = require('../../bible-translations/mappings/EXO/31.json'); break;
      case 32: rawData = require('../../bible-translations/mappings/EXO/32.json'); break;
      case 33: rawData = require('../../bible-translations/mappings/EXO/33.json'); break;
      case 34: rawData = require('../../bible-translations/mappings/EXO/34.json'); break;
      case 35: rawData = require('../../bible-translations/mappings/EXO/35.json'); break;
      case 36: rawData = require('../../bible-translations/mappings/EXO/36.json'); break;
      case 37: rawData = require('../../bible-translations/mappings/EXO/37.json'); break;
      case 38: rawData = require('../../bible-translations/mappings/EXO/38.json'); break;
      case 39: rawData = require('../../bible-translations/mappings/EXO/39.json'); break;
      case 40: rawData = require('../../bible-translations/mappings/EXO/40.json'); break;
    }
  } else   if (book === 'LEV') {
    bookName = 'Leviticus';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/LEV/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/LEV/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/LEV/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/LEV/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/LEV/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/LEV/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/LEV/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/LEV/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/LEV/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/LEV/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/LEV/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/LEV/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/LEV/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/LEV/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/LEV/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/LEV/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/LEV/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/LEV/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/LEV/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/LEV/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/LEV/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/LEV/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/LEV/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/LEV/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/LEV/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/LEV/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/LEV/27.json'); break;
    }
  } else   if (book === 'NUM') {
    bookName = 'Numbers';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/NUM/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/NUM/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/NUM/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/NUM/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/NUM/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/NUM/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/NUM/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/NUM/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/NUM/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/NUM/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/NUM/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/NUM/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/NUM/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/NUM/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/NUM/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/NUM/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/NUM/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/NUM/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/NUM/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/NUM/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/NUM/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/NUM/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/NUM/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/NUM/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/NUM/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/NUM/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/NUM/27.json'); break;
      case 28: rawData = require('../../bible-translations/mappings/NUM/28.json'); break;
      case 29: rawData = require('../../bible-translations/mappings/NUM/29.json'); break;
      case 30: rawData = require('../../bible-translations/mappings/NUM/30.json'); break;
      case 31: rawData = require('../../bible-translations/mappings/NUM/31.json'); break;
      case 32: rawData = require('../../bible-translations/mappings/NUM/32.json'); break;
      case 33: rawData = require('../../bible-translations/mappings/NUM/33.json'); break;
      case 34: rawData = require('../../bible-translations/mappings/NUM/34.json'); break;
      case 35: rawData = require('../../bible-translations/mappings/NUM/35.json'); break;
      case 36: rawData = require('../../bible-translations/mappings/NUM/36.json'); break;
    }
  } else   if (book === 'DEU') {
    bookName = 'Deuteronomy';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/DEU/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/DEU/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/DEU/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/DEU/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/DEU/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/DEU/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/DEU/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/DEU/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/DEU/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/DEU/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/DEU/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/DEU/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/DEU/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/DEU/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/DEU/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/DEU/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/DEU/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/DEU/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/DEU/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/DEU/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/DEU/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/DEU/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/DEU/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/DEU/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/DEU/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/DEU/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/DEU/27.json'); break;
      case 28: rawData = require('../../bible-translations/mappings/DEU/28.json'); break;
      case 29: rawData = require('../../bible-translations/mappings/DEU/29.json'); break;
      case 30: rawData = require('../../bible-translations/mappings/DEU/30.json'); break;
      case 31: rawData = require('../../bible-translations/mappings/DEU/31.json'); break;
      case 32: rawData = require('../../bible-translations/mappings/DEU/32.json'); break;
      case 33: rawData = require('../../bible-translations/mappings/DEU/33.json'); break;
      case 34: rawData = require('../../bible-translations/mappings/DEU/34.json'); break;
    }
  } else   if (book === 'JOS') {
    bookName = 'Joshua';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/JOS/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/JOS/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/JOS/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/JOS/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/JOS/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/JOS/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/JOS/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/JOS/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/JOS/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/JOS/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/JOS/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/JOS/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/JOS/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/JOS/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/JOS/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/JOS/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/JOS/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/JOS/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/JOS/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/JOS/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/JOS/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/JOS/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/JOS/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/JOS/24.json'); break;
    }
  } else   if (book === 'JDG') {
    bookName = 'Judges';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/JDG/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/JDG/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/JDG/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/JDG/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/JDG/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/JDG/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/JDG/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/JDG/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/JDG/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/JDG/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/JDG/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/JDG/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/JDG/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/JDG/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/JDG/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/JDG/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/JDG/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/JDG/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/JDG/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/JDG/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/JDG/21.json'); break;
    }
  } else   if (book === 'RUT') {
    bookName = 'Ruth';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/RUT/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/RUT/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/RUT/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/RUT/4.json'); break;
    }
  } else   if (book === '1SA') {
    bookName = '1 Samuel';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/1SA/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/1SA/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/1SA/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/1SA/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/1SA/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/1SA/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/1SA/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/1SA/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/1SA/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/1SA/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/1SA/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/1SA/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/1SA/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/1SA/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/1SA/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/1SA/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/1SA/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/1SA/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/1SA/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/1SA/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/1SA/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/1SA/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/1SA/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/1SA/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/1SA/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/1SA/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/1SA/27.json'); break;
      case 28: rawData = require('../../bible-translations/mappings/1SA/28.json'); break;
      case 29: rawData = require('../../bible-translations/mappings/1SA/29.json'); break;
      case 30: rawData = require('../../bible-translations/mappings/1SA/30.json'); break;
      case 31: rawData = require('../../bible-translations/mappings/1SA/31.json'); break;
    }
  } else   if (book === '2SA') {
    bookName = '2 Samuel';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/2SA/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/2SA/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/2SA/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/2SA/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/2SA/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/2SA/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/2SA/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/2SA/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/2SA/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/2SA/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/2SA/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/2SA/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/2SA/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/2SA/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/2SA/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/2SA/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/2SA/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/2SA/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/2SA/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/2SA/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/2SA/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/2SA/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/2SA/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/2SA/24.json'); break;
    }
  } else   if (book === '1KI') {
    bookName = '1 Kings';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/1KI/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/1KI/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/1KI/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/1KI/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/1KI/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/1KI/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/1KI/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/1KI/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/1KI/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/1KI/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/1KI/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/1KI/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/1KI/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/1KI/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/1KI/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/1KI/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/1KI/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/1KI/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/1KI/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/1KI/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/1KI/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/1KI/22.json'); break;
    }
  } else   if (book === '2KI') {
    bookName = '2 Kings';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/2KI/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/2KI/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/2KI/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/2KI/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/2KI/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/2KI/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/2KI/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/2KI/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/2KI/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/2KI/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/2KI/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/2KI/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/2KI/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/2KI/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/2KI/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/2KI/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/2KI/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/2KI/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/2KI/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/2KI/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/2KI/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/2KI/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/2KI/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/2KI/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/2KI/25.json'); break;
    }
  } else   if (book === '1CH') {
    bookName = '1 Chronicles';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/1CH/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/1CH/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/1CH/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/1CH/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/1CH/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/1CH/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/1CH/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/1CH/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/1CH/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/1CH/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/1CH/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/1CH/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/1CH/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/1CH/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/1CH/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/1CH/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/1CH/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/1CH/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/1CH/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/1CH/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/1CH/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/1CH/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/1CH/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/1CH/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/1CH/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/1CH/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/1CH/27.json'); break;
      case 28: rawData = require('../../bible-translations/mappings/1CH/28.json'); break;
      case 29: rawData = require('../../bible-translations/mappings/1CH/29.json'); break;
    }
  } else   if (book === '2CH') {
    bookName = '2 Chronicles';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/2CH/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/2CH/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/2CH/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/2CH/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/2CH/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/2CH/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/2CH/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/2CH/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/2CH/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/2CH/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/2CH/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/2CH/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/2CH/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/2CH/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/2CH/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/2CH/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/2CH/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/2CH/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/2CH/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/2CH/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/2CH/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/2CH/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/2CH/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/2CH/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/2CH/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/2CH/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/2CH/27.json'); break;
      case 28: rawData = require('../../bible-translations/mappings/2CH/28.json'); break;
      case 29: rawData = require('../../bible-translations/mappings/2CH/29.json'); break;
      case 30: rawData = require('../../bible-translations/mappings/2CH/30.json'); break;
      case 31: rawData = require('../../bible-translations/mappings/2CH/31.json'); break;
      case 32: rawData = require('../../bible-translations/mappings/2CH/32.json'); break;
      case 33: rawData = require('../../bible-translations/mappings/2CH/33.json'); break;
      case 34: rawData = require('../../bible-translations/mappings/2CH/34.json'); break;
      case 35: rawData = require('../../bible-translations/mappings/2CH/35.json'); break;
      case 36: rawData = require('../../bible-translations/mappings/2CH/36.json'); break;
    }
  } else   if (book === 'EZR') {
    bookName = 'Ezra';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/EZR/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/EZR/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/EZR/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/EZR/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/EZR/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/EZR/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/EZR/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/EZR/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/EZR/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/EZR/10.json'); break;
    }
  } else   if (book === 'NEH') {
    bookName = 'Nehemiah';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/NEH/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/NEH/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/NEH/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/NEH/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/NEH/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/NEH/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/NEH/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/NEH/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/NEH/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/NEH/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/NEH/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/NEH/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/NEH/13.json'); break;
    }
  } else   if (book === 'EST') {
    bookName = 'Esther';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/EST/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/EST/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/EST/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/EST/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/EST/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/EST/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/EST/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/EST/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/EST/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/EST/10.json'); break;
    }
  } else   if (book === 'JOB') {
    bookName = 'Job';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/JOB/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/JOB/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/JOB/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/JOB/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/JOB/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/JOB/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/JOB/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/JOB/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/JOB/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/JOB/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/JOB/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/JOB/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/JOB/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/JOB/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/JOB/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/JOB/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/JOB/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/JOB/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/JOB/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/JOB/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/JOB/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/JOB/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/JOB/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/JOB/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/JOB/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/JOB/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/JOB/27.json'); break;
      case 28: rawData = require('../../bible-translations/mappings/JOB/28.json'); break;
      case 29: rawData = require('../../bible-translations/mappings/JOB/29.json'); break;
      case 30: rawData = require('../../bible-translations/mappings/JOB/30.json'); break;
      case 31: rawData = require('../../bible-translations/mappings/JOB/31.json'); break;
      case 32: rawData = require('../../bible-translations/mappings/JOB/32.json'); break;
      case 33: rawData = require('../../bible-translations/mappings/JOB/33.json'); break;
      case 34: rawData = require('../../bible-translations/mappings/JOB/34.json'); break;
      case 35: rawData = require('../../bible-translations/mappings/JOB/35.json'); break;
      case 36: rawData = require('../../bible-translations/mappings/JOB/36.json'); break;
      case 37: rawData = require('../../bible-translations/mappings/JOB/37.json'); break;
      case 38: rawData = require('../../bible-translations/mappings/JOB/38.json'); break;
      case 39: rawData = require('../../bible-translations/mappings/JOB/39.json'); break;
      case 40: rawData = require('../../bible-translations/mappings/JOB/40.json'); break;
      case 41: rawData = require('../../bible-translations/mappings/JOB/41.json'); break;
      case 42: rawData = require('../../bible-translations/mappings/JOB/42.json'); break;
    }
  } else   if (book === 'PSA') {
    bookName = 'Psalms';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/PSA/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/PSA/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/PSA/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/PSA/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/PSA/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/PSA/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/PSA/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/PSA/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/PSA/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/PSA/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/PSA/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/PSA/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/PSA/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/PSA/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/PSA/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/PSA/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/PSA/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/PSA/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/PSA/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/PSA/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/PSA/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/PSA/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/PSA/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/PSA/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/PSA/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/PSA/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/PSA/27.json'); break;
      case 28: rawData = require('../../bible-translations/mappings/PSA/28.json'); break;
      case 29: rawData = require('../../bible-translations/mappings/PSA/29.json'); break;
      case 30: rawData = require('../../bible-translations/mappings/PSA/30.json'); break;
      case 31: rawData = require('../../bible-translations/mappings/PSA/31.json'); break;
      case 32: rawData = require('../../bible-translations/mappings/PSA/32.json'); break;
      case 33: rawData = require('../../bible-translations/mappings/PSA/33.json'); break;
      case 34: rawData = require('../../bible-translations/mappings/PSA/34.json'); break;
      case 35: rawData = require('../../bible-translations/mappings/PSA/35.json'); break;
      case 36: rawData = require('../../bible-translations/mappings/PSA/36.json'); break;
      case 37: rawData = require('../../bible-translations/mappings/PSA/37.json'); break;
      case 38: rawData = require('../../bible-translations/mappings/PSA/38.json'); break;
      case 39: rawData = require('../../bible-translations/mappings/PSA/39.json'); break;
      case 40: rawData = require('../../bible-translations/mappings/PSA/40.json'); break;
      case 41: rawData = require('../../bible-translations/mappings/PSA/41.json'); break;
      case 42: rawData = require('../../bible-translations/mappings/PSA/42.json'); break;
      case 43: rawData = require('../../bible-translations/mappings/PSA/43.json'); break;
      case 44: rawData = require('../../bible-translations/mappings/PSA/44.json'); break;
      case 45: rawData = require('../../bible-translations/mappings/PSA/45.json'); break;
      case 46: rawData = require('../../bible-translations/mappings/PSA/46.json'); break;
      case 47: rawData = require('../../bible-translations/mappings/PSA/47.json'); break;
      case 48: rawData = require('../../bible-translations/mappings/PSA/48.json'); break;
      case 49: rawData = require('../../bible-translations/mappings/PSA/49.json'); break;
      case 50: rawData = require('../../bible-translations/mappings/PSA/50.json'); break;
      case 51: rawData = require('../../bible-translations/mappings/PSA/51.json'); break;
      case 52: rawData = require('../../bible-translations/mappings/PSA/52.json'); break;
      case 53: rawData = require('../../bible-translations/mappings/PSA/53.json'); break;
      case 54: rawData = require('../../bible-translations/mappings/PSA/54.json'); break;
      case 55: rawData = require('../../bible-translations/mappings/PSA/55.json'); break;
      case 56: rawData = require('../../bible-translations/mappings/PSA/56.json'); break;
      case 57: rawData = require('../../bible-translations/mappings/PSA/57.json'); break;
      case 58: rawData = require('../../bible-translations/mappings/PSA/58.json'); break;
      case 59: rawData = require('../../bible-translations/mappings/PSA/59.json'); break;
      case 60: rawData = require('../../bible-translations/mappings/PSA/60.json'); break;
      case 61: rawData = require('../../bible-translations/mappings/PSA/61.json'); break;
      case 62: rawData = require('../../bible-translations/mappings/PSA/62.json'); break;
      case 63: rawData = require('../../bible-translations/mappings/PSA/63.json'); break;
      case 64: rawData = require('../../bible-translations/mappings/PSA/64.json'); break;
      case 65: rawData = require('../../bible-translations/mappings/PSA/65.json'); break;
      case 66: rawData = require('../../bible-translations/mappings/PSA/66.json'); break;
      case 67: rawData = require('../../bible-translations/mappings/PSA/67.json'); break;
      case 68: rawData = require('../../bible-translations/mappings/PSA/68.json'); break;
      case 69: rawData = require('../../bible-translations/mappings/PSA/69.json'); break;
      case 70: rawData = require('../../bible-translations/mappings/PSA/70.json'); break;
      case 71: rawData = require('../../bible-translations/mappings/PSA/71.json'); break;
      case 72: rawData = require('../../bible-translations/mappings/PSA/72.json'); break;
      case 73: rawData = require('../../bible-translations/mappings/PSA/73.json'); break;
      case 74: rawData = require('../../bible-translations/mappings/PSA/74.json'); break;
      case 75: rawData = require('../../bible-translations/mappings/PSA/75.json'); break;
      case 76: rawData = require('../../bible-translations/mappings/PSA/76.json'); break;
      case 77: rawData = require('../../bible-translations/mappings/PSA/77.json'); break;
      case 78: rawData = require('../../bible-translations/mappings/PSA/78.json'); break;
      case 79: rawData = require('../../bible-translations/mappings/PSA/79.json'); break;
      case 80: rawData = require('../../bible-translations/mappings/PSA/80.json'); break;
      case 81: rawData = require('../../bible-translations/mappings/PSA/81.json'); break;
      case 82: rawData = require('../../bible-translations/mappings/PSA/82.json'); break;
      case 83: rawData = require('../../bible-translations/mappings/PSA/83.json'); break;
      case 84: rawData = require('../../bible-translations/mappings/PSA/84.json'); break;
      case 85: rawData = require('../../bible-translations/mappings/PSA/85.json'); break;
      case 86: rawData = require('../../bible-translations/mappings/PSA/86.json'); break;
      case 87: rawData = require('../../bible-translations/mappings/PSA/87.json'); break;
      case 88: rawData = require('../../bible-translations/mappings/PSA/88.json'); break;
      case 89: rawData = require('../../bible-translations/mappings/PSA/89.json'); break;
      case 90: rawData = require('../../bible-translations/mappings/PSA/90.json'); break;
      case 91: rawData = require('../../bible-translations/mappings/PSA/91.json'); break;
      case 92: rawData = require('../../bible-translations/mappings/PSA/92.json'); break;
      case 93: rawData = require('../../bible-translations/mappings/PSA/93.json'); break;
      case 94: rawData = require('../../bible-translations/mappings/PSA/94.json'); break;
      case 95: rawData = require('../../bible-translations/mappings/PSA/95.json'); break;
      case 96: rawData = require('../../bible-translations/mappings/PSA/96.json'); break;
      case 97: rawData = require('../../bible-translations/mappings/PSA/97.json'); break;
      case 98: rawData = require('../../bible-translations/mappings/PSA/98.json'); break;
      case 99: rawData = require('../../bible-translations/mappings/PSA/99.json'); break;
      case 100: rawData = require('../../bible-translations/mappings/PSA/100.json'); break;
      case 101: rawData = require('../../bible-translations/mappings/PSA/101.json'); break;
      case 102: rawData = require('../../bible-translations/mappings/PSA/102.json'); break;
      case 103: rawData = require('../../bible-translations/mappings/PSA/103.json'); break;
      case 104: rawData = require('../../bible-translations/mappings/PSA/104.json'); break;
      case 105: rawData = require('../../bible-translations/mappings/PSA/105.json'); break;
      case 106: rawData = require('../../bible-translations/mappings/PSA/106.json'); break;
      case 107: rawData = require('../../bible-translations/mappings/PSA/107.json'); break;
      case 108: rawData = require('../../bible-translations/mappings/PSA/108.json'); break;
      case 109: rawData = require('../../bible-translations/mappings/PSA/109.json'); break;
      case 110: rawData = require('../../bible-translations/mappings/PSA/110.json'); break;
      case 111: rawData = require('../../bible-translations/mappings/PSA/111.json'); break;
      case 112: rawData = require('../../bible-translations/mappings/PSA/112.json'); break;
      case 113: rawData = require('../../bible-translations/mappings/PSA/113.json'); break;
      case 114: rawData = require('../../bible-translations/mappings/PSA/114.json'); break;
      case 115: rawData = require('../../bible-translations/mappings/PSA/115.json'); break;
      case 116: rawData = require('../../bible-translations/mappings/PSA/116.json'); break;
      case 117: rawData = require('../../bible-translations/mappings/PSA/117.json'); break;
      case 118: rawData = require('../../bible-translations/mappings/PSA/118.json'); break;
      case 119: rawData = require('../../bible-translations/mappings/PSA/119.json'); break;
      case 120: rawData = require('../../bible-translations/mappings/PSA/120.json'); break;
      case 121: rawData = require('../../bible-translations/mappings/PSA/121.json'); break;
      case 122: rawData = require('../../bible-translations/mappings/PSA/122.json'); break;
      case 123: rawData = require('../../bible-translations/mappings/PSA/123.json'); break;
      case 124: rawData = require('../../bible-translations/mappings/PSA/124.json'); break;
      case 125: rawData = require('../../bible-translations/mappings/PSA/125.json'); break;
      case 126: rawData = require('../../bible-translations/mappings/PSA/126.json'); break;
      case 127: rawData = require('../../bible-translations/mappings/PSA/127.json'); break;
      case 128: rawData = require('../../bible-translations/mappings/PSA/128.json'); break;
      case 129: rawData = require('../../bible-translations/mappings/PSA/129.json'); break;
      case 130: rawData = require('../../bible-translations/mappings/PSA/130.json'); break;
      case 131: rawData = require('../../bible-translations/mappings/PSA/131.json'); break;
      case 132: rawData = require('../../bible-translations/mappings/PSA/132.json'); break;
      case 133: rawData = require('../../bible-translations/mappings/PSA/133.json'); break;
      case 134: rawData = require('../../bible-translations/mappings/PSA/134.json'); break;
      case 135: rawData = require('../../bible-translations/mappings/PSA/135.json'); break;
      case 136: rawData = require('../../bible-translations/mappings/PSA/136.json'); break;
      case 137: rawData = require('../../bible-translations/mappings/PSA/137.json'); break;
      case 138: rawData = require('../../bible-translations/mappings/PSA/138.json'); break;
      case 139: rawData = require('../../bible-translations/mappings/PSA/139.json'); break;
      case 140: rawData = require('../../bible-translations/mappings/PSA/140.json'); break;
      case 141: rawData = require('../../bible-translations/mappings/PSA/141.json'); break;
      case 142: rawData = require('../../bible-translations/mappings/PSA/142.json'); break;
      case 143: rawData = require('../../bible-translations/mappings/PSA/143.json'); break;
      case 144: rawData = require('../../bible-translations/mappings/PSA/144.json'); break;
      case 145: rawData = require('../../bible-translations/mappings/PSA/145.json'); break;
      case 146: rawData = require('../../bible-translations/mappings/PSA/146.json'); break;
      case 147: rawData = require('../../bible-translations/mappings/PSA/147.json'); break;
      case 148: rawData = require('../../bible-translations/mappings/PSA/148.json'); break;
      case 149: rawData = require('../../bible-translations/mappings/PSA/149.json'); break;
      case 150: rawData = require('../../bible-translations/mappings/PSA/150.json'); break;
    }
  } else   if (book === 'PRO') {
    bookName = 'Proverbs';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/PRO/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/PRO/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/PRO/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/PRO/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/PRO/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/PRO/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/PRO/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/PRO/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/PRO/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/PRO/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/PRO/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/PRO/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/PRO/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/PRO/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/PRO/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/PRO/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/PRO/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/PRO/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/PRO/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/PRO/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/PRO/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/PRO/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/PRO/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/PRO/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/PRO/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/PRO/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/PRO/27.json'); break;
      case 28: rawData = require('../../bible-translations/mappings/PRO/28.json'); break;
      case 29: rawData = require('../../bible-translations/mappings/PRO/29.json'); break;
      case 30: rawData = require('../../bible-translations/mappings/PRO/30.json'); break;
      case 31: rawData = require('../../bible-translations/mappings/PRO/31.json'); break;
    }
  } else   if (book === 'ECC') {
    bookName = 'Ecclesiastes';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/ECC/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/ECC/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/ECC/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/ECC/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/ECC/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/ECC/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/ECC/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/ECC/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/ECC/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/ECC/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/ECC/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/ECC/12.json'); break;
    }
  } else   if (book === 'SNG') {
    bookName = 'Song of Solomon';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/SNG/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/SNG/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/SNG/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/SNG/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/SNG/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/SNG/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/SNG/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/SNG/8.json'); break;
    }
  } else   if (book === 'ISA') {
    bookName = 'Isaiah';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/ISA/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/ISA/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/ISA/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/ISA/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/ISA/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/ISA/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/ISA/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/ISA/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/ISA/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/ISA/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/ISA/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/ISA/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/ISA/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/ISA/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/ISA/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/ISA/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/ISA/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/ISA/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/ISA/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/ISA/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/ISA/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/ISA/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/ISA/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/ISA/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/ISA/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/ISA/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/ISA/27.json'); break;
      case 28: rawData = require('../../bible-translations/mappings/ISA/28.json'); break;
      case 29: rawData = require('../../bible-translations/mappings/ISA/29.json'); break;
      case 30: rawData = require('../../bible-translations/mappings/ISA/30.json'); break;
      case 31: rawData = require('../../bible-translations/mappings/ISA/31.json'); break;
      case 32: rawData = require('../../bible-translations/mappings/ISA/32.json'); break;
      case 33: rawData = require('../../bible-translations/mappings/ISA/33.json'); break;
      case 34: rawData = require('../../bible-translations/mappings/ISA/34.json'); break;
      case 35: rawData = require('../../bible-translations/mappings/ISA/35.json'); break;
      case 36: rawData = require('../../bible-translations/mappings/ISA/36.json'); break;
      case 37: rawData = require('../../bible-translations/mappings/ISA/37.json'); break;
      case 38: rawData = require('../../bible-translations/mappings/ISA/38.json'); break;
      case 39: rawData = require('../../bible-translations/mappings/ISA/39.json'); break;
      case 40: rawData = require('../../bible-translations/mappings/ISA/40.json'); break;
      case 41: rawData = require('../../bible-translations/mappings/ISA/41.json'); break;
      case 42: rawData = require('../../bible-translations/mappings/ISA/42.json'); break;
      case 43: rawData = require('../../bible-translations/mappings/ISA/43.json'); break;
      case 44: rawData = require('../../bible-translations/mappings/ISA/44.json'); break;
      case 45: rawData = require('../../bible-translations/mappings/ISA/45.json'); break;
      case 46: rawData = require('../../bible-translations/mappings/ISA/46.json'); break;
      case 47: rawData = require('../../bible-translations/mappings/ISA/47.json'); break;
      case 48: rawData = require('../../bible-translations/mappings/ISA/48.json'); break;
      case 49: rawData = require('../../bible-translations/mappings/ISA/49.json'); break;
      case 50: rawData = require('../../bible-translations/mappings/ISA/50.json'); break;
      case 51: rawData = require('../../bible-translations/mappings/ISA/51.json'); break;
      case 52: rawData = require('../../bible-translations/mappings/ISA/52.json'); break;
      case 53: rawData = require('../../bible-translations/mappings/ISA/53.json'); break;
      case 54: rawData = require('../../bible-translations/mappings/ISA/54.json'); break;
      case 55: rawData = require('../../bible-translations/mappings/ISA/55.json'); break;
      case 56: rawData = require('../../bible-translations/mappings/ISA/56.json'); break;
      case 57: rawData = require('../../bible-translations/mappings/ISA/57.json'); break;
      case 58: rawData = require('../../bible-translations/mappings/ISA/58.json'); break;
      case 59: rawData = require('../../bible-translations/mappings/ISA/59.json'); break;
      case 60: rawData = require('../../bible-translations/mappings/ISA/60.json'); break;
      case 61: rawData = require('../../bible-translations/mappings/ISA/61.json'); break;
      case 62: rawData = require('../../bible-translations/mappings/ISA/62.json'); break;
      case 63: rawData = require('../../bible-translations/mappings/ISA/63.json'); break;
      case 64: rawData = require('../../bible-translations/mappings/ISA/64.json'); break;
      case 65: rawData = require('../../bible-translations/mappings/ISA/65.json'); break;
      case 66: rawData = require('../../bible-translations/mappings/ISA/66.json'); break;
    }
  } else   if (book === 'JER') {
    bookName = 'Jeremiah';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/JER/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/JER/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/JER/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/JER/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/JER/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/JER/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/JER/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/JER/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/JER/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/JER/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/JER/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/JER/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/JER/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/JER/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/JER/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/JER/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/JER/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/JER/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/JER/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/JER/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/JER/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/JER/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/JER/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/JER/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/JER/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/JER/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/JER/27.json'); break;
      case 28: rawData = require('../../bible-translations/mappings/JER/28.json'); break;
      case 29: rawData = require('../../bible-translations/mappings/JER/29.json'); break;
      case 30: rawData = require('../../bible-translations/mappings/JER/30.json'); break;
      case 31: rawData = require('../../bible-translations/mappings/JER/31.json'); break;
      case 32: rawData = require('../../bible-translations/mappings/JER/32.json'); break;
      case 33: rawData = require('../../bible-translations/mappings/JER/33.json'); break;
      case 34: rawData = require('../../bible-translations/mappings/JER/34.json'); break;
      case 35: rawData = require('../../bible-translations/mappings/JER/35.json'); break;
      case 36: rawData = require('../../bible-translations/mappings/JER/36.json'); break;
      case 37: rawData = require('../../bible-translations/mappings/JER/37.json'); break;
      case 38: rawData = require('../../bible-translations/mappings/JER/38.json'); break;
      case 39: rawData = require('../../bible-translations/mappings/JER/39.json'); break;
      case 40: rawData = require('../../bible-translations/mappings/JER/40.json'); break;
      case 41: rawData = require('../../bible-translations/mappings/JER/41.json'); break;
      case 42: rawData = require('../../bible-translations/mappings/JER/42.json'); break;
      case 43: rawData = require('../../bible-translations/mappings/JER/43.json'); break;
      case 44: rawData = require('../../bible-translations/mappings/JER/44.json'); break;
      case 45: rawData = require('../../bible-translations/mappings/JER/45.json'); break;
      case 46: rawData = require('../../bible-translations/mappings/JER/46.json'); break;
      case 47: rawData = require('../../bible-translations/mappings/JER/47.json'); break;
      case 48: rawData = require('../../bible-translations/mappings/JER/48.json'); break;
      case 49: rawData = require('../../bible-translations/mappings/JER/49.json'); break;
      case 50: rawData = require('../../bible-translations/mappings/JER/50.json'); break;
      case 51: rawData = require('../../bible-translations/mappings/JER/51.json'); break;
      case 52: rawData = require('../../bible-translations/mappings/JER/52.json'); break;
    }
  } else   if (book === 'LAM') {
    bookName = 'Lamentations';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/LAM/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/LAM/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/LAM/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/LAM/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/LAM/5.json'); break;
    }
  } else   if (book === 'EZK') {
    bookName = 'Ezekiel';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/EZK/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/EZK/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/EZK/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/EZK/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/EZK/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/EZK/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/EZK/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/EZK/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/EZK/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/EZK/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/EZK/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/EZK/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/EZK/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/EZK/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/EZK/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/EZK/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/EZK/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/EZK/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/EZK/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/EZK/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/EZK/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/EZK/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/EZK/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/EZK/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/EZK/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/EZK/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/EZK/27.json'); break;
      case 28: rawData = require('../../bible-translations/mappings/EZK/28.json'); break;
      case 29: rawData = require('../../bible-translations/mappings/EZK/29.json'); break;
      case 30: rawData = require('../../bible-translations/mappings/EZK/30.json'); break;
      case 31: rawData = require('../../bible-translations/mappings/EZK/31.json'); break;
      case 32: rawData = require('../../bible-translations/mappings/EZK/32.json'); break;
      case 33: rawData = require('../../bible-translations/mappings/EZK/33.json'); break;
      case 34: rawData = require('../../bible-translations/mappings/EZK/34.json'); break;
      case 35: rawData = require('../../bible-translations/mappings/EZK/35.json'); break;
      case 36: rawData = require('../../bible-translations/mappings/EZK/36.json'); break;
      case 37: rawData = require('../../bible-translations/mappings/EZK/37.json'); break;
      case 38: rawData = require('../../bible-translations/mappings/EZK/38.json'); break;
      case 39: rawData = require('../../bible-translations/mappings/EZK/39.json'); break;
      case 40: rawData = require('../../bible-translations/mappings/EZK/40.json'); break;
      case 41: rawData = require('../../bible-translations/mappings/EZK/41.json'); break;
      case 42: rawData = require('../../bible-translations/mappings/EZK/42.json'); break;
      case 43: rawData = require('../../bible-translations/mappings/EZK/43.json'); break;
      case 44: rawData = require('../../bible-translations/mappings/EZK/44.json'); break;
      case 45: rawData = require('../../bible-translations/mappings/EZK/45.json'); break;
      case 46: rawData = require('../../bible-translations/mappings/EZK/46.json'); break;
      case 47: rawData = require('../../bible-translations/mappings/EZK/47.json'); break;
      case 48: rawData = require('../../bible-translations/mappings/EZK/48.json'); break;
    }
  } else   if (book === 'DAN') {
    bookName = 'Daniel';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/DAN/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/DAN/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/DAN/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/DAN/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/DAN/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/DAN/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/DAN/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/DAN/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/DAN/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/DAN/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/DAN/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/DAN/12.json'); break;
    }
  } else   if (book === 'HOS') {
    bookName = 'Hosea';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/HOS/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/HOS/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/HOS/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/HOS/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/HOS/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/HOS/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/HOS/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/HOS/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/HOS/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/HOS/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/HOS/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/HOS/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/HOS/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/HOS/14.json'); break;
    }
  } else   if (book === 'JOL') {
    bookName = 'Joel';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/JOL/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/JOL/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/JOL/3.json'); break;
    }
  } else   if (book === 'AMO') {
    bookName = 'Amos';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/AMO/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/AMO/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/AMO/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/AMO/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/AMO/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/AMO/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/AMO/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/AMO/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/AMO/9.json'); break;
    }
  } else   if (book === 'OBA') {
    bookName = 'Obadiah';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/OBA/1.json'); break;
    }
  } else   if (book === 'JON') {
    bookName = 'Jonah';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/JON/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/JON/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/JON/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/JON/4.json'); break;
    }
  } else   if (book === 'MIC') {
    bookName = 'Micah';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/MIC/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/MIC/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/MIC/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/MIC/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/MIC/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/MIC/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/MIC/7.json'); break;
    }
  } else   if (book === 'NAM') {
    bookName = 'Nahum';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/NAM/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/NAM/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/NAM/3.json'); break;
    }
  } else   if (book === 'HAB') {
    bookName = 'Habakkuk';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/HAB/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/HAB/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/HAB/3.json'); break;
    }
  } else   if (book === 'ZEP') {
    bookName = 'Zephaniah';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/ZEP/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/ZEP/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/ZEP/3.json'); break;
    }
  } else   if (book === 'HAG') {
    bookName = 'Haggai';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/HAG/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/HAG/2.json'); break;
    }
  } else   if (book === 'ZEC') {
    bookName = 'Zechariah';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/ZEC/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/ZEC/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/ZEC/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/ZEC/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/ZEC/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/ZEC/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/ZEC/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/ZEC/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/ZEC/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/ZEC/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/ZEC/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/ZEC/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/ZEC/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/ZEC/14.json'); break;
    }
  } else   if (book === 'MAL') {
    bookName = 'Malachi';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/MAL/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/MAL/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/MAL/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/MAL/4.json'); break;
    }
  } else   if (book === 'MAT') {
    bookName = 'Matthew';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/MAT/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/MAT/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/MAT/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/MAT/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/MAT/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/MAT/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/MAT/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/MAT/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/MAT/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/MAT/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/MAT/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/MAT/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/MAT/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/MAT/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/MAT/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/MAT/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/MAT/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/MAT/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/MAT/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/MAT/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/MAT/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/MAT/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/MAT/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/MAT/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/MAT/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/MAT/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/MAT/27.json'); break;
      case 28: rawData = require('../../bible-translations/mappings/MAT/28.json'); break;
    }
  } else   if (book === 'MRK') {
    bookName = 'Mark';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/MRK/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/MRK/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/MRK/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/MRK/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/MRK/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/MRK/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/MRK/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/MRK/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/MRK/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/MRK/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/MRK/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/MRK/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/MRK/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/MRK/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/MRK/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/MRK/16.json'); break;
    }
  } else   if (book === 'LUK') {
    bookName = 'Luke';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/LUK/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/LUK/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/LUK/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/LUK/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/LUK/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/LUK/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/LUK/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/LUK/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/LUK/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/LUK/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/LUK/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/LUK/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/LUK/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/LUK/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/LUK/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/LUK/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/LUK/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/LUK/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/LUK/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/LUK/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/LUK/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/LUK/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/LUK/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/LUK/24.json'); break;
    }
  } else   if (book === 'JHN') {
    bookName = 'John';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/JHN/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/JHN/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/JHN/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/JHN/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/JHN/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/JHN/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/JHN/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/JHN/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/JHN/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/JHN/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/JHN/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/JHN/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/JHN/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/JHN/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/JHN/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/JHN/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/JHN/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/JHN/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/JHN/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/JHN/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/JHN/21.json'); break;
    }
  } else   if (book === 'ACT') {
    bookName = 'Acts';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/ACT/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/ACT/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/ACT/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/ACT/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/ACT/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/ACT/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/ACT/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/ACT/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/ACT/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/ACT/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/ACT/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/ACT/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/ACT/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/ACT/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/ACT/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/ACT/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/ACT/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/ACT/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/ACT/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/ACT/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/ACT/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/ACT/22.json'); break;
      case 23: rawData = require('../../bible-translations/mappings/ACT/23.json'); break;
      case 24: rawData = require('../../bible-translations/mappings/ACT/24.json'); break;
      case 25: rawData = require('../../bible-translations/mappings/ACT/25.json'); break;
      case 26: rawData = require('../../bible-translations/mappings/ACT/26.json'); break;
      case 27: rawData = require('../../bible-translations/mappings/ACT/27.json'); break;
      case 28: rawData = require('../../bible-translations/mappings/ACT/28.json'); break;
    }
  } else   if (book === 'ROM') {
    bookName = 'Romans';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/ROM/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/ROM/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/ROM/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/ROM/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/ROM/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/ROM/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/ROM/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/ROM/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/ROM/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/ROM/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/ROM/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/ROM/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/ROM/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/ROM/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/ROM/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/ROM/16.json'); break;
    }
  } else   if (book === '1CO') {
    bookName = '1 Corinthians';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/1CO/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/1CO/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/1CO/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/1CO/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/1CO/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/1CO/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/1CO/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/1CO/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/1CO/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/1CO/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/1CO/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/1CO/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/1CO/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/1CO/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/1CO/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/1CO/16.json'); break;
    }
  } else   if (book === '2CO') {
    bookName = '2 Corinthians';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/2CO/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/2CO/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/2CO/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/2CO/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/2CO/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/2CO/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/2CO/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/2CO/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/2CO/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/2CO/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/2CO/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/2CO/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/2CO/13.json'); break;
    }
  } else   if (book === 'GAL') {
    bookName = 'Galatians';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/GAL/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/GAL/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/GAL/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/GAL/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/GAL/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/GAL/6.json'); break;
    }
  } else   if (book === 'EPH') {
    bookName = 'Ephesians';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/EPH/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/EPH/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/EPH/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/EPH/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/EPH/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/EPH/6.json'); break;
    }
  } else   if (book === 'PHP') {
    bookName = 'Philippians';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/PHP/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/PHP/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/PHP/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/PHP/4.json'); break;
    }
  } else   if (book === 'COL') {
    bookName = 'Colossians';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/COL/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/COL/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/COL/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/COL/4.json'); break;
    }
  } else   if (book === '1TH') {
    bookName = '1 Thessalonians';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/1TH/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/1TH/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/1TH/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/1TH/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/1TH/5.json'); break;
    }
  } else   if (book === '2TH') {
    bookName = '2 Thessalonians';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/2TH/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/2TH/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/2TH/3.json'); break;
    }
  } else   if (book === '1TI') {
    bookName = '1 Timothy';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/1TI/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/1TI/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/1TI/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/1TI/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/1TI/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/1TI/6.json'); break;
    }
  } else   if (book === '2TI') {
    bookName = '2 Timothy';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/2TI/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/2TI/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/2TI/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/2TI/4.json'); break;
    }
  } else   if (book === 'TIT') {
    bookName = 'Titus';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/TIT/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/TIT/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/TIT/3.json'); break;
    }
  } else   if (book === 'PHM') {
    bookName = 'Philemon';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/PHM/1.json'); break;
    }
  } else   if (book === 'HEB') {
    bookName = 'Hebrews';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/HEB/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/HEB/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/HEB/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/HEB/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/HEB/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/HEB/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/HEB/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/HEB/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/HEB/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/HEB/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/HEB/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/HEB/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/HEB/13.json'); break;
    }
  } else   if (book === 'JAS') {
    bookName = 'James';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/JAS/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/JAS/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/JAS/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/JAS/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/JAS/5.json'); break;
    }
  } else   if (book === '1PE') {
    bookName = '1 Peter';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/1PE/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/1PE/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/1PE/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/1PE/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/1PE/5.json'); break;
    }
  } else   if (book === '2PE') {
    bookName = '2 Peter';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/2PE/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/2PE/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/2PE/3.json'); break;
    }
  } else   if (book === '1JN') {
    bookName = '1 John';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/1JN/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/1JN/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/1JN/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/1JN/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/1JN/5.json'); break;
    }
  } else   if (book === '2JN') {
    bookName = '2 John';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/2JN/1.json'); break;
    }
  } else   if (book === '3JN') {
    bookName = '3 John';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/3JN/1.json'); break;
    }
  } else   if (book === 'JUD') {
    bookName = 'Jude';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/JUD/1.json'); break;
    }
  } else   if (book === 'REV') {
    bookName = 'Revelation';
    switch (chapter) {
      case 1: rawData = require('../../bible-translations/mappings/REV/1.json'); break;
      case 2: rawData = require('../../bible-translations/mappings/REV/2.json'); break;
      case 3: rawData = require('../../bible-translations/mappings/REV/3.json'); break;
      case 4: rawData = require('../../bible-translations/mappings/REV/4.json'); break;
      case 5: rawData = require('../../bible-translations/mappings/REV/5.json'); break;
      case 6: rawData = require('../../bible-translations/mappings/REV/6.json'); break;
      case 7: rawData = require('../../bible-translations/mappings/REV/7.json'); break;
      case 8: rawData = require('../../bible-translations/mappings/REV/8.json'); break;
      case 9: rawData = require('../../bible-translations/mappings/REV/9.json'); break;
      case 10: rawData = require('../../bible-translations/mappings/REV/10.json'); break;
      case 11: rawData = require('../../bible-translations/mappings/REV/11.json'); break;
      case 12: rawData = require('../../bible-translations/mappings/REV/12.json'); break;
      case 13: rawData = require('../../bible-translations/mappings/REV/13.json'); break;
      case 14: rawData = require('../../bible-translations/mappings/REV/14.json'); break;
      case 15: rawData = require('../../bible-translations/mappings/REV/15.json'); break;
      case 16: rawData = require('../../bible-translations/mappings/REV/16.json'); break;
      case 17: rawData = require('../../bible-translations/mappings/REV/17.json'); break;
      case 18: rawData = require('../../bible-translations/mappings/REV/18.json'); break;
      case 19: rawData = require('../../bible-translations/mappings/REV/19.json'); break;
      case 20: rawData = require('../../bible-translations/mappings/REV/20.json'); break;
      case 21: rawData = require('../../bible-translations/mappings/REV/21.json'); break;
      case 22: rawData = require('../../bible-translations/mappings/REV/22.json'); break;
    }
  } else {
    // Unknown book
    return null;
  }

  if (rawData) {
    const transformed = transformMappingData(rawData, bookName, book);
    chapterCache[cacheKey] = transformed;
    return transformed;
  }

  return null;
};

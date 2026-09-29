// "جمع روحاني" (Spiritual Gathering), from the leader's Arabic template, in meeting order.
//
// Section: { key, plan?, ar, en, icon, noteAr, noteEn, groups, links?, lines? }
//   plan:   'always' — in every generated plan; 'alternate' — one of these per plan (picked at
//           random); absent — Resources tab only. Keeps a plan to six parts.
//   groups: [{ key, ar, en, refs?, hymns?, inPlan? }] — "Create plan" picks one item from each
//           group with inPlan !== false. refs are compact references ('MAT 28:18-20'); hymns are
//           { id, ar, en, url }. Group keys are stored in saved plans, so keep them stable.
//   links:  external pages [{ ar, en, url, platform? }]
//   lines:  a text said together, line by line [{ ar, en }]

const WAHA_IOS = 'https://apps.apple.com/us/app/waha-discovery-bible-study/id1530116294';
const WAHA_ANDROID = 'https://play.google.com/store/apps/details?id=com.kingdomstrategies.waha';
const HYMN_PLAYLIST = 'https://youtube.com/playlist?list=PLgMBxAK1mJY3Vxu9Ba6cueh_f2_mR0O-T';

export const GATHERING_SECTIONS = [
  {
    key: 'fellowship',
    plan: 'always',
    ar: 'حياة الشركة',
    en: 'Fellowship',
    icon: 'people-outline',
    noteAr: 'رحّبوا ببعضكم وشاركوا ما يحدث في حياتكم.',
    noteEn: 'Welcome one another and share what is happening in your lives.',
    groups: [
      {
        key: 'fellowship',
        ar: 'مراجع',
        en: 'References',
        refs: [
          'ACT 2:42-47', 'ROM 16', '1CO 16:20', '2CO 13:11-13', 'PHP 4:21-22', 'COL 4:10-18',
          '1TH 5:26', 'TIT 3:15', 'HEB 13:24', '1PE 5:14', '2JN 1:10-11', '3JN 1:15',
        ],
      },
    ],
  },
  {
    key: 'prayer',
    plan: 'always',
    ar: 'صلاة',
    en: 'Prayer',
    icon: 'hand-left-outline',
    noteAr: 'صلّوا من أجل بعضكم ومن أجل احتياجات المجموعة.',
    noteEn: 'Pray for one another and for the needs of the group.',
    groups: [
      {
        key: 'prayer',
        ar: 'مراجع',
        en: 'References',
        refs: [
          'MAT 6:5-34', 'ACT 1:14', 'ACT 2:42', 'ACT 12:5', 'ACT 14:23', 'ROM 12:12', 'ROM 15:30',
          '2CO 1:11', 'EPH 6:18', 'PHP 1:19', 'PHP 4:6', 'COL 4:2', '1TI 2:1', 'PHM 1:22',
          'JAS 5:13-16', '1PE 3:12', '1PE 4:7', 'REV 5:8', 'REV 8:3-4',
        ],
      },
    ],
  },
  {
    key: 'worship',
    plan: 'always',
    ar: 'مزامير وترانيم',
    en: 'Psalms and hymns',
    icon: 'musical-notes-outline',
    noteAr: 'اقرأوا مزمورًا معًا ورنّموا ترنيمة.',
    noteEn: 'Read a psalm together and sing a hymn.',
    groups: [
      { key: 'psalm', ar: 'مزامير', en: 'Psalms', refs: ['PSA 8', 'PSA 24', 'PSA 63', 'PSA 96', 'PSA 103', 'PSA 145'] },
      {
        key: 'hymn',
        ar: 'ترانيم',
        en: 'Hymns',
        hymns: [
          {
            id: 'ahdeek',
            ar: 'أهديك كل المجد والكرامة',
            en: 'I give you all the glory and honor',
            url: 'https://st-takla.org/Lyrics-Spiritual-Songs/01-Coptic-Taraneem-Kalemat_Alef/Ahdeek-Kol-El-Magd-Wal-Karama.html',
          },
          {
            id: 'azim',
            ar: 'أنت عظيم يا الله',
            en: 'You are great, O God',
            url: 'https://st-takla.org/lyrics/ar/songs/ain/3zim.html',
          },
          {
            id: 'ohebak',
            ar: 'أحبك ربي يسوع',
            en: 'I love you, my Lord Jesus',
            url: 'https://st-takla.org/Lyrics-Spiritual-Songs/01-Coptic-Taraneem-Kalemat_Alef/O7ebak-Rabby-Yasoo3.html',
          },
          {
            id: 'sammamt',
            ar: 'صممت أني أتبع يسوعي',
            en: 'I have decided to follow Jesus',
            url: 'https://st-takla.org/Lyrics-Spiritual-Songs/05-Coptic-Taraneem-Kalemat_Sein-Shein-Saad-Daad-Tah-Zah/Sammamto-Enny-Atba3-Yasso3.html',
          },
          {
            id: 'majdan',
            ar: 'مجدًا وعزًّا',
            en: 'Glory and might',
            url: 'https://st-takla.org/lyrics/ar/songs/meem/wa.html',
          },
          {
            id: 'feek',
            ar: 'فيك يا يسوع',
            en: 'In you, O Jesus',
            url: 'https://st-takla.org/lyrics/ar/songs/lam/esm.html',
          },
        ],
      },
      { key: 'worshipRefs', ar: 'مراجع', en: 'References', refs: ['EPH 5:19', 'COL 3:16'], inPlan: false },
    ],
    links: [{ ar: 'قائمة الترانيم على يوتيوب', en: 'Hymn playlist on YouTube', url: HYMN_PLAYLIST }],
  },
  {
    key: 'word',
    plan: 'always',
    ar: 'كلمة الله',
    en: 'The Word of God',
    icon: 'book-outline',
    noteAr: 'ادرسوا قصة من الكتاب المقدس معًا باستخدام تطبيق واحة.',
    noteEn: 'Study a Bible story together using the Waha app.',
    groups: [
      {
        key: 'word',
        ar: 'مراجع',
        en: 'References',
        refs: [
          '1TI 4:13', '1CO 14:26', 'HEB 13:22', 'LUK 4:20', 'ACT 2:42', 'ACT 5:42', 'ACT 13:13-52',
          'LUK 3:18', 'ROM 12:8', '2TI 4:1-5',
        ],
      },
    ],
    links: [
      { ar: 'حمّل تطبيق واحة', en: 'Download Waha', url: WAHA_IOS, platform: 'ios' },
      { ar: 'حمّل تطبيق واحة', en: 'Download Waha', url: WAHA_ANDROID, platform: 'android' },
    ],
  },
  {
    key: 'confession',
    plan: 'alternate',
    ar: 'اعتراف',
    en: 'Confession',
    icon: 'water-outline',
    noteAr: 'خذوا وقتًا للاعتراف بخطاياكم أمام الله.',
    noteEn: 'Take time to confess your sins before God.',
    groups: [{ key: 'confession', ar: 'مقاطع', en: 'Passages', refs: ['1JN 1:5-10', 'JAS 5:16', 'PSA 51', 'PRO 28:13'] }],
  },
  {
    key: 'supper',
    plan: 'alternate',
    ar: 'العشاء الرباني',
    en: "The Lord's Supper",
    icon: 'wine-outline',
    noteAr: 'اقرأوا المقطع ثم تناولوا الخبز والكأس معًا.',
    noteEn: 'Read the passage, then share the bread and the cup together.',
    groups: [
      { key: 'supper', ar: 'مقاطع', en: 'Passages', refs: ['1CO 11:23-26', 'MRK 14:22-25', 'MAT 26:26-29', 'LUK 22:14-20'] },
    ],
  },
  {
    key: 'commission',
    ar: 'الإرسالية العظمى',
    en: 'The Great Commission',
    icon: 'send-outline',
    noteAr: 'اقرأوا المقطع وفكّروا: مع مَن سأشارك هذا الأسبوع؟',
    noteEn: 'Read the passage and ask: who will I share with this week?',
    groups: [
      { key: 'commission', ar: 'مقاطع', en: 'Passages', refs: ['MAT 28:18-20', 'MRK 16:15', 'JHN 20:21', 'LUK 24:46-49', 'ACT 1:8'] },
    ],
  },
  {
    key: 'blessing',
    plan: 'always',
    ar: 'البركة الختامية',
    en: 'Closing blessing',
    icon: 'sunny-outline',
    noteAr: 'باركوا بعضكم بهذه الكلمات.',
    noteEn: 'Bless one another with these words.',
    groups: [
      {
        key: 'blessing',
        ar: 'مقاطع',
        en: 'Passages',
        refs: ['NUM 6:24-26', '2CO 13:14', 'HEB 13:20-21', 'JUD 1:24-25', 'EPH 3:20-21', '1TH 5:23-24'],
      },
    ],
  },
  {
    key: 'lordsPrayer',
    ar: 'الصلاة الربانية',
    en: "The Lord's Prayer",
    icon: 'heart-outline',
    noteAr: 'صلّوها معًا.',
    noteEn: 'Pray it together.',
    groups: [{ key: 'lordsPrayerRef', ar: 'مرجع', en: 'Reference', refs: ['MAT 6:9-13'], inPlan: false }],
    lines: [
      { ar: 'أَبَانَا الَّذِي فِي السَّمَاوَاتِ،', en: 'Our Father in heaven,' },
      { ar: 'لِيَتَقَدَّسِ ٱسْمُكَ.', en: 'hallowed be your name.' },
      { ar: 'لِيَأْتِ مَلَكُوتُكَ.', en: 'Your kingdom come.' },
      { ar: 'لِتَكُنْ مَشِيئَتُكَ،', en: 'Your will be done,' },
      { ar: 'كَمَا فِي ٱلسَّمَاءِ، كَذَلِكَ عَلَى ٱلْأَرْضِ.', en: 'on earth as it is in heaven.' },
      { ar: 'أَعْطِنَا ٱلْيَوْمَ خُبْزَنَا كَفَافَنَا،', en: 'Give us today our daily bread,' },
      { ar: 'وَٱغْفِرْ لَنَا ذُنُوبَنَا،', en: 'and forgive us our sins,' },
      { ar: 'كَمَا نَغْفِرُ نَحْنُ أَيْضًا لِلَّذِينَ أَذْنَبُوا إِلَيْنَا.', en: 'as we also forgive those who sin against us.' },
      { ar: 'وَلَا تُدْخِلْنَا فِي تَجْرِبَةٍ،', en: 'And lead us not into temptation,' },
      { ar: 'لَكِنْ نَجِّنَا مِنَ ٱلشِّرِّيرِ.', en: 'but deliver us from the evil one.' },
      { ar: 'لأن لك الملك، والقوة، والمجد، إلى الأبد.', en: 'For yours is the kingdom, and the power, and the glory, forever.' },
      { ar: 'آمين', en: 'Amen' },
    ],
  },
  {
    key: 'creed',
    ar: 'نشيد الرسل',
    en: "The Apostles' Creed",
    icon: 'shield-checkmark-outline',
    noteAr: 'أعلنوا إيمانكم معًا.',
    noteEn: 'Declare your faith together.',
    groups: [],
    lines: [
      { ar: 'أؤمن بالله الآب، القدير خالق السماء والأرض', en: 'I believe in God, the Father almighty, creator of heaven and earth.' },
      { ar: 'أؤمن بيسوع المسيح، ابنه الوحيد، ربنا', en: 'I believe in Jesus Christ, his only Son, our Lord,' },
      { ar: 'الذي حُبل به بالروح القدس', en: 'who was conceived by the Holy Spirit,' },
      { ar: 'ووُلد من مريم العذراء', en: 'born of the Virgin Mary,' },
      { ar: 'وتألم في عهد بيلاطس البنطي، صُلب،', en: 'suffered under Pontius Pilate, was crucified,' },
      { ar: 'ومات، ودُفن', en: 'died, and was buried;' },
      { ar: 'ونزل إلى الهاوية', en: 'he descended to the dead.' },
      { ar: 'وفي اليوم الثالث قام من الأموات', en: 'On the third day he rose again;' },
      { ar: 'وصعد إلى السماء', en: 'he ascended into heaven,' },
      { ar: 'وجلس عن يمين الله الآب، القدير', en: 'he is seated at the right hand of the Father almighty,' },
      { ar: 'ومن ثم يأتي ليدين الأحياء والأموات', en: 'and he will come to judge the living and the dead.' },
      { ar: 'وأؤمن بالروح القدس', en: 'I believe in the Holy Spirit,' },
      { ar: 'والكنيسة الجامعة المقدسة', en: 'the holy catholic Church,' },
      { ar: 'وشركة القديسين', en: 'the communion of saints,' },
      { ar: 'وغفران الخطايا', en: 'the forgiveness of sins,' },
      { ar: 'وقيامة الأجساد', en: 'the resurrection of the body.' },
    ],
  },
];

export const ALTERNATE_SLOT = 'alternate';
const inPlan = (section) => Boolean(section.plan);

// One slot per group that "Create plan" draws from: { key, items: [{ id }] }, plus one slot
// choosing which 'alternate' section (confession or the Lord's Supper) this plan includes.
export const PLAN_SLOTS = [
  ...GATHERING_SECTIONS.filter(inPlan).flatMap((section) =>
    section.groups
      .filter((group) => group.inPlan !== false)
      .map((group) => ({
        key: group.key,
        items: [
          ...(group.refs ?? []).map((ref) => ({ id: ref, ref })),
          ...(group.hymns ?? []).map((hymn) => ({ id: hymn.id, hymn })),
        ],
      }))
  ),
  {
    key: ALTERNATE_SLOT,
    items: GATHERING_SECTIONS.filter((section) => section.plan === 'alternate').map((section) => ({ id: section.key })),
  },
];

/** The sections a plan shows, in meeting order, given its picks (group key → item). */
export const getPlanSections = (picks) =>
  GATHERING_SECTIONS.filter(
    (section) => section.plan === 'always' || (section.plan === 'alternate' && picks?.[ALTERNATE_SLOT]?.id === section.key)
  );

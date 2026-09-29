import fs from 'fs';
import path from 'path';
import { parseScriptureRef, formatScriptureRef, formatScriptureRefArabic, toArabicDigits } from './scriptureRef';
import { createPlan, pickItemId, rerollSlot, resolvePlan } from './planGenerator';
import { GATHERING_SECTIONS, PLAN_SLOTS, ALTERNATE_SLOT, getPlanSections } from '../../data/gathering/gathering';
import { BOOKS } from '../../data/bibleData';

const sequenceRng = (values) => {
  let i = 0;
  return () => values[i++ % values.length];
};

const SLOTS = [
  { key: 'a', items: [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }] },
  { key: 'b', items: [{ id: 'b1' }] },
];

describe('parseScriptureRef', () => {
  it('parses a verse range', () => {
    expect(parseScriptureRef('JHN 4:1-26')).toEqual({ book: 'JHN', chapter: 4, verse: 1, endVerse: 26 });
  });

  it('parses a single verse and a whole chapter', () => {
    expect(parseScriptureRef('1JN 1:9')).toEqual({ book: '1JN', chapter: 1, verse: 9, endVerse: 9 });
    expect(parseScriptureRef('PSA 23')).toEqual({ book: 'PSA', chapter: 23, verse: null, endVerse: null });
  });

  it('rejects malformed or backwards references', () => {
    expect(parseScriptureRef('John 3:16')).toBeNull();
    expect(parseScriptureRef('JHN 3:16-10')).toBeNull();
    expect(parseScriptureRef('JHN 0:1')).toBeNull();
    expect(parseScriptureRef(null)).toBeNull();
  });
});

describe('formatScriptureRef', () => {
  it('formats ranges, single verses and chapters', () => {
    expect(formatScriptureRef(parseScriptureRef('JHN 4:1-26'))).toBe('John 4:1-26');
    expect(formatScriptureRef(parseScriptureRef('1JN 1:9'))).toBe('1 John 1:9');
    expect(formatScriptureRef(parseScriptureRef('PSA 23'))).toBe('Psalms 23');
  });
});

describe('formatScriptureRefArabic', () => {
  it('uses Arabic book names and digits', () => {
    expect(toArabicDigits('28:18-20')).toBe('٢٨:١٨-٢٠');
    expect(formatScriptureRefArabic(parseScriptureRef('MAT 28:18-20'))).toBe('متى ٢٨:١٨-٢٠');
    expect(formatScriptureRefArabic(parseScriptureRef('1JN 1:9'))).toBe('يوحنا الأولى ١:٩');
  });

  it('names a single psalm', () => {
    expect(formatScriptureRefArabic(parseScriptureRef('PSA 23'))).toBe('المزمور ٢٣');
  });
});

describe('plan generator', () => {
  it('picks one item per slot', () => {
    const plan = createPlan(SLOTS, sequenceRng([0.5, 0]), null, new Date('2026-09-28T00:00:00Z'));
    expect(plan).toEqual({ createdAt: '2026-09-28T00:00:00.000Z', picks: { a: 'a2', b: 'b1' } });
  });

  it('avoids repeating the previous pick when the pool has alternatives', () => {
    for (let i = 0; i < 20; i += 1) {
      expect(pickItemId(SLOTS[0], () => i / 20, 'a2')).not.toBe('a2');
    }
    expect(pickItemId(SLOTS[1], () => 0.9, 'b1')).toBe('b1');
  });

  it('never indexes past the end of the pool', () => {
    expect(pickItemId(SLOTS[0], () => 0.9999999)).toBe('a3');
  });

  it('rerolls a single slot without touching the rest or the original', () => {
    const plan = { createdAt: 'x', picks: { a: 'a1', b: 'b1' } };
    const next = rerollSlot(plan, SLOTS, 'a', () => 0);
    expect(next.picks).toEqual({ a: 'a2', b: 'b1' });
    expect(plan.picks.a).toBe('a1');
    expect(rerollSlot(plan, SLOTS, 'missing')).toBe(plan);
  });

  it('resolves a plan and rejects stale ones', () => {
    expect(resolvePlan({ picks: { a: 'a3', b: 'b1' } }, SLOTS).map((e) => e.item.id)).toEqual(['a3', 'b1']);
    expect(resolvePlan({ picks: { a: 'gone', b: 'b1' } }, SLOTS)).toBeNull();
    expect(resolvePlan(null, SLOTS)).toBeNull();
  });
});

// Every scripture link in the Gathering content must open a verse that exists.
describe('gathering content', () => {
  const UNIFIED_DIR = path.join(__dirname, '../../../bible-translations/unified');
  const bookIds = new Set(BOOKS.map((b) => b.id));
  const allRefs = GATHERING_SECTIONS.flatMap((section) => section.groups.flatMap((group) => group.refs ?? []));

  it('plans one pick per section part, with unique slot keys', () => {
    const keys = PLAN_SLOTS.map((slot) => slot.key);
    expect(keys).toEqual(['fellowship', 'prayer', 'psalm', 'hymn', 'word', 'confession', 'supper', 'blessing', 'alternate']);
    expect(PLAN_SLOTS.every((slot) => slot.items.length > 0)).toBe(true);
  });

  it('makes a six-part plan: five fixed parts plus confession or the Lord\'s Supper', () => {
    for (const alternate of ['confession', 'supper']) {
      const keys = getPlanSections({ [ALTERNATE_SLOT]: { id: alternate } }).map((section) => section.key);
      expect(keys).toEqual(['fellowship', 'prayer', 'worship', 'word', alternate, 'blessing']);
    }
  });

  it('has Arabic and English for every title, note and line', () => {
    for (const section of GATHERING_SECTIONS) {
      expect(section.ar && section.en && section.noteAr && section.noteEn).toBeTruthy();
      for (const line of section.lines ?? []) expect(line.ar && line.en).toBeTruthy();
    }
  });

  it('has unique item ids within each slot', () => {
    for (const slot of PLAN_SLOTS) {
      const ids = slot.items.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it.each(allRefs)('%s points at real verses', (ref) => {
    const parsed = parseScriptureRef(ref);
    expect(parsed).not.toBeNull();
    expect(bookIds.has(parsed.book)).toBe(true);
    const chapterFile = path.join(UNIFIED_DIR, parsed.book, `${parsed.chapter}.json`);
    const verses = JSON.parse(fs.readFileSync(chapterFile, 'utf8'));
    if (parsed.verse) {
      expect(verses[String(parsed.verse)]).toBeDefined();
      expect(verses[String(parsed.endVerse)]).toBeDefined();
    }
  });
});

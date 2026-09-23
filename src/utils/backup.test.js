import {
  BACKUP_APP_ID,
  BACKUP_FORMAT_VERSION,
  LAST_BACKUP_KEY,
  backupFileName,
  buildBackupPayload,
  parseBackup,
} from './backup';

const NOW = new Date(2026, 8, 3, 12, 0);

const validPayload = (data) =>
  JSON.stringify({ app: BACKUP_APP_ID, formatVersion: BACKUP_FORMAT_VERSION, exportedAt: NOW.toISOString(), data });

describe('buildBackupPayload', () => {
  it('keeps only app keys with string values and skips device-only keys', () => {
    const payload = buildBackupPayload(
      [
        ['@learnarabic_flashcards', '[]'],
        ['@learnarabic_bookmarks', null],
        [LAST_BACKUP_KEY, NOW.toISOString()],
        ['@other_app_key', 'x'],
      ],
      NOW
    );
    expect(payload.app).toBe(BACKUP_APP_ID);
    expect(payload.formatVersion).toBe(BACKUP_FORMAT_VERSION);
    expect(payload.exportedAt).toBe(NOW.toISOString());
    expect(payload.data).toEqual({ '@learnarabic_flashcards': '[]' });
  });
});

describe('backupFileName', () => {
  it('includes the zero-padded date', () => {
    expect(backupFileName(NOW)).toBe('kingdom-arabic-backup-2026-09-03.json');
  });
});

describe('parseBackup', () => {
  it('round-trips an exported payload with a summary', () => {
    const data = {
      '@learnarabic_flashcards': JSON.stringify([{ id: 'a' }, { id: 'b' }]),
      '@learnarabic_memory_verses': JSON.stringify([{ id: 'JHN-3-16' }]),
      '@learnarabic_reading_progress': JSON.stringify({ 'JHN:1': 'x', 'JHN:2': 'y' }),
    };
    const result = parseBackup(JSON.stringify(buildBackupPayload(Object.entries(data), NOW)));
    expect(result.ok).toBe(true);
    expect(result.entries).toHaveLength(3);
    expect(result.summary).toEqual({ flashcards: 2, memoryVerses: 1, bookmarks: 0, chaptersRead: 2 });
  });

  it.each([
    ['', 'empty'],
    ['not json', 'not JSON'],
    [JSON.stringify({ app: 'other', formatVersion: 1, data: {} }), 'not a Kingdom Arabic backup'],
    [JSON.stringify({ app: BACKUP_APP_ID, formatVersion: 99, data: {} }), 'newer version'],
    [JSON.stringify({ app: BACKUP_APP_ID, formatVersion: 1, data: [] }), 'missing its data'],
    [validPayload({ '@other': 'x' }), 'does not contain any study data'],
  ])('rejects invalid input %#', (text, message) => {
    const result = parseBackup(text);
    expect(result.ok).toBe(false);
    expect(result.error).toContain(message);
  });

  it('drops foreign keys and non-string values but keeps valid ones', () => {
    const result = parseBackup(validPayload({ '@learnarabic_bookmarks': '[]', '@evil': 'x', '@learnarabic_x': 5 }));
    expect(result.ok).toBe(true);
    expect(result.entries).toEqual([['@learnarabic_bookmarks', '[]']]);
  });

  it('tolerates corrupt inner JSON when summarizing', () => {
    const result = parseBackup(validPayload({ '@learnarabic_flashcards': '{broken' }));
    expect(result.ok).toBe(true);
    expect(result.summary.flashcards).toBe(0);
  });
});

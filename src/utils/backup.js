// Pure helpers for exporting and restoring all app data as a JSON file.
// Everything the app stores lives in AsyncStorage under the `@learnarabic_` prefix.

export const STORAGE_PREFIX = '@learnarabic_';
export const BACKUP_APP_ID = 'kingdom-arabic';
export const BACKUP_FORMAT_VERSION = 1;
export const LAST_BACKUP_KEY = '@learnarabic_last_backup_at';

// Keys that describe this device rather than the user's study data.
const EXCLUDED_KEYS = new Set([LAST_BACKUP_KEY]);

const MAX_BACKUP_KEYS = 500;
export const MAX_BACKUP_BYTES = 50 * 1024 * 1024;

export const isBackupKey = (key) =>
  typeof key === 'string' && key.startsWith(STORAGE_PREFIX) && !EXCLUDED_KEYS.has(key);

/** entries: [key, value][] as returned by AsyncStorage.multiGet. */
export function buildBackupPayload(entries, now = new Date()) {
  const data = Object.fromEntries(
    entries.filter(([key, value]) => isBackupKey(key) && typeof value === 'string')
  );
  return {
    app: BACKUP_APP_ID,
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: now.toISOString(),
    data,
  };
}

export function backupFileName(now = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return `kingdom-arabic-backup-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

const fail = (error) => ({ ok: false, error });

/**
 * Validate a backup file's text. Returns { ok: true, entries, exportedAt, summary }
 * or { ok: false, error } with a message suitable for showing to the user.
 */
export function parseBackup(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    return fail('The file is empty.');
  }
  if (text.length > MAX_BACKUP_BYTES) {
    return fail('The file is too large to be a Kingdom Arabic backup.');
  }

  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    return fail('The file is not a valid backup (it is not JSON).');
  }

  if (!payload || typeof payload !== 'object' || payload.app !== BACKUP_APP_ID) {
    return fail('This file is not a Kingdom Arabic backup.');
  }
  if (typeof payload.formatVersion !== 'number' || payload.formatVersion > BACKUP_FORMAT_VERSION) {
    return fail('This backup was made by a newer version of the app. Please update the app first.');
  }
  if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
    return fail('The backup is missing its data.');
  }

  const entries = Object.entries(payload.data).filter(
    ([key, value]) => isBackupKey(key) && typeof value === 'string'
  );
  if (entries.length === 0) {
    return fail('The backup does not contain any study data.');
  }
  if (entries.length > MAX_BACKUP_KEYS) {
    return fail('The backup contains too many entries.');
  }

  return {
    ok: true,
    entries,
    exportedAt: typeof payload.exportedAt === 'string' ? payload.exportedAt : null,
    summary: summarizeBackup(Object.fromEntries(entries)),
  };
}

const countJsonArray = (raw) => {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.length : 0;
  } catch {
    return 0;
  }
};

const countJsonKeys = (raw) => {
  try {
    const value = JSON.parse(raw);
    return value && typeof value === 'object' ? Object.keys(value).length : 0;
  } catch {
    return 0;
  }
};

/** Human-facing counts shown before restoring. */
export function summarizeBackup(data) {
  return {
    flashcards: data['@learnarabic_flashcards'] ? countJsonArray(data['@learnarabic_flashcards']) : 0,
    memoryVerses: data['@learnarabic_memory_verses'] ? countJsonArray(data['@learnarabic_memory_verses']) : 0,
    bookmarks: data['@learnarabic_bookmarks'] ? countJsonArray(data['@learnarabic_bookmarks']) : 0,
    chaptersRead: data['@learnarabic_reading_progress'] ? countJsonKeys(data['@learnarabic_reading_progress']) : 0,
  };
}

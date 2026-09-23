import React, { useEffect, useState } from 'react';
import { PreparingBible } from '../components/PreparingBible';
import { SQLiteProvider, useSQLiteContext, deleteDatabaseAsync, defaultDatabaseDirectory } from 'expo-sqlite';
import { Asset } from 'expo-asset';
import { Directory, File, FileMode, Paths } from 'expo-file-system';
import { BIBLE_DB_BYTES, BIBLE_DB_VERSION } from '../data/bibleDbVersion';
import { unpackBibleDb } from '../utils/bibleDbInstall';
import { BIBLE_DB_ASSET } from '../data/bibleDbAsset';

// The file name carries the content hash, so an app update with new Bible data
// unpacks a fresh copy instead of reusing the old one.
const DB_PREFIX = 'bible-';
export const BIBLE_DB_NAME = `${DB_PREFIX}${BIBLE_DB_VERSION}.db`;
const PARTIAL_SUFFIX = '.partial';

// Remove copies left behind by earlier app versions, and any interrupted unpack.
async function deleteOutdatedBibleDbs(directory) {
  try {
    const names = directory.list().map((entry) => entry.name);
    const outdated = names.filter(
      (name) => name.startsWith(DB_PREFIX) && name.endsWith('.db') && name !== BIBLE_DB_NAME
    );
    await Promise.all(outdated.map((name) => deleteDatabaseAsync(name)));
    names
      .filter((name) => name.startsWith(DB_PREFIX) && name.endsWith(PARTIAL_SUFFIX))
      .forEach((name) => new File(directory, name).delete());
  } catch (error) {
    console.warn('Could not remove outdated Bible databases:', error);
  }
}

// Android copies bundled assets into the cache before they can be read; that
// copy is no longer needed once the database is installed. On iOS the archive
// is read in place from the app bundle, which is left alone.
function deleteCachedArchive(localUri) {
  try {
    const cached = new File(localUri);
    if (localUri.startsWith(Paths.cache.uri) && cached.exists) cached.delete();
  } catch (error) {
    console.warn('Could not remove cached Bible archive:', error);
  }
}

// expo-sqlite reports a plain path; expo-file-system wants a file:// URI.
const toFileUri = (path) => (path.startsWith('file://') ? path : `file://${path}`);

async function unpackArchive(archiveFile, partial) {
  const archive = await archiveFile.bytes();
  partial.create();
  const handle = partial.open(FileMode.WriteOnly);
  try {
    await unpackBibleDb(archive, { write: (bytes) => handle.writeBytes(bytes), close: () => handle.close() }, {
      expectedBytes: BIBLE_DB_BYTES,
    });
  } catch (error) {
    partial.delete();
    throw error;
  }
}

async function ensureBibleDb() {
  const directory = new Directory(toFileUri(defaultDatabaseDirectory));
  if (!directory.exists) directory.create({ intermediates: true });
  await deleteOutdatedBibleDbs(directory);

  const target = new File(directory, BIBLE_DB_NAME);
  if (target.exists && target.size === BIBLE_DB_BYTES) return;

  const asset = await Asset.fromModule(BIBLE_DB_ASSET.module).downloadAsync();
  if (!asset.localUri) throw new Error('Bible database is missing from the app bundle');

  // Write beside the target and rename at the end, so an interrupted install
  // never leaves a truncated database under the real name.
  const partial = new File(directory, BIBLE_DB_NAME + PARTIAL_SUFFIX);
  if (partial.exists) partial.delete();
  if (BIBLE_DB_ASSET.compressed) {
    await unpackArchive(new File(asset.localUri), partial);
  } else {
    // Android: the asset was already copied out of the APK natively; just verify and take it.
    const copied = new File(asset.localUri);
    if (copied.size !== BIBLE_DB_BYTES) {
      throw new Error(`Bible database is ${copied.size} bytes, expected ${BIBLE_DB_BYTES}`);
    }
    // Copy rather than move: Android counts a file toward "cache" based on where it
    // was created, and the Bible must not show up as clearable cache.
    await copied.copy(partial);
  }
  // deleteDatabaseAsync also drops the -wal/-shm files, which must not outlive the old copy.
  if (target.exists) await deleteDatabaseAsync(BIBLE_DB_NAME);
  await partial.move(target);
  deleteCachedArchive(asset.localUri);
}

// Only show the "preparing" screen if installing takes noticeably long (first launch).
const PREPARING_DELAY_MS = 400;

export function BibleDbProvider({ children, onError }) {
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (ready) return undefined;
    const timer = setTimeout(() => setSlow(true), PREPARING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    let cancelled = false;
    ensureBibleDb()
      .then(() => !cancelled && setReady(true))
      .catch((error) => !cancelled && onError?.(error));
    return () => {
      cancelled = true;
    };
  }, [onError]);

  if (!ready) return slow ? <PreparingBible /> : null;

  return (
    <SQLiteProvider databaseName={BIBLE_DB_NAME} options={{ enableChangeListener: false }} onError={onError}>
      {children}
    </SQLiteProvider>
  );
}

export const useBibleDb = useSQLiteContext;

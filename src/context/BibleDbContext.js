import React, { useCallback } from 'react';
import { SQLiteProvider, useSQLiteContext, deleteDatabaseAsync, defaultDatabaseDirectory } from 'expo-sqlite';
import { Directory } from 'expo-file-system';
import { BIBLE_DB_VERSION } from '../data/bibleDbVersion';

// The file name carries the content hash, so an app update with new Bible data
// imports a fresh copy instead of reusing the old one.
const DB_PREFIX = 'bible-';
export const BIBLE_DB_NAME = `${DB_PREFIX}${BIBLE_DB_VERSION}.db`;
const BIBLE_DB_ASSET = require('../../assets/bible/bible.db');

// Remove copies left behind by earlier app versions.
async function deleteOutdatedBibleDbs() {
  try {
    const directory = new Directory(defaultDatabaseDirectory);
    if (!directory.exists) return;
    const outdated = directory
      .list()
      .map((entry) => entry.name)
      .filter((name) => name.startsWith(DB_PREFIX) && name.endsWith('.db') && name !== BIBLE_DB_NAME);
    await Promise.all(outdated.map((name) => deleteDatabaseAsync(name)));
  } catch (error) {
    console.warn('Could not remove outdated Bible databases:', error);
  }
}

export function BibleDbProvider({ children, onError }) {
  const handleInit = useCallback(async () => {
    await deleteOutdatedBibleDbs();
  }, []);

  return (
    <SQLiteProvider
      databaseName={BIBLE_DB_NAME}
      assetSource={{ assetId: BIBLE_DB_ASSET }}
      options={{ enableChangeListener: false }}
      onInit={handleInit}
      onError={onError}
    >
      {children}
    </SQLiteProvider>
  );
}

export const useBibleDb = useSQLiteContext;

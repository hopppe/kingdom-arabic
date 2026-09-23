import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { useAppData } from '../../context/AppDataContext';
import {
  LAST_BACKUP_KEY,
  MAX_BACKUP_BYTES,
  backupFileName,
  buildBackupPayload,
  isBackupKey,
  parseBackup,
} from '../../utils/backup';

/**
 * Export all study data to a JSON file (shared via the OS share sheet, so it can go
 * to Files/iCloud Drive, Google Drive, email, etc.) and restore it again.
 */
export function useBackup() {
  const { reloadAllData } = useAppData();
  const [lastBackupAt, setLastBackupAt] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LAST_BACKUP_KEY)
      .then(setLastBackupAt)
      .catch((error) => console.error('Failed to read last backup time:', error));
  }, []);

  /** Returns { ok } or { ok: false, error }. */
  const exportBackup = useCallback(async () => {
    setBusy(true);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        return { ok: false, error: 'Sharing is not available on this device.' };
      }
      const keys = (await AsyncStorage.getAllKeys()).filter(isBackupKey);
      const entries = await AsyncStorage.multiGet(keys);
      const now = new Date();
      const payload = buildBackupPayload(entries, now);

      const file = new File(Paths.cache, backupFileName(now));
      if (file.exists) file.delete();
      file.create();
      file.write(JSON.stringify(payload));

      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        UTI: 'public.json',
        dialogTitle: 'Save your Kingdom Arabic backup',
      });

      const stamp = now.toISOString();
      await AsyncStorage.setItem(LAST_BACKUP_KEY, stamp);
      setLastBackupAt(stamp);
      return { ok: true };
    } catch (error) {
      console.error('Backup export failed:', error);
      return { ok: false, error: 'Could not create the backup file. Please try again.' };
    } finally {
      setBusy(false);
    }
  }, []);

  /** Lets the user pick a file. Returns { ok, canceled } or a parsed backup to confirm. */
  const pickBackup = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'public.json', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.length) {
        return { ok: false, canceled: true };
      }
      const asset = result.assets[0];
      if (asset.size && asset.size > MAX_BACKUP_BYTES) {
        return { ok: false, error: 'The file is too large to be a Kingdom Arabic backup.' };
      }
      const text = await new File(asset.uri).text();
      return parseBackup(text);
    } catch (error) {
      console.error('Reading backup failed:', error);
      return { ok: false, error: 'Could not read that file.' };
    }
  }, []);

  /** Replace all study data with a parsed backup's entries, then reload every screen. */
  const restoreBackup = useCallback(
    async (entries) => {
      setBusy(true);
      let snapshot = null;
      try {
        const existingKeys = (await AsyncStorage.getAllKeys()).filter(isBackupKey);
        snapshot = (await AsyncStorage.multiGet(existingKeys)).filter(([, value]) => value !== null);
        await AsyncStorage.multiRemove(existingKeys);
        await AsyncStorage.multiSet(entries);
        reloadAllData();
        return { ok: true };
      } catch (error) {
        console.error('Backup restore failed:', error);
        if (snapshot) {
          // Put the previous data back so a failed restore doesn't lose anything.
          await AsyncStorage.multiRemove(entries.map(([key]) => key)).catch(() => {});
          await AsyncStorage.multiSet(snapshot).catch((rollbackError) =>
            console.error('Rolling back failed restore also failed:', rollbackError)
          );
          reloadAllData();
        }
        return { ok: false, error: 'Restoring failed, so your existing data was kept. Please try again.' };
      } finally {
        setBusy(false);
      }
    },
    [reloadAllData]
  );

  return { lastBackupAt, busy, exportBackup, pickBackup, restoreBackup };
}

import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useBackup } from './useBackup';

const formatDate = (iso) => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
};

const describeSummary = ({ flashcards, memoryVerses, bookmarks, chaptersRead }) =>
  [
    `${flashcards} flashcard${flashcards === 1 ? '' : 's'}`,
    `${memoryVerses} memory verse${memoryVerses === 1 ? '' : 's'}`,
    `${bookmarks} bookmark${bookmarks === 1 ? '' : 's'}`,
    `${chaptersRead} chapter${chaptersRead === 1 ? '' : 's'} read`,
  ].join(', ');

export default function BackupSection() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { lastBackupAt, busy, exportBackup, pickBackup, restoreBackup } = useBackup();

  const handleExport = useCallback(async () => {
    const result = await exportBackup();
    if (!result.ok) Alert.alert('Backup failed', result.error);
  }, [exportBackup]);

  const handleRestore = useCallback(async () => {
    const picked = await pickBackup();
    if (picked.canceled) return;
    if (!picked.ok) {
      Alert.alert('Cannot restore', picked.error);
      return;
    }
    const from = formatDate(picked.exportedAt);
    Alert.alert(
      'Replace your data?',
      `This backup${from ? ` from ${from}` : ''} has ${describeSummary(picked.summary)}.\n\n` +
        'Restoring replaces everything currently in the app on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            const result = await restoreBackup(picked.entries);
            Alert.alert(result.ok ? 'Restored' : 'Restore failed', result.ok ? 'Your data has been restored.' : result.error);
          },
        },
      ]
    );
  }, [pickBackup, restoreBackup]);

  const lastBackupText = formatDate(lastBackupAt);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your data</Text>
      <Text style={styles.body}>
        Everything is stored only on this device. Save a backup file to Files, iCloud Drive, Google Drive or email so
        you can restore your flashcards, memory verses and progress on a new phone.
      </Text>
      <Text style={styles.meta}>{lastBackupText ? `Last backup: ${lastBackupText}` : 'No backup yet'}</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={handleExport} disabled={busy} accessibilityRole="button">
        {busy ? (
          <ActivityIndicator color={theme.colors.textOnPrimary} />
        ) : (
          <>
            <Ionicons name="share-outline" size={18} color={theme.colors.textOnPrimary} />
            <Text style={styles.primaryButtonText}>Back up data</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleRestore} disabled={busy} accessibilityRole="button">
        <Ionicons name="download-outline" size={18} color={theme.colors.text} />
        <Text style={styles.secondaryButtonText}>Restore from backup</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    title: { fontSize: 17, fontWeight: '600', color: theme.colors.text, marginBottom: 6 },
    body: { fontSize: 14, lineHeight: 20, color: theme.colors.textSecondary },
    meta: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 8, marginBottom: 12 },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: 12,
      minHeight: 44,
    },
    primaryButtonText: { color: theme.colors.textOnPrimary, fontSize: 16, fontWeight: '600' },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 12,
      marginTop: 10,
      minHeight: 44,
    },
    secondaryButtonText: { color: theme.colors.text, fontSize: 16, fontWeight: '500' },
  });

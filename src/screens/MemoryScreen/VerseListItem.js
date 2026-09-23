import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { formatReference } from '../../data/bibleData';
import { STEP_LABELS, STEP_ORDER } from '../../utils/memory/steps';
import { STATUS } from '../../utils/memory/scheduler';

const formatDueDate = (dueAt) => {
  if (!dueAt) return 'Not yet scheduled';
  const due = new Date(dueAt);
  const today = new Date();
  const diffDays = Math.round((due.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86400000);
  if (diffDays <= 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  return `Due in ${diffDays} days`;
};

export function VerseListItem({ verse, onPress, onLongPress }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const subtitle =
    verse.status === STATUS.LEARNING
      ? `Step ${STEP_ORDER.indexOf(verse.currentStep) + 1} of ${STEP_ORDER.length}: ${STEP_LABELS[verse.currentStep] || 'Learn'}`
      : formatDueDate(verse.dueAt);

  const badgeColor =
    verse.status === STATUS.MASTERED
      ? theme.colors.success
      : verse.status === STATUS.REVIEWING
      ? theme.colors.info
      : theme.colors.warning;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
      <View style={styles.textColumn}>
        <View style={styles.headerRow}>
          <Text style={styles.reference}>{formatReference(verse.book, verse.chapter, verse.verse)}</Text>
          <View style={[styles.badge, { backgroundColor: badgeColor }]} />
        </View>
        <Text style={[theme.arabic.small, styles.arabicPreview]} numberOfLines={1}>
          {verse.ar}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    textColumn: { flex: 1, marginRight: theme.spacing.sm },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    reference: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginRight: 8,
    },
    badge: { width: 8, height: 8, borderRadius: 4 },
    arabicPreview: { textAlign: 'right', color: theme.colors.text, marginBottom: 4 },
    subtitle: { fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary },
  });

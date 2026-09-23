import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import DashboardCard from './DashboardCard';

const BUCKETS = [
  { key: 'new', label: 'New', colorKey: 'info' },
  { key: 'learning', label: 'Learning', colorKey: 'warning' },
  { key: 'young', label: 'Young', colorKey: 'purple' },
  { key: 'mature', label: 'Mature', colorKey: 'success' },
];

/** props: buckets ({new, learning, young, mature, dueToday}) */
export default function FlashcardStatsCard({ buckets }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <DashboardCard title="Flashcards">
      <View style={styles.row}>
        {BUCKETS.map(({ key, label, colorKey }) => (
          <View key={key} style={styles.bucket}>
            <Text style={[styles.bucketValue, { color: theme.colors[colorKey] }]}>{buckets[key]}</Text>
            <Text style={styles.bucketLabel}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.dueRow}>
        <Text style={styles.dueLabel}>Due today</Text>
        <Text style={styles.dueValue}>{buckets.dueToday}</Text>
      </View>
    </DashboardCard>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    bucket: {
      alignItems: 'center',
      flex: 1,
    },
    bucketValue: {
      fontSize: theme.typography.fontSize.xxl,
      fontWeight: theme.typography.fontWeight.bold,
    },
    bucketLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    dueRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.borderLight,
    },
    dueLabel: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    dueValue: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
  });

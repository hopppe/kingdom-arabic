import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import DashboardCard from './DashboardCard';

const WEEKS = 5;
const DAYS = WEEKS * 7;

/** props: currentStreak, longestStreak, last7Days ([{key, ...counts}]), last35Days */
export default function StreakCard({ currentStreak, longestStreak, last7Days, last35Days }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isActive = (day) =>
    (day.cardReviews || 0) + (day.verseReviews || 0) + (day.versePractice || 0) + (day.chaptersRead || 0) > 0;

  return (
    <DashboardCard>
      <View style={styles.headerRow}>
        <View style={styles.streakBlock}>
          <View style={styles.streakValueRow}>
            <Ionicons name="flame" size={28} color={theme.colors.warning} />
            <Text style={styles.streakValue}>{currentStreak}</Text>
          </View>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
        <View style={styles.streakBlock}>
          <Text style={styles.longestValue}>{longestStreak}</Text>
          <Text style={styles.streakLabel}>longest streak</Text>
        </View>
      </View>

      <View style={styles.dotsRow}>
        {last7Days.map((day) => (
          <View key={day.key} style={[styles.dot, isActive(day) && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.heatmap}>
        {last35Days.map((day) => (
          <View key={day.key} style={styles.cell}>
            <View style={[styles.cellFill, isActive(day) && styles.cellFillActive]} />
          </View>
        ))}
      </View>
    </DashboardCard>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },
    streakBlock: {
      flex: 1,
      alignItems: 'center',
    },
    streakValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    streakValue: {
      fontSize: theme.typography.fontSize.header,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginLeft: theme.spacing.xs,
    },
    longestValue: {
      fontSize: theme.typography.fontSize.header,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    streakLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    dot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: theme.colors.borderLight,
    },
    dotActive: {
      backgroundColor: theme.colors.warning,
    },
    heatmap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '100%',
    },
    cell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      padding: 2,
    },
    cellFill: {
      flex: 1,
      borderRadius: 3,
      backgroundColor: theme.colors.borderLight,
    },
    cellFillActive: {
      backgroundColor: theme.colors.warning,
    },
  });

// Re-exported for the row-of-cells width math; keeps DAYS referenced.
export const HEATMAP_DAYS = DAYS;

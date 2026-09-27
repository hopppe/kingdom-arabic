import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { fromDateKey } from '../../utils/activityStats';
import DashboardCard from './DashboardCard';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const isActive = (day) =>
  (day.cardReviews || 0) + (day.verseReviews || 0) + (day.versePractice || 0) + (day.chaptersRead || 0) > 0;

// Rows of 7 days (percentage widths with flexWrap round badly and wrap at 6).
const toWeeks = (days) =>
  Array.from({ length: Math.ceil(days.length / 7) }, (_, i) => days.slice(i * 7, i * 7 + 7));

/** props: currentStreak, longestStreak, last7Days ([{key, ...counts}]), last35Days */
export default function StreakCard({ currentStreak, longestStreak, last7Days, last35Days }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const flame = theme.colors.warning;

  return (
    <DashboardCard>
      <View style={styles.hero}>
        <View style={[styles.flameBadge, { backgroundColor: `${flame}22` }]}>
          <Ionicons name="flame" size={34} color={flame} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.streakValue}>
            {currentStreak}
            <Text style={styles.streakUnit}> {currentStreak === 1 ? 'day' : 'days'}</Text>
          </Text>
          <Text style={styles.streakLabel}>Current streak</Text>
        </View>
        <View style={styles.bestPill}>
          <Ionicons name="trophy" size={13} color={theme.colors.textSecondary} />
          <Text style={styles.bestText}>Best {longestStreak}</Text>
        </View>
      </View>

      <View style={styles.weekRow}>
        {last7Days.map((day) => {
          const active = isActive(day);
          return (
            <View key={day.key} style={styles.weekDay}>
              <View style={[styles.weekDot, active && { backgroundColor: flame }]}>
                {active ? <Ionicons name="checkmark" size={14} color={theme.colors.white} /> : null}
              </View>
              <Text style={styles.weekLetter}>{DAY_LETTERS[fromDateKey(day.key).getDay()]}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.heatmapLabel}>Last 5 weeks</Text>
      <View style={styles.heatmap}>
        {toWeeks(last35Days).map((week) => (
          <View key={week[0].key} style={styles.heatmapRow}>
            {week.map((day) => (
              <View key={day.key} style={[styles.cell, isActive(day) && { backgroundColor: flame }]} />
            ))}
          </View>
        ))}
      </View>
    </DashboardCard>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    hero: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
    },
    flameBadge: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    heroText: {
      flex: 1,
    },
    streakValue: {
      fontSize: 34,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      fontVariant: ['tabular-nums'],
    },
    streakUnit: {
      fontSize: 17,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textSecondary,
    },
    streakLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    bestPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: theme.colors.borderLight,
    },
    bestText: {
      fontSize: 13,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textSecondary,
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 18,
    },
    weekDay: {
      alignItems: 'center',
      gap: 4,
    },
    weekDot: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.borderLight,
    },
    weekLetter: {
      fontSize: 11,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.textSecondary,
    },
    heatmapLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    heatmap: {
      gap: 4,
    },
    heatmapRow: {
      flexDirection: 'row',
      gap: 4,
    },
    cell: {
      flex: 1,
      height: 18,
      borderRadius: 5,
      backgroundColor: theme.colors.borderLight,
    },
  });

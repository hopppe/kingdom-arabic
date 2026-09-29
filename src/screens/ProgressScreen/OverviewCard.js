// The big Stats card: streak, last-30-day totals and the activity grid.
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import DashboardCard from './DashboardCard';
import ActivityHeatmap from './ActivityHeatmap';

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

/** props: currentStreak, longestStreak, totals30 ({ activeDays, cardReviews, verses }), activityLog */
export default function OverviewCard({ currentStreak, longestStreak, totals30, activityLog }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const flame = theme.colors.warning;

  const figures = [
    { key: 'days', value: totals30.activeDays, label: 'days studied' },
    { key: 'cards', value: totals30.cardReviews, label: 'cards reviewed' },
    { key: 'verses', value: totals30.verses, label: 'verse practice' },
  ];

  return (
    <DashboardCard>
      <View style={styles.hero}>
        <View style={[styles.flameBadge, { backgroundColor: `${flame}22` }]}>
          <Ionicons name="flame" size={30} color={flame} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.streakValue}>{plural(currentStreak, 'day')}</Text>
          <Text style={styles.streakLabel}>
            {currentStreak > 0 ? 'Current streak' : 'Study today to start a streak'}
          </Text>
        </View>
        <View style={styles.bestPill}>
          <Ionicons name="trophy" size={13} color={theme.colors.textSecondary} />
          <Text style={styles.bestText}>{`Best ${longestStreak}`}</Text>
        </View>
      </View>

      <View style={styles.figures}>
        {figures.map(({ key, value, label }) => (
          <View key={key} style={styles.figure}>
            <Text style={styles.figureValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
            <Text style={styles.figureLabel} numberOfLines={1}>{label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.periodNote}>Last 30 days</Text>

      <ActivityHeatmap activityLog={activityLog} color={flame} />
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
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    heroText: {
      flex: 1,
      marginRight: 8,
    },
    streakValue: {
      fontSize: 28,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      fontVariant: ['tabular-nums'],
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
    figures: {
      flexDirection: 'row',
      borderRadius: 14,
      paddingVertical: 12,
      backgroundColor: theme.colors.borderLight,
    },
    figure: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    figureValue: {
      fontSize: 20,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      fontVariant: ['tabular-nums'],
    },
    figureLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    periodNote: {
      fontSize: 11,
      color: theme.colors.textTertiary,
      textAlign: 'right',
      marginTop: 6,
      marginBottom: 14,
    },
  });

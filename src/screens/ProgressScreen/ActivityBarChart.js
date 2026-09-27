// Stacked bar chart (no chart library): card + verse reviews per day over the
// last 14 days, then 7-day stat tiles with the 30-day figure underneath.
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import DashboardCard from './DashboardCard';
import StatTile from './StatTile';

const CHART_HEIGHT = 96;
const MIN_BAR_HEIGHT = 4;

const formatRetention = (retention) => (retention === null ? '—' : `${Math.round(retention * 100)}%`);

/** props: last14Days, totals7, totals30 (each {cardReviews, verseReviews, versePractice, chaptersRead}), retention7, retention30 */
export default function ActivityBarChart({ last14Days, totals7, totals30, retention7, retention30 }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const maxTotal = useMemo(
    () => Math.max(1, ...last14Days.map((day) => (day.cardReviews || 0) + (day.verseReviews || 0))),
    [last14Days]
  );

  const hasActivity = last14Days.some((day) => (day.cardReviews || 0) + (day.verseReviews || 0) > 0);
  const barHeight = (count) => (count > 0 ? Math.max((count / maxTotal) * CHART_HEIGHT, MIN_BAR_HEIGHT) : 0);

  return (
    <DashboardCard title="Study activity" icon="pulse" iconColor={theme.colors.info}>
      <View style={styles.chartRow}>
        {last14Days.map((day) => {
          const cardHeight = barHeight(Math.max(day.cardReviews || 0, 0));
          const verseHeight = barHeight(Math.max(day.verseReviews || 0, 0));
          return (
            <View key={day.key} style={styles.barColumn}>
              <View style={styles.barTrack}>
                {!verseHeight && !cardHeight && <View style={[styles.bar, styles.emptyBar]} />}
                {verseHeight > 0 && <View style={[styles.bar, styles.verseBar, { height: verseHeight }]} />}
                {cardHeight > 0 && <View style={[styles.bar, styles.cardBar, { height: cardHeight }]} />}
              </View>
            </View>
          );
        })}
        {!hasActivity && (
          <Text style={styles.emptyText}>Review flashcards or verses to see your activity here.</Text>
        )}
      </View>

      <View style={styles.axisRow}>
        <Text style={styles.axisText}>2 weeks ago</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendSwatch, { backgroundColor: theme.colors.info }]} />
          <Text style={styles.axisText}>Cards</Text>
          <View style={[styles.legendSwatch, { backgroundColor: theme.colors.purple }]} />
          <Text style={styles.axisText}>Verses</Text>
        </View>
        <Text style={styles.axisText}>Today</Text>
      </View>

      <Text style={styles.periodLabel}>Last 7 days</Text>
      <View style={styles.tileGrid}>
        <View style={styles.tileRow}>
          <StatTile value={totals7.cardReviews} label="Cards reviewed" detail={`${totals30.cardReviews} in 30 days`} />
          <StatTile value={formatRetention(retention7)} label="Retention" detail={`${formatRetention(retention30)} in 30 days`} />
        </View>
        <View style={styles.tileRow}>
          <StatTile value={totals7.versePractice} label="Memory steps" detail={`${totals30.versePractice} in 30 days`} />
          <StatTile value={totals7.chaptersRead} label="Chapters read" detail={`${totals30.chaptersRead} in 30 days`} />
        </View>
      </View>
    </DashboardCard>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    chartRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: CHART_HEIGHT,
      paddingBottom: 1,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    barColumn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: '100%',
    },
    barTrack: {
      width: '62%',
      justifyContent: 'flex-end',
      gap: 2,
    },
    bar: {
      width: '100%',
      borderRadius: 4,
    },
    cardBar: {
      backgroundColor: theme.colors.info,
    },
    emptyBar: {
      height: MIN_BAR_HEIGHT,
      backgroundColor: theme.colors.borderLight,
    },
    emptyText: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: CHART_HEIGHT / 2 - 18,
      textAlign: 'center',
      fontSize: 13,
      color: theme.colors.textSecondary,
      paddingHorizontal: 24,
    },
    verseBar: {
      backgroundColor: theme.colors.purple,
    },
    axisRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 6,
      marginBottom: 18,
    },
    axisText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    legendSwatch: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: 6,
    },
    periodLabel: {
      fontSize: 12,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    tileGrid: {
      gap: 14,
    },
    tileRow: {
      flexDirection: 'row',
      gap: 14,
    },
  });

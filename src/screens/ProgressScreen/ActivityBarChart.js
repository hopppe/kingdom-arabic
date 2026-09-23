// Simple stacked bar chart (no chart library): card reviews + verse reviews
// per day over the last 14 days, with a small legend and 7/30-day stat rows.
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import DashboardCard from './DashboardCard';

const CHART_HEIGHT = 90;

const formatRetention = (retention) => (retention === null ? '—' : `${Math.round(retention * 100)}%`);

/** props: last14Days, totals7, totals30 (each {cardReviews, verseReviews, versePractice, chaptersRead}), retention7, retention30 */
export default function ActivityBarChart({ last14Days, totals7, totals30, retention7, retention30 }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const maxTotal = useMemo(
    () => Math.max(1, ...last14Days.map((day) => (day.cardReviews || 0) + (day.verseReviews || 0))),
    [last14Days]
  );

  return (
    <DashboardCard title="Study activity">
      <View style={styles.chartRow}>
        {last14Days.map((day) => {
          const cardHeight = (Math.max(day.cardReviews || 0, 0) / maxTotal) * CHART_HEIGHT;
          const verseHeight = (Math.max(day.verseReviews || 0, 0) / maxTotal) * CHART_HEIGHT;
          return (
            <View key={day.key} style={styles.barColumn}>
              <View style={styles.barTrack}>
                {verseHeight > 0 && <View style={[styles.verseBar, { height: verseHeight }]} />}
                {cardHeight > 0 && <View style={[styles.cardBar, { height: cardHeight }]} />}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: theme.colors.info }]} />
          <Text style={styles.legendText}>Cards</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: theme.colors.purple }]} />
          <Text style={styles.legendText}>Verses</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableCell, styles.tableMetricCell]} />
          <Text style={[styles.tableCell, styles.tableHeaderText]}>7d</Text>
          <Text style={[styles.tableCell, styles.tableHeaderText]}>30d</Text>
        </View>
        <StatRow label="Cards reviewed" a={totals7.cardReviews} b={totals30.cardReviews} styles={styles} />
        <StatRow label="Retention" a={formatRetention(retention7)} b={formatRetention(retention30)} styles={styles} />
        <StatRow label="Memory practice steps" a={totals7.versePractice} b={totals30.versePractice} styles={styles} />
        <StatRow label="Chapters read" a={totals7.chaptersRead} b={totals30.chaptersRead} styles={styles} />
      </View>
    </DashboardCard>
  );
}

const StatRow = ({ label, a, b, styles }) => (
  <View style={styles.tableRow}>
    <Text style={[styles.tableCell, styles.tableMetricCell, styles.tableMetricText]}>{label}</Text>
    <Text style={[styles.tableCell, styles.tableValueText]}>{a}</Text>
    <Text style={[styles.tableCell, styles.tableValueText]}>{b}</Text>
  </View>
);

const createStyles = (theme) =>
  StyleSheet.create({
    chartRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: CHART_HEIGHT,
      marginBottom: theme.spacing.sm,
    },
    barColumn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: CHART_HEIGHT,
      paddingHorizontal: 1,
    },
    barTrack: {
      width: '70%',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    cardBar: {
      width: '100%',
      backgroundColor: theme.colors.info,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
    },
    verseBar: {
      width: '100%',
      backgroundColor: theme.colors.purple,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
      marginBottom: 2,
    },
    legendRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: theme.spacing.sm,
    },
    legendSwatch: {
      width: 10,
      height: 10,
      borderRadius: 2,
      marginRight: 4,
    },
    legendText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
    },
    table: {
      marginTop: theme.spacing.xs,
    },
    tableHeaderRow: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 6,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.borderLight,
    },
    tableCell: {
      flex: 1,
      textAlign: 'right',
      fontSize: theme.typography.fontSize.sm,
    },
    tableMetricCell: {
      flex: 2,
      textAlign: 'left',
    },
    tableHeaderText: {
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    tableMetricText: {
      color: theme.colors.text,
    },
    tableValueText: {
      color: theme.colors.text,
      fontWeight: theme.typography.fontWeight.medium,
    },
  });

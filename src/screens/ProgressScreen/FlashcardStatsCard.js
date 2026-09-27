import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import DashboardCard from './DashboardCard';
import SegmentedBar from './SegmentedBar';
import StatTile from './StatTile';
import DuePill from './DuePill';

const BUCKETS = [
  { key: 'new', label: 'New', colorKey: 'info' },
  { key: 'learning', label: 'Learning', colorKey: 'warning' },
  { key: 'young', label: 'Young', colorKey: 'purple' },
  { key: 'mature', label: 'Mature', colorKey: 'success' },
];

/** props: buckets ({new, learning, young, mature, dueToday}), onPress */
export default function FlashcardStatsCard({ buckets, onPress }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const segments = BUCKETS.map(({ key, colorKey }) => ({ key, value: buckets[key], color: theme.colors[colorKey] }));

  return (
    <DashboardCard title="Flashcards" icon="albums" iconColor={theme.colors.purple} onPress={onPress}>
      <SegmentedBar segments={segments} />
      <View style={styles.row}>
        {BUCKETS.map(({ key, label, colorKey }) => (
          <StatTile key={key} value={buckets[key]} label={label} color={theme.colors[colorKey]} />
        ))}
      </View>
      <DuePill count={buckets.dueToday} />
    </DashboardCard>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 8,
    },
  });

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useMemoryVerses } from '../../context/MemoryVerseContext';
import { useTheme } from '../../context/ThemeContext';
import DashboardCard from './DashboardCard';
import SegmentedBar from './SegmentedBar';
import StatTile from './StatTile';
import DuePill from './DuePill';

/** props: onPress (open the Memorize screen) */
export default function MemoryVerseCard({ onPress }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { stats } = useMemoryVerses();

  if (!stats) return null;

  const segments = [
    { key: 'learning', value: stats.learning, color: theme.colors.warning },
    { key: 'reviewing', value: stats.reviewing, color: theme.colors.info },
    { key: 'mastered', value: stats.mastered, color: theme.colors.success },
  ];

  return (
    <DashboardCard title="Memory verses" icon="bulb" iconColor={theme.colors.warning} onPress={onPress}>
      <SegmentedBar segments={segments} />
      <View style={styles.row}>
        <StatTile value={stats.total} label="Total" />
        <StatTile value={stats.learning} label="Learning" color={theme.colors.warning} />
        <StatTile value={stats.reviewing} label="Memorized" color={theme.colors.info} />
        <StatTile value={stats.mastered} label="Mastered" color={theme.colors.success} />
      </View>
      <DuePill count={stats.dueToday} />
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

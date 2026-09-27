// One rounded bar split into colored segments, sized by each value's share.
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/** props: segments ([{key, value, color}]) */
export default function SegmentedBar({ segments }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const total = segments.reduce((sum, { value }) => sum + Math.max(value || 0, 0), 0);

  return (
    <View style={styles.track}>
      {total > 0 &&
        segments
          .filter(({ value }) => value > 0)
          .map(({ key, value, color }) => (
            <View key={key} style={[styles.segment, { flex: value, backgroundColor: color }]} />
          ))}
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    track: {
      flexDirection: 'row',
      height: 10,
      borderRadius: 5,
      overflow: 'hidden',
      gap: 2,
      backgroundColor: theme.colors.borderLight,
      marginBottom: 16,
    },
    segment: {
      height: '100%',
    },
  });

// GitHub-style grid of study activity: as many weeks as fit the width, today at the bottom right.
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { buildHeatmap, HEATMAP_THRESHOLDS } from '../../utils/activityHeatmap';

const CELL_TARGET = 15;
const GAP = 3;
const MIN_WEEKS = 8;
const MAX_WEEKS = 26;
const DEFAULT_WEEKS = 18;
// Opacity of the accent for levels 1-4 (level 0 is the empty track color).
const LEVEL_OPACITY = ['', '44', '88', 'BB', 'FF'];

const weeksForWidth = (width) =>
  Math.min(MAX_WEEKS, Math.max(MIN_WEEKS, Math.floor((width + GAP) / (CELL_TARGET + GAP))));

/** props: activityLog, color (accent for active days) */
export default function ActivityHeatmap({ activityLog, color }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [weeks, setWeeks] = useState(DEFAULT_WEEKS);
  const grid = useMemo(() => buildHeatmap(activityLog, weeks), [activityLog, weeks]);

  const cellColor = (level) => (level > 0 ? `${color}${LEVEL_OPACITY[level]}` : theme.colors.borderLight);

  return (
    <View>
      <View style={styles.grid} onLayout={(event) => setWeeks(weeksForWidth(event.nativeEvent.layout.width))}>
        {grid.map((week) => (
          <View key={week[0].key} style={styles.week}>
            {week.map((day, weekday) =>
              day ? (
                <View key={day.key} style={[styles.cell, { backgroundColor: cellColor(day.level) }]} />
              ) : (
                <View key={`empty-${weekday}`} style={styles.cell} />
              )
            )}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{`Last ${weeks} weeks`}</Text>
        <View style={styles.legend}>
          <Text style={styles.footerText}>Less</Text>
          {HEATMAP_THRESHOLDS.map((min, level) => (
            <View key={min} style={[styles.legendCell, { backgroundColor: cellColor(level) }]} />
          ))}
          <Text style={styles.footerText}>More</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      gap: GAP,
    },
    week: {
      flex: 1,
      gap: GAP,
    },
    cell: {
      aspectRatio: 1,
      borderRadius: 3,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    footerText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    legend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    legendCell: {
      width: 10,
      height: 10,
      borderRadius: 2,
    },
  });

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * Anki-style card counts display for study session
 * Shows: New (blue) | Learning (orange) | Review (green)
 * Receives counts object from LocalQueueManager
 */
export const AnkiCardCounts = ({ counts }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { new: newCount = 0, learning: learningCount = 0, review: reviewCount = 0 } = counts || {};

  return (
    <View style={styles.container}>
      <View style={styles.countGroup}>
        <Text style={[styles.count, styles.newCount]}>{newCount}</Text>
        <Text style={styles.label}>New</Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.countGroup}>
        <Text style={[styles.count, styles.learningCount]}>{learningCount}</Text>
        <Text style={styles.label}>Learning</Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.countGroup}>
        <Text style={[styles.count, styles.reviewCount]}>{reviewCount}</Text>
        <Text style={styles.label}>Review</Text>
      </View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginBottom: 16,
  },
  countGroup: {
    alignItems: 'center',
    minWidth: 60,
  },
  count: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  newCount: {
    color: theme.colors.info,
  },
  learningCount: {
    color: theme.colors.warning,
  },
  reviewCount: {
    color: theme.colors.success,
  },
  label: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontWeight: '600',
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
    marginHorizontal: 16,
  },
});

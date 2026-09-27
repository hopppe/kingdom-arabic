import React, { useMemo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/** "N due today" pill shown under the flashcard and memory verse stats. */
export default function DuePill({ count }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.pill}>
      <Text style={styles.value}>{count}</Text>
      <Text style={styles.label}> due today</Text>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    pill: {
      flexDirection: 'row',
      alignItems: 'baseline',
      alignSelf: 'flex-start',
      marginTop: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: theme.colors.borderLight,
    },
    value: {
      fontSize: 15,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    label: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
  });

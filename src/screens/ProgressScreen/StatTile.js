// Big number over a small label; the building block of the dashboard cards.
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/** props: value, label, color (dot + value tint), detail (small line under the label) */
export default function StatTile({ value, label, color, detail }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.tile}>
      <Text style={[styles.value, color && { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <View style={styles.labelRow}>
        {color ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
      </View>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    tile: {
      flex: 1,
      minWidth: 0,
    },
    value: {
      fontSize: 26,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      fontVariant: ['tabular-nums'],
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 2,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    label: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      flexShrink: 1,
    },
    detail: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
  });

// Half-width Stats card: "12 / 40 learned", a progress bar, and a chip for what's due.
import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import GlassSurface from '../../components/glass/GlassSurface';

/** props: title, icon, color, summary ({ done, total, due, fraction }), doneLabel, emptyText, onPress */
export default function SummaryCard({ title, icon, color, summary, doneLabel, emptyText, onPress }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { done, total, due, fraction } = summary;

  return (
    <GlassSurface style={styles.card} interactive={Boolean(onPress)}>
      <Pressable style={styles.pressable} onPress={onPress} disabled={!onPress} accessibilityRole="button" accessibilityLabel={title}>
        <View style={styles.header}>
          <Ionicons name={icon} size={16} color={color} />
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {due > 0 ? (
            <View style={[styles.dueChip, { backgroundColor: `${theme.colors.warning}22` }]}>
              <Text style={[styles.dueText, { color: theme.colors.warning }]}>{`${due} due`}</Text>
            </View>
          ) : null}
        </View>

        {total === 0 ? (
          <Text style={styles.emptyText}>{emptyText}</Text>
        ) : (
          <>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
              {done}
              <Text style={styles.total}>{` / ${total}`}</Text>
            </Text>
            <Text style={styles.label} numberOfLines={1}>{doneLabel}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.round(fraction * 100)}%`, backgroundColor: color }]} />
            </View>
          </>
        )}
      </Pressable>
    </GlassSurface>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    card: {
      flex: 1,
      borderRadius: 22,
    },
    pressable: {
      flex: 1,
      padding: 14,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
    },
    title: {
      flex: 1,
      fontSize: 15,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    dueChip: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    dueText: {
      fontSize: 12,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    value: {
      fontSize: 30,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      fontVariant: ['tabular-nums'],
    },
    total: {
      fontSize: 17,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textTertiary,
    },
    label: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: 12,
    },
    track: {
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
      marginTop: 'auto',
      backgroundColor: theme.colors.borderLight,
    },
    fill: {
      height: '100%',
      borderRadius: 3,
    },
    emptyText: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.textSecondary,
    },
  });

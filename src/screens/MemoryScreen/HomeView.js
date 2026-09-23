import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { formatReference } from '../../data/bibleData';
import { STATUS } from '../../utils/memory/scheduler';
import { VerseListItem } from './VerseListItem';
import { STARTER_VERSES } from './starters';

const StatTile = ({ label, value, color, theme, styles }) => (
  <View style={styles.statTile}>
    <Text style={[styles.statValue, color && { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

function EmptyState({ theme, styles, onAddStarter }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="bulb-outline" size={40} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>Memorize Bible verses</Text>
      <Text style={styles.emptyBody}>
        Each verse walks you through five steps — Learn the meaning, Fade out words a few at a
        time, recall from first letters, rebuild it from tiles, then recite it from memory. Once you
        pass Recall, the verse comes back for spaced review so it sticks.
      </Text>
      <Text style={styles.emptySubheading}>Try one of these to start:</Text>
      <View style={styles.starterWrap}>
        {STARTER_VERSES.slice(0, 6).map((starter) => (
          <TouchableOpacity
            key={`${starter.book}-${starter.chapter}-${starter.verse}`}
            style={styles.starterChip}
            onPress={() => onAddStarter(starter)}
          >
            <Text style={styles.starterChipText}>
              {formatReference(starter.book, starter.chapter, starter.verse)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function HomeView({ verses, stats, onStartReview, onAddPress, onAddStarter, onOpenVerse, onRemoveVerse }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const learningVerses = verses.filter((v) => v.status === STATUS.LEARNING);
  const memorizedVerses = verses
    .filter((v) => v.status !== STATUS.LEARNING)
    .sort((a, b) => new Date(a.dueAt || 0) - new Date(b.dueAt || 0));
  const memorizedCount = stats.reviewing + stats.mastered;

  const confirmRemove = (verse) => {
    Alert.alert(
      'Remove verse?',
      `${formatReference(verse.book, verse.chapter, verse.verse)} will be removed from your memory verses.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onRemoveVerse(verse.id) },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Memorize</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Ionicons name="add" size={26} color={theme.colors.textOnPrimary} />
        </TouchableOpacity>
      </View>

      {verses.length === 0 ? (
        <EmptyState theme={theme} styles={styles} onAddStarter={onAddStarter} />
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatTile label="Due today" value={stats.dueToday} color={theme.colors.warning} theme={theme} styles={styles} />
            <StatTile label="Learning" value={stats.learning} color={theme.colors.info} theme={theme} styles={styles} />
            <StatTile label="Memorized" value={memorizedCount} color={theme.colors.success} theme={theme} styles={styles} />
          </View>

          {stats.dueToday > 0 && (
            <TouchableOpacity style={styles.reviewButton} onPress={onStartReview}>
              <Ionicons name="refresh" size={20} color={theme.colors.textOnPrimary} />
              <Text style={styles.reviewButtonText}>
                Review {stats.dueToday} due verse{stats.dueToday === 1 ? '' : 's'}
              </Text>
            </TouchableOpacity>
          )}

          {learningVerses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Learning</Text>
              {learningVerses.map((verse) => (
                <VerseListItem
                  key={verse.id}
                  verse={verse}
                  onPress={() => onOpenVerse(verse)}
                  onLongPress={() => confirmRemove(verse)}
                />
              ))}
            </View>
          )}

          {memorizedVerses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Memorized</Text>
              {memorizedVerses.map((verse) => (
                <VerseListItem
                  key={verse.id}
                  verse={verse}
                  onPress={() => onOpenVerse(verse)}
                  onLongPress={() => confirmRemove(verse)}
                />
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxl },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
    title: { fontSize: theme.typography.fontSize.title, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.buttonBackground,
    },
    statsRow: { flexDirection: 'row', marginBottom: theme.spacing.md, gap: theme.spacing.sm },
    statTile: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    statValue: { fontSize: theme.typography.fontSize.xxl, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
    statLabel: { fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary, marginTop: 2 },
    reviewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.colors.info,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 14,
      marginBottom: theme.spacing.lg,
    },
    reviewButtonText: { color: theme.colors.textOnPrimary, fontWeight: theme.typography.fontWeight.semibold, fontSize: theme.typography.fontSize.md },
    section: { marginBottom: theme.spacing.lg },
    sectionTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
    },
    emptyState: { alignItems: 'center', paddingVertical: theme.spacing.xl, paddingHorizontal: theme.spacing.sm },
    emptyTitle: { fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text, marginTop: theme.spacing.md },
    emptyBody: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, textAlign: 'center', marginTop: theme.spacing.sm, lineHeight: 20 },
    emptySubheading: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
    starterWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
    starterChip: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: 8,
      paddingHorizontal: 14,
      marginBottom: 4,
    },
    starterChipText: { color: theme.colors.text, fontSize: theme.typography.fontSize.sm },
  });

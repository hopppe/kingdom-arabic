// The Stats dashboard: an overview (streak, totals, activity grid), then flashcards and memory verses side by side.
// Shown in the Stats tab on tablets and in the reader's Settings sheet on phones.
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useActivity } from '../../context/ActivityContext';
import { useFlashcards } from '../../context/FlashcardContext';
import { useMemoryVerses } from '../../context/MemoryVerseContext';
import { computeCurrentStreak, computeLongestStreak, countActiveDays, sumActivity } from '../../utils/activityStats';
import { bucketFlashcardProgress } from '../../utils/flashcardStats';
import { summarizeFlashcards, summarizeMemoryVerses } from '../../utils/progressSummary';
import OverviewCard from './OverviewCard';
import SummaryCard from './SummaryCard';

/** props: onOpenFlashcards, onOpenMemorize (make those cards links) */
export default function ProgressContent({ onOpenFlashcards, onOpenMemorize }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { activityLog, loaded: activityLoaded } = useActivity();
  const { userProgress } = useFlashcards();
  const { stats: memoryStats } = useMemoryVerses();

  const overview = useMemo(() => {
    const now = new Date();
    const totals = sumActivity(activityLog, 30, now);
    return {
      current: computeCurrentStreak(activityLog, now),
      longest: computeLongestStreak(activityLog),
      totals30: {
        activeDays: countActiveDays(activityLog, 30, now),
        cardReviews: totals.cardReviews,
        verses: totals.verseReviews + totals.versePractice,
      },
    };
  }, [activityLog]);

  const flashcards = useMemo(() => summarizeFlashcards(bucketFlashcardProgress(userProgress)), [userProgress]);
  const verses = useMemo(() => summarizeMemoryVerses(memoryStats), [memoryStats]);

  if (!activityLoaded) return null;

  return (
    <>
      <OverviewCard
        currentStreak={overview.current}
        longestStreak={overview.longest}
        totals30={overview.totals30}
        activityLog={activityLog}
      />
      <View style={styles.row}>
        <SummaryCard
          title="Flashcards"
          icon="albums"
          color={theme.colors.purple}
          summary={flashcards}
          doneLabel="words learned"
          emptyText="Save words while reading to build your deck."
          onPress={onOpenFlashcards}
        />
        <SummaryCard
          title="Memorize"
          icon="bulb"
          color={theme.colors.warning}
          summary={verses}
          doneLabel="verses memorized"
          emptyText="Long-press a verse number to add one."
          onPress={onOpenMemorize}
        />
      </View>
    </>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 12,
      marginHorizontal: theme.spacing.md,
      marginBottom: 14,
    },
  });

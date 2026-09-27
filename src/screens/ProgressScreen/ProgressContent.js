// The Progress dashboard's cards. Shown in the Progress tab on tablets and in
// the reader's Settings sheet on phones.
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useActivity } from '../../context/ActivityContext';
import { useFlashcards } from '../../context/FlashcardContext';
import BackupSection from '../../components/backup/BackupSection';
import {
  computeCurrentStreak,
  computeLongestStreak,
  computeRetention,
  lastNDays,
  sumActivity,
} from '../../utils/activityStats';
import { bucketFlashcardProgress } from '../../utils/flashcardStats';
import StreakCard from './StreakCard';
import ActivityBarChart from './ActivityBarChart';
import FlashcardStatsCard from './FlashcardStatsCard';
import MemoryVerseCard from './MemoryVerseCard';
import ReadingProgressCard from './ReadingProgressCard';

/** props: onOpenFlashcards, onOpenMemorize (make those cards links) */
export default function ProgressContent({ onOpenFlashcards, onOpenMemorize }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { activityLog, loaded: activityLoaded } = useActivity();
  const { userProgress } = useFlashcards();

  const stats = useMemo(() => {
    const now = new Date();
    return {
      currentStreak: computeCurrentStreak(activityLog, now),
      longestStreak: computeLongestStreak(activityLog),
      last7Days: lastNDays(activityLog, 7, now),
      last35Days: lastNDays(activityLog, 35, now),
      last14Days: lastNDays(activityLog, 14, now),
      totals7: sumActivity(activityLog, 7, now),
      totals30: sumActivity(activityLog, 30, now),
      retention7: computeRetention(activityLog, 7, now),
      retention30: computeRetention(activityLog, 30, now),
    };
  }, [activityLog]);

  const flashcardBuckets = useMemo(() => bucketFlashcardProgress(userProgress), [userProgress]);

  if (!activityLoaded) return null;

  return (
    <>
      <StreakCard
        currentStreak={stats.currentStreak}
        longestStreak={stats.longestStreak}
        last7Days={stats.last7Days}
        last35Days={stats.last35Days}
      />
      <ActivityBarChart
        last14Days={stats.last14Days}
        totals7={stats.totals7}
        totals30={stats.totals30}
        retention7={stats.retention7}
        retention30={stats.retention30}
      />
      <FlashcardStatsCard buckets={flashcardBuckets} onPress={onOpenFlashcards} />
      <MemoryVerseCard onPress={onOpenMemorize} />
      <ReadingProgressCard />
      <View style={styles.backup}>
        <BackupSection />
      </View>
    </>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    backup: {
      marginHorizontal: theme.spacing.md,
    },
  });

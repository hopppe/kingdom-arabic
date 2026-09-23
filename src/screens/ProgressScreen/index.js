import React, { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

export default function ProgressScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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
      <FlashcardStatsCard buckets={flashcardBuckets} />
      <MemoryVerseCard />
      <ReadingProgressCard />
      <BackupSection />
    </ScrollView>
  );
}

const createStyles = (theme, topInset) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingTop: topInset + theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
  });

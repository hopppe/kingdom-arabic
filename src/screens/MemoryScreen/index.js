import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useMemoryVerses } from '../../context/MemoryVerseContext';
import { STATUS, isDue } from '../../utils/memory/scheduler';
import { HomeView } from './HomeView';
import { AddVerseView } from './AddVerseView';
import { PracticeSession } from './PracticeSession';

// Views: 'home' | 'add' | 'practice'. Practice covers both a single verse
// (tapped from a list) and a due-review queue (several verses in sequence).
export default function MemoryScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { verses, loaded, stats, addVerse, removeVerse } = useMemoryVerses();

  const [view, setView] = useState('home');
  const [queue, setQueue] = useState(null); // { ids: string[], index: number } | null

  const activeVerseId = queue ? queue.ids[queue.index] : null;
  const activeVerse = activeVerseId ? verses.find((v) => v.id === activeVerseId) : null;

  const openSingleVerse = (verse) => {
    setQueue({ ids: [verse.id], index: 0 });
    setView('practice');
  };

  const startDueReview = () => {
    const dueIds = verses.filter((v) => v.status !== STATUS.LEARNING && isDue(v)).map((v) => v.id);
    if (dueIds.length === 0) return;
    setQueue({ ids: dueIds, index: 0 });
    setView('practice');
  };

  const handleGraded = () => {
    if (!queue) return;
    const nextIndex = queue.index + 1;
    if (nextIndex >= queue.ids.length) {
      setQueue(null);
      setView('home');
      return;
    }
    setQueue({ ...queue, index: nextIndex });
  };

  const exitPractice = () => {
    setQueue(null);
    setView('home');
  };

  const handleAddStarter = async (starter) => {
    const result = await addVerse(starter);
    if (!result.error) {
      setView('home');
    }
  };

  if (!loaded) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator color={theme.colors.info} size="large" />
      </SafeAreaView>
    );
  }

  if (view === 'add') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AddVerseView onClose={() => setView('home')} onAdded={() => setView('home')} />
      </SafeAreaView>
    );
  }

  if (view === 'practice' && activeVerse) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <PracticeSession
          verse={activeVerse}
          onExit={exitPractice}
          onGraded={handleGraded}
          queueLabel={queue && queue.ids.length > 1 ? `${queue.index + 1} of ${queue.ids.length}` : null}
        />
      </SafeAreaView>
    );
  }

  if (view === 'practice' && !activeVerse) {
    // The active verse was removed mid-session; bail out gracefully.
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyPractice}>
          <Text style={styles.emptyPracticeText}>This verse is no longer available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HomeView
        verses={verses}
        stats={stats}
        onStartReview={startDueReview}
        onAddPress={() => setView('add')}
        onAddStarter={handleAddStarter}
        onOpenVerse={openSingleVerse}
        onRemoveVerse={removeVerse}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    loadingContainer: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' },
    emptyPractice: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg },
    emptyPracticeText: { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.md },
  });

// Memory verse state: the list of verses the user is memorizing, persisted to
// AsyncStorage, plus the mutators the Memorize screens use to add verses and
// record practice/review progress.
//
// Storage: AsyncStorage key @learnarabic_memory_verses, a JSON array of
// records shaped like `createMemoryVerseRecord()` below (see
// src/utils/memory/persistence.js for the validator applied on load).
//
// Public API (via useMemoryVerses()):
//   verses            - array of verse records, oldest-added first
//   loaded            - true once the initial AsyncStorage read has finished
//   addVerse({ book, chapter, verse }) -> Promise<{ added, alreadyExists, error? }>
//                        fetches the verse text via bibleRepository.getVerse
//   removeVerse(id)    - removes a verse (no confirmation here; screens confirm)
//   hasVerse(book, chapter, verse) -> boolean
//   stats              - { total, learning, reviewing, mastered, dueToday }
//                        (this exact shape is displayed by the Progress tab)
//   updateStep(id, { currentStep, fadeRound }) - persist practice-session position
//   recordHint(id)     - +1 to a verse's cumulative hint/reveal count
//   recordBuildError(id) - +1 to a verse's cumulative wrong-tile-tap count
//   recordReview(id, rating) - grades the Recall step (RATINGS.AGAIN/HARD/GOOD/EASY),
//                        applies the day-level scheduler, logs VERSE_REVIEW activity,
//                        and repositions the verse for its next practice/review
//   logPracticeStep()  - logs one VERSE_PRACTICE activity (call after each
//                        completed Learn/Fade-round/First-letters/Build step)
//
// A verse record: { id, book, chapter, verse, ar, en, addedAt, status,
//   currentStep, fadeRound, intervalDays, easeFactor, reviewCount, lapses,
//   dueAt, hintCount, errorCount }

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBibleDb } from './BibleDbContext';
import { useActivity } from './ActivityContext';
import { getVerse } from '../data/bibleRepository';
import { ACTIVITY_TYPES } from '../utils/activityStats';
import { buildVerseId, sanitizeMemoryVerses } from '../utils/memory/persistence';
import { createInitialSchedule, scheduleReview, computeMemoryStats, RATINGS } from '../utils/memory/scheduler';
import { STEP } from '../utils/memory/steps';

export const MEMORY_VERSES_KEY = '@learnarabic_memory_verses';
export { RATINGS };

const MemoryVerseContext = createContext(null);

const createMemoryVerseRecord = ({ book, chapter, verse, ar, en }) => ({
  id: buildVerseId(book, chapter, verse),
  book,
  chapter,
  verse,
  ar,
  en,
  addedAt: new Date().toISOString(),
  ...createInitialSchedule(),
  currentStep: STEP.LEARN,
  fadeRound: 0,
  hintCount: 0,
  errorCount: 0,
});

export function MemoryVerseProvider({ children }) {
  const db = useBibleDb();
  const { logActivity } = useActivity();
  const [verses, setVerses] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const versesRef = useRef(verses);

  useEffect(() => {
    versesRef.current = verses;
  }, [verses]);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(MEMORY_VERSES_KEY)
      .then((stored) => {
        if (cancelled || !stored) return;
        const sanitized = sanitizeMemoryVerses(JSON.parse(stored));
        versesRef.current = sanitized;
        setVerses(sanitized);
      })
      .catch((error) => console.error('Failed to load memory verses:', error))
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next) => {
    versesRef.current = next;
    setVerses(next);
    AsyncStorage.setItem(MEMORY_VERSES_KEY, JSON.stringify(next)).catch((error) =>
      console.error('Failed to save memory verses:', error)
    );
  }, []);

  const hasVerse = useCallback(
    (book, chapter, verse) => versesRef.current.some((v) => v.id === buildVerseId(book, chapter, verse)),
    []
  );

  const addVerse = useCallback(
    async ({ book, chapter, verse }) => {
      if (!book || !chapter || !verse) {
        return { added: false, alreadyExists: false, error: 'Choose a book, chapter, and verse first.' };
      }
      const id = buildVerseId(book, chapter, verse);
      if (versesRef.current.some((v) => v.id === id)) {
        return { added: false, alreadyExists: true };
      }
      try {
        const row = await getVerse(db, book, chapter, verse);
        if (!row) {
          return { added: false, alreadyExists: false, error: 'That verse could not be found.' };
        }
        const record = createMemoryVerseRecord({ book, chapter, verse, ar: row.ar, en: row.en });
        persist([...versesRef.current, record]);
        logActivity(ACTIVITY_TYPES.VERSE_ADDED);
        return { added: true, alreadyExists: false };
      } catch (error) {
        console.error('Failed to add memory verse:', error);
        return { added: false, alreadyExists: false, error: 'Could not add that verse. Please try again.' };
      }
    },
    [db, persist, logActivity]
  );

  const removeVerse = useCallback(
    (id) => {
      persist(versesRef.current.filter((v) => v.id !== id));
    },
    [persist]
  );

  const updateVerse = useCallback(
    (id, changes) => {
      const next = versesRef.current.map((v) => (v.id === id ? { ...v, ...changes } : v));
      persist(next);
    },
    [persist]
  );

  /** Persist which practice-session step (and Fade round) a verse is resuming at. */
  const updateStep = useCallback(
    (id, { currentStep, fadeRound } = {}) => {
      const changes = {};
      if (currentStep !== undefined) changes.currentStep = currentStep;
      if (fadeRound !== undefined) changes.fadeRound = fadeRound;
      if (Object.keys(changes).length > 0) updateVerse(id, changes);
    },
    [updateVerse]
  );

  const recordHint = useCallback(
    (id) => {
      const current = versesRef.current.find((v) => v.id === id);
      if (!current) return;
      updateVerse(id, { hintCount: (current.hintCount || 0) + 1 });
    },
    [updateVerse]
  );

  const recordBuildError = useCallback(
    (id) => {
      const current = versesRef.current.find((v) => v.id === id);
      if (!current) return;
      updateVerse(id, { errorCount: (current.errorCount || 0) + 1 });
    },
    [updateVerse]
  );

  /**
   * Grade the Recall step. AGAIN sends the verse back into learning to be
   * re-practiced (Fade -> Build -> Recall) the same day; HARD/GOOD/EASY
   * schedule the next day-level review and park the verse at the Recall
   * step, ready to be shown with just reference + English next time.
   */
  const recordReview = useCallback(
    (id, rating) => {
      const current = versesRef.current.find((v) => v.id === id);
      if (!current) return;
      const now = new Date();
      const nextSchedule = scheduleReview(current, rating, now);
      const changes =
        rating === RATINGS.AGAIN
          ? { ...nextSchedule, currentStep: STEP.FADE, fadeRound: 0 }
          : { ...nextSchedule, currentStep: STEP.RECALL, fadeRound: 0 };
      updateVerse(id, changes);
      logActivity(ACTIVITY_TYPES.VERSE_REVIEW);
    },
    [updateVerse, logActivity]
  );

  const logPracticeStep = useCallback(() => {
    logActivity(ACTIVITY_TYPES.VERSE_PRACTICE);
  }, [logActivity]);

  const stats = useMemo(() => computeMemoryStats(verses), [verses]);

  const value = useMemo(
    () => ({
      verses,
      loaded,
      addVerse,
      removeVerse,
      hasVerse,
      stats,
      updateStep,
      recordHint,
      recordBuildError,
      recordReview,
      logPracticeStep,
    }),
    [verses, loaded, addVerse, removeVerse, hasVerse, stats, updateStep, recordHint, recordBuildError, recordReview, logPracticeStep]
  );

  return <MemoryVerseContext.Provider value={value}>{children}</MemoryVerseContext.Provider>;
}

export const useMemoryVerses = () => {
  const context = useContext(MemoryVerseContext);
  if (!context) {
    throw new Error('useMemoryVerses must be used within a MemoryVerseProvider');
  }
  return context;
};

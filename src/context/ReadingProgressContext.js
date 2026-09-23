// Tracks which Bible chapters the user has read, persisted locally.
//
// useReadingProgress() returns:
//   readChapters               - { 'JHN:3': isoTimestamp, ... } raw map
//   loaded                     - true once AsyncStorage has been read
//   isChapterRead(book, ch)    - bool
//   markChapterRead(book, ch)  - marks read (idempotent); logs
//                                 ACTIVITY_TYPES.CHAPTER_READ the first time only
//   unmarkChapterRead(book, ch)
//   toggleChapterRead(book, ch)
//   getBookProgress(book)      -> { read, total, fraction }
//   overall                    -> { read, total, fraction, booksCompleted,
//                                    oldTestament: { read, total },
//                                    newTestament: { read, total } }
//
// Persisted under `@learnarabic_reading_progress`. Pure computations live in
// src/utils/readingProgress.js.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActivity } from './ActivityContext';
import { ACTIVITY_TYPES } from '../utils/activityStats';
import {
  computeOverallProgress,
  getBookProgress as getBookProgressHelper,
  isChapterRead as isChapterReadHelper,
  markChapterRead as markChapterReadHelper,
  sanitizeReadChapters,
  unmarkChapterRead as unmarkChapterReadHelper,
} from '../utils/readingProgress';

export const READING_PROGRESS_KEY = '@learnarabic_reading_progress';

const ReadingProgressContext = createContext(null);

export function ReadingProgressProvider({ children }) {
  const { logActivity } = useActivity();
  const [readChapters, setReadChapters] = useState({});
  const [loaded, setLoaded] = useState(false);
  const readChaptersRef = useRef(readChapters);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(READING_PROGRESS_KEY)
      .then((stored) => {
        if (cancelled || !stored) return;
        const sanitized = sanitizeReadChapters(JSON.parse(stored));
        readChaptersRef.current = sanitized;
        setReadChapters(sanitized);
      })
      .catch((error) => console.error('Failed to load reading progress:', error))
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next) => {
    readChaptersRef.current = next;
    setReadChapters(next);
    AsyncStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(next)).catch((error) =>
      console.error('Failed to save reading progress:', error)
    );
  }, []);

  const markChapterRead = useCallback(
    (book, chapter) => {
      const wasRead = isChapterReadHelper(readChaptersRef.current, book, chapter);
      const next = markChapterReadHelper(readChaptersRef.current, book, chapter);
      if (next !== readChaptersRef.current) {
        persist(next);
        if (!wasRead) logActivity(ACTIVITY_TYPES.CHAPTER_READ);
      }
    },
    [persist, logActivity]
  );

  const unmarkChapterRead = useCallback(
    (book, chapter) => {
      const next = unmarkChapterReadHelper(readChaptersRef.current, book, chapter);
      if (next !== readChaptersRef.current) persist(next);
    },
    [persist]
  );

  const toggleChapterRead = useCallback(
    (book, chapter) => {
      if (isChapterReadHelper(readChaptersRef.current, book, chapter)) {
        unmarkChapterRead(book, chapter);
      } else {
        markChapterRead(book, chapter);
      }
    },
    [markChapterRead, unmarkChapterRead]
  );

  const isChapterRead = useCallback((book, chapter) => isChapterReadHelper(readChapters, book, chapter), [
    readChapters,
  ]);

  const getBookProgress = useCallback((book) => getBookProgressHelper(readChapters, book), [readChapters]);

  const overall = useMemo(() => computeOverallProgress(readChapters), [readChapters]);

  const value = useMemo(
    () => ({
      readChapters,
      loaded,
      isChapterRead,
      markChapterRead,
      unmarkChapterRead,
      toggleChapterRead,
      getBookProgress,
      overall,
    }),
    [readChapters, loaded, isChapterRead, markChapterRead, unmarkChapterRead, toggleChapterRead, getBookProgress, overall]
  );

  return <ReadingProgressContext.Provider value={value}>{children}</ReadingProgressContext.Provider>;
}

export const useReadingProgress = () => {
  const context = useContext(ReadingProgressContext);
  if (!context) {
    throw new Error('useReadingProgress must be used within a ReadingProgressProvider');
  }
  return context;
};

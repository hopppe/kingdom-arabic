import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@learnarabic_bookmarks';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const bookmarksRef = useRef(bookmarks);

  // Keep ref in sync
  useEffect(() => {
    bookmarksRef.current = bookmarks;
  }, [bookmarks]);

  // Load bookmarks from storage
  const loadBookmarks = useCallback(async () => {
    if (initialized) return;
    setInitialized(true);
    try {
      const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setBookmarks(parsed);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      setBookmarks([]);
    }
  }, [initialized]);

  // Save bookmarks to storage
  const saveBookmarks = useCallback(async (newBookmarks) => {
    try {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // Check if a verse is already bookmarked
  const isBookmarked = useCallback((book, chapter, verse) => {
    return bookmarksRef.current.some(
      b => b.book === book && b.chapter === chapter && b.verse === verse
    );
  }, []);

  // Add a bookmark
  const addBookmark = useCallback(async (bookmark) => {
    // bookmark: { book, chapter, verse, verseTextArabic, verseTextEnglish }
    const { book, chapter, verse } = bookmark;

    // Check if already exists
    if (isBookmarked(book, chapter, verse)) {
      return { success: false, alreadyExists: true };
    }

    const newBookmark = {
      ...bookmark,
      id: `${book}-${chapter}-${verse}`,
      createdAt: new Date().toISOString(),
    };

    const updatedBookmarks = [newBookmark, ...bookmarksRef.current];
    setBookmarks(updatedBookmarks);
    await saveBookmarks(updatedBookmarks);

    return { success: true, alreadyExists: false };
  }, [isBookmarked, saveBookmarks]);

  // Remove a bookmark
  const removeBookmark = useCallback(async (bookmarkId) => {
    const updatedBookmarks = bookmarksRef.current.filter(b => b.id !== bookmarkId);
    setBookmarks(updatedBookmarks);
    await saveBookmarks(updatedBookmarks);
  }, [saveBookmarks]);

  // Get recent bookmarks (last N)
  const getRecentBookmarks = useCallback((count = 3) => {
    return bookmarksRef.current.slice(0, count);
  }, []);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    getRecentBookmarks,
    loadBookmarks,
  };
};

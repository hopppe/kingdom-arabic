import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { setAudioModeAsync } from 'expo-audio';
import { useTheme } from '../../context/ThemeContext';
import { useFlashcards } from '../../context/FlashcardContext';
import { BOOKS, getBookName } from '../../data/bibleData';
import { getChapter } from '../../data/bibleRepository';
import { useBibleDb } from '../../context/BibleDbContext';
import { createStyles } from '../BibleReaderScreen.styles';
import { ChapterSelector } from './ChapterSelector';
import { SavedWordsPanel } from './SavedWordsPanel';
import { SettingsModal } from './SettingsModal';
import { VerseActionsModal } from './VerseActionsModal';
import { ReaderHeader } from './ReaderHeader';
import { WordTooltip } from './WordTooltip';
import WordStudyModal from './WordStudy/WordStudyModal';
import { AllBookmarksModal } from './AllBookmarksModal';
import { HelpModal } from './HelpModal';
import { SearchModal } from './SearchModal';
import { useBibleReader, stripPunctuation } from '../../hooks/useBibleReader';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useMemoryVerses } from '../../context/MemoryVerseContext';
import { useReadingProgress } from '../../context/ReadingProgressContext';
import { ROUTES } from '../../navigation/routes';
import { getReaderLayout } from '../../utils/layout';
import { IS_TABLET } from '../../navigation/device';
import GlassSurface from '../../components/glass/GlassSurface';

// How close (px) to the bottom of a chapter counts as having read it.
const END_OF_CHAPTER_THRESHOLD = 150;

export default function BibleReaderScreen({ navigation }) {
  const { theme } = useTheme();
  const db = useBibleDb();
  const { addMultipleFlashcards, flashcards } = useFlashcards();
  const { addVerse: addMemoryVerse, hasVerse: isMemoryVerse } = useMemoryVerses();
  const { markChapterRead } = useReadingProgress();

  // Storage key for reading position
  const READING_POSITION_KEY = '@learnarabic_reading_position';

  // Current chapter state (default to John 1 for first-time users)
  const [currentBook, setCurrentBook] = useState('JHN');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapter, setChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedPosition, setHasLoadedPosition] = useState(false);

  // Scroll offset to restore once the saved chapter has loaded (app relaunch).
  const restoreOffsetRef = useRef(0);

  // Load saved reading position on mount
  useEffect(() => {
    const loadReadingPosition = async () => {
      try {
        const saved = await AsyncStorage.getItem(READING_POSITION_KEY);
        if (saved) {
          const { book, chapter: savedChapter, offsetY } = JSON.parse(saved);
          if (book && savedChapter) {
            setCurrentBook(book);
            setCurrentChapter(savedChapter);
            restoreOffsetRef.current = Number(offsetY) > 0 ? Number(offsetY) : 0;
          }
        }
      } catch (error) {
        console.error('Failed to load reading position:', error);
      } finally {
        setHasLoadedPosition(true);
      }
    };
    loadReadingPosition();
  }, []);

  // Save reading position whenever it changes
  useEffect(() => {
    if (!hasLoadedPosition) return; // Don't save until we've loaded the initial position
    const saveReadingPosition = async () => {
      try {
        await AsyncStorage.setItem(
          READING_POSITION_KEY,
          // Keep a not-yet-restored offset from the last session; new chapters start at the top.
          JSON.stringify({ book: currentBook, chapter: currentChapter, offsetY: restoreOffsetRef.current })
        );
      } catch (error) {
        console.error('Failed to save reading position:', error);
      }
    };
    saveReadingPosition();
  }, [currentBook, currentChapter, hasLoadedPosition]);

  // UI state
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [expandedBook, setExpandedBook] = useState(null);
  const [showTranslations, setShowTranslations] = useState(false);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [verseActions, setVerseActions] = useState(null);
  const [wordStudy, setWordStudy] = useState(null);
  const [showAllBookmarks, setShowAllBookmarks] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [hasSeenHelp, setHasSeenHelp] = useState(true); // Start true to prevent flash
  // { book, chapter, verse } to scroll to once that chapter has loaded (search, word study).
  const [targetVerse, setTargetVerse] = useState(null);
  const [loadedChapterKey, setLoadedChapterKey] = useState(null);

  // Bookmarks hook
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  // Check if first app open and show help
  const HELP_SEEN_KEY = '@learnarabic_help_seen';
  useEffect(() => {
    const checkFirstOpen = async () => {
      try {
        const seen = await AsyncStorage.getItem(HELP_SEEN_KEY);
        if (!seen) {
          setHasSeenHelp(false);
          setShowHelpModal(true);
          await AsyncStorage.setItem(HELP_SEEN_KEY, 'true');
        }
      } catch (error) {
        console.error('Failed to check help seen:', error);
      }
    };
    checkFirstOpen();
  }, []);

  // Speak Arabic verse text
  const speakVerse = useCallback(async (verseIndex) => {
    const verseText = chapter?.data?.content_arabic?.[verseIndex];
    if (!verseText) return;

    // Stop any currently playing speech
    Speech.stop();

    try {
      // Configure audio to play even in silent mode
      await setAudioModeAsync({
        playsInSilentMode: true,
      });

      const voices = await Speech.getAvailableVoicesAsync();
      const arabicVoice = voices.find(v => v.language?.startsWith('ar'));

      if (!arabicVoice) {
        Alert.alert('TTS Not Available', 'Your device does not support Arabic text-to-speech.');
        return;
      }

      Speech.speak(verseText, { language: 'ar' });
    } catch (error) {
      console.error('Failed to speak verse:', error);
    }
  }, [chapter]);

  // Ref for scrolling to verse
  const scrollViewRef = useRef(null);
  const verseRefs = useRef({});
  const scrollPositionRef = useRef(0);
  const topVisibleVerseRef = useRef(0);

  // Track scroll position and find top visible verse
  // Only the reader's own scrolling counts toward "read" — not jumps to a
  // verse from search or word study.
  const userScrolledRef = useRef(false);
  useEffect(() => {
    userScrolledRef.current = false;
  }, [currentBook, currentChapter]);

  // Remember where in the chapter the reader stopped, so relaunching returns there.
  const saveScrollOffset = useCallback(() => {
    AsyncStorage.setItem(
      READING_POSITION_KEY,
      JSON.stringify({ book: currentBook, chapter: currentChapter, offsetY: Math.round(scrollPositionRef.current) })
    ).catch((error) => console.error('Failed to save reading position:', error));
  }, [currentBook, currentChapter]);

  const handleScroll = useCallback((event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    scrollPositionRef.current = contentOffset.y;
    const reachedEnd = contentOffset.y + layoutMeasurement.height >= contentSize.height - END_OF_CHAPTER_THRESHOLD;
    if (reachedEnd && userScrolledRef.current && chapter) {
      markChapterRead(currentBook, currentChapter);
    }
  }, [chapter, currentBook, currentChapter, markChapterRead]);

  // Toggle translations while keeping the same verse visible
  const handleToggleTranslations = useCallback(() => {
    // Find current top verse synchronously using stored measurements
    const currentScrollY = scrollPositionRef.current;
    topVisibleVerseRef.current = 0;

    // Measure all verses to find which one is at the top
    const versePromises = Object.entries(verseRefs.current).map(([index, ref]) => {
      return new Promise((resolve) => {
        if (ref && scrollViewRef.current) {
          ref.measureLayout(
            scrollViewRef.current,
            (x, y) => resolve({ index: parseInt(index, 10), y }),
            () => resolve(null)
          );
        } else {
          resolve(null);
        }
      });
    });

    Promise.all(versePromises).then((measurements) => {
      const validMeasurements = measurements.filter(m => m !== null);
      // Find verse closest to top of viewport
      let topVerse = 0;
      for (const m of validMeasurements) {
        if (m.y <= currentScrollY + 100) {
          topVerse = Math.max(topVerse, m.index);
        }
      }
      topVisibleVerseRef.current = topVerse;

      // Toggle translations
      setShowTranslations(prev => !prev);

      // After layout updates, scroll back to the same verse
      setTimeout(() => {
        const verseRef = verseRefs.current[topVisibleVerseRef.current];
        if (verseRef && scrollViewRef.current) {
          verseRef.measureLayout(
            scrollViewRef.current,
            (x, y) => {
              scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 10), animated: false });
            },
            () => {}
          );
        }
      }, 50);
    });
  }, []);

  // Use custom hook for word interactions
  const {
    activeWord,
    setActiveWord,
    savedWords,
    setSavedWords,
    savedWordsSet,
    handleWordPress,
    handleGlobalTap,
    findGlossEntry,
  } = useBibleReader(chapter, currentBook, currentChapter);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Tablets show English beside Arabic instead of beneath it.
  const { width: windowWidth } = useWindowDimensions();
  const readerLayout = getReaderLayout(windowWidth, showTranslations);

  // Set of Arabic words already in flashcards
  const flashcardWordsSet = useMemo(() => {
    return new Set(flashcards.map(card => stripPunctuation(card.arabic)));
  }, [flashcards]);

  // Load chapter data. Only the most recent request may update state, so
  // quickly flipping chapters can't leave an older chapter on screen.
  const latestLoadRef = useRef(null);
  const loadCurrentChapter = useCallback(async () => {
    const requestKey = `${currentBook}:${currentChapter}`;
    latestLoadRef.current = requestKey;
    setIsLoading(true);
    try {
      const data = await getChapter(db, currentBook, currentChapter);
      if (latestLoadRef.current !== requestKey) return;
      setChapter(data);
      setLoadedChapterKey(requestKey);
    } catch (error) {
      console.error('Failed to load chapter:', error);
    } finally {
      if (latestLoadRef.current === requestKey) setIsLoading(false);
    }
  }, [db, currentBook, currentChapter]);

  useEffect(() => {
    if (!hasLoadedPosition) return; // Wait until we've loaded the saved position
    // Defer one frame so the chapter change paints before the load starts.
    const frame = requestAnimationFrame(() => {
      loadCurrentChapter();
    });
    return () => cancelAnimationFrame(frame);
  }, [loadCurrentChapter, hasLoadedPosition]);

  // Chapter navigation
  const handleChapterSelect = useCallback((bookId, chapterNum) => {
    setCurrentBook(bookId);
    setCurrentChapter(chapterNum);
    setShowChapterSelector(false);
    setExpandedBook(null);
    setActiveWord(null);
  }, [setActiveWord]);

  const navigateChapter = useCallback((direction) => {
    const bookObj = BOOKS.find(b => b.id === currentBook);
    if (!bookObj) return;

    const currentIndex = bookObj.chapters.indexOf(currentChapter);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < bookObj.chapters.length) {
      if (direction > 0) markChapterRead(currentBook, currentChapter);
      setCurrentChapter(bookObj.chapters[newIndex]);
      setActiveWord(null);
    }
  }, [currentBook, currentChapter, setActiveWord, markChapterRead]);

  const canNavigatePrev = useCallback(() => {
    const bookObj = BOOKS.find(b => b.id === currentBook);
    if (!bookObj) return false;
    return bookObj.chapters.indexOf(currentChapter) > 0;
  }, [currentBook, currentChapter]);

  const canNavigateNext = useCallback(() => {
    const bookObj = BOOKS.find(b => b.id === currentBook);
    if (!bookObj) return false;
    return bookObj.chapters.indexOf(currentChapter) < bookObj.chapters.length - 1;
  }, [currentBook, currentChapter]);

  const handleAddToFlashcards = useCallback(async () => {
    if (savedWords.length === 0) {
      Alert.alert('No Words', 'Tap on Arabic words to save them first.');
      return;
    }

    const result = await addMultipleFlashcards(savedWords);

    if (result.added > 0 || result.updated > 0) {
      let message = '';
      if (result.added > 0 && result.updated > 0) {
        message = `Added ${result.added} new word${result.added === 1 ? '' : 's'} and updated ${result.updated} existing word${result.updated === 1 ? '' : 's'}!`;
      } else if (result.added > 0) {
        message = `Added ${result.added} word${result.added === 1 ? '' : 's'} to flashcards!`;
      } else {
        message = `Updated ${result.updated} word${result.updated === 1 ? '' : 's'} in flashcards!`;
      }
      Alert.alert('Success', message);
      setSavedWords([]);
      setActiveWord(null);
    } else {
      Alert.alert('Info', 'All words are already in your flashcards with the same translations.');
    }
    setShowSavedPanel(false);
  }, [savedWords, addMultipleFlashcards, setSavedWords]);

  const handleUpdateTranslation = useCallback((timestamp, newTranslation) => {
    setSavedWords(prevWords =>
      prevWords.map(word =>
        word.timestamp === timestamp
          ? { ...word, translation: newTranslation }
          : word
      )
    );
  }, [setSavedWords]);

  // Handle verse number tap to play audio
  const handleVerseNumberTap = useCallback((verseIndex) => {
    speakVerse(verseIndex);
  }, [speakVerse]);

  // Long-pressing a verse number opens the verse actions sheet.
  const handleVerseNumberLongPress = useCallback((verseIndex) => {
    const verse = chapter?.data?.verse_numbers?.[verseIndex] ?? verseIndex + 1;
    setVerseActions({
      book: currentBook,
      chapter: currentChapter,
      verse,
      verseIndex,
      verseTextArabic: chapter?.data?.content_arabic?.[verseIndex] || '',
      verseTextEnglish: chapter?.data?.content_english?.[verseIndex] || '',
    });
  }, [chapter, currentBook, currentChapter]);

  // Phones have no tab bar: the header opens the study screens instead.
  const openFlashcards = useMemo(
    () => (IS_TABLET ? undefined : () => navigation.navigate(ROUTES.FLASHCARDS)),
    [navigation]
  );
  const openMemorize = useMemo(
    () => (IS_TABLET ? undefined : () => navigation.navigate(ROUTES.MEMORIZE)),
    [navigation]
  );

  const closeVerseActions = useCallback(() => setVerseActions(null), []);

  const handleBookmarkVerse = useCallback(async () => {
    if (verseActions) {
      const { verseIndex, ...bookmark } = verseActions;
      await addBookmark(bookmark);
    }
    setVerseActions(null);
  }, [verseActions, addBookmark]);

  const handleMemorizeVerse = useCallback(async () => {
    if (!verseActions) return;
    const { book, chapter: chapterNum, verse } = verseActions;
    setVerseActions(null);
    const result = await addMemoryVerse({ book, chapter: chapterNum, verse });
    if (result.error) {
      Alert.alert('Could not add verse', result.error);
      return;
    }
    Alert.alert(
      result.alreadyExists ? 'Already memorizing' : 'Added to memory verses',
      'Practice it any time in the Memorize tab.',
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Practice now',
          onPress: () => navigation.navigate(ROUTES.MEMORIZE, { practiceVerseId: `${book}-${chapterNum}-${verse}` }),
        },
      ]
    );
  }, [verseActions, addMemoryVerse, navigation]);

  const handleListenVerse = useCallback(() => {
    if (verseActions) speakVerse(verseActions.verseIndex);
    setVerseActions(null);
  }, [verseActions, speakVerse]);

  // Long-pressing a word (or tapping its tooltip) opens word study.
  const openWordStudy = useCallback((word, verseIndex) => {
    const entry = findGlossEntry(word, verseIndex);
    if (!entry) return;
    setActiveWord(null);
    setWordStudy(entry);
  }, [findGlossEntry, setActiveWord]);

  const openActiveWordStudy = useCallback(() => {
    if (activeWord) openWordStudy(activeWord.word, activeWord.verseIndex);
  }, [activeWord, openWordStudy]);

  // Navigate to bookmark
  const handleSelectBookmark = useCallback((bookmark) => {
    setCurrentBook(bookmark.book);
    setCurrentChapter(bookmark.chapter);
    setActiveWord(null);
    // Close any open modals
    setShowSettingsModal(false);
    setShowAllBookmarks(false);
    // Note: We could scroll to the specific verse after load, but for now we just navigate to the chapter
  }, [setActiveWord]);

  // Handle search result selection
  const handleSearchResult = useCallback((book, chapter, verse) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setTargetVerse({ book, chapter, verse });
    setActiveWord(null);
  }, [setActiveWord]);

  // Restore the saved scroll offset after the relaunched chapter renders.
  useEffect(() => {
    if (!chapter || restoreOffsetRef.current <= 0) return undefined;
    const offsetY = restoreOffsetRef.current;
    restoreOffsetRef.current = 0;
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: offsetY, animated: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [chapter]);

  // Scroll to target verse after chapter loads
  useEffect(() => {
    if (!targetVerse || !chapter || isLoading || !scrollViewRef.current) return undefined;
    // Wait until the target's own chapter is on screen; the old one may still be showing.
    if (loadedChapterKey !== `${targetVerse.book}:${targetVerse.chapter}`) return undefined;
    // Wait for layout to complete
    const timer = setTimeout(() => {
      const verseIndex = chapter.data.verse_numbers?.indexOf(targetVerse.verse) ?? targetVerse.verse - 1;
      const verseRef = verseRefs.current[verseIndex];
      if (verseRef) {
        verseRef.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: true });
          },
          () => {} // Error callback
        );
      }
      setTargetVerse(null);
    }, 300);
    return () => clearTimeout(timer);
  }, [targetVerse, chapter, isLoading, loadedChapterKey]);

  // Each word is a tappable span inside one Text per verse. Nested Text is far
  // cheaper than a View + Pressable per word (a chapter has ~1,000 words) and
  // lets Arabic wrap and justify like normal running text.
  //
  // The space after a word lives inside that word's span (unhighlighted). On
  // Android, a bare space owned by the verse would win taps near a word's edge
  // and swallow them.
  const renderWord = (token, wordIndex, verseIndex) => {
    const word = token.trimEnd();
    const gap = token.slice(word.length);

    const wordId = `${verseIndex}-${wordIndex}`;
    const isActive = activeWord?.id === wordId;
    const bareWord = stripPunctuation(word);
    const isSaved = savedWordsSet.has(bareWord);
    const isInFlashcards = flashcardWordsSet.has(bareWord);

    return (
      <Text
        key={wordIndex}
        onPress={(event) => handleWordPress(word, verseIndex, event, wordIndex)}
        onLongPress={() => openWordStudy(word, verseIndex)}
        suppressHighlighting
      >
        <Text
          style={[
            isInFlashcards && !isActive && !isSaved && styles.flashcardWordContainer,
            isSaved && !isActive && styles.savedWordContainer,
            isActive && styles.activeWordContainer,
            isActive && styles.activeWordText,
          ]}
        >
          {word}
        </Text>
        {gap}
      </Text>
    );
  };

  // Render verse component
  const renderVerse = (verseText, verseIndex) => {
    // Each token is a word plus the whitespace after it (see renderWord).
    const words = verseText.match(/\S+\s*/g) || [];
    const verseNum = chapter?.data?.verse_numbers?.[verseIndex] ?? verseIndex + 1;
    const verseIsBookmarked = isBookmarked(currentBook, currentChapter, verseNum);
    const arabicWords = words.map((word, wordIndex) => renderWord(word, wordIndex, verseIndex));
    const englishText = chapter?.data?.content_english?.[verseIndex] ?? '';

    return (
      <View
        style={styles.verseContainer}
        key={verseIndex}
        ref={(ref) => { verseRefs.current[verseIndex] = ref; }}
      >
        <View style={styles.paragraphWithNumber}>
          {readerLayout.sideBySide ? (
            <View style={[styles.paragraph, styles.sideBySideRow]}>
              <Text style={[styles.englishText, styles.englishSideBySide, styles.sideBySideColumn]}>
                {englishText}
              </Text>
              <Text style={[styles.arabicVerse, styles.sideBySideColumn]}>{arabicWords}</Text>
            </View>
          ) : (
            <View style={styles.paragraph}>
              <Text style={styles.arabicVerse}>{arabicWords}</Text>
              {showTranslations && <Text style={styles.englishText}>{englishText}</Text>}
            </View>
          )}
          <TouchableOpacity
            onPress={() => handleVerseNumberTap(verseIndex)}
            onLongPress={() => handleVerseNumberLongPress(verseIndex)}
            delayLongPress={400}
            style={styles.verseNumberTouchable}
          >
            <Text style={[styles.verseNumber, verseIsBookmarked && styles.bookmarkedVerseText]}>
              {verseNum}
            </Text>
            {verseIsBookmarked && (
              <Ionicons name="bookmark" size={10} color={theme.colors.primary} style={styles.bookmarkIcon} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Loading state
  if (isLoading || !chapter) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ReaderHeader
          currentBook={currentBook}
          currentChapter={currentChapter}
          showTranslations={showTranslations}
          onToggleTranslations={handleToggleTranslations}
          setShowChapterSelector={setShowChapterSelector}
          setShowSettingsModal={setShowSettingsModal}
          onOpenFlashcards={openFlashcards}
          onOpenMemorize={openMemorize}
          theme={theme}
          styles={styles}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>
            Loading {getBookName(currentBook)} {currentChapter}...
          </Text>
        </View>
        <ChapterSelector
          visible={showChapterSelector}
          onClose={() => setShowChapterSelector(false)}
          currentBook={currentBook}
          currentChapter={currentChapter}
          expandedBook={expandedBook}
          setExpandedBook={setExpandedBook}
          onChapterSelect={handleChapterSelect}
          theme={theme}
          styles={styles}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ReaderHeader
        currentBook={currentBook}
        currentChapter={currentChapter}
        showTranslations={showTranslations}
        onToggleTranslations={handleToggleTranslations}
        setShowChapterSelector={setShowChapterSelector}
        setShowSettingsModal={setShowSettingsModal}
        onOpenFlashcards={openFlashcards}
        onOpenMemorize={openMemorize}
        theme={theme}
        styles={styles}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollEndDrag={saveScrollOffset}
        onMomentumScrollEnd={saveScrollOffset}
        onScrollBeginDrag={() => {
          userScrolledRef.current = true;
          setActiveWord(null);
        }}
      >
        <Pressable onPress={handleGlobalTap}>
          <View style={[styles.storyContent, { maxWidth: readerLayout.maxWidth }]}>
            <Text style={styles.storyTitle}>{chapter.data.title_arabic}</Text>
            <Text style={styles.storyTitleEnglish}>
              {getBookName(currentBook)} {currentChapter}
            </Text>

            {chapter.data.content_arabic.map((verseText, index) => renderVerse(verseText, index))}
          </View>
        </Pressable>
      </ScrollView>

      {activeWord && (
        <WordTooltip activeWord={activeWord} theme={theme} styles={styles} onPress={openActiveWordStudy} />
      )}

      <View style={styles.bottomButtonRow}>
        <GlassSurface style={[styles.navButton, !canNavigatePrev() && { opacity: 0.3 }]} interactive>
          <Pressable
            style={styles.navButtonPressable}
            onPress={() => navigateChapter(-1)}
            disabled={!canNavigatePrev()}
            accessibilityRole="button"
            accessibilityLabel="Previous chapter"
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </Pressable>
        </GlassSurface>

        <GlassSurface style={styles.learnedWordsButton} interactive>
          <Pressable style={styles.learnedWordsPressable} onPress={() => setShowSavedPanel(true)} accessibilityRole="button">
            <Text style={styles.learnedWordsButtonText}>
              Saved Words ({savedWords.length})
            </Text>
          </Pressable>
        </GlassSurface>

        <GlassSurface style={[styles.navButton, !canNavigateNext() && { opacity: 0.3 }]} interactive>
          <Pressable
            style={styles.navButtonPressable}
            onPress={() => navigateChapter(1)}
            disabled={!canNavigateNext()}
            accessibilityRole="button"
            accessibilityLabel="Next chapter"
          >
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
          </Pressable>
        </GlassSurface>
      </View>

      <ChapterSelector
        visible={showChapterSelector}
        onClose={() => setShowChapterSelector(false)}
        currentBook={currentBook}
        currentChapter={currentChapter}
        expandedBook={expandedBook}
        setExpandedBook={setExpandedBook}
        onChapterSelect={handleChapterSelect}
        theme={theme}
        styles={styles}
      />

      <SavedWordsPanel
        visible={showSavedPanel}
        onClose={() => setShowSavedPanel(false)}
        savedWords={savedWords}
        onAddToFlashcards={handleAddToFlashcards}
        onClearAll={() => setSavedWords([])}
        onRemoveWord={(timestamp) => setSavedWords(savedWords.filter(w => w.timestamp !== timestamp))}
        onUpdateTranslation={handleUpdateTranslation}
        styles={styles}
      />

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        styles={styles}
        bookmarks={bookmarks}
        onShowAllBookmarks={() => {
          setShowSettingsModal(false);
          setShowAllBookmarks(true);
        }}
        onSelectBookmark={handleSelectBookmark}
        onShowHelp={() => setShowHelpModal(true)}
        onShowSearch={() => setShowSearchModal(true)}
        showProgress={!IS_TABLET}
        onOpenFlashcards={openFlashcards}
        onOpenMemorize={openMemorize}
      />

      <VerseActionsModal
        visible={Boolean(verseActions)}
        onClose={closeVerseActions}
        verse={verseActions}
        isBookmarked={verseActions ? isBookmarked(verseActions.book, verseActions.chapter, verseActions.verse) : false}
        isMemorizing={verseActions ? isMemoryVerse(verseActions.book, verseActions.chapter, verseActions.verse) : false}
        onBookmark={handleBookmarkVerse}
        onMemorize={handleMemorizeVerse}
        onListen={handleListenVerse}
      />

      <WordStudyModal
        visible={Boolean(wordStudy)}
        word={wordStudy}
        onClose={() => setWordStudy(null)}
        onSelectVerse={handleSearchResult}
      />

      <AllBookmarksModal
        visible={showAllBookmarks}
        onClose={() => setShowAllBookmarks(false)}
        bookmarks={bookmarks}
        onSelectBookmark={handleSelectBookmark}
        onDeleteBookmark={removeBookmark}
      />

      <HelpModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectResult={handleSearchResult}
      />
    </SafeAreaView>
  );
}

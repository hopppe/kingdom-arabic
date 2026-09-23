import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  InteractionManager,
  ActivityIndicator,
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
import { useBibleReader } from '../../hooks/useBibleReader';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useMemoryVerses } from '../../context/MemoryVerseContext';
import { useReadingProgress } from '../../context/ReadingProgressContext';
import { ROUTES } from '../../navigation/routes';

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

  // Load saved reading position on mount
  useEffect(() => {
    const loadReadingPosition = async () => {
      try {
        const saved = await AsyncStorage.getItem(READING_POSITION_KEY);
        if (saved) {
          const { book, chapter: savedChapter } = JSON.parse(saved);
          if (book && savedChapter) {
            setCurrentBook(book);
            setCurrentChapter(savedChapter);
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
          JSON.stringify({ book: currentBook, chapter: currentChapter })
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
  const [targetVerse, setTargetVerse] = useState(null); // For scroll-to-verse after search

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
  const handleScroll = useCallback((event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    scrollPositionRef.current = contentOffset.y;
    const reachedEnd = contentOffset.y + layoutMeasurement.height >= contentSize.height - END_OF_CHAPTER_THRESHOLD;
    if (reachedEnd && contentOffset.y > 0 && chapter) {
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

  // Set of Arabic words already in flashcards
  const flashcardWordsSet = useMemo(() => {
    return new Set(flashcards.map(card => card.arabic));
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
    } catch (error) {
      console.error('Failed to load chapter:', error);
    } finally {
      if (latestLoadRef.current === requestKey) setIsLoading(false);
    }
  }, [db, currentBook, currentChapter]);

  useEffect(() => {
    if (!hasLoadedPosition) return; // Wait until we've loaded the saved position
    const task = InteractionManager.runAfterInteractions(() => {
      loadCurrentChapter();
    });
    return () => task.cancel();
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
        { text: 'Practice now', onPress: () => navigation.navigate(ROUTES.MEMORIZE) },
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
    setTargetVerse(verse);
    setActiveWord(null);
  }, [setActiveWord]);

  // Scroll to target verse after chapter loads
  useEffect(() => {
    if (targetVerse && chapter && scrollViewRef.current) {
      // Wait for layout to complete
      const timer = setTimeout(() => {
        const verseIndex = targetVerse - 1;
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
    }
  }, [targetVerse, chapter]);

  // Render word component
  const renderWord = (word, wordIndex, verseIndex) => {
    if (/^\s+$/.test(word) || !word.trim()) {
      return <Text key={wordIndex} style={styles.arabicText}>{word}</Text>;
    }

    const wordId = `${verseIndex}-${word}`;
    const isActive = activeWord?.id === wordId;
    const isSaved = savedWordsSet.has(word);
    const isInFlashcards = flashcardWordsSet.has(word);

    return (
      <View key={wordIndex} style={styles.wordWrapper}>
        <Pressable
          onPress={(event) => handleWordPress(word, verseIndex, event)}
          onLongPress={() => openWordStudy(word, verseIndex)}
          delayLongPress={350}
          style={[
            styles.wordTouchable,
            isInFlashcards && !isActive && !isSaved && styles.flashcardWordContainer,
            isSaved && !isActive && styles.savedWordContainer,
            isActive && styles.activeWordContainer,
          ]}
        >
          <Text style={[
            styles.arabicText,
            isActive && styles.activeWordText,
            isSaved && !isActive && styles.savedWordText,
          ]}>
            {word}
          </Text>
        </Pressable>
      </View>
    );
  };

  // Render verse component
  const renderVerse = (verseText, verseIndex) => {
    const words = verseText.split(/(\s+)/);
    const verseNum = chapter?.data?.verse_numbers?.[verseIndex] ?? verseIndex + 1;
    const verseIsBookmarked = isBookmarked(currentBook, currentChapter, verseNum);

    return (
      <View
        style={styles.verseContainer}
        key={verseIndex}
        ref={(ref) => { verseRefs.current[verseIndex] = ref; }}
      >
        <View style={styles.paragraphWithNumber}>
          <View style={styles.paragraph}>
            <View style={styles.arabicContainer}>
              {words.map((word, wordIndex) => renderWord(word, wordIndex, verseIndex))}
            </View>

            {showTranslations && chapter && (
              <Text style={styles.englishText}>
                {chapter.data.content_english[verseIndex]}
              </Text>
            )}
          </View>
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
        onScrollBeginDrag={() => setActiveWord(null)}
      >
        <Pressable onPress={handleGlobalTap}>
          <View style={styles.storyContent}>
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
        <TouchableOpacity
          style={[styles.navButton, !canNavigatePrev() && { opacity: 0.3 }]}
          onPress={() => navigateChapter(-1)}
          disabled={!canNavigatePrev()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.learnedWordsButton}
          onPress={() => setShowSavedPanel(true)}
        >
          <Text style={styles.learnedWordsButtonText}>
            View Saved Words ({savedWords.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !canNavigateNext() && { opacity: 0.3 }]}
          onPress={() => navigateChapter(1)}
          disabled={!canNavigateNext()}
        >
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </TouchableOpacity>
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

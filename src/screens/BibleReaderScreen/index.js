import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  Dimensions,
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
import { BOOKS, getBookName, loadChapterData } from '../../data/bibleData';
import { createStyles } from '../BibleReaderScreen.styles';
import { ChapterSelector } from './ChapterSelector';
import { SavedWordsPanel } from './SavedWordsPanel';
import { SettingsModal } from './SettingsModal';
import { BookmarkConfirmModal } from './BookmarkConfirmModal';
import { AllBookmarksModal } from './AllBookmarksModal';
import { HelpModal } from './HelpModal';
import { SearchModal } from './SearchModal';
import { useBibleReader } from '../../hooks/useBibleReader';
import { useBookmarks } from '../../hooks/useBookmarks';
import { loadChapterWithMappingType } from '../../utils/bibleLoader';

const { width: screenWidth} = Dimensions.get('window');

export default function BibleReaderScreen({ navigation }) {
  const { theme } = useTheme();
  const { addMultipleFlashcards, flashcards } = useFlashcards();

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
  const [showBookmarkConfirm, setShowBookmarkConfirm] = useState(false);
  const [showAllBookmarks, setShowAllBookmarks] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [pendingBookmark, setPendingBookmark] = useState(null);
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
  }, [chapter]);

  // Ref for scrolling to verse
  const scrollViewRef = useRef(null);
  const verseRefs = useRef({});
  const scrollPositionRef = useRef(0);
  const topVisibleVerseRef = useRef(0);

  // Track scroll position and find top visible verse
  const handleScroll = useCallback((event) => {
    scrollPositionRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  // Find which verse is currently at the top of the viewport
  const findTopVisibleVerse = useCallback(() => {
    const scrollY = scrollPositionRef.current;
    let topVerse = 0;

    // Find the verse closest to current scroll position
    Object.entries(verseRefs.current).forEach(([index, ref]) => {
      if (ref) {
        ref.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            if (y <= scrollY + 50) { // 50px buffer for header area
              topVerse = Math.max(topVerse, parseInt(index, 10));
            }
          },
          () => {}
        );
      }
    });

    return topVerse;
  }, []);

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
  } = useBibleReader(chapter, currentBook, currentChapter);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Set of Arabic words already in flashcards
  const flashcardWordsSet = useMemo(() => {
    return new Set(flashcards.map(card => card.arabic));
  }, [flashcards]);

  // Load chapter data
  const loadCurrentChapter = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await loadChapterWithMappingType(currentBook, currentChapter);
      setChapter(data);
    } catch (error) {
      console.error('Failed to load chapter:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentBook, currentChapter]);

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
      setCurrentChapter(bookObj.chapters[newIndex]);
      setActiveWord(null);
    }
  }, [currentBook, currentChapter, setActiveWord]);

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

  // Handle verse number long press for bookmark menu
  const handleVerseNumberLongPress = useCallback((verseIndex) => {
    const verse = verseIndex + 1;
    const verseTextArabic = chapter?.data?.content_arabic?.[verseIndex] || '';
    const verseTextEnglish = chapter?.data?.content_english?.[verseIndex] || '';

    const alreadyBookmarked = isBookmarked(currentBook, currentChapter, verse);

    setPendingBookmark({
      book: currentBook,
      chapter: currentChapter,
      verse,
      verseTextArabic,
      verseTextEnglish,
      alreadyBookmarked,
    });
    setShowBookmarkConfirm(true);
  }, [chapter, currentBook, currentChapter, isBookmarked]);

  // Confirm adding bookmark
  const handleConfirmBookmark = useCallback(async () => {
    if (pendingBookmark) {
      await addBookmark(pendingBookmark);
    }
    setShowBookmarkConfirm(false);
    setPendingBookmark(null);
  }, [pendingBookmark, addBookmark]);

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
    const verseNum = verseIndex + 1;
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
        <Header
          navigation={navigation}
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
      <Header
        navigation={navigation}
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

      {activeWord && <WordTooltip activeWord={activeWord} theme={theme} styles={styles} />}

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

      <BookmarkConfirmModal
        visible={showBookmarkConfirm}
        onClose={() => {
          setShowBookmarkConfirm(false);
          setPendingBookmark(null);
        }}
        onConfirm={handleConfirmBookmark}
        book={pendingBookmark?.book || ''}
        chapter={pendingBookmark?.chapter || 1}
        verse={pendingBookmark?.verse || 1}
        alreadyBookmarked={pendingBookmark?.alreadyBookmarked || false}
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

// Header component
const Header = ({
  navigation,
  currentBook,
  currentChapter,
  showTranslations,
  onToggleTranslations,
  setShowChapterSelector,
  setShowSettingsModal,
  theme,
  styles,
}) => (
  <View style={styles.headerBar}>
    <TouchableOpacity
      style={styles.referenceButton}
      onPress={() => setShowChapterSelector(true)}
    >
      <Text style={styles.referenceText}>
        {getBookName(currentBook)} {currentChapter}
      </Text>
      <Ionicons name="chevron-down" size={16} color={theme.colors.text} />
    </TouchableOpacity>

    <View style={styles.headerRightButtons}>
      <TouchableOpacity
        style={styles.flashcardsButton}
        onPress={() => navigation.navigate('Flashcards')}
      >
        <Ionicons name="albums-outline" size={18} color={theme.colors.text} />
        <Text style={styles.flashcardsButtonText}>Flashcards</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.translationButton, showTranslations && styles.headerButtonActive]}
        onPress={onToggleTranslations}
      >
        <Ionicons
          name={showTranslations ? "eye-off" : "eye"}
          size={20}
          color={showTranslations ? '#fff' : theme.colors.text}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.translationButton}
        onPress={() => setShowSettingsModal(true)}
      >
        <Ionicons name="settings-outline" size={20} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  </View>
);

// Word tooltip component
const WordTooltip = ({ activeWord, theme, styles }) => {
  const estimatedWidth = Math.min(
    Math.max(activeWord.translation.length * 10 + 24, 80),
    screenWidth - 40
  );
  const tooltipLeft = Math.max(20, Math.min(activeWord.x - estimatedWidth / 2, screenWidth - estimatedWidth - 20));

  return (
    <View
      style={{
        position: 'absolute',
        left: tooltipLeft,
        top: activeWord.y - 60,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 9999,
        maxWidth: screenWidth - 40,
      }}
      pointerEvents="none"
    >
      <Text style={styles.tooltipText}>{activeWord.translation}</Text>
    </View>
  );
};

import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  InteractionManager,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useFlashcards } from '../../context/FlashcardContext';
import { BOOKS, getBookName, loadChapterData } from '../../data/bibleData';
import { createStyles } from '../BibleReaderScreen.styles';
import { ChapterSelector } from './ChapterSelector';
import { SavedWordsPanel } from './SavedWordsPanel';
import { SettingsModal } from './SettingsModal';
import { useBibleReader } from '../../hooks/useBibleReader';
import { loadChapterWithMappingType, getMappingType, setMappingType, MAPPING_TYPES } from '../../utils/bibleLoader';

const { width: screenWidth} = Dimensions.get('window');

export default function BibleReaderScreen({ navigation }) {
  const { theme } = useTheme();
  const { addMultipleFlashcards } = useFlashcards();

  // Current chapter state
  const [currentBook, setCurrentBook] = useState('MRK');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapter, setChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [expandedBook, setExpandedBook] = useState(null);
  const [showTranslations, setShowTranslations] = useState(false);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Mapping type state
  const [mappingType, setMappingTypeState] = useState(MAPPING_TYPES.INTERPRETIVE);

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

  // Load mapping type preference on mount
  useEffect(() => {
    const loadMappingPreference = async () => {
      const savedType = await getMappingType();
      setMappingTypeState(savedType);
    };
    loadMappingPreference();
  }, []);

  // Load chapter data with selected mapping type
  const loadCurrentChapter = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await loadChapterWithMappingType(currentBook, currentChapter, mappingType);
      setChapter(data);
    } catch (error) {
      console.error('Failed to load chapter:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentBook, currentChapter, mappingType]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      loadCurrentChapter();
    });
    return () => task.cancel();
  }, [loadCurrentChapter]);

  // Handle mapping type change
  const handleMappingTypeChange = useCallback(async (newType) => {
    setMappingTypeState(newType);
    await setMappingType(newType);

    // Clear active word to avoid showing stale translation
    setActiveWord(null);

    // Reload chapter immediately with new type (don't wait for state update)
    setIsLoading(true);
    try {
      const data = await loadChapterWithMappingType(currentBook, currentChapter, newType);
      setChapter(data);
    } catch (error) {
      console.error('Failed to load chapter with new mapping type:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentBook, currentChapter, setActiveWord]);

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

  const handleAddToFlashcards = useCallback(() => {
    if (savedWords.length === 0) {
      Alert.alert('No Words', 'Tap on Arabic words to save them first.');
      return;
    }

    const added = addMultipleFlashcards(savedWords);

    if (added > 0) {
      Alert.alert('Success', `Added ${added} words to flashcards!`);
      setSavedWords([]);
    } else {
      Alert.alert('Info', 'All words are already in your flashcards.');
    }
    setShowSavedPanel(false);
  }, [savedWords, addMultipleFlashcards, setSavedWords]);

  // Memoized Word component
  const renderWord = useCallback((word, wordIndex, verseIndex) => {
    if (/^\s+$/.test(word) || !word.trim()) {
      return <Text key={wordIndex} style={styles.arabicText}>{word}</Text>;
    }

    const wordId = `${verseIndex}-${word}`;
    const isActive = activeWord?.id === wordId;
    const isSaved = savedWordsSet.has(word);

    return (
      <View key={wordIndex} style={styles.wordWrapper}>
        <TouchableOpacity
          onPress={(event) => handleWordPress(word, verseIndex, event)}
          style={[
            styles.wordTouchable,
            isActive && styles.activeWordContainer,
            isSaved && !isActive && styles.savedWordContainer,
          ]}
        >
          <Text style={[
            styles.arabicText,
            isActive && styles.activeWordText,
            isSaved && !isActive && styles.savedWordText,
          ]}>
            {word}
          </Text>
        </TouchableOpacity>
      </View>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWord, savedWordsSet, handleWordPress]);

  // Memoize verse splitting
  const versesWithWords = useMemo(() => {
    if (!chapter) return [];
    return chapter.data.content_arabic.map(text => text.split(/(\s+)/));
  }, [chapter]);

  const renderVerse = useCallback((words, verseIndex) => {
    return (
      <View style={styles.verseContainer} key={verseIndex}>
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
          <Text style={styles.verseNumber}>{verseIndex + 1}</Text>
        </View>
      </View>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderWord, showTranslations, chapter]);

  // Loading state
  if (isLoading || !chapter) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          navigation={navigation}
          currentBook={currentBook}
          currentChapter={currentChapter}
          showTranslations={showTranslations}
          setShowTranslations={setShowTranslations}
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
    <SafeAreaView style={styles.container}>
      <Header
        navigation={navigation}
        currentBook={currentBook}
        currentChapter={currentChapter}
        showTranslations={showTranslations}
        setShowTranslations={setShowTranslations}
        setShowChapterSelector={setShowChapterSelector}
        setShowSettingsModal={setShowSettingsModal}
        theme={theme}
        styles={styles}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => setActiveWord(null)}
        onTouchStart={handleGlobalTap}
      >
        <View style={styles.storyContent}>
          <Text style={styles.storyTitle}>{chapter.data.title_arabic}</Text>
          <Text style={styles.storyTitleEnglish}>
            {getBookName(currentBook)} {currentChapter}
          </Text>

          {versesWithWords.map((words, index) => renderVerse(words, index))}
        </View>
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
        styles={styles}
      />

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        styles={styles}
        mappingType={mappingType}
        onMappingTypeChange={handleMappingTypeChange}
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
  setShowTranslations,
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
        onPress={() => setShowTranslations(!showTranslations)}
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

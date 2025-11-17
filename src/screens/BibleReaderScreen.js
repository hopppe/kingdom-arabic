import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  SafeAreaView,
  Dimensions,
  TouchableWithoutFeedback,
  InteractionManager,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useFlashcards } from '../context/FlashcardContext';
import { BOOKS, getBookName, loadChapterData } from '../data/bibleData';

const { width: screenWidth } = Dimensions.get('window');

export default function BibleReaderScreen({ navigation }) {
  const { theme } = useTheme();
  const { addMultipleFlashcards } = useFlashcards();

  // Current chapter state
  const [currentBook, setCurrentBook] = useState('MRK');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapter, setChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Chapter selector state
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [expandedBook, setExpandedBook] = useState(null);

  // Reading state
  const [showTranslations, setShowTranslations] = useState(false);
  const [activeWord, setActiveWord] = useState(null);
  const [savedWords, setSavedWords] = useState([]);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const wordTapInProgress = useRef(false);

  const getCurrentBookName = () => {
    return getBookName(currentBook);
  };

  // Define styles first so they can be used in memoized callbacks
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerBar: {
      position: 'absolute',
      top: 60,
      left: 16,
      right: 16,
      zIndex: 1000,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    referenceButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    referenceText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginRight: 4,
    },
    flashcardsButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 36,
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerRightButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    translationButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 36,
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    wordsCountButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 44,
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    wordsCountText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    content: {
      flex: 1,
    },
    storyContent: {
      padding: 24,
      paddingTop: 60,
    },
    storyTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
      writingDirection: 'rtl',
    },
    storyTitleEnglish: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      fontStyle: 'italic',
    },
    verseContainer: {
      marginBottom: 24,
    },
    paragraphWithNumber: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    paragraph: {
      flex: 1,
    },
    arabicContainer: {
      flexDirection: 'row-reverse',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      overflow: 'visible',
      rowGap: 12,
    },
    wordWrapper: {
      position: 'relative',
      overflow: 'visible',
      alignSelf: 'flex-start',
    },
    wordTouchable: {
      borderRadius: 6,
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    arabicText: {
      fontSize: 22,
      lineHeight: 28,
      color: theme.colors.text,
      fontWeight: '500',
    },
    activeWordContainer: {
      backgroundColor: '#FFF9C4',
    },
    activeWordText: {
      color: theme.colors.text,
    },
    savedWordContainer: {
      backgroundColor: '#FFF3CD',
    },
    savedWordText: {
      color: theme.colors.text,
    },
    tooltipText: {
      fontSize: 18,
      color: theme.colors.text,
      fontWeight: '600',
      textAlign: 'center',
    },
    verseNumber: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginLeft: 12,
      marginTop: 5,
      minWidth: 20,
      textAlign: 'left',
    },
    englishText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontWeight: '400',
      textAlign: 'left',
      marginTop: 8,
      marginBottom: 8,
      fontStyle: 'italic',
    },
    bottomButtonRow: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: 'transparent',
      position: 'absolute',
      bottom: 30,
      left: 0,
      right: 0,
      justifyContent: 'center',
      gap: 12,
    },
    navButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    learnedWordsButton: {
      flex: 1,
      maxWidth: 200,
      paddingVertical: 14,
      paddingHorizontal: 8,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    learnedWordsButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    // Chapter selector modal styles
    selectorOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    selectorContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    selectorHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    selectorTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    cancelButton: {
      padding: 8,
    },
    cancelButtonText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    bookRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    bookRowExpanded: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 0,
    },
    bookName: {
      fontSize: 18,
      fontWeight: '500',
      color: theme.colors.text,
    },
    bookNameExpanded: {
      fontWeight: '700',
    },
    chapterGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    chapterButton: {
      width: '20%',
      aspectRatio: 1,
      padding: 4,
    },
    chapterButtonInner: {
      flex: 1,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chapterButtonCurrent: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chapterNumber: {
      fontSize: 18,
      fontWeight: '500',
      color: theme.colors.text,
    },
    chapterNumberCurrent: {
      color: '#fff',
    },
    // Saved words modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: 24,
      gap: 8,
    },
    addToFlashcardsButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
    },
    addToFlashcardsButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
    },
    clearAllButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: '#800020',
    },
    clearAllButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
    },
    savedWordsList: {
      padding: 24,
    },
    wordCount: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    savedWordItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    wordContent: {
      flex: 1,
    },
    savedWordArabic: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    savedWordEnglish: {
      fontSize: 16,
      color: theme.colors.primary,
    },
    savedWordReference: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
      marginTop: 2,
    },
    removeWordButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#800020',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    removeWordText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      lineHeight: 20,
      textAlign: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
  }), [theme]);

  // Load chapter data
  const loadCurrentChapter = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await loadChapterData(currentBook, currentChapter);
      setChapter(data);
    } catch (error) {
      console.error('Failed to load chapter:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentBook, currentChapter]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      loadCurrentChapter();
    });
    return () => task.cancel();
  }, [loadCurrentChapter]);

  // Chapter navigation
  const handleChapterSelect = (bookId, chapterNum) => {
    setCurrentBook(bookId);
    setCurrentChapter(chapterNum);
    setShowChapterSelector(false);
    setExpandedBook(null);
    setActiveWord(null);
  };

  const navigateChapter = (direction) => {
    const bookObj = BOOKS.find(b => b.id === currentBook);
    if (!bookObj) return;

    const currentIndex = bookObj.chapters.indexOf(currentChapter);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < bookObj.chapters.length) {
      setCurrentChapter(bookObj.chapters[newIndex]);
      setActiveWord(null);
    }
  };

  const canNavigatePrev = () => {
    const bookObj = BOOKS.find(b => b.id === currentBook);
    if (!bookObj) return false;
    return bookObj.chapters.indexOf(currentChapter) > 0;
  };

  const canNavigateNext = () => {
    const bookObj = BOOKS.find(b => b.id === currentBook);
    if (!bookObj) return false;
    return bookObj.chapters.indexOf(currentChapter) < bookObj.chapters.length - 1;
  };

  // Smart tooltip positioning based on translation length
  const getTooltipStyle = useCallback((translation) => {
    const estimatedWidth = Math.min(
      Math.max(translation.length * 10 + 24, 120),
      screenWidth * 0.7
    );

    const centerOffset = -estimatedWidth / 2;

    return {
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      marginLeft: centerOffset,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginBottom: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      zIndex: 9999,
      minWidth: 100,
      maxWidth: screenWidth * 0.7,
      alignItems: 'center',
      justifyContent: 'center',
    };
  }, [theme.colors.surface]);

  const handleGlobalTap = () => {
    if (wordTapInProgress.current) {
      wordTapInProgress.current = false;
      return;
    }
    if (activeWord) {
      setActiveWord(null);
    }
  };

  // Memoize the translation lookup function
  const findTranslation = useCallback((word, verseIndex) => {
    if (!chapter) return null;
    const cleanWord = word.trim().replace(/[.,،؛:؟!«»"]/g, '');
    const verseKey = `verse_${verseIndex + 1}`;
    const verseVocab = chapter.vocab[verseKey] || {};

    if (verseVocab[cleanWord]) return verseVocab[cleanWord];
    if (verseVocab[word.trim()]) return verseVocab[word.trim()];

    for (const [arabic, english] of Object.entries(verseVocab)) {
      if (arabic.includes(cleanWord)) return english;
    }
    return null;
  }, [chapter]);

  const handleWordPress = (word, verseIndex, event) => {
    if (event) {
      event.stopPropagation();
    }
    wordTapInProgress.current = true;

    const translation = findTranslation(word, verseIndex);
    if (!translation) {
      setActiveWord(null);
      return;
    }

    const wordId = `${verseIndex}-${word}`;
    if (activeWord?.id === wordId) {
      setActiveWord(null);
    } else {
      setActiveWord({ id: wordId, word, translation, verseIndex });

      const exists = savedWords.some(w => w.word === word && w.translation === translation);
      if (!exists) {
        setSavedWords([{
          word,
          translation,
          book: currentBook,
          chapter: currentChapter,
          verse: verseIndex + 1,
          timestamp: Date.now()
        }, ...savedWords]);
      }
    }
  };

  const handleAddToFlashcards = () => {
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
  };

  // Memoize saved words lookup for performance
  const savedWordsSet = useMemo(() => {
    return new Set(savedWords.map(w => w.word));
  }, [savedWords]);

  // Memoized Word component to prevent unnecessary re-renders
  const renderWord = useCallback((word, wordIndex, verseIndex) => {
    if (/^\s+$/.test(word) || !word.trim()) {
      return <Text key={wordIndex} style={styles.arabicText}>{word}</Text>;
    }

    const translation = findTranslation(word, verseIndex);
    const wordId = `${verseIndex}-${word}`;
    const isActive = activeWord?.id === wordId;
    const isSaved = savedWordsSet.has(word);

    return (
      <View key={wordIndex} style={styles.wordWrapper}>
        {isActive && translation && (
          <View style={getTooltipStyle(translation)}>
            <Text style={styles.tooltipText}>{translation}</Text>
          </View>
        )}
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
  }, [activeWord, savedWordsSet, findTranslation, handleWordPress, styles, getTooltipStyle]);

  // Memoize verse splitting to avoid re-computing on every render
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
  }, [renderWord, showTranslations, chapter, styles]);

  const renderChapterSelector = () => (
    <Modal
      visible={showChapterSelector}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowChapterSelector(false)}
    >
      <View style={styles.selectorOverlay}>
        <View style={styles.selectorContent}>
          <View style={styles.selectorHeader}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowChapterSelector(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.selectorTitle}>Books</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {BOOKS.map((book) => {
              const isExpanded = expandedBook === book.id;

              return (
                <View key={book.id}>
                  <TouchableOpacity
                    style={[styles.bookRow, isExpanded && styles.bookRowExpanded]}
                    onPress={() => setExpandedBook(isExpanded ? null : book.id)}
                  >
                    <Text style={[styles.bookName, isExpanded && styles.bookNameExpanded]}>
                      {book.name}
                    </Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.chapterGrid}>
                      {book.chapters.map((chapterNum) => {
                        const isCurrent = book.id === currentBook && chapterNum === currentChapter;
                        return (
                          <View key={chapterNum} style={styles.chapterButton}>
                            <TouchableOpacity
                              style={[
                                styles.chapterButtonInner,
                                isCurrent && styles.chapterButtonCurrent,
                              ]}
                              onPress={() => handleChapterSelect(book.id, chapterNum)}
                            >
                              <Text style={[
                                styles.chapterNumber,
                                isCurrent && styles.chapterNumberCurrent,
                              ]}>
                                {chapterNum}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Show loading state while chapter data is being fetched
  if (isLoading || !chapter) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.referenceButton}
            onPress={() => setShowChapterSelector(true)}
          >
            <Text style={styles.referenceText}>
              {getCurrentBookName()} {currentChapter}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.headerRightButtons}>
            <TouchableOpacity
              style={styles.flashcardsButton}
              onPress={() => navigation.navigate('Flashcards')}
            >
              <Ionicons name="albums-outline" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>
            Loading {getCurrentBookName()} {currentChapter}...
          </Text>
        </View>
        {renderChapterSelector()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.referenceButton}
          onPress={() => setShowChapterSelector(true)}
        >
          <Text style={styles.referenceText}>
            {getCurrentBookName()} {currentChapter}
          </Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerRightButtons}>
          <TouchableOpacity
            style={styles.flashcardsButton}
            onPress={() => navigation.navigate('Flashcards')}
          >
            <Ionicons name="albums-outline" size={20} color={theme.colors.text} />
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
            style={styles.wordsCountButton}
            onPress={() => setShowSavedPanel(true)}
          >
            <Text style={styles.wordsCountText}>+ ({savedWords.length})</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableWithoutFeedback onPress={handleGlobalTap}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.storyContent}>
            <Text style={styles.storyTitle}>{chapter.data.title_arabic}</Text>
            <Text style={styles.storyTitleEnglish}>
              {getCurrentBookName()} {currentChapter}
            </Text>

            {versesWithWords.map((words, index) => renderVerse(words, index))}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

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

      {renderChapterSelector()}

      <Modal
        visible={showSavedPanel}
        animationType="slide"
        onRequestClose={() => setShowSavedPanel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Saved Words</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowSavedPanel(false)}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {savedWords.length > 0 && (
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.addToFlashcardsButton}
                  onPress={handleAddToFlashcards}
                >
                  <Text style={styles.addToFlashcardsButtonText}>Add to Flashcards</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearAllButton}
                  onPress={() => setSavedWords([])}
                >
                  <Text style={styles.clearAllButtonText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView style={styles.savedWordsList} showsVerticalScrollIndicator={false}>
              {savedWords.length > 0 ? (
                <>
                  <Text style={styles.wordCount}>
                    {savedWords.length} {savedWords.length === 1 ? 'word' : 'words'} total
                  </Text>
                  {savedWords.map((item, index) => (
                    <View key={index} style={styles.savedWordItem}>
                      <View style={styles.wordContent}>
                        <Text style={styles.savedWordArabic}>{item.word}</Text>
                        <Text style={styles.savedWordEnglish}>{item.translation}</Text>
                        {item.book && item.chapter && item.verse && (
                          <Text style={styles.savedWordReference}>
                            {getBookName(item.book)} {item.chapter}:{item.verse}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.removeWordButton}
                        onPress={() => setSavedWords(savedWords.filter((_, i) => i !== index))}
                      >
                        <Text style={styles.removeWordText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No words saved yet</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

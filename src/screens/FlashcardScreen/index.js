import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useFlashcards } from '../../context/FlashcardContext';
import { AnkiCardCounts } from '../components/AnkiCardCounts';
import { AnkiRatingButtons } from '../components/AnkiRatingButtons';
import { QuickSettingsModal } from '../components/QuickSettingsModal';
import { Dropdown } from '../components/Dropdown';
import { FlashcardCard } from './FlashcardCard';
import { useFlashcardPreferences } from '../../hooks/useFlashcardPreferences';
import { useFlashcardAnimations } from '../../hooks/useFlashcardAnimations';
import { useFlashcardSession } from '../../hooks/useFlashcardSession';
import { calculateAnkiSchedule, DEFAULT_EASE_FACTOR } from '../../../Flashcards/utils/ankiScheduler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 700;
const isMediumScreen = screenHeight >= 700 && screenHeight < 800;

export default function FlashcardScreen({ navigation, route }) {
  const { theme } = useTheme();
  const {
    flashcards,
    userProgress,
    groups,
    loading,
    recordAnswer,
    removeFlashcard,
    resetCardProgress,
    createGroup,
    addCardToGroup,
    removeCardFromGroup,
  } = useFlashcards();

  // Get selected group from route params if available (for restart)
  const initialGroup = route?.params?.selectedGroup || 'All Cards';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(initialGroup);

  // Custom hooks
  const { showEnglishFirst, showVerseOnFront, toggleFlipPreference, toggleVerseOnFront } = useFlashcardPreferences();
  const {
    flipAnimation,
    slideAnimation,
    frontInterpolate,
    backInterpolate,
    flipCard,
    slideOut,
    slideIn,
    resetAnimations,
  } = useFlashcardAnimations();
  const {
    sessionCards,
    setSessionCards,
    cardCounts,
    setCardCounts,
    sessionInitialized,
    localUserProgress,
    setLocalUserProgress,
    queueManagerRef,
    isMountedRef,
  } = useFlashcardSession(flashcards, userProgress, selectedGroup);

  const handleFlip = useCallback(() => {
    flipCard(showAnswer, setShowAnswer);
  }, [showAnswer, flipCard]);

  const handleRating = useCallback((rating) => {
    if (currentIndex >= sessionCards.length || isProcessingAnswer || !queueManagerRef.current) return;

    setIsProcessingAnswer(true);
    const card = sessionCards[currentIndex];

    // Start slide out animation for instant feedback
    slideOut(() => {
      const currentProgress = card.cardProgress || localUserProgress[card.id] || {
        card_state: 'new',
        ease_factor: DEFAULT_EASE_FACTOR,
        interval_days: 0,
        step_index: 0,
        lapses: 0,
        reviews_count: 0,
      };

      const ankiData = calculateAnkiSchedule(currentProgress, rating);

      // Update local progress
      const updatedProgress = {
        ...localUserProgress,
        [card.id]: {
          ...ankiData,
          last_reviewed_at: new Date().toISOString(),
        },
      };
      setLocalUserProgress(updatedProgress);

      // Record answer (fire-and-forget)
      recordAnswer(card.id, rating);

      // Update queue
      const newQueue = queueManagerRef.current.answerCard(card.id, ankiData);
      const queueState = queueManagerRef.current.getQueueState();

      setSessionCards(newQueue);
      setCardCounts(queueState.counts);

      if (newQueue.length > 0) {
        setCurrentIndex(0);
        setShowAnswer(false);
        resetAnimations();
        slideIn(() => {
          setTimeout(() => setIsProcessingAnswer(false), 100);
        });
      } else {
        const hasMoreCards = queueState.hasCardsInSession;
        setIsProcessingAnswer(false);

        if (!hasMoreCards) {
          Alert.alert(
            'Session Complete!',
            'Great job! You\'ve finished all cards for now.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      }
    });
  }, [currentIndex, sessionCards, localUserProgress, recordAnswer, isProcessingAnswer, slideOut, slideIn, resetAnimations, queueManagerRef, setLocalUserProgress, setSessionCards, setCardCounts, navigation]);

  const handleRemoveCard = useCallback(() => {
    if (currentIndex >= sessionCards.length) return;
    const card = sessionCards[currentIndex];

    Alert.alert(
      'Remove Flashcard',
      `Remove "${card.arabic}" from your deck? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSettingsLoading(true);
            setTimeout(() => {
              if (!isMountedRef.current) return;
              removeFlashcard(card.id);
              const newCards = sessionCards.filter((_, i) => i !== currentIndex);
              setSessionCards(newCards);

              if (newCards.length === 0) {
                setShowSettingsModal(false);
                navigation.goBack();
              } else if (currentIndex >= newCards.length) {
                setCurrentIndex(Math.max(0, newCards.length - 1));
              }

              setShowAnswer(false);
              resetAnimations();
              setSettingsLoading(false);
              setShowSettingsModal(false);
            }, 300);
          },
        },
      ]
    );
  }, [currentIndex, sessionCards, removeFlashcard, navigation, resetAnimations, isMountedRef, setSessionCards]);

  const handleResetProgress = useCallback(() => {
    if (currentIndex >= sessionCards.length) return;
    const card = sessionCards[currentIndex];

    Alert.alert(
      'Reset Progress',
      'This will reset the learning progress for this card. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetCardProgress(card.id);
            setShowSettingsModal(false);
          },
        },
      ]
    );
  }, [currentIndex, sessionCards, resetCardProgress]);

  const handleCreateGroup = useCallback((groupName) => createGroup(groupName), [createGroup]);

  const handleAddToGroup = useCallback((groupName) => {
    if (currentIndex >= sessionCards.length) return;
    addCardToGroup(sessionCards[currentIndex].id, groupName);
  }, [currentIndex, sessionCards, addCardToGroup]);

  const handleRemoveFromGroup = useCallback((groupName) => {
    if (currentIndex >= sessionCards.length) return;
    removeCardFromGroup(sessionCards[currentIndex].id, groupName);
  }, [currentIndex, sessionCards, removeCardFromGroup]);

  const handleRestartSession = useCallback(() => {
    if (!queueManagerRef.current) return;

    // Filter flashcards by selected group
    let cardsToLoad = flashcards;
    if (selectedGroup && selectedGroup !== 'All Cards') {
      cardsToLoad = flashcards.filter(card =>
        card.groups && card.groups.includes(selectedGroup)
      );
    }

    // Reinitialize the queue manager with all cards from the selected group
    const cards = queueManagerRef.current.initialize(cardsToLoad, userProgress);
    const queueState = queueManagerRef.current.getQueueState();

    // Reset session state
    setSessionCards(cards);
    setCardCounts(queueState.counts);
    setCurrentIndex(0);
    setShowAnswer(false);
    resetAnimations();
  }, [flashcards, userProgress, selectedGroup, queueManagerRef, setSessionCards, setCardCounts, resetAnimations]);

  const styles = getStyles(theme);

  // Loading state
  if (!sessionInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <Header navigation={navigation} theme={theme} styles={styles} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading flashcards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No flashcards at all
  if (flashcards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header navigation={navigation} theme={theme} styles={styles} />
        <View style={styles.emptyContainer}>
          <Ionicons name="card-outline" size={80} color={theme.colors.text} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>
            No flashcards yet.{'\n'}Read Bible chapters and save words to create flashcards.
          </Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackButtonText}>Go to Chapters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentCard = sessionCards[currentIndex];

  const currentCardProgress = currentCard ? (currentCard.cardProgress || localUserProgress[currentCard.id] || {
    card_state: 'new',
    ease_factor: DEFAULT_EASE_FACTOR,
    interval_days: 0,
    step_index: 0,
  }) : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.bibleButton} onPress={() => navigation.goBack()}>
          <Ionicons name="book-outline" size={18} color={theme.colors.text} />
          <Text style={styles.bibleButtonText}>Bible</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Dropdown
            items={['All Cards', ...groups]}
            selectedValue={selectedGroup}
            onSelect={setSelectedGroup}
            maxHeight={250}
            style={styles.groupDropdown}
            dropdownStyle={{ backgroundColor: '#FFFFFF', opacity: 1 }}
          />
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowSettingsModal(true)}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <AnkiCardCounts counts={cardCounts} />

        {!currentCard ? (
          <View style={styles.completionMessageContainer}>
            <Text style={[styles.completionText, { color: theme.colors.text }]}>
              You have finished the flashcards in this deck
            </Text>
            <View style={styles.completionButtonsContainer}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleRestartSession}
              >
                <Text style={[styles.primaryButtonText, { color: '#fff' }]}>
                  Review Again
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                  Go Back
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <FlashcardCard
              card={currentCard}
              showAnswer={showAnswer}
              showEnglishFirst={showEnglishFirst}
              showVerseOnFront={showVerseOnFront}
              frontInterpolate={frontInterpolate}
              backInterpolate={backInterpolate}
              slideAnimation={slideAnimation}
              styles={styles}
              onFlip={handleFlip}
            />
            <View style={styles.ratingContainer}>
              <AnkiRatingButtons
                onRatingPress={handleRating}
                currentCard={currentCard}
                cardProgress={currentCardProgress}
                disabled={isProcessingAnswer}
              />
            </View>
          </>
        )}
      </View>

      <QuickSettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentCard={currentCard}
        onRemoveCard={handleRemoveCard}
        onResetProgress={handleResetProgress}
        settingsLoading={settingsLoading}
        showEnglishFirst={showEnglishFirst}
        onToggleFlip={toggleFlipPreference}
        showVerseOnFront={showVerseOnFront}
        onToggleVerseOnFront={toggleVerseOnFront}
        onCreateGroup={handleCreateGroup}
        onAddToGroup={handleAddToGroup}
        onRemoveFromGroup={handleRemoveFromGroup}
        availableGroups={groups}
      />
    </SafeAreaView>
  );
}

// Simple header component
const Header = ({ navigation, theme, styles }) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.bibleButton} onPress={() => navigation.goBack()}>
      <Ionicons name="book-outline" size={18} color={theme.colors.text} />
      <Text style={styles.bibleButtonText}>Bible</Text>
    </TouchableOpacity>
    <View style={styles.headerButton} />
  </View>
);

// Styles
function getStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: isSmallScreen ? 8 : 12,
      paddingBottom: isSmallScreen ? 8 : 12,
    },
    headerButton: {
      padding: 8,
      borderRadius: 8,
    },
    bibleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    bibleButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginLeft: 4,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    groupDropdown: {
      minWidth: 160,
      maxWidth: 200,
      zIndex: 9999,
      elevation: 9999,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyIcon: {
      marginBottom: 20,
    },
    emptyText: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 26,
    },
    text: {
      color: theme.colors.textSecondary,
    },
    goBackButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    goBackButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    cardContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      maxHeight: isSmallScreen ? screenHeight * 0.5 : isMediumScreen ? screenHeight * 0.55 : screenHeight * 0.6,
    },
    cardWrapper: {
      width: screenWidth - 40,
      height: isSmallScreen ? Math.min(screenHeight * 0.5, 350) :
             isMediumScreen ? Math.min(screenHeight * 0.55, 420) :
             Math.min(screenHeight * 0.6, 480),
      maxHeight: screenHeight * 0.65,
    },
    card: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      backfaceVisibility: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 12,
      borderWidth: 0.5,
      borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    cardFront: {
      backgroundColor: theme.colors.cardBackground,
    },
    cardBack: {
      backgroundColor: theme.colors.primary,
    },
    cardContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: isSmallScreen ? 20 : 24,
    },
    arabicText: {
      fontSize: isSmallScreen ? 42 : isMediumScreen ? 48 : 54,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    arabicTextBack: {
      fontSize: isSmallScreen ? 36 : isMediumScreen ? 42 : 48,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      marginBottom: 16,
    },
    englishText: {
      fontSize: isSmallScreen ? 28 : isMediumScreen ? 32 : 36,
      fontWeight: '700',
      color: '#fff',
      textAlign: 'center',
    },
    englishTextFront: {
      fontSize: isSmallScreen ? 32 : isMediumScreen ? 38 : 44,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    referenceText: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      marginTop: 12,
      fontStyle: 'italic',
    },
    referenceTextFront: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      fontStyle: 'italic',
    },
    verseTextContainer: {
      marginTop: 16,
      padding: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 12,
      maxHeight: isSmallScreen ? 160 : 200,
    },
    verseScrollView: {
      flexGrow: 0,
    },
    verseTextArabic: {
      fontSize: isSmallScreen ? 14 : 16,
      color: '#fff',
      textAlign: 'right',
      writingDirection: 'rtl',
      marginBottom: 8,
      lineHeight: isSmallScreen ? 22 : 26,
    },
    verseTextEnglish: {
      fontSize: isSmallScreen ? 12 : 14,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'left',
      fontStyle: 'italic',
      lineHeight: isSmallScreen ? 18 : 22,
    },
    verseTextContainerFront: {
      marginTop: 12,
      padding: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      borderRadius: 10,
      maxHeight: isSmallScreen ? 140 : 160,
    },
    verseTextArabicFront: {
      fontSize: isSmallScreen ? 14 : 16,
      color: theme.colors.text,
      textAlign: 'right',
      writingDirection: 'rtl',
      lineHeight: isSmallScreen ? 22 : 26,
    },
    verseTextEnglishFront: {
      fontSize: isSmallScreen ? 12 : 14,
      color: theme.colors.textSecondary,
      textAlign: 'left',
      fontStyle: 'italic',
      lineHeight: isSmallScreen ? 18 : 22,
    },
    tapHint: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
      position: 'absolute',
      top: isSmallScreen ? 16 : 20,
    },
    ratingContainer: {
      paddingVertical: isSmallScreen ? 12 : 16,
      paddingHorizontal: 4,
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
    completionMessageContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    completionText: {
      fontSize: 26,
      fontWeight: '700',
      marginBottom: 40,
      textAlign: 'center',
      letterSpacing: 0.2,
    },
    completionButtonsContainer: {
      width: '100%',
      gap: 12,
    },
    primaryButton: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 14,
      minHeight: 44,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
      alignItems: 'center',
    },
    primaryButtonText: {
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    secondaryButton: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 14,
      minHeight: 44,
      borderWidth: 2,
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: 17,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
  });
}

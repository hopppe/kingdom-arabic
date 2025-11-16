import React, { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFlashcards } from '../../context/FlashcardContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation, useLanguage } from '../../context/LanguageContext';
import { useHelp } from '../../context/HelpContext';
import { useAuth } from '../../context/AuthContext';
import { useLearningStage } from '../../context/LearningStageContext';
import { Ionicons } from '@expo/vector-icons';
import { getIconDirection } from '../../utils/rtlUtils';
import UnifiedAudioService from '../../services/UnifiedAudioService';
import { HelpOverlay, HelpButton, CompletionPopup } from '../../components/ui';
import { HELP_CONTENT } from '../../data/helpContent';
import posthogService from '../../services/posthogService';
import UnifiedActivityWrapper from '../../components/UnifiedActivityWrapper';
import ActivityContainer from '../../components/ActivityContainer';

// Import new components
import { AnkiRatingButtons } from './components/AnkiRatingButtons';
import { AnkiCardCounts } from './components/AnkiCardCounts';
import { QuickSettingsModal } from './components/QuickSettingsModal';
import FlashcardErrorBoundary from './components/FlashcardErrorBoundary';

// Import new hooks and utilities
import { useFlashcardAnimations } from './hooks/useFlashcardAnimations';
import { calculateAnkiScheduledCards, calculateAnkiSchedule, DEFAULT_EASE_FACTOR } from './utils/ankiScheduler';
import { getImageForWord } from '../../utils/imageMapping';
import imagePreloader from '../../utils/imagePreloader';
import { LocalQueueManager } from './utils/localQueueManager';

const { width: screenWidth } = Dimensions.get('window');

// Helper function to bold the target word in the sentence
const renderBoldWord = (sentence, word) => {
  if (!sentence || !word) return sentence;

  // Create a case-insensitive regex to find the word
  const regex = new RegExp(`\\b(${word})\\b`, 'gi');
  const parts = sentence.split(regex);

  return (
    <Text style={styles.definition}>
      {parts.map((part, index) => {
        // If this part matches the word (case-insensitive), make it bold
        if (part.toLowerCase() === word.toLowerCase()) {
          return (
            <Text key={index} style={styles.boldWord}>
              {part}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

function FlashcardScreenInternal({
  onComplete,
  onEmptyContent,
  hasContent: hasContentProp,
  activityType: activityTypeProp,
  isFromDailyPlan: isFromDailyPlanProp
}) {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    studyDeckCards: mainDeckCards,
    getFreshCardsReadyForReview,
    recordAnswer,
    flushPendingUpdates,
    removeCardFromStudyDeck,
    userProgress: contextUserProgress,
    ensureDataLoaded,
    initialLoadComplete,
    isLoadingData,
    loading
  } = useFlashcards();

  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { isFirstTimeScreen, markScreenVisited } = useHelp();
  const { phase } = useLearningStage();
  const insets = useSafeAreaInsets();

  // Local user progress state for immediate queue updates (syncs with context)
  const [localUserProgress, setLocalUserProgress] = useState({});

  // Track card counts for display (single source of truth)
  const [cardCounts, setCardCounts] = useState({ new: 0, learning: 0, review: 0, total: 0 });
  const [waitingCardsInfo, setWaitingCardsInfo] = useState(null);

  // Sync local progress with context progress
  useEffect(() => {
    setLocalUserProgress(contextUserProgress);
  }, [contextUserProgress]);

  // Use local progress for queue operations
  const userProgress = localUserProgress;

  // Simplified animations - only use A card system
  const {
    isFlippedA,
    panA,
    scaleA,
    flipAnimationA,
    flipCard,
    createPanResponder,
    resetCurrentCardAnimation,
    resetFlipState,
    setActiveCard,
  } = useFlashcardAnimations();

  // Simple card state
  const isFlipped = isFlippedA;
  const currentPan = panA;
  const currentScale = scaleA;
  const currentFlipAnimation = flipAnimationA;

  // REMOVED: checkAndReorderDueCards - now handled inline in handleButtonPress
  // This matches Anki's behavior: queue is reordered after EVERY answer, not just at specific indices

  // Simple flip handler
  const handleFlip = useCallback(() => {
    flipCard('A');
  }, [flipCard]);

  // Get route params
  const {
    mode,
    fromDailyPlan = false,
    activityType: routeActivityType = null,
    autoComplete = false,
    noCardsAvailable = false
  } = route.params || {};

  const isFromDailyPlan = isFromDailyPlanProp || fromDailyPlan;
  const activityType = activityTypeProp || routeActivityType;

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCards, setSessionCards] = useState([]);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const [isProcessingCompletion, setIsProcessingCompletion] = useState(false);
  const [hasAutoCompleted, setHasAutoCompleted] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpStep, setHelpStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);

  // Displayed card state (separate from sessionCards for smooth animations)
  const [displayedCard, setDisplayedCard] = useState(null);

  // Completion popup state
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  // Card slide animation
  const [slideAnimation] = useState(new Animated.Value(0));

  // Simple analytics state
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Refs
  const isMountedRef = useRef(true);
  const initializationStartedRef = useRef(false);
  const lastScreenTrackTime = useRef(0);
  const queueManagerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      imagePreloader.clearCache();
      // Clean up queue manager
      if (queueManagerRef.current) {
        queueManagerRef.current.cleanup();
        queueManagerRef.current = null;
      }
    };
  }, []);

  // Simple card loading - no preloading
  // Use displayedCard for rendering (for smooth animations), fallback to sessionCards for logic
  const currentCard = displayedCard || sessionCards[currentIndex];

  // Session persistence
  const getSessionKey = () => {
    return mode === 'all' ? 'flashcard_session_all' : 'flashcard_session_review';
  };

  const saveSessionState = async () => {
    try {
      if (sessionCards.length > 0) {
        const sessionKey = getSessionKey();
        const sessionData = {
          currentIndex,
          sessionCards,
          timestamp: Date.now()
        };
        await AsyncStorage.setItem(sessionKey, JSON.stringify(sessionData));
      }
    } catch (error) {
      console.error('Error saving session state:', error);
    }
  };

  const clearSessionState = async () => {
    try {
      const sessionKey = getSessionKey();
      await AsyncStorage.removeItem(sessionKey);
    } catch (error) {
      console.error('Error clearing session state:', error);
    }
  };

  // Activity completion handler
  const handleActivityComplete = useCallback(async (isEmptyContent = false, flashcardData = null) => {
    if (isProcessingCompletion) return;

    try {
      setIsProcessingCompletion(true);

      // NOTE: Activity completion analytics are tracked by UnifiedActivityWrapper
      // No need to track here to avoid duplicate PostHog events

      // If from daily plan, ALWAYS call onComplete to trigger UnifiedActivityWrapper
      if (isFromDailyPlan && onComplete) {
        if (isEmptyContent && onEmptyContent) {
          onEmptyContent();
        } else {
          // Call onComplete() to trigger UnifiedActivityWrapper flow
          // This will show the unified completion modal with next activity navigation
          onComplete();
        }
        return;
      }

      // For standalone flashcard sessions (not from daily plan), show custom popup
      if (flashcardData) {
        setCompletionData(flashcardData);
        setShowCompletionPopup(true);
      }
    } catch (error) {
      console.error('Error handling flashcard completion:', error);
      setCompletionData({
        title: t('common.activityComplete') || 'Activity Complete!',
        message: t('common.completionError') || 'There was an issue saving your progress, but your activity is complete.'
      });
      setShowCompletionPopup(true);
    } finally {
      setIsProcessingCompletion(false);
    }
  }, [isProcessingCompletion, isFromDailyPlan, onComplete, onEmptyContent, t, navigation, sessionStartTime, sessionCards.length, mode]);

  // Ensure data is loaded BEFORE initializing session
  useEffect(() => {
    if (!initialLoadComplete) {
      ensureDataLoaded();
    }
  }, [initialLoadComplete, ensureDataLoaded]);

  // Initialize session cards with queue manager
  useEffect(() => {
    const initializeSessionCards = async () => {
      // Don't initialize until initial load is complete and we have data
      if (!initialLoadComplete) {
        return;
      }

      // CRITICAL: Wait for BOTH cards and progress to be populated
      // If we have 0 cards AND 0 progress, data hasn't loaded yet
      const hasNoData = mainDeckCards.length === 0 && Object.keys(userProgress).length === 0;
      if (hasNoData && !isLoadingData) {
        return;
      }

      // If we have cards but no progress, wait for progress to load
      if (Object.keys(userProgress).length === 0 && mainDeckCards.length > 0) {
        return;
      }

      // CRITICAL: Only allow re-initialization in these cases:
      // 1. Before session starts (!sessionInitialized)
      // 2. If session started but we now have data when we didn't before (edge case recovery)
      const hasCards = mainDeckCards && mainDeckCards.length > 0;
      const hadNoCardsWhenInitialized = sessionInitialized && sessionCards.length === 0;
      const shouldReinitialize = !sessionInitialized || (hadNoCardsWhenInitialized && hasCards && !initializationStartedRef.current);

      if (initializationStartedRef.current && !shouldReinitialize) {
        return;
      }

      // Prevent infinite loop: If session is initialized with 0 cards, don't keep trying
      if (sessionInitialized && sessionCards.length === 0 && !hasCards) {
        return;
      }

      // If we have no cards to show, mark as initialized so we show empty state instead of spinner
      if (!hasCards && !sessionInitialized) {
        setSessionInitialized(true);
        setSessionCards([]);
        setCardCounts({ new: 0, learning: 0, review: 0, total: 0 });
        return;
      }

      if (!initializationStartedRef.current || shouldReinitialize) {
        initializationStartedRef.current = true;
      }

      const isReviewMode = !mode || mode === 'review' || mode === undefined;

      if (isReviewMode) {
        await clearSessionState();
      }

      // Clean up old queue manager if exists
      if (queueManagerRef.current) {
        queueManagerRef.current.cleanup();
      }

      // Create new queue manager
      queueManagerRef.current = new LocalQueueManager();

      // Set up callback for when cards reappear from timers
      queueManagerRef.current.setQueueUpdateCallback((queueState) => {
        if (isMountedRef.current) {
          setSessionCards([...queueState.queue]);
          setCardCounts(queueState.counts);

          // Update waiting cards info
          if (queueState.waitingCount > 0) {
            setWaitingCardsInfo({
              count: queueState.waitingCount,
              nextDueIn: queueState.nextDueIn,
              displayTime: queueManagerRef.current.getWaitingTimeDisplay()
            });
          } else {
            setWaitingCardsInfo(null);
          }

          // If we were waiting and now have cards, reset index
          if (queueState.queue.length > 0 && sessionCards.length === 0) {
            setCurrentIndex(0);
            resetFlipState();
          }
        }
      });

      if (mode === 'all') {
        if (mainDeckCards && mainDeckCards.length > 0) {
          if (!isMountedRef.current) return;

          // Initialize queue manager with all cards
          const cards = queueManagerRef.current.initialize(mainDeckCards, userProgress);
          const queueState = queueManagerRef.current.getQueueState();

          setSessionCards(cards);
          setDisplayedCard(cards[0]); // Initialize displayed card
          setCardCounts(queueState.counts);
          setCurrentIndex(0);
          setActiveCard('A');
          setSessionInitialized(true);

          // Initialize rolling queue preload (first 10 images)
          imagePreloader.initializeRollingQueue(cards, 10);

          // Activity started tracking is handled by UnifiedActivityWrapper
          setSessionStartTime(Date.now());
        } else {
          if (!isMountedRef.current) return;
          setSessionCards([]);
          setSessionInitialized(true);
        }
      } else if (mode === 'study') {
        if (mainDeckCards && mainDeckCards.length > 0) {
          if (!isMountedRef.current) return;

          // Calculate scheduled cards (cards that are due for review)
          const { scheduledCards } = calculateAnkiScheduledCards(mainDeckCards, userProgress);

          // Limit to 25 cards when coming from daily plan
          const limitedCards = isFromDailyPlan && scheduledCards.length > 25
            ? scheduledCards.slice(0, 25)
            : scheduledCards;

          const cards = queueManagerRef.current.initialize(limitedCards, userProgress);
          const queueState = queueManagerRef.current.getQueueState();

          setSessionCards(cards);
          setDisplayedCard(cards[0]); // Initialize displayed card
          setCardCounts(queueState.counts);
          setCurrentIndex(0);
          setActiveCard('A');
          setSessionInitialized(true);

          // Initialize rolling queue preload (first 10 images)
          imagePreloader.initializeRollingQueue(cards, 10);

          // Activity started tracking is handled by UnifiedActivityWrapper
          setSessionStartTime(Date.now());
        } else {
          if (!isMountedRef.current) return;
          setSessionCards([]);
          setCardCounts({ new: 0, learning: 0, review: 0, total: 0 });
          setSessionInitialized(true);
        }
      } else {
        if (getFreshCardsReadyForReview) {
          setSessionCards([]);
          try {
            const freshReviewCards = await getFreshCardsReadyForReview(true);

            if (freshReviewCards && freshReviewCards.length > 0) {
              if (!isMountedRef.current) return;

              // Limit to 25 cards when coming from home screen (daily plan)
              const limitedCards = isFromDailyPlan && freshReviewCards.length > 25
                ? freshReviewCards.slice(0, 25)
                : freshReviewCards;

              // Initialize queue manager with review cards
              const cards = queueManagerRef.current.initialize(limitedCards, userProgress);
              const queueState = queueManagerRef.current.getQueueState();

              setSessionCards(cards);
              setDisplayedCard(cards[0]); // Initialize displayed card
              setCardCounts(queueState.counts);
              setCurrentIndex(0);
              setActiveCard('A');
              setSessionInitialized(true);

              // Preload all images for the deck
              imagePreloader.preloadCards(cards, 0, cards.length);

              // Activity started tracking is handled by UnifiedActivityWrapper
              setSessionStartTime(Date.now());
            } else {
              if (!isMountedRef.current) return;
              setSessionCards([]);
              setCardCounts({ new: 0, learning: 0, review: 0, total: 0 });
              setSessionInitialized(true);
            }
          } catch (error) {
            if (!isMountedRef.current) return;
            console.error('Error loading flashcards:', error);
            setSessionCards([]);
            setCardCounts({ new: 0, learning: 0, review: 0, total: 0 });
            setSessionInitialized(true);
          }
        } else {
          if (!isMountedRef.current) return;
          setSessionCards([]);
          setCardCounts({ new: 0, learning: 0, review: 0, total: 0 });
          setSessionInitialized(true);
        }
      }
    };

    initializeSessionCards();
  }, [mainDeckCards, userProgress, getFreshCardsReadyForReview, initialLoadComplete, sessionCards.length, resetFlipState]);


  // Button press handler with LOCAL queue management (instant, no blocking)
  const handleButtonPress = useCallback(async (rating) => {
    if (!currentCard || isProcessingAnswer || !queueManagerRef.current) return;

    setIsProcessingAnswer(true);

    const isCorrect = rating >= 3;
    setCorrectAnswers(prev => isCorrect ? prev + 1 : prev);

    // === STEP 1: Calculate new schedule LOCALLY (instant) ===
    const currentProgress = userProgress[currentCard.id] || {
      card_state: 'new',
      ease_factor: DEFAULT_EASE_FACTOR,
      interval_days: 0,
      step_index: 0,
      lapses: 0,
      reviews_count: 0
    };

    const ankiData = calculateAnkiSchedule(currentProgress, rating);

    // === STEP 2: Update LOCAL progress immediately ===
    const updatedProgress = {
      ...userProgress,
      [currentCard.id]: {
        ...currentProgress,
        ...ankiData,
        last_reviewed_at: new Date().toISOString()
      }
    };
    setLocalUserProgress(updatedProgress);

    // === STEP 3: Update queue manager (handles timer-based reappearance) ===
    const newQueue = queueManagerRef.current.answerCard(currentCard.id, ankiData);
    const queueState = queueManagerRef.current.getQueueState();

    // === STEP 4: Fire-and-forget Supabase update (non-blocking) ===
    // IMPORTANT: For cards in learning with short intervals, save due time as "now"
    // so they're available in next session. Timers are only for current session.
    const ankiDataForDB = { ...ankiData };
    if ((ankiData.card_state === 'learning' || ankiData.card_state === 'relearning') &&
        ankiData.interval_days < 1) {
      // Card has timer but should be "due now" for next session
      ankiDataForDB.next_review_at = new Date().toISOString();
    }

    // This runs in background - doesn't slow down the UI
    recordAnswer(currentCard.id, rating, ankiDataForDB).catch(err => {
      console.warn('Background sync failed:', err);
      // No problem - local state is already updated
    });

    // === STEP 5: Slide OUT current card ===
    Animated.timing(slideAnimation, {
      toValue: -screenWidth,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      // === STEP 6: Update UI state AFTER slide-out completes ===
      setSessionCards(newQueue);
      setCardCounts(queueState.counts);

      // === STEP 7: Check if we have cards or are waiting ===
      if (newQueue.length > 0) {
        // We have cards to show - update displayed card BEFORE sliding in
        setCurrentIndex(0);
        setDisplayedCard(newQueue[0]); // Update displayed card with new data
        resetFlipState();

        // Preload next images
        imagePreloader.preloadUpcoming(newQueue, 0, 8).catch(error => {
          console.warn('Background image preload failed:', error);
        });

        // Slide IN next card
        slideAnimation.setValue(screenWidth);
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => setIsProcessingAnswer(false), 100);
        });
      } else {
        // Check if we truly have no more cards (not even waiting)
        const hasMoreCards = queueState.hasCardsInSession;

        if (!hasMoreCards) {
          // Session truly complete - no cards left at all
          clearSessionState();
          setIsProcessingAnswer(false);
          setTimeout(() => {
            handleActivityComplete(false, {
              correctAnswers: correctAnswers + (isCorrect ? 1 : 0),
              totalCards: sessionCards.length,
              accuracy: Math.round(((correctAnswers + (isCorrect ? 1 : 0)) / sessionCards.length) * 100),
              sessionType: mode,
              deckTitle: 'Review'
            });
          }, 0);
        } else {
          // We have waiting cards - they should automatically appear
          setIsProcessingAnswer(false);
        }
      }
    });
  }, [currentCard, sessionCards, userProgress, correctAnswers, mode, recordAnswer, clearSessionState, handleActivityComplete, resetFlipState, slideAnimation, isProcessingAnswer]);

  // Audio playback
  const playAudio = async () => {
    if (!currentCard?.word) return;

    setAudioLoading(true);
    try {
      await UnifiedAudioService.playWord(currentCard.word);
    } catch (error) {
      // Silently handle audio errors
    } finally {
      setAudioLoading(false);
    }
  };

  // Quick settings handlers
  const handleRemoveCard = async () => {
    if (!currentCard) return;

    setSettingsLoading(true);
    setShowQuickSettings(false);

    try {
      const result = await removeCardFromStudyDeck(currentCard.id);

      if (result.success) {
        const updatedSessionCards = sessionCards.filter(card => card.id !== currentCard.id);
        setSessionCards(updatedSessionCards);

        Alert.alert('Card Removed', `"${currentCard.word}" has been removed from your study deck.`);

        if (updatedSessionCards.length === 0) {
          navigation.goBack();
        } else if (currentIndex >= updatedSessionCards.length) {
          setCurrentIndex(Math.max(0, updatedSessionCards.length - 1));
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to remove card');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while removing the card');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleResetCardProgress = async () => {
    if (!currentCard) return;

    Alert.alert(
      'Reset Progress',
      `Are you sure you want to reset your progress for "${currentCard.word}"? This will make it appear as a new card.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setSettingsLoading(true);
            setShowQuickSettings(false);

            try {
              const resetProgress = {
                vocabulary_id: currentCard.id,
                card_state: 'new',
                ease_factor: 2.50,
                interval_days: 0,
                step_index: 0,
                lapses: 0,
                reviews_count: 0,
                last_reviewed_at: null,
                next_review_at: new Date().toISOString()
              };

              await recordAnswer(currentCard.id, resetProgress);
              Alert.alert('Progress Reset', `Progress for "${currentCard.word}" has been reset to new card state.`);
            } catch (error) {
              console.error('Error resetting card progress:', error);
              Alert.alert('Error', 'Failed to reset progress. Please try again.');
            } finally {
              setSettingsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Navigation setup - RTL-aware header buttons
  useLayoutEffect(() => {
    const headerButtons = (
      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity
          style={{ padding: 8, borderRadius: 20 }}
          onPress={() => setShowQuickSettings(true)}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <HelpButton
          onPress={() => setShowHelp(true)}
          color={theme.colors.text}
          size={24}
        />
      </View>
    );

    // Custom back button that respects RTL
    const backButton = (
      <TouchableOpacity
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Home');
          }
        }}
        style={{ padding: 8, marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}
      >
        <Ionicons
          name={getIconDirection('arrow-back', isRTL)}
          size={24}
          color={theme.colors.text}
        />
      </TouchableOpacity>
    );

    navigation.setOptions({
      title: '',
      headerShown: true, // Show header for back button and action buttons
      // In RTL: action buttons on left, back button on right
      // In LTR: back button on left, action buttons on right
      headerLeft: isRTL ? () => headerButtons : () => backButton,
      headerRight: isRTL ? () => backButton : () => headerButtons,
    });
  }, [navigation, theme.colors.text, isRTL]);

  // Focus effect for data loading and help
  useFocusEffect(
    React.useCallback(() => {
      // Reset completion state when screen gains focus (for multiple study sessions)
      setIsProcessingCompletion(false);
      setShowCompletionPopup(false);
      setIsProcessingAnswer(false); // Reset button responsiveness
      setIsTransitioning(false); // Reset transition state

      // Track screen view with debouncing (minimum 30 seconds between tracks)
      const now = Date.now();
      const timeSinceLastTrack = now - lastScreenTrackTime.current;
      const DEBOUNCE_TIME = 30000; // 30 seconds

      if (timeSinceLastTrack > DEBOUNCE_TIME) {
        posthogService.screen('Flashcards', {
          activity_type: 'flashcard_review',
          source: isFromDailyPlan ? 'daily_plan' : 'activities_tab',
          learning_stage: phase
        });
        lastScreenTrackTime.current = now;
      }

      if (isFirstTimeScreen('flashcard_review')) {
        setTimeout(() => setShowHelp(true), 1000);
      }

      return () => {
        saveSessionState();

        // Flush any pending updates to Supabase when leaving
        flushPendingUpdates().catch(err => {
          console.warn('⚠️ Failed to sync on exit:', err);
        });

        // Clear image cache when leaving the screen to free memory
        imagePreloader.clearCache();

        // DON'T reset session state here - let it persist
        // Only reset initialization flag if we want to allow re-entry
        // Keep sessionCards and sessionInitialized intact so progress is preserved
      };
    }, [ensureDataLoaded, isFromDailyPlan, phase])
  );

  // Help handlers
  const handleHelpClose = () => {
    setShowHelp(false);
    markScreenVisited('flashcard_review');

    // Track help usage
    posthogService.trackEvent('help_viewed', {
      screen: 'flashcard_review',
      activity_type: 'flashcard_review'
    });
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Reset flip state when active card changes (but don't reset slide animation during transitions)
  useEffect(() => {
    resetFlipState();
    setAudioLoading(false);
    // Don't reset slide animation during button transitions - let the animation handle positioning
  }, [currentIndex]);

  // REMOVED: Auto-completion logic
  // Let the user see the empty state and navigate back themselves
  // This prevents premature auto-completion when cards are still loading

  // Create pan responder for swipe gestures - no animation
  const panResponder = {
    panHandlers: {}
  };

  // Loading state - show spinner while data is loading
  // Check: session not initialized OR context data not loaded OR currently loading
  if (!sessionInitialized || !initialLoadComplete || isLoadingData || loading) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.components.flashcard.container.backgroundColor, paddingTop: insets.top + 20 }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary, marginTop: 16 }]}>
          Loading flashcards...
        </Text>
      </View>
    );
  }

  // Empty state with auto-completion - only show after data has loaded
  if (sessionCards.length === 0) {
    // Simplified: Show loading while auto-completing from daily plan
    if (isFromDailyPlan && !hasAutoCompleted) {
      return (
        <View style={[styles.emptyContainer, { backgroundColor: theme.components.flashcard.container.backgroundColor, paddingTop: insets.top + 20 }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.components.flashcard.container.backgroundColor, paddingTop: insets.top + 20 }]}>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          No flashcards to review
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
          Great job! You've reviewed all your cards for now.
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          }}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.surface }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentCard) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.components.flashcard.container.backgroundColor, paddingTop: insets.top + 20 }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ActivityContainer style={[styles.container, { backgroundColor: theme.components.flashcard.container.backgroundColor, paddingTop: insets.top + 20 }]}>
      {/* Anki-style card counts */}
      <AnkiCardCounts counts={cardCounts} />

      {/* Super simple card display */}
      <View style={styles.cardContainer}>
        {currentCard && (
          <Animated.View
            style={[
              styles.cardWrapper,
              {
                transform: [{
                  translateX: slideAnimation
                }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={() => flipCard('A')}
              activeOpacity={0.9}
            >
              {/* Front side - animated */}
              <Animated.View
                style={[
                  styles.cardFace,
                  styles.cardFront,
                  {
                    transform: [{
                      rotateY: flipAnimationA.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      })
                    }],
                  },
                ]}
                pointerEvents={!isFlipped ? 'auto' : 'none'}
              >
                {currentCard.image_url || imagePreloader.getPreloadedImage(currentCard.word) ? (
                  <>
                    <Image
                      key={`${currentCard.id}-${currentCard.word}-${currentIndex}`}
                      source={imagePreloader.getPreloadedImage(currentCard.word) || getImageForWord(currentCard.word)}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.arabicWord}>{currentCard.arabic_translation || currentCard.word}</Text>
                  </>
                ) : (
                  <Text style={styles.noImageText}>{currentCard.arabic_translation || currentCard.word}</Text>
                )}
              </Animated.View>

              {/* Back side - animated */}
              <Animated.View
                style={[
                  styles.cardFace,
                  styles.cardBack,
                  {
                    transform: [{
                      rotateY: flipAnimationA.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['180deg', '360deg'],
                      })
                    }],
                  },
                ]}
                pointerEvents={isFlipped ? 'auto' : 'none'}
              >
                <Text style={styles.englishWord}>{currentCard.word}</Text>
                {renderBoldWord(currentCard.definition, currentCard.word)}
                <TouchableOpacity
                  style={[
                    styles.audioButton,
                    audioLoading && styles.audioButtonDisabled
                  ]}
                  onPress={playAudio}
                  disabled={audioLoading || !isFlipped}
                >
                  <Text style={[
                    styles.audioButtonText,
                    audioLoading && styles.audioButtonTextDisabled
                  ]}>
                    🔊 Play Audio
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Anki Rating Buttons */}
      <AnkiRatingButtons
        onRatingPress={handleButtonPress}
        currentCard={currentCard}
      />

      {/* Quick Settings Modal */}
      <QuickSettingsModal
        visible={showQuickSettings}
        onClose={() => setShowQuickSettings(false)}
        currentCard={currentCard}
        userProgress={userProgress}
        onRemoveCard={handleRemoveCard}
        onResetProgress={handleResetCardProgress}
        settingsLoading={settingsLoading}
      />

      {/* Help Overlay */}
      <HelpOverlay
        visible={showHelp}
        onClose={handleHelpClose}
        steps={HELP_CONTENT.activity_specific.flashcard_review.steps}
        titleKey={HELP_CONTENT.activity_specific.flashcard_review.titleKey}
        currentStep={helpStep}
        onStepChange={setHelpStep}
        onComplete={handleHelpClose}
      />

      {/* Completion Popup */}
      <CompletionPopup
        isVisible={showCompletionPopup}
        onClose={() => setShowCompletionPopup(false)}
        onActionPress={() => {
          setShowCompletionPopup(false);
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Home');
          }
        }}
        title={completionData?.title || t('flashcard.sessionComplete')}
        message={completionData?.message || t('flashcard.sessionCompleteMessage')}
        actionButtonText={t('common.close') || 'Close'}
        showAnimation={true}
      />

      {/* Off-screen image preloader - renders next 4 images invisibly so they're ready */}
      <View style={styles.preloader}>
        {sessionCards.slice(1, 5).map((card, idx) => (
          <Image
            key={`preload-${card.id}-${idx}`}
            source={imagePreloader.getPreloadedImage(card.word) || getImageForWord(card.word)}
            style={styles.preloadImage}
          />
        ))}
      </View>
    </ActivityContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    width: '90%',
    aspectRatio: 0.7,
    maxWidth: 350,
  },
  card: {
    flex: 1,
    position: 'relative',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  cardBack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  cardImage: {
    width: '80%',
    height: '60%',
    marginBottom: 20,
  },
  noImageText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  arabicWord: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  englishWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  definition: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  boldWord: {
    fontWeight: 'bold',
    color: '#333',
  },
  audioButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  audioButtonDisabled: {
    backgroundColor: '#A0A0A0',
    opacity: 0.6,
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  audioButtonTextDisabled: {
    color: '#E0E0E0',
  },
  loadingText: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  emptySubtext: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    minHeight: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  // Preloader styles
  preloader: {
    position: 'absolute',
    top: -1000, // Move completely off screen
    left: -1000,
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  preloadImage: {
    width: 1,
    height: 1,
  },
});

// Wrapper component that always applies UnifiedActivityWrapper
const FlashcardScreen = (props) => {
  const route = useRoute();
  const navigation = useNavigation();
  const {
    fromDailyPlan,
    dailyPlan,
    activityType
  } = route?.params || {};

  // Simple wrapper - no loading checks, no content checks
  // Let the internal screen handle its own empty states
  // Wrapper only handles completion tracking and navigation
  return (
    <UnifiedActivityWrapper
      activityType={activityType || "flashcard_review"}
      activityId={null}
      hasContent={true} // Always true - let screen handle empty state internally
      isContentLoading={false} // Never loading - screen loads its own data
    >
      <FlashcardErrorBoundary
        onReset={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Home');
          }
        }}
      >
        <FlashcardScreenInternal {...props} />
      </FlashcardErrorBoundary>
    </UnifiedActivityWrapper>
  );
};

export default FlashcardScreen;
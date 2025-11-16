import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateAnkiSchedule, DEFAULT_EASE_FACTOR } from '../../Flashcards/utils/ankiScheduler';

const FlashcardContext = createContext({});

const FLASHCARDS_KEY = '@learnarabic_flashcards';
const PROGRESS_KEY = '@learnarabic_flashcard_progress';

// Sample flashcards to start with
const INITIAL_FLASHCARDS = [
  {
    id: '1',
    arabic: 'كَلِمَة',
    english: 'Word',
  },
  {
    id: '2',
    arabic: 'نُور',
    english: 'Light',
  },
  {
    id: '3',
    arabic: 'حَيَاة',
    english: 'Life',
  },
  {
    id: '4',
    arabic: 'ٱلْحَقّ',
    english: 'The Truth',
  },
  {
    id: '5',
    arabic: 'إِيمَان',
    english: 'Faith',
  },
];

// Initial progress for a new card
const createNewCardProgress = () => ({
  card_state: 'new',
  ease_factor: DEFAULT_EASE_FACTOR,
  interval_days: 0,
  step_index: 0,
  lapses: 0,
  reviews_count: 0,
  next_review_at: new Date().toISOString(),
  last_reviewed_at: null,
  scheduled_days_before_lapse: null,
});

export const FlashcardProvider = ({ children }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // Load flashcards and progress from storage
  const loadData = useCallback(async () => {
    try {
      const [storedCards, storedProgress] = await Promise.all([
        AsyncStorage.getItem(FLASHCARDS_KEY),
        AsyncStorage.getItem(PROGRESS_KEY),
      ]);

      let cards = [];
      let progress = {};

      // Load cards
      if (storedCards) {
        const parsedCards = JSON.parse(storedCards);
        if (parsedCards && parsedCards.length > 0) {
          // Migrate old cards that don't have arabic/english fields
          cards = parsedCards.filter(card => {
            // Keep only cards that have both arabic and english fields
            const hasArabic = card.arabic && typeof card.arabic === 'string' && card.arabic.trim() !== '';
            const hasEnglish = card.english && typeof card.english === 'string' && card.english.trim() !== '';

            if (!hasArabic || !hasEnglish) {
              console.log(`Removing invalid card ${card.id} - missing arabic (${hasArabic}) or english (${hasEnglish}) field`);
              console.log(`Card data:`, JSON.stringify(card));
              return false;
            }
            return true;
          });

          // If we filtered out some cards, save the cleaned list
          if (cards.length !== parsedCards.length) {
            console.log(`Cleaned up ${parsedCards.length - cards.length} invalid cards`);
            await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cards));
          }
        }
      }

      // If no valid cards, use initial ones
      if (cards.length === 0) {
        console.log('No valid cards found, adding initial flashcards');
        cards = INITIAL_FLASHCARDS;
        await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cards));
      }

      // Load progress
      if (storedProgress) {
        progress = JSON.parse(storedProgress);

        // Clean up progress for cards that no longer exist
        const validCardIds = new Set(cards.map(c => c.id));
        const cleanedProgress = {};
        Object.keys(progress).forEach(cardId => {
          if (validCardIds.has(cardId)) {
            cleanedProgress[cardId] = progress[cardId];
          } else {
            console.log(`Removing orphaned progress for card ${cardId}`);
          }
        });
        progress = cleanedProgress;
      }

      // Ensure all cards have progress entries
      cards.forEach(card => {
        if (!progress[card.id]) {
          progress[card.id] = createNewCardProgress();
        }
      });

      // Save updated progress
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

      setFlashcards(cards);
      setUserProgress(progress);
    } catch (error) {
      console.error('Error loading flashcard data:', error);
      // On error, provide initial cards
      setFlashcards(INITIAL_FLASHCARDS);
      const initialProgress = {};
      INITIAL_FLASHCARDS.forEach(card => {
        initialProgress[card.id] = createNewCardProgress();
      });
      setUserProgress(initialProgress);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save flashcards to storage
  const saveFlashcards = useCallback(async (cards) => {
    try {
      await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cards));
    } catch (error) {
      console.error('Error saving flashcards:', error);
    }
  }, []);

  // Save progress to storage
  const saveProgress = useCallback(async (progress) => {
    try {
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add a new flashcard
  const addFlashcard = useCallback((arabic, english) => {
    // Check if already exists
    const exists = flashcards.some(card => card.arabic === arabic);
    if (exists) {
      console.log(`Flashcard already exists for: ${arabic}`);
      return false;
    }

    const newCard = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      arabic,
      english,
    };

    const updatedCards = [...flashcards, newCard];
    const updatedProgress = {
      ...userProgress,
      [newCard.id]: createNewCardProgress(),
    };

    setFlashcards(updatedCards);
    setUserProgress(updatedProgress);
    saveFlashcards(updatedCards);
    saveProgress(updatedProgress);

    console.log(`Added flashcard: ${arabic} -> ${english}`);
    return true;
  }, [flashcards, userProgress, saveFlashcards, saveProgress]);

  // Add multiple flashcards at once
  const addMultipleFlashcards = useCallback((words) => {
    let addedCount = 0;
    const newCards = [];
    const newProgress = { ...userProgress };

    words.forEach(({ word, translation }) => {
      const arabic = word;
      const english = translation;

      const existsInCurrent = flashcards.some(card => card.arabic === arabic);
      const existsInNew = newCards.some(card => card.arabic === arabic);

      if (!existsInCurrent && !existsInNew) {
        const cardId = Date.now().toString() + Math.random().toString(36).substr(2, 9) + addedCount;
        newCards.push({
          id: cardId,
          arabic,
          english,
        });
        newProgress[cardId] = createNewCardProgress();
        console.log(`Added flashcard: ${arabic} -> ${english}`);
        addedCount++;
      } else {
        console.log(`Flashcard already exists for: ${arabic}`);
      }
    });

    if (newCards.length > 0) {
      const updatedCards = [...flashcards, ...newCards];
      setFlashcards(updatedCards);
      setUserProgress(newProgress);
      saveFlashcards(updatedCards);
      saveProgress(newProgress);
    }

    return addedCount;
  }, [flashcards, userProgress, saveFlashcards, saveProgress]);

  // Remove a flashcard
  const removeFlashcard = useCallback((id) => {
    const updatedCards = flashcards.filter(card => card.id !== id);
    const updatedProgress = { ...userProgress };
    delete updatedProgress[id];

    setFlashcards(updatedCards);
    setUserProgress(updatedProgress);
    saveFlashcards(updatedCards);
    saveProgress(updatedProgress);
  }, [flashcards, userProgress, saveFlashcards, saveProgress]);

  // Get cards due for review (returns all cards, let LocalQueueManager handle scheduling)
  const getCardsForReview = useCallback(() => {
    const now = new Date();
    return flashcards.filter(card => {
      const progress = userProgress[card.id];
      if (!progress) return true; // New card

      const nextReview = new Date(progress.next_review_at);
      return nextReview <= now;
    });
  }, [flashcards, userProgress]);

  // Record answer using Anki algorithm
  const recordAnswer = useCallback((cardId, rating) => {
    const currentProgress = userProgress[cardId] || createNewCardProgress();
    const newSchedule = calculateAnkiSchedule(currentProgress, rating);

    const updatedProgress = {
      ...userProgress,
      [cardId]: {
        ...newSchedule,
        last_reviewed_at: new Date().toISOString(),
      },
    };

    setUserProgress(updatedProgress);
    saveProgress(updatedProgress);
  }, [userProgress, saveProgress]);

  // Reset progress for a specific card
  const resetCardProgress = useCallback((cardId) => {
    const updatedProgress = {
      ...userProgress,
      [cardId]: createNewCardProgress(),
    };

    setUserProgress(updatedProgress);
    saveProgress(updatedProgress);
  }, [userProgress, saveProgress]);

  // Clear all flashcards
  const clearAllFlashcards = useCallback(async () => {
    setFlashcards([]);
    setUserProgress({});
    await AsyncStorage.removeItem(FLASHCARDS_KEY);
    await AsyncStorage.removeItem(PROGRESS_KEY);
  }, []);

  // Reset to initial cards (for testing)
  const resetToInitialCards = useCallback(async () => {
    const initialProgress = {};
    INITIAL_FLASHCARDS.forEach(card => {
      initialProgress[card.id] = createNewCardProgress();
    });

    setFlashcards(INITIAL_FLASHCARDS);
    setUserProgress(initialProgress);
    await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(INITIAL_FLASHCARDS));
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(initialProgress));
  }, []);

  const value = {
    flashcards,
    userProgress,
    loading,
    addFlashcard,
    addMultipleFlashcards,
    removeFlashcard,
    getCardsForReview,
    recordAnswer,
    resetCardProgress,
    clearAllFlashcards,
    resetToInitialCards,
  };

  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};

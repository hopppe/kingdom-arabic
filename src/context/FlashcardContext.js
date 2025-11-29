import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateAnkiSchedule, DEFAULT_EASE_FACTOR } from '../../Flashcards/utils/ankiScheduler';
import { getBookName } from '../data/bibleData';

const FlashcardContext = createContext({});

const FLASHCARDS_KEY = '@learnarabic_flashcards';
const PROGRESS_KEY = '@learnarabic_flashcard_progress';
const GROUPS_KEY = '@learnarabic_flashcard_groups';


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
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Use refs to access latest state without recreating callbacks
  const flashcardsRef = useRef(flashcards);
  const userProgressRef = useRef(userProgress);
  const groupsRef = useRef(groups);

  // Load flashcards and progress from storage (lazy load)
  const loadData = useCallback(async () => {
    if (initialized) return; // Already loaded
    setLoading(true);
    setInitialized(true);
    try {
      const [storedCards, storedProgress, storedGroups] = await Promise.all([
        AsyncStorage.getItem(FLASHCARDS_KEY),
        AsyncStorage.getItem(PROGRESS_KEY),
        AsyncStorage.getItem(GROUPS_KEY),
      ]);

      let cards = [];
      let progress = {};
      let groupsList = [];

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
              return false;
            }
            return true;
          });

          // If we filtered out some cards, save the cleaned list
          if (cards.length !== parsedCards.length) {
            await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cards));
          }
        }
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

      // Load groups
      if (storedGroups) {
        groupsList = JSON.parse(storedGroups);
      }

      setFlashcards(cards);
      setUserProgress(progress);
      setGroups(groupsList);
    } catch (error) {
      console.error('Error loading flashcard data:', error);
      setFlashcards([]);
      setUserProgress({});
    } finally {
      setLoading(false);
    }
  }, [initialized]);

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

  // Auto-load flashcards on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keep refs in sync with state
  useEffect(() => {
    flashcardsRef.current = flashcards;
  }, [flashcards]);

  useEffect(() => {
    userProgressRef.current = userProgress;
  }, [userProgress]);

  useEffect(() => {
    groupsRef.current = groups;
  }, [groups]);

  // Add multiple flashcards at once
  const addMultipleFlashcards = useCallback(async (words) => {
    // Ensure data is loaded before adding
    if (!initialized) {
      await loadData();
    }

    let addedCount = 0;
    let updatedCount = 0;
    const newCards = [];
    const newProgress = { ...userProgressRef.current };
    let updatedCards = [...flashcardsRef.current];

    words.forEach(({ word, translation, book, chapter, verse, verseTextArabic, verseTextEnglish }) => {
      const arabic = word;
      const english = translation;

      // Check if card already exists
      const existingCardIndex = updatedCards.findIndex(card => card.arabic === arabic);
      const existsInNew = newCards.some(card => card.arabic === arabic);

      if (existingCardIndex !== -1) {
        // Card exists - update the translation if it's different
        const existingCard = updatedCards[existingCardIndex];
        if (existingCard.english !== english) {
          updatedCards[existingCardIndex] = {
            ...existingCard,
            english,
          };
          updatedCount++;
        }
      } else if (!existsInNew) {
        // Card doesn't exist - add it
        const cardId = Date.now().toString() + Math.random().toString(36).substring(2, 11) + addedCount;
        const reference = book && chapter && verse
          ? `${getBookName(book)} ${chapter}:${verse}`
          : null;
        newCards.push({
          id: cardId,
          arabic,
          english,
          reference,
          verseTextArabic: verseTextArabic || null,
          verseTextEnglish: verseTextEnglish || null,
        });
        newProgress[cardId] = createNewCardProgress();
        addedCount++;
      }
    });

    if (newCards.length > 0 || updatedCount > 0) {
      const finalCards = [...updatedCards, ...newCards];
      setFlashcards(finalCards);
      setUserProgress(newProgress);
      saveFlashcards(finalCards);
      saveProgress(newProgress);
    }

    return { added: addedCount, updated: updatedCount };
  }, [initialized, loadData, saveFlashcards, saveProgress]);

  // Remove a flashcard
  const removeFlashcard = useCallback((id) => {
    const updatedCards = flashcardsRef.current.filter(card => card.id !== id);
    const updatedProgress = { ...userProgressRef.current };
    delete updatedProgress[id];

    setFlashcards(updatedCards);
    setUserProgress(updatedProgress);
    saveFlashcards(updatedCards);
    saveProgress(updatedProgress);
  }, [saveFlashcards, saveProgress]);

  // Record answer using Anki algorithm
  const recordAnswer = useCallback((cardId, rating) => {
    const currentProgress = userProgressRef.current[cardId] || createNewCardProgress();
    const newSchedule = calculateAnkiSchedule(currentProgress, rating);

    const updatedProgress = {
      ...userProgressRef.current,
      [cardId]: {
        ...newSchedule,
        last_reviewed_at: new Date().toISOString(),
      },
    };

    setUserProgress(updatedProgress);
    saveProgress(updatedProgress);
  }, [saveProgress]);

  // Reset progress for a specific card
  const resetCardProgress = useCallback((cardId) => {
    const updatedProgress = {
      ...userProgressRef.current,
      [cardId]: createNewCardProgress(),
    };

    setUserProgress(updatedProgress);
    saveProgress(updatedProgress);
  }, [saveProgress]);

  // Update a flashcard's content (e.g., change English translation)
  const updateFlashcard = useCallback((cardId, updates) => {
    const updatedCards = flashcardsRef.current.map(card => {
      if (card.id === cardId) {
        return { ...card, ...updates };
      }
      return card;
    });

    setFlashcards(updatedCards);
    saveFlashcards(updatedCards);
  }, [saveFlashcards]);

  // Save groups to storage
  const saveGroups = useCallback(async (groupsList) => {
    try {
      await AsyncStorage.setItem(GROUPS_KEY, JSON.stringify(groupsList));
    } catch (error) {
      console.error('Error saving groups:', error);
    }
  }, []);

  // Create a new group
  const createGroup = useCallback((groupName) => {
    if (!groupName || groupName.trim() === '') return false;
    const trimmedName = groupName.trim();

    // Check if group already exists
    if (groupsRef.current.includes(trimmedName)) return false;

    const updatedGroups = [...groupsRef.current, trimmedName];
    setGroups(updatedGroups);
    saveGroups(updatedGroups);
    return true;
  }, [saveGroups]);

  // Delete a group
  const deleteGroup = useCallback((groupName) => {
    const updatedGroups = groupsRef.current.filter(g => g !== groupName);
    setGroups(updatedGroups);
    saveGroups(updatedGroups);

    // Remove group from all flashcards
    const updatedCards = flashcardsRef.current.map(card => {
      if (card.groups && card.groups.includes(groupName)) {
        return {
          ...card,
          groups: card.groups.filter(g => g !== groupName),
        };
      }
      return card;
    });
    setFlashcards(updatedCards);
    saveFlashcards(updatedCards);
  }, [saveGroups, saveFlashcards]);

  // Add card to group
  const addCardToGroup = useCallback((cardId, groupName) => {
    const updatedCards = flashcardsRef.current.map(card => {
      if (card.id === cardId) {
        const currentGroups = card.groups || [];
        if (!currentGroups.includes(groupName)) {
          return { ...card, groups: [...currentGroups, groupName] };
        }
      }
      return card;
    });

    setFlashcards(updatedCards);
    saveFlashcards(updatedCards);
  }, [saveFlashcards]);

  // Remove card from group
  const removeCardFromGroup = useCallback((cardId, groupName) => {
    const updatedCards = flashcardsRef.current.map(card => {
      if (card.id === cardId && card.groups) {
        return {
          ...card,
          groups: card.groups.filter(g => g !== groupName),
        };
      }
      return card;
    });

    setFlashcards(updatedCards);
    saveFlashcards(updatedCards);
  }, [saveFlashcards]);

  const value = {
    flashcards,
    userProgress,
    groups,
    loading,
    loadData,
    addMultipleFlashcards,
    removeFlashcard,
    recordAnswer,
    resetCardProgress,
    updateFlashcard,
    createGroup,
    deleteGroup,
    addCardToGroup,
    removeCardFromGroup,
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

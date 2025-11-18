import { useState, useEffect, useRef } from 'react';
import { LocalQueueManager } from '../../Flashcards/utils/localQueueManager';

export function useFlashcardSession(flashcards, userProgress, selectedGroup) {
  const [sessionCards, setSessionCards] = useState([]);
  const [cardCounts, setCardCounts] = useState({ new: 0, learning: 0, review: 0 });
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [localUserProgress, setLocalUserProgress] = useState({});

  const queueManagerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (queueManagerRef.current) {
        queueManagerRef.current.cleanup();
        queueManagerRef.current = null;
      }
    };
  }, []);

  // Sync local progress with context progress
  useEffect(() => {
    setLocalUserProgress(userProgress);
  }, [userProgress]);

  // Sync session cards' groups from flashcards when flashcards change
  useEffect(() => {
    if (sessionCards.length > 0) {
      let hasChanges = false;
      const updatedSessionCards = sessionCards.map(sessionCard => {
        const updatedCard = flashcards.find(fc => fc.id === sessionCard.id);
        if (updatedCard) {
          const sessionGroups = JSON.stringify(sessionCard.groups || []);
          const updatedGroups = JSON.stringify(updatedCard.groups || []);
          if (sessionGroups !== updatedGroups) {
            hasChanges = true;
            return { ...sessionCard, groups: updatedCard.groups };
          }
        }
        return sessionCard;
      });
      if (hasChanges) {
        setSessionCards(updatedSessionCards);
      }
    }
  }, [flashcards, sessionCards]);

  // Reset session when group changes
  useEffect(() => {
    if (sessionInitialized) {
      setSessionInitialized(false);
    }
  }, [selectedGroup]);

  // Initialize session with queue manager
  useEffect(() => {
    if (flashcards.length === 0 || Object.keys(userProgress).length === 0) {
      setSessionInitialized(true);
      return;
    }

    if (sessionInitialized) return;

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
      }
    });

    // Filter flashcards by selected group
    const filteredFlashcards = selectedGroup === 'All Cards'
      ? flashcards
      : flashcards.filter(card => card.groups && card.groups.includes(selectedGroup));

    // Get cards due for review
    const now = new Date();
    const dueCards = filteredFlashcards.filter(card => {
      const progress = userProgress[card.id];
      if (!progress) return true;
      const nextReview = new Date(progress.next_review_at);
      return nextReview <= now;
    });

    if (dueCards.length > 0) {
      const cards = queueManagerRef.current.initialize(dueCards, userProgress);
      const queueState = queueManagerRef.current.getQueueState();

      setSessionCards(cards);
      setCardCounts(queueState.counts);
    } else {
      setSessionCards([]);
      setCardCounts({ new: 0, learning: 0, review: 0 });
    }

    setSessionInitialized(true);
  }, [flashcards, userProgress, sessionInitialized, selectedGroup]);

  return {
    sessionCards,
    setSessionCards,
    cardCounts,
    setCardCounts,
    sessionInitialized,
    localUserProgress,
    setLocalUserProgress,
    queueManagerRef,
    isMountedRef,
  };
}

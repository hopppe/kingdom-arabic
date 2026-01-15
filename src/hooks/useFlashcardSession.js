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

  // Sync session cards with flashcards when flashcards change (deletions, edits, groups)
  useEffect(() => {
    if (sessionCards.length > 0) {
      const flashcardIds = new Set(flashcards.map(fc => fc.id));
      let hasChanges = false;

      // Filter out deleted cards and update changed properties
      const updatedSessionCards = sessionCards
        .filter(sessionCard => {
          // Remove cards that no longer exist in flashcards
          if (!flashcardIds.has(sessionCard.id)) {
            hasChanges = true;
            return false;
          }
          return true;
        })
        .map(sessionCard => {
          const updatedCard = flashcards.find(fc => fc.id === sessionCard.id);
          if (updatedCard) {
            // Check for any property changes (english, groups, etc.)
            const needsUpdate =
              sessionCard.english !== updatedCard.english ||
              sessionCard.arabic !== updatedCard.arabic ||
              JSON.stringify(sessionCard.groups || []) !== JSON.stringify(updatedCard.groups || []);

            if (needsUpdate) {
              hasChanges = true;
              return {
                ...sessionCard,
                english: updatedCard.english,
                arabic: updatedCard.arabic,
                groups: updatedCard.groups
              };
            }
          }
          return sessionCard;
        });

      if (hasChanges) {
        setSessionCards(updatedSessionCards);
      }
    }
  }, [flashcards]);

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

    // Set up callback for when cards become ready from timers
    // ANKI BEHAVIOR: Only update counts, don't change the displayed card mid-review
    // Ready cards will be incorporated when user finishes answering current card
    queueManagerRef.current.setQueueUpdateCallback((queueState) => {
      if (isMountedRef.current) {
        // Update counts to show user that cards are ready
        setCardCounts(queueState.counts);

        // Only update sessionCards if queue changed AND we're not currently reviewing
        // (i.e., queue was empty and cards were auto-pulled from waiting)
        // The queue manager only modifies the queue when it's empty, so this is safe
        setSessionCards(prevCards => {
          // If we had no cards and now have cards, update
          if (prevCards.length === 0 && queueState.queue.length > 0) {
            return [...queueState.queue];
          }
          // Otherwise keep current cards (don't interrupt)
          return prevCards;
        });
      }
    });

    // Filter flashcards by selected group
    const filteredFlashcards = selectedGroup === 'All Cards'
      ? flashcards
      : flashcards.filter(card => card.groups && card.groups.includes(selectedGroup));

    // Get cards for today's session:
    // - New cards (no progress)
    // - Cards that are already due
    // - Learning/relearning cards that will be due today (queue manager handles waiting)
    const now = new Date();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const dueCards = filteredFlashcards.filter(card => {
      const progress = userProgress[card.id];
      if (!progress) return true;  // New cards

      const nextReview = new Date(progress.next_review_at);

      // Already due - include
      if (nextReview <= now) return true;

      // Learning/relearning cards due today should stay in session
      // (they may just be waiting for their short interval)
      const cardState = progress.card_state;
      if ((cardState === 'learning' || cardState === 'relearning') && nextReview <= endOfToday) {
        return true;
      }

      return false;
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

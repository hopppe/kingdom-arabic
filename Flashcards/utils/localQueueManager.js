// Local Queue Manager - Anki-like behavior with proper queue management
// CORE PRINCIPLE: Never end session if cards have intervals < 1 day

export class LocalQueueManager {
  constructor() {
    this.queue = [];
    this.waitingCards = new Map(); // Cards with future due times
    this.timerCheckInterval = null;
    this.onQueueUpdate = null; // Callback when queue changes
  }

  // Initialize with cards and progress
  initialize(allCards, userProgress) {
    const now = new Date();
    this.queue = [];
    this.waitingCards.clear();

    let missingProgressCount = 0;

    // Sort all cards into queue
    allCards.forEach(card => {
      const progress = userProgress[card.id];

      // Use progress from userProgress if available, otherwise fallback to card's embedded data
      const cardProgress = progress || {
        card_state: card.card_state || 'new',
        next_review_at: card.next_review_at || null,
        reviews_count: card.reviews_count || 0,
        ease_factor: card.ease_factor,
        interval_days: card.interval_days,
        step_index: card.step_index,
        lapses: card.lapses
      };

      if (!progress) {
        missingProgressCount++;
      }

      // All cards go in the queue - we'll handle timing during reviews
      this.queue.push({
        ...card,
        cardProgress: cardProgress,
        dueTime: cardProgress.next_review_at ? new Date(cardProgress.next_review_at).getTime() : 0
      });
    });

    if (missingProgressCount > 0) {
      console.warn(`⚠️ ${missingProgressCount} cards missing progress data - using embedded card data`);
    }

    // Sort queue by due time (due cards first, then new cards)
    this.sortQueue();

    // Start checking for cards that become due
    this.startTimerCheck();

    return this.queue;
  }

  // Sort queue: due cards first, then by state priority
  sortQueue() {
    const now = Date.now();
    this.queue.sort((a, b) => {
      const aDue = a.dueTime && a.dueTime <= now;
      const bDue = b.dueTime && b.dueTime <= now;

      // Due cards come first
      if (aDue && !bDue) return -1;
      if (!aDue && bDue) return 1;

      // Then sort by state priority: relearning > learning > review > new
      const stateOrder = { 'relearning': 0, 'learning': 1, 'review': 2, 'new': 3 };
      const aState = a.cardProgress?.card_state || 'new';
      const bState = b.cardProgress?.card_state || 'new';

      return (stateOrder[aState] || 3) - (stateOrder[bState] || 3);
    });
  }

  // Start checking for cards that become due
  startTimerCheck() {
    if (this.timerCheckInterval) {
      clearInterval(this.timerCheckInterval);
    }

    // Check every 5 seconds
    this.timerCheckInterval = setInterval(() => {
      this.checkAndUpdateQueue();
    }, 5000);

    // Also check immediately
    this.checkAndUpdateQueue();
  }

  // Check if any waiting cards should be shown
  checkAndUpdateQueue() {
    const now = Date.now();
    let updated = false;

    // Move any due waiting cards back to queue
    this.waitingCards.forEach((waitingCard, cardId) => {
      if (waitingCard.dueTime <= now) {
        // Card is due - add to TOP of queue (highest priority)
        this.queue.unshift(waitingCard.card);
        this.waitingCards.delete(cardId);
        updated = true;
      }
    });

    // If queue is empty but we have waiting cards, show them anyway!
    if (this.queue.length === 0 && this.waitingCards.size > 0) {
      // Get the card that's due soonest
      let soonestCard = null;
      let soonestTime = Infinity;

      this.waitingCards.forEach((waitingCard, cardId) => {
        if (waitingCard.dueTime < soonestTime) {
          soonestTime = waitingCard.dueTime;
          soonestCard = { card: waitingCard.card, id: cardId };
        }
      });

      if (soonestCard) {
        // Show this card immediately (don't wait for timer)
        this.queue.push(soonestCard.card);
        this.waitingCards.delete(soonestCard.id);
        updated = true;
      }
    }

    if (updated) {
      this.sortQueue();
      if (this.onQueueUpdate) {
        this.onQueueUpdate(this.getQueueState());
      }
    }
  }

  // Handle card answer - returns updated queue
  answerCard(cardId, ankiScheduleData) {
    const now = new Date();
    const nextReviewAt = new Date(ankiScheduleData.next_review_at);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Find card in current queue
    const cardIndex = this.queue.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      console.warn(`⚠️ Card ${cardId} not found in queue`);
      return this.queue;
    }

    const card = this.queue[cardIndex];
    // Remove card from current position
    this.queue.splice(cardIndex, 1);

    // Update card with new progress
    const updatedCard = {
      ...card,
      cardProgress: ankiScheduleData,
      dueTime: nextReviewAt.getTime()
    };

    // Determine what to do with the card
    const isLearningOrRelearning =
      ankiScheduleData.card_state === 'learning' ||
      ankiScheduleData.card_state === 'relearning';

    if (isLearningOrRelearning && nextReviewAt <= endOfToday) {
      // Card stays in today's session
      const dueInMs = nextReviewAt.getTime() - now.getTime();

      if (dueInMs <= 0) {
        // Due now or overdue - add to END of queue
        this.queue.push(updatedCard);
      } else if (this.queue.length > 0 || this.waitingCards.size > 0) {
        // Has future due time AND other cards exist (in queue OR waiting) - move to waiting
        this.waitingCards.set(cardId, {
          card: updatedCard,
          dueTime: nextReviewAt.getTime()
        });
      } else {
        // Has future due time BUT no other cards anywhere - show immediately
        this.queue.push(updatedCard);
      }
    }
    // If card graduated (interval > 1 day), it's removed from session (don't add back)

    // Check if we need to pull in waiting cards (this handles rotating through cards)
    if (this.queue.length === 0 && this.waitingCards.size > 0) {
      this.checkAndUpdateQueue();
    }

    return this.queue;
  }

  // Get current queue state
  getQueueState() {
    // Count cards by state
    let newCount = 0;
    let learningCount = 0;
    let reviewCount = 0;

    // Count cards in active queue
    this.queue.forEach(item => {
      const state = item.cardProgress?.card_state || 'new';
      if (state === 'new') {
        newCount++;
      } else if (state === 'learning' || state === 'relearning') {
        learningCount++;
      } else if (state === 'review') {
        reviewCount++;
      }
    });

    // Count waiting cards (all are learning/relearning)
    this.waitingCards.forEach(item => {
      const state = item.card.cardProgress?.card_state;
      if (state === 'learning' || state === 'relearning') {
        learningCount++;
      }
    });

    const hasCardsInSession = this.queue.length > 0 || this.waitingCards.size > 0;

    return {
      queue: this.queue,
      waitingCount: this.waitingCards.size,
      hasCardsInSession,
      counts: {
        new: newCount,
        learning: learningCount,
        review: reviewCount,
        total: this.queue.length
      },
      nextDueIn: this.getNextDueTime()
    };
  }

  // Get time until next card is due (in ms)
  getNextDueTime() {
    if (this.waitingCards.size === 0) return null;

    const now = Date.now();
    let nextDue = Infinity;

    this.waitingCards.forEach(waitingCard => {
      if (waitingCard.dueTime < nextDue) {
        nextDue = waitingCard.dueTime;
      }
    });

    if (nextDue === Infinity) return null;

    const msUntilDue = nextDue - now;
    return msUntilDue > 0 ? msUntilDue : 0;
  }

  // Clean up timers and move waiting cards back to queue
  cleanup() {
    // Stop the timer check interval
    if (this.timerCheckInterval) {
      clearInterval(this.timerCheckInterval);
      this.timerCheckInterval = null;
    }

    // IMPORTANT: Don't lose waiting cards!
    // When leaving the session, waiting cards should be available for next session
    // So we DON'T clear them here - they stay in the data
    // The timers are only relevant during a session

    this.waitingCards.clear();
    this.queue = [];
  }

  // Set callback for queue updates
  setQueueUpdateCallback(callback) {
    this.onQueueUpdate = callback;
  }

  // Get formatted waiting time for UI display
  getWaitingTimeDisplay() {
    const nextDueMs = this.getNextDueTime();
    if (!nextDueMs) return null;

    const seconds = Math.ceil(nextDueMs / 1000);
    const minutes = Math.ceil(nextDueMs / 60000);

    if (seconds < 60) return `${seconds} seconds`;
    if (minutes === 1) return "1 minute";
    return `${minutes} minutes`;
  }

  // Check if session should continue
  shouldContinueSession() {
    // Session continues if we have any cards in queue or waiting
    return this.queue.length > 0 || this.waitingCards.size > 0;
  }
}

export default LocalQueueManager;
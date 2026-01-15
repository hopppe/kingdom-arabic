/**
 * Queue Manager Tests - Verifies Anki-correct queue behavior
 * Run with: node Flashcards/utils/localQueueManager.test.js
 */

import { LocalQueueManager } from './localQueueManager.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${e.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message} Expected ${expected}, got ${actual}`);
  }
}

function assertDeepEqual(actual, expected, message = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message} Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// Helper to create mock cards
function createCard(id, state = 'new', dueIn = 0) {
  const now = Date.now();
  return {
    id,
    arabic: `word_${id}`,
    english: `translation_${id}`,
    cardProgress: {
      card_state: state,
      step_index: 0,
      next_review_at: dueIn === 0 ? null : new Date(now + dueIn).toISOString(),
    }
  };
}

function createProgress(card) {
  return {
    [card.id]: card.cardProgress
  };
}

console.log('\n=== QUEUE MANAGER TESTS ===\n');

// ==========================================
// INITIALIZATION TESTS
// ==========================================
console.log('--- Initialization Tests ---');

test('Initialize with empty cards', () => {
  const qm = new LocalQueueManager();
  const queue = qm.initialize([], {});
  assertEqual(queue.length, 0);
  qm.cleanup();
});

test('Initialize with new cards', () => {
  const qm = new LocalQueueManager();
  const cards = [createCard('1'), createCard('2')];
  const progress = { ...createProgress(cards[0]), ...createProgress(cards[1]) };

  const queue = qm.initialize(cards, progress);
  assertEqual(queue.length, 2);
  qm.cleanup();
});

test('Initialize sorts by priority (relearning > learning > review > new)', () => {
  const qm = new LocalQueueManager();
  const cards = [
    createCard('new1', 'new'),
    createCard('review1', 'review'),
    createCard('learning1', 'learning'),
    createCard('relearning1', 'relearning'),
  ];
  const progress = {};
  cards.forEach(c => progress[c.id] = c.cardProgress);

  const queue = qm.initialize(cards, progress);

  // Get indices of each card type
  const getIndex = (state) => queue.findIndex(c => c.cardProgress.card_state === state);

  const relearningIdx = getIndex('relearning');
  const learningIdx = getIndex('learning');
  const reviewIdx = getIndex('review');
  const newIdx = getIndex('new');

  // Verify priority order: relearning < learning < review < new
  if (relearningIdx > learningIdx) {
    throw new Error(`Relearning (${relearningIdx}) should come before learning (${learningIdx})`);
  }
  if (learningIdx > reviewIdx) {
    throw new Error(`Learning (${learningIdx}) should come before review (${reviewIdx})`);
  }
  if (reviewIdx > newIdx) {
    throw new Error(`Review (${reviewIdx}) should come before new (${newIdx})`);
  }

  qm.cleanup();
});

// ==========================================
// NO INTERRUPTION TESTS
// ==========================================
console.log('\n--- No Interruption Tests ---');

test('Due card goes to readyCards, not directly to queue', () => {
  const qm = new LocalQueueManager();

  // Start with one card in queue
  const card1 = createCard('1', 'new');
  qm.initialize([card1], createProgress(card1));

  // Simulate a card becoming due (add to waiting then trigger check)
  const card2 = createCard('2', 'learning');
  card2.cardProgress.next_review_at = new Date(Date.now() - 1000).toISOString(); // Already due

  qm.waitingCards.set('2', {
    card: card2,
    dueTime: Date.now() - 1000 // Already past
  });

  // Before check: queue has 1 card
  assertEqual(qm.queue.length, 1);

  // Check and update - card2 should go to readyCards, NOT queue
  qm.checkAndUpdateQueue();

  // Queue should STILL have 1 card (no interruption)
  assertEqual(qm.queue.length, 1);
  assertEqual(qm.queue[0].id, '1', 'Original card should still be first');

  // card2 should be in readyCards
  assertEqual(qm.readyCards.size, 1);
  assertEqual(qm.readyCards.has('2'), true);

  qm.cleanup();
});

test('Ready cards are incorporated after answering', () => {
  const qm = new LocalQueueManager();

  // Initialize with one card
  const card1 = createCard('1', 'new');
  qm.initialize([card1], createProgress(card1));

  // Add a ready card (simulating one that became due)
  const card2 = createCard('2', 'learning');
  qm.readyCards.set('2', card2);

  // Answer card1
  const newSchedule = {
    card_state: 'review', // Graduating
    next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    interval_days: 1,
  };

  const newQueue = qm.answerCard('1', newSchedule);

  // card1 should be removed (graduated to tomorrow)
  // card2 should now be in the queue
  assertEqual(newQueue.length, 1);
  assertEqual(newQueue[0].id, '2');
  assertEqual(qm.readyCards.size, 0);

  qm.cleanup();
});

test('Answered card with future due time goes to waiting', () => {
  const qm = new LocalQueueManager();

  // Initialize with two cards
  const card1 = createCard('1', 'new');
  const card2 = createCard('2', 'new');
  qm.initialize([card1, card2], { ...createProgress(card1), ...createProgress(card2) });

  // Answer card1 with 1-minute interval (learning)
  const newSchedule = {
    card_state: 'learning',
    next_review_at: new Date(Date.now() + 60 * 1000).toISOString(), // 1 min from now
    interval_days: 1 / (24 * 60),
  };

  const newQueue = qm.answerCard('1', newSchedule);

  // card1 should go to waiting (has future due time)
  // card2 should still be in queue
  assertEqual(newQueue.length, 1);
  assertEqual(newQueue[0].id, '2');
  assertEqual(qm.waitingCards.size, 1);
  assertEqual(qm.waitingCards.has('1'), true);

  qm.cleanup();
});

// ==========================================
// QUEUE STATE TESTS
// ==========================================
console.log('\n--- Queue State Tests ---');

test('getQueueState includes ready cards in counts', () => {
  const qm = new LocalQueueManager();

  const card1 = createCard('1', 'new');
  qm.initialize([card1], createProgress(card1));

  // Add a ready learning card
  const card2 = createCard('2', 'learning');
  qm.readyCards.set('2', card2);

  const state = qm.getQueueState();

  assertEqual(state.counts.new, 1);
  assertEqual(state.counts.learning, 1); // From readyCards
  assertEqual(state.counts.total, 2); // queue + readyCards
  assertEqual(state.readyCount, 1);
  assertEqual(state.hasCardsInSession, true);

  qm.cleanup();
});

test('getQueueState includes waiting cards in counts', () => {
  const qm = new LocalQueueManager();

  const card1 = createCard('1', 'new');
  qm.initialize([card1], createProgress(card1));

  // Add a waiting learning card
  const card2 = createCard('2', 'learning');
  qm.waitingCards.set('2', {
    card: card2,
    dueTime: Date.now() + 60000
  });

  const state = qm.getQueueState();

  assertEqual(state.counts.new, 1);
  assertEqual(state.counts.learning, 1); // From waitingCards
  assertEqual(state.waitingCount, 1);
  assertEqual(state.hasCardsInSession, true);

  qm.cleanup();
});

test('shouldContinueSession returns true with ready cards', () => {
  const qm = new LocalQueueManager();
  qm.queue = [];
  qm.readyCards.set('1', createCard('1'));

  assertEqual(qm.shouldContinueSession(), true);

  qm.cleanup();
});

test('shouldContinueSession returns true with waiting cards', () => {
  const qm = new LocalQueueManager();
  qm.queue = [];
  qm.waitingCards.set('1', { card: createCard('1'), dueTime: Date.now() + 60000 });

  assertEqual(qm.shouldContinueSession(), true);

  qm.cleanup();
});

// ==========================================
// EMPTY QUEUE BEHAVIOR
// ==========================================
console.log('\n--- Empty Queue Behavior ---');

test('When queue empty, ready cards are pulled in', () => {
  const qm = new LocalQueueManager();
  qm.queue = [];

  const card1 = createCard('1', 'learning');
  qm.readyCards.set('1', card1);

  qm.checkAndUpdateQueue();

  assertEqual(qm.queue.length, 1);
  assertEqual(qm.queue[0].id, '1');
  assertEqual(qm.readyCards.size, 0);

  qm.cleanup();
});

test('When queue empty and no ready cards, waiting cards pulled in', () => {
  const qm = new LocalQueueManager();
  qm.queue = [];
  qm.readyCards.clear();

  const card1 = createCard('1', 'learning');
  qm.waitingCards.set('1', {
    card: card1,
    dueTime: Date.now() + 60000 // Future
  });

  qm.checkAndUpdateQueue();

  // Waiting card should be pulled in since queue is empty
  assertEqual(qm.queue.length, 1);
  assertEqual(qm.waitingCards.size, 0);

  qm.cleanup();
});

// ==========================================
// SUMMARY
// ==========================================
console.log('\n=== TEST SUMMARY ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed > 0) {
  console.log('\n❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}

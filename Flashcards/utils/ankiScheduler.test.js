/**
 * Anki Scheduler Logic Tests
 * Run with: node Flashcards/utils/ankiScheduler.test.js
 */

import {
  calculateAnkiSchedule,
  LEARNING_STEPS,
  GRADUATING_INTERVAL,
  EASY_INTERVAL,
  DEFAULT_EASE_FACTOR,
  MIN_EASE_FACTOR,
  MAX_EASE_FACTOR,
  LAPSE_NEW_INTERVAL_MULTIPLIER,
} from './ankiScheduler.js';

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

function assertApprox(actual, expected, tolerance = 0.01, message = '') {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message} Expected ~${expected}, got ${actual}`);
  }
}

function assertGreaterThan(actual, min, message = '') {
  if (actual <= min) {
    throw new Error(`${message} Expected > ${min}, got ${actual}`);
  }
}

function assertLessThanOrEqual(actual, max, message = '') {
  if (actual > max) {
    throw new Error(`${message} Expected <= ${max}, got ${actual}`);
  }
}

// Convert days to minutes for easier verification
const toMinutes = (days) => Math.round(days * 24 * 60);

console.log('\n=== ANKI SCHEDULER TESTS ===\n');

// ==========================================
// NEW CARD TESTS
// ==========================================
console.log('--- New Card Tests ---');

test('New + Again → Learning step 0 (1 min)', () => {
  const result = calculateAnkiSchedule({ card_state: 'new' }, 1);
  assertEqual(result.card_state, 'learning');
  assertEqual(result.step_index, 0);
  assertEqual(toMinutes(result.interval_days), 1);
});

test('New + Hard → Learning step 0 (5.5 min average)', () => {
  const result = calculateAnkiSchedule({ card_state: 'new' }, 2);
  assertEqual(result.card_state, 'learning');
  assertEqual(result.step_index, 0);
  // Average of 1 and 10 = 5.5
  assertApprox(toMinutes(result.interval_days), 5.5, 0.5);
});

test('New + Good → Learning step 1 (10 min)', () => {
  const result = calculateAnkiSchedule({ card_state: 'new' }, 3);
  assertEqual(result.card_state, 'learning');
  assertEqual(result.step_index, 1);  // Good on new card advances directly to step 1
  assertEqual(toMinutes(result.interval_days), 10);
});

test('New + Easy → Review (2 days)', () => {
  const result = calculateAnkiSchedule({ card_state: 'new' }, 4);
  assertEqual(result.card_state, 'review');
  // With fuzzing, should be approximately 2 days
  assertApprox(result.interval_days, EASY_INTERVAL, 0.15);
});

// ==========================================
// LEARNING CARD TESTS (Step 0)
// ==========================================
console.log('\n--- Learning Card Tests (Step 0) ---');

test('Learning(0) + Again → Stay at step 0 (1 min)', () => {
  const result = calculateAnkiSchedule({ card_state: 'learning', step_index: 0 }, 1);
  assertEqual(result.card_state, 'learning');
  assertEqual(result.step_index, 0);
  assertEqual(toMinutes(result.interval_days), 1);
});

test('Learning(0) + Hard → Stay at step 0 (5.5 min)', () => {
  const result = calculateAnkiSchedule({ card_state: 'learning', step_index: 0 }, 2);
  assertEqual(result.card_state, 'learning');
  assertEqual(result.step_index, 0);
  assertApprox(toMinutes(result.interval_days), 5.5, 0.5);
});

test('Learning(0) + Good → Advance to step 1 (10 min)', () => {
  const result = calculateAnkiSchedule({ card_state: 'learning', step_index: 0 }, 3);
  assertEqual(result.card_state, 'learning');
  assertEqual(result.step_index, 1);
  assertEqual(toMinutes(result.interval_days), 10);
});

test('Learning(0) + Easy → Graduate to review (2 days)', () => {
  const result = calculateAnkiSchedule({ card_state: 'learning', step_index: 0 }, 4);
  assertEqual(result.card_state, 'review');
  assertApprox(result.interval_days, EASY_INTERVAL, 0.15);
});

// ==========================================
// LEARNING CARD TESTS (Step 1 - Final Step)
// ==========================================
console.log('\n--- Learning Card Tests (Step 1 - Final) ---');

test('Learning(1) + Again → Reset to step 0 (1 min)', () => {
  const result = calculateAnkiSchedule({ card_state: 'learning', step_index: 1 }, 1);
  assertEqual(result.card_state, 'learning');
  assertEqual(result.step_index, 0);
  assertEqual(toMinutes(result.interval_days), 1);
});

test('Learning(1) + Hard → Stay at step 1 (10 min)', () => {
  const result = calculateAnkiSchedule({ card_state: 'learning', step_index: 1 }, 2);
  assertEqual(result.card_state, 'learning');
  assertEqual(result.step_index, 1);
  assertEqual(toMinutes(result.interval_days), 10);
});

test('Learning(1) + Good → Graduate to review (1 day)', () => {
  const result = calculateAnkiSchedule({ card_state: 'learning', step_index: 1 }, 3);
  assertEqual(result.card_state, 'review');
  // With fuzzing, should be approximately 1 day
  assertApprox(result.interval_days, GRADUATING_INTERVAL, 0.1);
});

test('Learning(1) + Easy → Graduate to review (2 days)', () => {
  const result = calculateAnkiSchedule({ card_state: 'learning', step_index: 1 }, 4);
  assertEqual(result.card_state, 'review');
  assertApprox(result.interval_days, EASY_INTERVAL, 0.15);
});

// ==========================================
// REVIEW CARD TESTS
// ==========================================
console.log('\n--- Review Card Tests ---');

test('Review + Again → Relearning step 0, ease decreases', () => {
  const result = calculateAnkiSchedule({
    card_state: 'review',
    interval_days: 10,
    ease_factor: 2.5
  }, 1);
  assertEqual(result.card_state, 'relearning');
  assertEqual(result.step_index, 0);
  assertEqual(toMinutes(result.interval_days), 1);
  assertEqual(result.lapses, 1);
  assertEqual(result.ease_factor, 2.30); // 2.5 - 0.20
  assertEqual(result.scheduled_days_before_lapse, 10);
});

test('Review + Hard → Interval * 1.2, ease decreases', () => {
  const result = calculateAnkiSchedule({
    card_state: 'review',
    interval_days: 10,
    ease_factor: 2.5
  }, 2);
  assertEqual(result.card_state, 'review');
  // 10 * 1.2 = 12, with fuzzing ~12
  assertApprox(result.interval_days, 12, 1);
  assertEqual(result.ease_factor, 2.35); // 2.5 - 0.15
});

test('Review + Good → Interval * ease, ease unchanged', () => {
  const result = calculateAnkiSchedule({
    card_state: 'review',
    interval_days: 10,
    ease_factor: 2.5
  }, 3);
  assertEqual(result.card_state, 'review');
  // 10 * 2.5 = 25, with fuzzing ~25
  assertApprox(result.interval_days, 25, 2);
  assertEqual(result.ease_factor, 2.5);
});

test('Review + Easy → Interval * ease * 1.15, ease increases', () => {
  const result = calculateAnkiSchedule({
    card_state: 'review',
    interval_days: 10,
    ease_factor: 2.5
  }, 4);
  assertEqual(result.card_state, 'review');
  // 10 * 2.5 * 1.15 = 28.75, with fuzzing ~28.75
  assertApprox(result.interval_days, 28.75, 2);
  assertEqual(result.ease_factor, 2.6); // 2.5 + 0.10
});

// ==========================================
// RELEARNING CARD TESTS
// ==========================================
console.log('\n--- Relearning Card Tests ---');

test('Relearning(0) + Good → Advance to step 1 (10 min)', () => {
  const result = calculateAnkiSchedule({
    card_state: 'relearning',
    step_index: 0,
    scheduled_days_before_lapse: 10
  }, 3);
  assertEqual(result.card_state, 'relearning');
  assertEqual(result.step_index, 1);
  assertEqual(toMinutes(result.interval_days), 10);
});

test('Relearning(1) + Good → Graduate back to review (50% of prev)', () => {
  const result = calculateAnkiSchedule({
    card_state: 'relearning',
    step_index: 1,
    scheduled_days_before_lapse: 10
  }, 3);
  assertEqual(result.card_state, 'review');
  // 10 * 0.5 = 5 days (with fuzzing)
  assertApprox(result.interval_days, 5, 0.5);
});

test('Relearning + Easy → Graduate back to review (70% of prev)', () => {
  const result = calculateAnkiSchedule({
    card_state: 'relearning',
    step_index: 0,
    scheduled_days_before_lapse: 10
  }, 4);
  assertEqual(result.card_state, 'review');
  // Should be at least 1 day
  assertGreaterThan(result.interval_days, 0.9);
});

// ==========================================
// EASE FACTOR BOUNDS TESTS
// ==========================================
console.log('\n--- Ease Factor Bounds Tests ---');

test('Ease factor has minimum bound', () => {
  const result = calculateAnkiSchedule({
    card_state: 'review',
    interval_days: 10,
    ease_factor: 1.35 // Close to minimum
  }, 2); // Hard decreases ease by 0.15
  assertEqual(result.ease_factor, MIN_EASE_FACTOR);
});

test('Ease factor has maximum bound', () => {
  const result = calculateAnkiSchedule({
    card_state: 'review',
    interval_days: 10,
    ease_factor: 2.95 // Close to maximum
  }, 4); // Easy increases ease by 0.10
  assertEqual(result.ease_factor, MAX_EASE_FACTOR);
});

// ==========================================
// FUZZING TESTS
// ==========================================
console.log('\n--- Fuzzing Tests ---');

test('Fuzzing does not push 1-day interval below 1 day', () => {
  // Run multiple times to check fuzzing
  for (let i = 0; i < 20; i++) {
    const result = calculateAnkiSchedule({
      card_state: 'learning',
      step_index: 1
    }, 3); // Good → Graduate to 1 day
    assertGreaterThan(result.interval_days, 0.99, `Iteration ${i}: `);
  }
});

test('Daily intervals get midnight scheduling', () => {
  const result = calculateAnkiSchedule({
    card_state: 'learning',
    step_index: 1
  }, 3);
  // Should have T00:00:00 in the timestamp (local midnight converted to ISO)
  const reviewDate = new Date(result.next_review_at);
  // Check that hours are 0 in local time
  const localMidnight = new Date(reviewDate);
  localMidnight.setHours(0, 0, 0, 0);
  assertEqual(reviewDate.getTime(), localMidnight.getTime(), 'Should be local midnight');
});

test('Learning intervals use exact time (not midnight)', () => {
  const before = new Date();
  // Use Again on new card to get 1 minute interval (Good now gives 10 min)
  const result = calculateAnkiSchedule({ card_state: 'new' }, 1);
  const after = new Date();

  const reviewTime = new Date(result.next_review_at);
  // Should be ~1 minute from now, not at midnight
  const expectedTime = new Date(before.getTime() + 60 * 1000);

  // Check it's within a reasonable range (within 2 minutes of expected)
  const diff = Math.abs(reviewTime.getTime() - expectedTime.getTime());
  if (diff > 2 * 60 * 1000) {
    throw new Error(`Learning interval should use exact time, not midnight. Diff: ${diff}ms`);
  }
});

// ==========================================
// FULL PROGRESSION TEST
// ==========================================
console.log('\n--- Full Progression Test ---');

test('Complete card lifecycle: New → Learning → Review → Relearning → Review', () => {
  // Start as new card
  let progress = { card_state: 'new' };

  // Step 1: New + Good → Learning(1), 10 min (seeing card counts as step 0)
  progress = calculateAnkiSchedule(progress, 3);
  assertEqual(progress.card_state, 'learning');
  assertEqual(progress.step_index, 1);

  // Step 2: Learning(1) + Good → Review, 1 day
  progress = calculateAnkiSchedule(progress, 3);
  assertEqual(progress.card_state, 'review');
  assertApprox(progress.interval_days, 1, 0.1);

  // Step 4: Review + Good → Review, ~2.5 days
  progress = calculateAnkiSchedule(progress, 3);
  assertEqual(progress.card_state, 'review');
  assertApprox(progress.interval_days, 2.5, 0.5);

  // Step 5: Review + Again → Relearning(0), 1 min
  const prevInterval = progress.interval_days;
  progress = calculateAnkiSchedule(progress, 1);
  assertEqual(progress.card_state, 'relearning');
  assertEqual(progress.step_index, 0);
  assertEqual(progress.lapses, 1);
  assertEqual(progress.scheduled_days_before_lapse, prevInterval);

  // Step 6: Relearning(0) + Good → Relearning(1), 10 min
  progress = calculateAnkiSchedule(progress, 3);
  assertEqual(progress.card_state, 'relearning');
  assertEqual(progress.step_index, 1);

  // Step 7: Relearning(1) + Good → Review, ~50% of prev
  progress = calculateAnkiSchedule(progress, 3);
  assertEqual(progress.card_state, 'review');
  // Should be about 50% of ~2.5 = ~1.25, minimum 1
  assertGreaterThan(progress.interval_days, 0.9);
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

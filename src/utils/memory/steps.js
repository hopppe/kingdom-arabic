// Practice-session step constants shared by MemoryVerseContext and the
// Memorize screens.

export const STEP = {
  LEARN: 0,
  FADE: 1,
  FIRST_LETTERS: 2,
  BUILD: 3,
  RECALL: 4,
};

export const STEP_ORDER = [STEP.LEARN, STEP.FADE, STEP.FIRST_LETTERS, STEP.BUILD, STEP.RECALL];

export const STEP_LABELS = {
  [STEP.LEARN]: 'Learn',
  [STEP.FADE]: 'Fade',
  [STEP.FIRST_LETTERS]: 'First letters',
  [STEP.BUILD]: 'Build',
  [STEP.RECALL]: 'Recall',
};

export const FADE_ROUND_COUNT = 4; // matches FADE_FRACTIONS in hideSelection.js

// The Stats page's two headline numbers: flashcard words learned and verses memorized,
// each as { done, total, due, fraction } for a single progress bar.

const summarize = (done, total, due) => ({
  done,
  total,
  due,
  fraction: total > 0 ? Math.min(done / total, 1) : 0,
});

/** buckets from bucketFlashcardProgress: a card counts as learned once it has graduated to review. */
export function summarizeFlashcards(buckets) {
  const { new: fresh = 0, learning = 0, young = 0, mature = 0, dueToday = 0 } = buckets || {};
  return summarize(young + mature, fresh + learning + young + mature, dueToday);
}

/** stats from computeMemoryStats: reviewing + mastered verses are memorized. */
export function summarizeMemoryVerses(stats) {
  const { total = 0, reviewing = 0, mastered = 0, dueToday = 0 } = stats || {};
  return summarize(reviewing + mastered, total, dueToday);
}

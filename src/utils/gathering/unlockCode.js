// The Gathering section is private: it stays hidden until this code is typed into
// Bible search and submitted. Disclose it to App Review in the review notes.
export const GATHERING_UNLOCK_CODE = 'gathering';

/** True when a submitted search query is the unlock code (case and surrounding spaces ignored). */
export function isGatheringUnlockCode(query) {
  if (typeof query !== 'string') return false;
  return query.trim().toLowerCase() === GATHERING_UNLOCK_CODE;
}

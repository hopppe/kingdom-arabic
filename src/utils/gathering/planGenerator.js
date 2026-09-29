// Builds a random gathering plan: one item per slot from the plan pools.
// A plan is { createdAt, picks: { [slotKey]: itemId } }; `rng` returns [0, 1).

const pickIndex = (length, rng) => Math.min(length - 1, Math.floor(rng() * length));

/** A random item id from `slot`, avoiding `avoidId` when the pool allows it. */
export function pickItemId(slot, rng = Math.random, avoidId = null) {
  const candidates = slot.items.length > 1 ? slot.items.filter((item) => item.id !== avoidId) : slot.items;
  if (candidates.length === 0) return null;
  return candidates[pickIndex(candidates.length, rng)].id;
}

/** A new plan; each slot differs from `previous` where possible. */
export function createPlan(slots, rng = Math.random, previous = null, now = new Date()) {
  const picks = Object.fromEntries(
    slots.map((slot) => [slot.key, pickItemId(slot, rng, previous?.picks?.[slot.key] ?? null)])
  );
  return { createdAt: now.toISOString(), picks };
}

/** A copy of `plan` with one slot re-drawn. */
export function rerollSlot(plan, slots, slotKey, rng = Math.random) {
  const slot = slots.find((s) => s.key === slotKey);
  if (!plan || !slot) return plan;
  return { ...plan, picks: { ...plan.picks, [slotKey]: pickItemId(slot, rng, plan.picks?.[slotKey]) } };
}

/**
 * Resolves a stored plan against the current pools: [{ slot, item }] in slot order.
 * Returns null when the plan is missing or any pick no longer exists (content changed).
 */
export function resolvePlan(plan, slots) {
  if (!plan || typeof plan.picks !== 'object' || plan.picks === null) return null;
  const resolved = slots.map((slot) => ({
    slot,
    item: slot.items.find((item) => item.id === plan.picks[slot.key]) ?? null,
  }));
  return resolved.every((entry) => entry.item) ? resolved : null;
}

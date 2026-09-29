import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PLAN_SLOTS } from '../data/gathering/gathering';
import { createPlan, rerollSlot, resolvePlan } from '../utils/gathering/planGenerator';

const GATHERING_PLAN_KEY = '@learnarabic_gathering_plan';
const GATHERING_ENGLISH_KEY = '@learnarabic_gathering_english';

/** Corrupt JSON (e.g. from a bad restore) is cleared so it doesn't fail on every launch. */
function parseStoredPlan(storedPlan) {
  if (!storedPlan) return null;
  try {
    return JSON.parse(storedPlan);
  } catch (error) {
    console.warn('Discarding unreadable gathering plan:', error);
    AsyncStorage.removeItem(GATHERING_PLAN_KEY).catch(() => {});
    return null;
  }
}

/**
 * The saved gathering plan and the English toggle.
 * `picks` maps a group key to its chosen item ({ id, ref } | { id, hymn }), or is null with no plan.
 */
export function useGatheringPlan() {
  const [plan, setPlan] = useState(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const planRef = useRef(null);
  const englishRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.multiGet([GATHERING_PLAN_KEY, GATHERING_ENGLISH_KEY])
      .then(([[, storedPlan], [, storedEnglish]]) => {
        if (cancelled) return;
        const parsed = parseStoredPlan(storedPlan);
        // A plan whose items were removed from the content is dropped rather than half-shown.
        if (resolvePlan(parsed, PLAN_SLOTS)) {
          planRef.current = parsed;
          setPlan(parsed);
        }
        englishRef.current = storedEnglish === 'true';
        setShowEnglish(englishRef.current);
      })
      .catch((error) => console.error('Failed to load gathering plan:', error))
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback((next) => {
    planRef.current = next;
    setPlan(next);
    const write = next
      ? AsyncStorage.setItem(GATHERING_PLAN_KEY, JSON.stringify(next))
      : AsyncStorage.removeItem(GATHERING_PLAN_KEY);
    write.catch((error) => console.error('Failed to save gathering plan:', error));
  }, []);

  const generate = useCallback(() => save(createPlan(PLAN_SLOTS, Math.random, planRef.current)), [save]);
  const reroll = useCallback((slotKey) => save(rerollSlot(planRef.current, PLAN_SLOTS, slotKey)), [save]);
  const clear = useCallback(() => save(null), [save]);

  const toggleEnglish = useCallback(() => {
    const next = !englishRef.current;
    englishRef.current = next;
    setShowEnglish(next);
    AsyncStorage.setItem(GATHERING_ENGLISH_KEY, String(next)).catch((error) =>
      console.error('Failed to save gathering English setting:', error)
    );
  }, []);

  const picks = useMemo(() => {
    const resolved = resolvePlan(plan, PLAN_SLOTS);
    return resolved ? Object.fromEntries(resolved.map(({ slot, item }) => [slot.key, item])) : null;
  }, [plan]);

  return { picks, loaded, generate, reroll, clear, showEnglish, toggleEnglish };
}

import { useEffect, useState } from 'react';

// Whether the app has finished starting up (or is showing a first-run/error screen),
// so the animated splash can fade out. Set once per launch.
let appReady = false;
const listeners = new Set();

export function markAppReady() {
  if (appReady) return;
  appReady = true;
  listeners.forEach((listener) => listener());
  listeners.clear();
}

export function useAppReady() {
  const [ready, setReady] = useState(appReady);
  useEffect(() => {
    if (appReady) {
      setReady(true);
      return undefined;
    }
    const listener = () => setReady(true);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);
  return ready;
}

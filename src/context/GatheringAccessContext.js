// Whether the private Gathering section has been unlocked on this device.
//
// useGatheringAccess() returns:
//   unlocked  - true once the unlock code has been entered in search
//   loaded    - true once AsyncStorage has been read
//   unlock()  - unlocks permanently (persisted, and carried by backups)
//
// Persisted under `@learnarabic_gathering_unlocked`. The code check lives in
// src/utils/gathering/unlockCode.js.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const GATHERING_UNLOCKED_KEY = '@learnarabic_gathering_unlocked';

const GatheringAccessContext = createContext(null);

export function GatheringAccessProvider({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(GATHERING_UNLOCKED_KEY)
      .then((stored) => {
        if (!cancelled && stored === 'true') setUnlocked(true);
      })
      .catch((error) => console.error('Failed to load gathering access:', error))
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const unlock = useCallback(() => {
    setUnlocked(true);
    AsyncStorage.setItem(GATHERING_UNLOCKED_KEY, 'true').catch((error) =>
      console.error('Failed to save gathering access:', error)
    );
  }, []);

  const value = useMemo(() => ({ unlocked, loaded, unlock }), [unlocked, loaded, unlock]);

  return <GatheringAccessContext.Provider value={value}>{children}</GatheringAccessContext.Provider>;
}

export function useGatheringAccess() {
  const context = useContext(GatheringAccessContext);
  if (!context) throw new Error('useGatheringAccess must be used within GatheringAccessProvider');
  return context;
}

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addActivity } from '../utils/activityStats';

export const ACTIVITY_KEY = '@learnarabic_activity_log';

const ActivityContext = createContext(null);

export function ActivityProvider({ children }) {
  const [activityLog, setActivityLog] = useState({});
  const [loaded, setLoaded] = useState(false);
  const logRef = useRef(activityLog);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(ACTIVITY_KEY)
      .then((stored) => {
        if (cancelled || !stored) return;
        const parsed = JSON.parse(stored);
        logRef.current = parsed;
        setActivityLog(parsed);
      })
      .catch((error) => console.error('Failed to load activity log:', error))
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Record study activity for today. `type` is one of ACTIVITY_TYPES. */
  const logActivity = useCallback((type, count = 1) => {
    if (count <= 0) return;
    const next = addActivity(logRef.current, type, count);
    logRef.current = next;
    setActivityLog(next);
    AsyncStorage.setItem(ACTIVITY_KEY, JSON.stringify(next)).catch((error) =>
      console.error('Failed to save activity log:', error)
    );
  }, []);

  const value = useMemo(() => ({ activityLog, loaded, logActivity }), [activityLog, loaded, logActivity]);

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

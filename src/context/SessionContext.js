import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SessionContext = createContext({});

const SESSION_KEY = '@learnarabic_session';

const DEFAULT_SESSION = {
  lastScreen: 'Reader',
  lastBook: 'MRK',
  lastChapter: 1,
};

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(DEFAULT_SESSION);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef(null);

  // Load session from storage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSession = await AsyncStorage.getItem(SESSION_KEY);
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          setSession(parsed);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // Debounced save to AsyncStorage - only save after 500ms of no updates
  const scheduleSave = useCallback((newSession) => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Schedule save to disk after delay
    saveTimeoutRef.current = setTimeout(() => {
      AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newSession)).catch(error => {
        console.error('Error saving session:', error);
      });
    }, 500);
  }, []);

  // Save immediately on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Save immediately on cleanup
        AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session)).catch(error => {
          console.error('Error saving session on unmount:', error);
        });
      }
    };
  }, [session]);

  // Update last screen
  const setLastScreen = useCallback((screenName) => {
    setSession(prev => {
      const newSession = { ...prev, lastScreen: screenName };
      scheduleSave(newSession);
      return newSession;
    });
  }, [scheduleSave]);

  // Update last passage
  const setLastPassage = useCallback((book, chapter) => {
    setSession(prev => {
      const newSession = { ...prev, lastBook: book, lastChapter: chapter };
      scheduleSave(newSession);
      return newSession;
    });
  }, [scheduleSave]);

  const value = {
    session,
    loading,
    setLastScreen,
    setLastPassage,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

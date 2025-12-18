import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { FlashcardProvider } from './src/context/FlashcardContext';
import { initializeNotifications } from './src/utils/notifications';

export default function App() {
  // Initialize notification channel on app startup
  useEffect(() => {
    initializeNotifications();
  }, []);

  return (
    <ThemeProvider>
      <FlashcardProvider>
        <AppNavigator />
      </FlashcardProvider>
    </ThemeProvider>
  );
}

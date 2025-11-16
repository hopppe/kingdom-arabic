import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { FlashcardProvider } from './src/context/FlashcardContext';

export default function App() {
  return (
    <ThemeProvider>
      <FlashcardProvider>
        <AppNavigator />
      </FlashcardProvider>
    </ThemeProvider>
  );
}

import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { FlashcardProvider } from './src/context/FlashcardContext';
import { SessionProvider } from './src/context/SessionContext';
import { TTSProvider } from './src/context/TTSContext';

export default function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <FlashcardProvider>
          <TTSProvider>
            <AppNavigator />
          </TTSProvider>
        </FlashcardProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

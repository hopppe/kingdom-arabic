import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { BibleDbProvider } from './src/context/BibleDbContext';
import { AppDataBoundary } from './src/context/AppDataContext';
import { ActivityProvider } from './src/context/ActivityContext';
import { FlashcardProvider } from './src/context/FlashcardContext';
import { MemoryVerseProvider } from './src/context/MemoryVerseContext';
import { ReadingProgressProvider } from './src/context/ReadingProgressContext';
import { ARABIC_FONT_ASSETS } from './src/theme/arabicFonts';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden (e.g. fast refresh); nothing to do.
});

// Rendered once the Bible database is open and preferences are loaded.
function AppReady() {
  const { theme, prefsLoaded } = useTheme();

  useEffect(() => {
    if (prefsLoaded) SplashScreen.hide();
  }, [prefsLoaded]);

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

function DatabaseError({ error }) {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Could not open the Bible</Text>
      <Text style={styles.errorBody}>
        Please close and reopen the app. If this keeps happening, reinstall it. ({error.message})
      </Text>
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts(ARABIC_FONT_ASSETS);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    if (fontError) console.error('Failed to load Arabic fonts:', fontError);
  }, [fontError]);

  // A failed font load falls back to the system font rather than blocking the app.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (dbError) {
    return <DatabaseError error={dbError} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <BibleDbProvider onError={setDbError}>
          <AppDataBoundary>
            <ActivityProvider>
              <FlashcardProvider>
                <MemoryVerseProvider>
                  <ReadingProgressProvider>
                    <AppReady />
                  </ReadingProgressProvider>
                </MemoryVerseProvider>
              </FlashcardProvider>
            </ActivityProvider>
          </AppDataBoundary>
        </BibleDbProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  errorBody: { fontSize: 15, textAlign: 'center', color: '#666666' },
});

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { BibleDbProvider } from './src/context/BibleDbContext';
import { AppDataBoundary } from './src/context/AppDataContext';
import { ActivityProvider } from './src/context/ActivityContext';
import { FlashcardProvider } from './src/context/FlashcardContext';
import { MemoryVerseProvider } from './src/context/MemoryVerseContext';
import { ReadingProgressProvider } from './src/context/ReadingProgressContext';
import { GatheringAccessProvider, useGatheringAccess } from './src/context/GatheringAccessContext';
import { ARABIC_FONT_ASSETS } from './src/theme/arabicFonts';
import AnimatedSplash from './src/components/splash/AnimatedSplash';
import { markAppReady } from './src/components/splash/splashState';

// The native launch screen stays up until the animated splash has drawn over it.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden (e.g. fast refresh); nothing to do.
});

// Rendered once the Bible database is open and preferences are loaded.
function AppReady() {
  const { theme, prefsLoaded } = useTheme();
  const { loaded: gatheringAccessLoaded } = useGatheringAccess();
  const ready = prefsLoaded && gatheringAccessLoaded;

  useEffect(() => {
    if (ready) markAppReady();
  }, [ready]);

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

function DatabaseError({ error }) {
  useEffect(() => {
    markAppReady();
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

  const [showSplash, setShowSplash] = useState(true);
  const hideSplash = useCallback(() => setShowSplash(false), []);

  // A failed font load falls back to the system font rather than blocking the app.
  const fontsSettled = fontsLoaded || Boolean(fontError);

  let content = null;
  if (dbError) {
    content = <DatabaseError error={dbError} />;
  } else if (fontsSettled) {
    content = (
      <SafeAreaProvider>
        {/* Restoring a backup remounts everything inside the boundary so it re-reads storage. */}
        <AppDataBoundary>
          <ThemeProvider>
            <BibleDbProvider onError={setDbError}>
              <ActivityProvider>
                <FlashcardProvider>
                  <MemoryVerseProvider>
                    <ReadingProgressProvider>
                      <GatheringAccessProvider>
                        <AppReady />
                      </GatheringAccessProvider>
                    </ReadingProgressProvider>
                  </MemoryVerseProvider>
                </FlashcardProvider>
              </ActivityProvider>
            </BibleDbProvider>
          </ThemeProvider>
        </AppDataBoundary>
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      {content}
      {showSplash && <AnimatedSplash onFinish={hideSplash} />}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  errorBody: { fontSize: 15, textAlign: 'center', color: '#666666' },
});

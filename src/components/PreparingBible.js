import React, { useEffect, useMemo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '../context/ThemeContext';

// Shown on first launch while the bundled Bible database is installed, so the
// app doesn't sit on the splash screen looking frozen.
export function PreparingBible() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={theme.colors.textSecondary} />
      <Text style={styles.title}>Preparing the Bible…</Text>
      <Text style={styles.body}>This only happens the first time you open the app.</Text>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.background,
    },
    title: { marginTop: theme.spacing.md, fontSize: 18, fontWeight: '600', color: theme.colors.text },
    body: { marginTop: theme.spacing.sm, fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center' },
  });

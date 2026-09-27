import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../navigation/routes';
import { CONTENT_MAX_WIDTH } from '../../utils/layout';
import ProgressContent from './ProgressContent';

// Progress tab (tablets). Phones show the same cards inside reader Settings.
export default function ProgressScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Progress</Text>
        <ProgressContent
          onOpenFlashcards={() => navigation.navigate(ROUTES.FLASHCARDS)}
          onOpenMemorize={() => navigation.navigate(ROUTES.MEMORIZE)}
        />
      </ScrollView>
      {/* Solid strip behind the status bar so cards don't scroll under the clock. */}
      <View style={styles.statusBarBackdrop} />
    </View>
  );
}

const createStyles = (theme, topInset) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      width: '100%',
      maxWidth: CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      paddingTop: topInset + theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    title: {
      fontSize: 34,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginHorizontal: theme.spacing.md + 4,
      marginBottom: theme.spacing.md,
    },
    statusBarBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: topInset,
      backgroundColor: theme.colors.background,
    },
  });

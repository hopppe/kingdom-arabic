// Step 1: chunking + meaning. Show short phrases with their English gloss,
// then the full English verse, before any recall drilling begins.
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { buildPhraseGloss } from '../../../utils/memory/glossBuilder';

export function LearnStep({ reference, chunks, alignedTokens, englishVerse, onSpeak, onNext }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.reference}>{reference}</Text>

        {chunks.map((chunk, chunkIndex) => {
          const phraseAligned = chunk.map((token) => alignedTokens[token.index]);
          const meaning = buildPhraseGloss(phraseAligned);
          return (
            <View key={chunkIndex} style={styles.phraseCard}>
              <Text style={[theme.arabic.large, styles.phraseArabic]}>
                {chunk.map((t) => t.raw).join(' ')}
              </Text>
              {!!meaning && <Text style={styles.phraseMeaning}>{meaning}</Text>}
            </View>
          );
        })}

        <View style={styles.englishCard}>
          <Text style={styles.englishLabel}>Full verse</Text>
          <Text style={styles.englishText}>{englishVerse}</Text>
        </View>

        <View style={styles.listenRow}>
          <TouchableOpacity style={styles.listenButton} onPress={() => onSpeak({ slow: false })}>
            <Ionicons name="volume-high" size={18} color={theme.colors.info} />
            <Text style={styles.listenText}>Listen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listenButton} onPress={() => onSpeak({ slow: true })}>
            <Ionicons name="volume-medium" size={18} color={theme.colors.info} />
            <Text style={styles.listenText}>Listen slowly</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={onNext}>
        <Text style={styles.nextButtonText}>Start practicing</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.md },
    reference: { fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
    phraseCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    phraseArabic: { textAlign: 'right', color: theme.colors.text, marginBottom: 6 },
    phraseMeaning: { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm },
    englishCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    englishLabel: { fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary, marginBottom: 4, textTransform: 'uppercase' },
    englishText: { fontSize: theme.typography.fontSize.md, color: theme.colors.text, lineHeight: 22 },
    listenRow: { flexDirection: 'row', gap: 12, marginBottom: theme.spacing.md },
    listenButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border },
    listenText: { color: theme.colors.info, fontSize: theme.typography.fontSize.sm },
    nextButton: {
      backgroundColor: theme.colors.info,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 14,
      alignItems: 'center',
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    nextButtonText: { color: theme.colors.textOnPrimary, fontWeight: theme.typography.fontWeight.semibold, fontSize: theme.typography.fontSize.md },
  });

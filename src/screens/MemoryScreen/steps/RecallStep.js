// Step 5: recall. Only the reference + English are shown; the user recites
// from memory, reveals the Arabic, then self-grades. Reviews reuse this step,
// with an optional first-letters hint available before revealing.
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { firstLetterCueTokens } from '../../../utils/memory/firstLetters';
import { RATINGS } from '../../../utils/memory/scheduler';

const RATING_CONFIG = [
  { rating: RATINGS.AGAIN, label: 'Again', colorKey: 'error' },
  { rating: RATINGS.HARD, label: 'Hard', colorKey: 'warning' },
  { rating: RATINGS.GOOD, label: 'Good', colorKey: 'success' },
  { rating: RATINGS.EASY, label: 'Easy', colorKey: 'info' },
];

export function RecallStep({ reference, englishVerse, tokens, onHint, onGrade, isReview }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleShowHint = () => {
    setShowHint(true);
    onHint();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.reference}>{reference}</Text>
      <Text style={styles.englishText}>{englishVerse}</Text>

      {!revealed ? (
        <View style={styles.reciteArea}>
          <Text style={styles.reciteHint}>Recite the verse in Arabic from memory.</Text>
          {isReview && !showHint && (
            <TouchableOpacity style={styles.hintButton} onPress={handleShowHint}>
              <Text style={styles.hintButtonText}>Show first-letter hint</Text>
            </TouchableOpacity>
          )}
          {showHint && (
            <View style={styles.hintWrap}>
              {firstLetterCueTokens(tokens).map((cue, i) => (
                <Text key={i} style={[theme.arabic.body, styles.hintWord]}>
                  {cue}
                </Text>
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.revealButton} onPress={() => setRevealed(true)}>
            <Text style={styles.revealButtonText}>Reveal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={[theme.arabic.large, styles.arabicText]}>{tokens.map((t) => t.raw).join(' ')}</Text>
          <Text style={styles.gradePrompt}>How did you do?</Text>
          <View style={styles.ratingRow}>
            {RATING_CONFIG.map(({ rating, label, colorKey }) => (
              <TouchableOpacity
                key={rating}
                style={[styles.ratingButton, { backgroundColor: theme.colors[colorKey] }]}
                onPress={() => onGrade(rating)}
              >
                <Text style={styles.ratingButtonText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: theme.spacing.md },
    reference: { fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text, marginBottom: 8 },
    englishText: { fontSize: theme.typography.fontSize.md, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl, lineHeight: 22 },
    reciteArea: { alignItems: 'center' },
    reciteHint: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.md, textAlign: 'center' },
    hintButton: { marginBottom: theme.spacing.md },
    hintButtonText: { color: theme.colors.info, fontSize: theme.typography.fontSize.sm },
    hintWrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', marginBottom: theme.spacing.md },
    hintWord: { marginHorizontal: 4, marginBottom: 8, color: theme.colors.text },
    revealButton: {
      backgroundColor: theme.colors.buttonBackground,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 12,
      paddingHorizontal: 32,
    },
    revealButtonText: { color: theme.colors.buttonText, fontWeight: theme.typography.fontWeight.semibold, fontSize: theme.typography.fontSize.md },
    arabicText: { textAlign: 'right', color: theme.colors.text, marginBottom: theme.spacing.lg },
    gradePrompt: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
    ratingRow: { flexDirection: 'row', gap: 8, marginBottom: theme.spacing.md },
    ratingButton: { flex: 1, borderRadius: theme.borderRadius.md, paddingVertical: 14, alignItems: 'center' },
    ratingButtonText: { color: theme.colors.white, fontWeight: theme.typography.fontWeight.semibold, fontSize: theme.typography.fontSize.sm },
  });

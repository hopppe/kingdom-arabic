// Step 2: vanishing cues. Each round hides a larger share of the verse's
// words; tapping a hidden word reveals it (and counts as a hint).
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { FADE_FRACTIONS, selectHiddenIndices, hashSeed, createSeededRandom } from '../../../utils/memory/hideSelection';

export function FadeStep({ reference, tokens, verseId, fadeRound, onHint, onNextRound, onFinish }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [revealed, setRevealed] = useState(() => new Set());

  const hiddenIndices = useMemo(() => {
    const rng = createSeededRandom(hashSeed(`${verseId}-fade-${fadeRound}`));
    return new Set(selectHiddenIndices(tokens, FADE_FRACTIONS[fadeRound], rng));
  }, [tokens, verseId, fadeRound]);

  useEffect(() => {
    setRevealed(new Set());
  }, [fadeRound]);

  const handleTap = (index) => {
    if (!hiddenIndices.has(index) || revealed.has(index)) return;
    setRevealed((current) => new Set(current).add(index));
    onHint();
  };

  const isLastRound = fadeRound >= FADE_FRACTIONS.length - 1;
  const allRevealed = [...hiddenIndices].every((i) => revealed.has(i));

  return (
    <View style={styles.container}>
      <Text style={styles.reference}>{reference}</Text>
      <Text style={styles.roundLabel}>
        Round {fadeRound + 1} of {FADE_FRACTIONS.length} &middot; {Math.round(FADE_FRACTIONS[fadeRound] * 100)}% hidden
      </Text>

      <View style={styles.verseWrap}>
        {tokens.map((token) => {
          const isHidden = hiddenIndices.has(token.index);
          const isRevealed = revealed.has(token.index);
          if (!isHidden || isRevealed) {
            return (
              <Text key={token.index} style={[theme.arabic.body, styles.word, isRevealed && styles.wordHinted]}>
                {token.raw}
              </Text>
            );
          }
          return (
            <TouchableOpacity key={token.index} style={styles.hiddenChip} onPress={() => handleTap(token.index)}>
              <Text style={styles.hiddenChipText}>{'—'.repeat(Math.min(token.core.length || 2, 4))}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.hint}>Recite the verse aloud. Tap a hidden word if you need it.</Text>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={isLastRound ? onFinish : onNextRound}
      >
        <Text style={styles.nextButtonText}>{isLastRound ? 'Continue' : 'Next round'}</Text>
      </TouchableOpacity>
      {!allRevealed && hiddenIndices.size > 0 && (
        <Text style={styles.progressNote}>
          {revealed.size} of {hiddenIndices.size} hidden words revealed
        </Text>
      )}
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: theme.spacing.md },
    reference: { fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textSecondary },
    roundLabel: { fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
    verseWrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: theme.spacing.lg },
    word: { marginLeft: 8, marginBottom: 10, color: theme.colors.text },
    wordHinted: { color: theme.colors.warning },
    hiddenChip: {
      backgroundColor: theme.colors.hiddenWord,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginLeft: 8,
      marginBottom: 10,
      justifyContent: 'center',
    },
    hiddenChipText: { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.md },
    hint: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
    nextButton: {
      backgroundColor: theme.colors.info,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 8,
    },
    nextButtonText: { color: theme.colors.textOnPrimary, fontWeight: theme.typography.fontWeight.semibold, fontSize: theme.typography.fontSize.md },
    progressNote: { fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.md },
  });

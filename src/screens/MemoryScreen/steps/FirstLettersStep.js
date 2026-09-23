// Step 3: first-letter recall cues. Tap a word to reveal it in full.
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { firstLetterCue } from '../../../utils/memory/firstLetters';

export function FirstLettersStep({ reference, tokens, onHint, onNext }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [revealed, setRevealed] = useState(() => new Set());

  const handleTap = (index) => {
    if (revealed.has(index)) return;
    setRevealed((current) => new Set(current).add(index));
    onHint();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.reference}>{reference}</Text>
      <Text style={styles.hint}>Recite the verse from the first letters. Tap a word if you need it.</Text>

      <View style={styles.verseWrap}>
        {tokens.map((token) => {
          const isRevealed = revealed.has(token.index);
          return (
            <TouchableOpacity key={token.index} onPress={() => handleTap(token.index)} disabled={isRevealed}>
              <Text style={[theme.arabic.body, styles.word, isRevealed && styles.wordHinted]}>
                {isRevealed ? token.raw : firstLetterCue(token.raw)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={onNext}>
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: theme.spacing.md },
    reference: { fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textSecondary, marginBottom: 4 },
    hint: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
    verseWrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', marginBottom: theme.spacing.xl },
    word: { marginLeft: 10, marginBottom: 12, color: theme.colors.text },
    wordHinted: { color: theme.colors.warning },
    nextButton: {
      backgroundColor: theme.colors.info,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 14,
      alignItems: 'center',
    },
    nextButtonText: { color: theme.colors.textOnPrimary, fontWeight: theme.typography.fontWeight.semibold, fontSize: theme.typography.fontSize.md },
  });

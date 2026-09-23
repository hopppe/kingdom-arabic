// Step 4: active reconstruction. Rebuild the verse by tapping tiles in order
// from a shuffled bank. Wrong taps flash red and are counted; correct ones
// slot into place.
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { createTileBank, isCorrectNextUnit, isBuildComplete } from '../../../utils/memory/buildCheck';
import { createSeededRandom, hashSeed } from '../../../utils/memory/hideSelection';

const FLASH_DURATION_MS = 400;

export function BuildStep({ reference, units, verseId, onError, onComplete }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const initialBank = useMemo(
    () => createTileBank(units, createSeededRandom(hashSeed(`${verseId}-build`))),
    [units, verseId]
  );
  const [bank, setBank] = useState(initialBank);
  const [placed, setPlaced] = useState([]);
  const [flashId, setFlashId] = useState(null);
  const flashTimeout = useRef(null);

  const handleTap = (tile) => {
    if (isCorrectNextUnit(units, placed.length, tile.text)) {
      const nextPlaced = [...placed, tile];
      setPlaced(nextPlaced);
      setBank((current) => current.filter((t) => t.id !== tile.id));
      if (isBuildComplete(units, nextPlaced.length)) {
        onComplete();
      }
      return;
    }
    onError();
    setFlashId(tile.id);
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    flashTimeout.current = setTimeout(() => setFlashId(null), FLASH_DURATION_MS);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.reference}>{reference}</Text>

      <View style={styles.placedArea}>
        {placed.length === 0 && <Text style={styles.placeholderText}>Tap the tiles below in order</Text>}
        {placed.map((tile) => (
          <View key={tile.id} style={styles.placedTile}>
            <Text style={[theme.arabic.body, styles.tileText]}>{tile.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.bankArea}>
        {bank.map((tile) => (
          <TouchableOpacity
            key={tile.id}
            style={[styles.bankTile, flashId === tile.id && styles.bankTileWrong]}
            onPress={() => handleTap(tile)}
          >
            <Text style={[theme.arabic.body, styles.tileText]}>{tile.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: theme.spacing.md },
    reference: { fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
    placedArea: {
      flexDirection: 'row-reverse',
      flexWrap: 'wrap',
      minHeight: 90,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
      alignContent: 'flex-start',
    },
    placeholderText: { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm, padding: theme.spacing.sm },
    placedTile: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.correct,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: 10,
      paddingVertical: 6,
      margin: 4,
    },
    bankArea: { flexDirection: 'row-reverse', flexWrap: 'wrap' },
    bankTile: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: 10,
      paddingVertical: 6,
      margin: 4,
    },
    bankTileWrong: { backgroundColor: theme.colors.incorrect, borderColor: theme.colors.incorrect },
    tileText: { color: theme.colors.text },
  });

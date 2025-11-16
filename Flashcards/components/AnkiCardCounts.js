import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from '../../../context/LanguageContext';

/**
 * Anki-style card counts display for study session
 * Shows: New (blue) | Learning (orange) | Review (green)
 * Now receives counts directly from calculateAnkiScheduledCards (single source of truth)
 */
export const AnkiCardCounts = ({ counts }) => {
  const { t } = useTranslation();

  // Use counts passed from calculateAnkiScheduledCards - no recalculation
  const { new: newCount = 0, learning: learningCount = 0, review: reviewCount = 0 } = counts || {};

  return (
    <View style={styles.container}>
      <View style={styles.countGroup}>
        <Text style={[styles.count, styles.newCount]}>{newCount}</Text>
        <Text style={styles.label}>{t('flashcard.new')}</Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.countGroup}>
        <Text style={[styles.count, styles.learningCount]}>{learningCount}</Text>
        <Text style={styles.label}>{t('flashcard.learning')}</Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.countGroup}>
        <Text style={[styles.count, styles.reviewCount]}>{reviewCount}</Text>
        <Text style={styles.label}>{t('flashcard.review')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginBottom: 16,
  },
  countGroup: {
    alignItems: 'center',
    minWidth: 60,
  },
  count: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  newCount: {
    color: '#007AFF', // Blue for new cards
  },
  learningCount: {
    color: '#FF9500', // Orange for learning cards
  },
  reviewCount: {
    color: '#34C759', // Green for review cards
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: '#ddd',
    marginHorizontal: 16,
  },
});

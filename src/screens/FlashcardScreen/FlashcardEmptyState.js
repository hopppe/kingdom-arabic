import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const FlashcardEmptyState = ({
  type,
  onGoBack,
  styles
}) => {
  const getContent = () => {
    switch (type) {
      case 'no-flashcards':
        return {
          icon: 'card-outline',
          color: styles.text.color,
          message: 'No flashcards yet.\nRead Bible chapters and save words to create flashcards.',
          buttonText: 'Go to Chapters',
        };
      case 'all-done':
        return {
          icon: 'checkmark-circle-outline',
          color: '#34C759',
          message: 'All caught up!\nNo cards due for review right now.\nCheck back later or add more words.',
          buttonText: 'Go Back',
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={content.icon}
        size={80}
        color={content.color}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyText}>
        {content.message}
      </Text>
      <TouchableOpacity
        style={styles.goBackButton}
        onPress={onGoBack}
      >
        <Text style={styles.goBackButtonText}>{content.buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

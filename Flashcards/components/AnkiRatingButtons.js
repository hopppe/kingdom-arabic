import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTranslation } from '../../../context/LanguageContext';

const { height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 700;
const isMediumScreen = screenHeight >= 700 && screenHeight < 800;

export const AnkiRatingButtons = ({ onRatingPress, currentCard }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.ankiButtonContainer}>
      <TouchableOpacity
        style={[
          styles.ankiButton,
          styles.againButton,
          { backgroundColor: '#FF3B30' }
        ]}
        onPress={() => onRatingPress(1)}
        disabled={!currentCard}
      >
        <Text style={[styles.ankiButtonText, { color: 'white' }]}>
          {t('flashcard.again')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.ankiButton,
          styles.hardButton,
          { backgroundColor: '#FF9500' }
        ]}
        onPress={() => onRatingPress(2)}
        disabled={!currentCard}
      >
        <Text style={[styles.ankiButtonText, { color: 'white' }]}>
          {t('flashcard.hard')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.ankiButton,
          styles.goodButton,
          { backgroundColor: '#34C759' }
        ]}
        onPress={() => onRatingPress(3)}
        disabled={!currentCard}
      >
        <Text style={[styles.ankiButtonText, { color: 'white' }]}>
          {t('flashcard.good')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.ankiButton,
          styles.easyButton,
          { backgroundColor: '#007AFF' }
        ]}
        onPress={() => onRatingPress(4)}
        disabled={!currentCard}
      >
        <Text style={[styles.ankiButtonText, { color: 'white' }]}>
          {t('flashcard.easy')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ankiButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: isSmallScreen ? 16 : isMediumScreen ? 20 : 24,
    paddingHorizontal: 4,
    gap: isSmallScreen ? 8 : 12, // Increased gap between buttons
  },
  ankiButton: {
    flex: 1,
    paddingVertical: isSmallScreen ? 12 : isMediumScreen ? 14 : 16,
    paddingHorizontal: isSmallScreen ? 4 : 6, // Reduced horizontal padding
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isSmallScreen ? 48 : isMediumScreen ? 52 : 56,
    minWidth: 65, // Ensure minimum width for text
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  ankiButtonText: {
    fontSize: isSmallScreen ? 11 : isMediumScreen ? 12 : 13, // Slightly smaller font
    fontWeight: '700',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  againButton: {},
  hardButton: {},
  goodButton: {},
  easyButton: {},
});
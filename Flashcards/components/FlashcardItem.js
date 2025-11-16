import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from '../../../context/LanguageContext';
import { getImageForWord } from '../../../utils/imageMapping';
import imagePreloader from '../../../utils/imagePreloader';
import { getWritingDirection } from '../../../utils/rtlUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 700;
const isMediumScreen = screenHeight >= 700 && screenHeight < 800;

const FlashcardItemComponent = ({
  card,
  cardType,
  pan,
  scale,
  isActive,
  isFlipped,
  flipAnimation,
  onFlip,
  onPlayAudio,
  audioLoading,
  panResponder,
  currentIndex, // Add this prop
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();


  if (!card) return null;

  // Try to get preloaded image first, fallback to normal image loading
  const imageSource = imagePreloader.isImagePreloaded(card.word)
    ? imagePreloader.getPreloadedImage(card.word)
    : getImageForWord(card.word);
  const hasImage = imageSource !== null;

  // Calculate flip interpolation for smooth animation
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });


  return (
    <Animated.View
      key={`card-${cardType}-${card.id}`}
      style={[
        styles.card,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scale },
          ],
        },
      ]}
      {...(isActive ? panResponder.panHandlers : {})}
    >
      {/* Front side - Picture with Arabic word */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardFront,
          {
            transform: [{ rotateY: frontInterpolate }],
            backgroundColor: theme.components.flashcard.front.backgroundColor,
            borderColor: theme.components.flashcard.front.borderColor,
            shadowColor: theme.components.flashcard.front.shadowColor,
          },
        ]}
        pointerEvents={!isFlipped ? 'auto' : 'none'}
      >
        <View style={styles.cardContent}>
          {hasImage ? (
            <TouchableOpacity style={styles.fullTouchable} onPress={() => onFlip(cardType)}>
              {/* Tap to flip hint at the top */}
              <View style={styles.flipHintContainer}>
                <Text style={[styles.flipHint, { color: theme.components.flashcard.front.hintTextColor || theme.colors.textSecondary }]}>
                  {t('flashcard.tapToSeeEnglish')}
                </Text>
              </View>

              <View style={styles.imageContainer}>
                <Image
                  key={`img-${card.id}-${currentIndex}-${card.word}`}
                  source={imageSource}
                  style={styles.cardImage}
                  resizeMode="contain"
                  onError={() => {
                    console.log(`❌ Image not found for: ${card.word}`);
                  }}
                />
              </View>

              {/* Arabic word centered under the picture - always show */}
              <View style={styles.arabicWordContainer}>
                <Text style={[
                  styles.arabicWord,
                  {
                    color: theme.components.flashcard.front.arabicTextColor || theme.colors.text,
                    writingDirection: getWritingDirection(card.arabic_translation || card.word)
                  }
                ]}>
                  {card.arabic_translation || card.word}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            /* Arabic word centered in the middle when no image */
            <TouchableOpacity style={styles.fullTouchable} onPress={() => onFlip(cardType)}>
              {/* Tap to flip hint at the top */}
              <View style={styles.flipHintContainerAbsolute}>
                <Text style={[styles.flipHint, { color: theme.components.flashcard.front.hintTextColor || theme.colors.textSecondary }]}>
                  {t('flashcard.tapToSeeEnglish')}
                </Text>
              </View>

              <View style={styles.noImageArabicCentered}>
                <Text style={[
                  styles.noImageArabicWord,
                  {
                    color: theme.components.flashcard.front.arabicTextColor || theme.colors.text,
                    writingDirection: getWritingDirection(card.arabic_translation || card.word)
                  }
                ]}>
                  {card.arabic_translation || card.word}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Back side - English word, sentence, and Audio */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardBack,
          {
            transform: [{ rotateY: backInterpolate }],
            backgroundColor: theme.components.flashcard.back.backgroundColor,
            borderColor: theme.components.flashcard.back.borderColor,
            shadowColor: theme.components.flashcard.back.shadowColor,
          },
        ]}
        pointerEvents={isFlipped ? 'auto' : 'none'}
      >
        <View style={styles.cardContent}>
          <TouchableOpacity style={styles.backTouchable} onPress={() => onFlip(cardType)}>
            {/* English word */}
            <Text style={[styles.cardWord, { color: theme.components.flashcard.back.textColor }]}>
              {card.word}
            </Text>

            {/* Example sentence */}
            {card.example_sentence && (
              <View style={styles.sentenceContainer}>
                <Text style={[styles.exampleSentence, { color: theme.components.flashcard.back.sentenceTextColor || theme.colors.textSecondary }]}>
                  "{card.example_sentence}"
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Audio button - only show when card is flipped to text side */}
          {isActive && isFlipped && (
            <TouchableOpacity
              style={[styles.audioButton, { backgroundColor: theme.components.flashcard.audio.backgroundColor }]}
              onPress={onPlayAudio}
              disabled={audioLoading}
            >
              {audioLoading ? (
                <ActivityIndicator size="small" color={theme.components.flashcard.audio.iconColor} />
              ) : (
                <Ionicons name="volume-high" size={24} color={theme.components.flashcard.audio.iconColor} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: screenWidth - 40,
    height: isSmallScreen ? Math.min(screenHeight * 0.5, 350) :
           isMediumScreen ? Math.min(screenHeight * 0.55, 420) :
           Math.min(screenHeight * 0.6, 480),
    maxHeight: screenHeight * 0.65,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
    backfaceVisibility: 'hidden',
  },
  cardFront: {},
  cardBack: {},
  cardContent: {
    flex: 1,
    padding: isSmallScreen ? 16 : isMediumScreen ? 20 : 24,
  },
  fullTouchable: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipHintContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 10,
  },
  flipHintContainerAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 8,
    zIndex: 10,
  },
  noImageArabicCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  flipHint: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  imageContainer: {
    width: isSmallScreen ? '75%' : '70%',
    aspectRatio: 1,
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: isSmallScreen ? 8 : 10,
    position: 'relative',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 15,
    zIndex: 1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  arabicWordContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  arabicWord: {
    fontSize: isSmallScreen ? 22 : isMediumScreen ? 26 : 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingVertical: 8,
  },
  noImageArabicWord: {
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cardWord: {
    fontSize: isSmallScreen ? 32 : isMediumScreen ? 36 : 40,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: isSmallScreen ? 12 : isMediumScreen ? 16 : 20,
    letterSpacing: 0.5,
  },
  sentenceContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
  },
  exampleSentence: {
    fontSize: 16,
    textAlign: 'center',
  },
  audioButton: {
    padding: isSmallScreen ? 12 : 16,
    borderRadius: 28,
    marginTop: isSmallScreen ? 16 : isMediumScreen ? 20 : 24,
    minWidth: isSmallScreen ? 48 : 56,
    minHeight: isSmallScreen ? 48 : 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});

// Memoize component to prevent unnecessary re-renders
export const FlashcardItem = React.memo(FlashcardItemComponent);
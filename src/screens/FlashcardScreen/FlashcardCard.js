import React from 'react';
import { View, Text, Animated, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Platform, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { setAudioModeAsync, AudioPlayer } from 'expo-audio';
import { highlightWordInVerse } from '../../utils/textUtils';

const openGoogleTranslate = (arabicWord) => {
  const url = `https://translate.google.com/?sl=ar&tl=en&text=${encodeURIComponent(arabicWord)}`;
  Linking.openURL(url);
};

const speakArabic = async (text) => {
  // Stop any currently playing speech first
  Speech.stop();

  const voices = await Speech.getAvailableVoicesAsync();
  const arabicVoice = voices.find(v => v.language?.startsWith('ar'));

  if (!arabicVoice) {
    Alert.alert('TTS Not Available', 'Your device does not support Arabic text-to-speech.');
    return;
  }

  // Configure audio to play even in silent mode (iOS)
  await setAudioModeAsync({
    playsInSilentMode: true,
  });

  Speech.speak(text, { language: 'ar' });
};

export const FlashcardCard = React.memo(({
  card,
  showEnglishFirst,
  showVerseOnFront,
  frontInterpolate,
  backInterpolate,
  slideAnimation,
  styles,
  onFlip,
}) => {
  return (
    <TouchableWithoutFeedback onPress={onFlip}>
      <View style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.cardWrapper,
            { transform: [{ translateX: slideAnimation }] },
            Platform.OS === 'android' && { elevation: 8 }
          ]}
        >
          {/* Front of card */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              { transform: [{ rotateY: frontInterpolate }] },
              Platform.OS === 'android' && { elevation: 0 }
            ]}
          >
            <View style={styles.cardContent} pointerEvents="box-none">
              <Text style={styles.tapHint}>Tap to flip</Text>
              {showEnglishFirst ? (
                <>
                  <Text style={styles.englishTextFront}>{card.english}</Text>
                  {card.reference && (
                    <Text style={styles.referenceTextFront}>{card.reference}</Text>
                  )}
                  {showVerseOnFront && card.verseTextEnglish && (
                    <View style={styles.verseTextContainerFront} pointerEvents="auto">
                      <ScrollView
                        style={styles.verseScrollView}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                        scrollEnabled={true}
                      >
                        {highlightWordInVerse(card.verseTextEnglish, card.english, styles.verseTextEnglishFront)}
                      </ScrollView>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.arabicText}>{card.arabic}</Text>
                  {showVerseOnFront && card.verseTextArabic && (
                    <View style={styles.verseTextContainerFront} pointerEvents="auto">
                      <ScrollView
                        style={styles.verseScrollView}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                        scrollEnabled={true}
                      >
                        {highlightWordInVerse(card.verseTextArabic, card.arabic, styles.verseTextArabicFront)}
                      </ScrollView>
                    </View>
                  )}
                </>
              )}
            </View>
          </Animated.View>

          {/* Back of card */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              { transform: [{ rotateY: backInterpolate }] },
              Platform.OS === 'android' && { elevation: 0 }
            ]}
          >
            <View style={styles.cardContent} pointerEvents="box-none">
              {showEnglishFirst ? (
                <>
                  <Text style={styles.arabicTextBack}>{card.arabic}</Text>
                  {card.verseTextArabic && (
                    <View style={styles.verseTextContainer} pointerEvents="auto">
                      <ScrollView
                        style={styles.verseScrollView}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                        scrollEnabled={true}
                      >
                        {highlightWordInVerse(card.verseTextArabic, card.arabic, styles.verseTextArabic)}
                        {card.verseTextEnglish && (
                          highlightWordInVerse(card.verseTextEnglish, card.english, styles.verseTextEnglish)
                        )}
                      </ScrollView>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.englishText}>{card.english}</Text>
                  {card.reference && (
                    <Text style={styles.referenceText}>{card.reference}</Text>
                  )}
                  {card.verseTextArabic && (
                    <View style={styles.verseTextContainer} pointerEvents="auto">
                      <ScrollView
                        style={styles.verseScrollView}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                        scrollEnabled={true}
                      >
                        {highlightWordInVerse(card.verseTextArabic, card.arabic, styles.verseTextArabic)}
                        {card.verseTextEnglish && (
                          highlightWordInVerse(card.verseTextEnglish, card.english, styles.verseTextEnglish)
                        )}
                      </ScrollView>
                    </View>
                  )}
                </>
              )}
            </View>
            {/* Speaker button - shows on Arabic side (back when showEnglishFirst) */}
            {showEnglishFirst && (
              <TouchableOpacity
                style={styles.speakerButtonBack}
                onPress={() => speakArabic(card.arabic)}
              >
                <Ionicons name="volume-high-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
              </TouchableOpacity>
            )}
            {/* Translate button - shows on English side (back when !showEnglishFirst) */}
            {!showEnglishFirst && (
              <TouchableOpacity
                style={styles.translateButton}
                onPress={() => openGoogleTranslate(card.arabic)}
              >
                <Ionicons name="language-outline" size={16} color="rgba(255, 255, 255, 0.6)" />
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Front card buttons - rendered separately for touch handling */}
          <Animated.View
            style={[
              styles.frontButtonContainer,
              { transform: [{ rotateY: frontInterpolate }] },
            ]}
            pointerEvents="box-none"
          >
            {/* Speaker button - shows on Arabic side (front when !showEnglishFirst) */}
            {!showEnglishFirst && (
              <TouchableOpacity
                style={styles.speakerButton}
                onPress={() => speakArabic(card.arabic)}
              >
                <Ionicons name="volume-high-outline" size={20} color="rgba(0, 0, 0, 0.5)" />
              </TouchableOpacity>
            )}
            {/* Translate button - shows on English side (front when showEnglishFirst) */}
            {showEnglishFirst && (
              <TouchableOpacity
                style={styles.translateButtonFront}
                onPress={() => openGoogleTranslate(card.arabic)}
              >
                <Ionicons name="language-outline" size={16} color="rgba(0, 0, 0, 0.5)" />
              </TouchableOpacity>
            )}
          </Animated.View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
});

FlashcardCard.displayName = 'FlashcardCard';

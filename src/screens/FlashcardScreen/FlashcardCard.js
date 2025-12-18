import React from 'react';
import { View, Text, Animated, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { highlightWordInVerse } from '../../utils/textUtils';

// Opens Google Translate with the Arabic word pre-filled
const openGoogleTranslate = (arabicWord) => {
  const encodedWord = encodeURIComponent(arabicWord);
  const url = `https://translate.google.com/?sl=ar&tl=en&text=${encodedWord}&op=translate`;
  Linking.openURL(url);
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
            {/* Google Translate button */}
            <TouchableOpacity
              style={styles.translateButton}
              onPress={() => openGoogleTranslate(card.arabic)}
              pointerEvents="auto"
            >
              <Ionicons name="language-outline" size={18} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.translateButtonText}>Translate</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
});

FlashcardCard.displayName = 'FlashcardCard';

import React from 'react';
import { View, Text, Animated, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { highlightWordInVerse } from '../../utils/textUtils';

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
            { transform: [{ translateX: slideAnimation }] }
          ]}
        >
          {/* Front of card */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              { transform: [{ rotateY: frontInterpolate }] },
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
          </Animated.View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
});

FlashcardCard.displayName = 'FlashcardCard';

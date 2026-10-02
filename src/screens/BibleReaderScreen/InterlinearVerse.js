import React, { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { stripPunctuation } from '../../hooks/useBibleReader';
import { alignGlosses } from '../../utils/interlinear';

// Word-by-word layout: each Arabic word sits above its gloss, and the words flow
// right to left, wrapping like a line of text. Both lines of a word share its tap
// (gloss tooltip + save) and long-press (word study) with the normal reader.
// Plain Text presses keep it to one View per word; a chapter can have 1,000+.
const InterlinearVerse = ({
  verseText,
  glosses,
  verseIndex,
  activeWordId,
  savedWordsSet,
  flashcardWordsSet,
  onWordPress,
  onWordLongPress,
  styles,
}) => {
  const words = useMemo(() => verseText.split(/\s+/).filter(Boolean), [verseText]);
  const aligned = useMemo(() => alignGlosses(words, glosses), [words, glosses]);

  return (
    <View style={styles.interlinearVerse}>
      {words.map((word, wordIndex) => {
        const isActive = activeWordId === `${verseIndex}-${wordIndex}`;
        const bareWord = stripPunctuation(word);
        const isSaved = savedWordsSet.has(bareWord);
        const isInFlashcards = flashcardWordsSet.has(bareWord);
        const gloss = aligned[wordIndex]?.en;
        const press = (event) => onWordPress(word, verseIndex, event, wordIndex);
        const longPress = () => onWordLongPress(word, verseIndex);

        return (
          <View key={wordIndex} style={styles.interlinearWord}>
            <Text
              style={[
                styles.interlinearArabic,
                isInFlashcards && !isActive && !isSaved && styles.flashcardWordContainer,
                isSaved && !isActive && styles.savedWordContainer,
                isActive && styles.activeWordContainer,
                isActive && styles.activeWordText,
              ]}
              onPress={press}
              onLongPress={longPress}
              suppressHighlighting
            >
              {word}
            </Text>
            {gloss ? (
              <Text style={styles.interlinearGloss} onPress={press} onLongPress={longPress} suppressHighlighting>
                {gloss}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

export default memo(InterlinearVerse);

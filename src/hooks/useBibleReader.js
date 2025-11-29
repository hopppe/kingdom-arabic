import { useState, useCallback, useMemo, useRef } from 'react';

export function useBibleReader(chapter, currentBook, currentChapter) {
  const [activeWord, setActiveWord] = useState(null);
  const [savedWords, setSavedWords] = useState([]);
  const wordTapInProgress = useRef(false);
  const dismissTimeoutRef = useRef(null);

  // Memoize the translation lookup function
  const findTranslation = useCallback((word, verseIndex) => {
    if (!chapter) return null;
    const cleanWord = word.trim().replace(/[.,،؛:؟!«»"]/g, '');
    const verseKey = `verse_${verseIndex + 1}`;
    const verseVocab = chapter.vocab[verseKey] || {};

    if (verseVocab[cleanWord]) return verseVocab[cleanWord];
    if (verseVocab[word.trim()]) return verseVocab[word.trim()];

    for (const [arabic, english] of Object.entries(verseVocab)) {
      if (arabic.includes(cleanWord)) return english;
    }
    return null;
  }, [chapter]);

  const handleWordPress = useCallback((word, verseIndex, event) => {
    if (event) {
      event.stopPropagation();
    }
    wordTapInProgress.current = true;

    // Reset the flag after a brief moment
    setTimeout(() => {
      wordTapInProgress.current = false;
    }, 100);

    const translation = findTranslation(word, verseIndex);
    if (!translation) {
      setActiveWord(null);
      return;
    }

    const wordId = `${verseIndex}-${word}`;
    const existingIndex = savedWords.findIndex(w => w.word === word && w.translation === translation);

    if (existingIndex !== -1) {
      // Word is already saved - remove it and hide tooltip
      setSavedWords(savedWords.filter((_, i) => i !== existingIndex));
      setActiveWord(null);
    } else {
      // Word is new - add it and show tooltip
      const touchX = event?.nativeEvent?.pageX || 0;
      const touchY = event?.nativeEvent?.pageY || 0;

      setActiveWord({
        id: wordId,
        word,
        translation,
        verseIndex,
        x: touchX,
        y: touchY
      });

      setSavedWords([{
        word,
        translation,
        book: currentBook,
        chapter: currentChapter,
        verse: verseIndex + 1,
        verseTextArabic: chapter?.data?.content_arabic?.[verseIndex] || '',
        verseTextEnglish: chapter?.data?.content_english?.[verseIndex] || '',
        timestamp: Date.now()
      }, ...savedWords]);
    }
  }, [findTranslation, activeWord, savedWords, currentBook, currentChapter, chapter]);

  const handleGlobalTap = useCallback(() => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }

    dismissTimeoutRef.current = setTimeout(() => {
      if (wordTapInProgress.current) {
        wordTapInProgress.current = false;
        return;
      }
      if (activeWord) {
        setActiveWord(null);
      }
    }, 50);
  }, [activeWord]);

  // Memoize saved words lookup for performance
  const savedWordsSet = useMemo(() => {
    return new Set(savedWords.map(w => w.word));
  }, [savedWords]);

  return {
    activeWord,
    setActiveWord,
    savedWords,
    setSavedWords,
    savedWordsSet,
    handleWordPress,
    handleGlobalTap,
    findTranslation,
  };
}

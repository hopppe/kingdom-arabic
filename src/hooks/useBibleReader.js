import { useState, useCallback, useMemo, useRef } from 'react';

const PUNCTUATION_RE = /[.,،؛:؟!«»"]/g;

export function useBibleReader(chapter, currentBook, currentChapter) {
  const [activeWord, setActiveWord] = useState(null);
  const [savedWords, setSavedWords] = useState([]);
  const wordTapInProgress = useRef(false);
  const dismissTimeoutRef = useRef(null);

  // Find the gloss entry ({ ar, en, formId }) for a tapped word in a verse.
  const findGlossEntry = useCallback((word, verseIndex) => {
    const entries = chapter?.glosses?.[`verse_${verseIndex + 1}`] || [];
    if (entries.length === 0) return null;
    const trimmed = word.trim();
    const cleanWord = trimmed.replace(PUNCTUATION_RE, '');

    return (
      entries.find((entry) => entry.ar === trimmed) ||
      entries.find((entry) => entry.ar === cleanWord) ||
      entries.find((entry) => entry.ar.replace(PUNCTUATION_RE, '') === cleanWord) ||
      (cleanWord ? entries.find((entry) => entry.ar.includes(cleanWord)) : null) ||
      null
    );
  }, [chapter]);

  const findTranslation = useCallback(
    (word, verseIndex) => findGlossEntry(word, verseIndex)?.en || null,
    [findGlossEntry]
  );

  const handleWordPress = useCallback((word, verseIndex, event) => {
    if (event) {
      event.stopPropagation();
    }
    wordTapInProgress.current = true;

    // Reset the flag after a brief moment
    setTimeout(() => {
      wordTapInProgress.current = false;
    }, 100);

    const entry = findGlossEntry(word, verseIndex);
    const translation = entry?.en;
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
        formId: entry.formId,
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
  }, [findGlossEntry, savedWords, currentBook, currentChapter, chapter]);

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
    findGlossEntry,
  };
}

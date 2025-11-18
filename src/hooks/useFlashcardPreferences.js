import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useFlashcardPreferences() {
  const [showEnglishFirst, setShowEnglishFirst] = useState(false);
  const [showVerseOnFront, setShowVerseOnFront] = useState(false);

  // Load display preferences from storage
  useEffect(() => {
    const loadDisplayPreferences = async () => {
      try {
        const [englishFirst, verseOnFront] = await Promise.all([
          AsyncStorage.getItem('@flashcard_show_english_first'),
          AsyncStorage.getItem('@flashcard_show_verse_on_front'),
        ]);
        if (englishFirst !== null) {
          setShowEnglishFirst(JSON.parse(englishFirst));
        }
        if (verseOnFront !== null) {
          setShowVerseOnFront(JSON.parse(verseOnFront));
        }
      } catch (error) {
        console.error('Error loading display preferences:', error);
      }
    };
    loadDisplayPreferences();
  }, []);

  // Toggle flip preference
  const toggleFlipPreference = useCallback(async () => {
    const newValue = !showEnglishFirst;
    setShowEnglishFirst(newValue);
    try {
      await AsyncStorage.setItem('@flashcard_show_english_first', JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving flip preference:', error);
    }
  }, [showEnglishFirst]);

  // Toggle verse on front preference
  const toggleVerseOnFront = useCallback(async () => {
    const newValue = !showVerseOnFront;
    setShowVerseOnFront(newValue);
    try {
      await AsyncStorage.setItem('@flashcard_show_verse_on_front', JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving verse on front preference:', error);
    }
  }, [showVerseOnFront]);

  return {
    showEnglishFirst,
    showVerseOnFront,
    toggleFlipPreference,
    toggleVerseOnFront,
  };
}

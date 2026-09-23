// Arabic text-to-speech for a verse, at a normal or slow rate. Mirrors the
// pattern in src/screens/BibleReaderScreen/index.js (speakVerse).
import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as Speech from 'expo-speech';
import { setAudioModeAsync } from 'expo-audio';

const SLOW_RATE = 0.6;

export function useVerseSpeech() {
  const speak = useCallback(async (text, { slow = false } = {}) => {
    if (!text) return;
    Speech.stop();
    try {
      await setAudioModeAsync({ playsInSilentMode: true });
      const voices = await Speech.getAvailableVoicesAsync();
      const arabicVoice = voices.find((v) => v.language?.startsWith('ar'));
      if (!arabicVoice) {
        Alert.alert('Text-to-speech not available', 'Your device does not support Arabic text-to-speech.');
        return;
      }
      Speech.speak(text, { language: 'ar', rate: slow ? SLOW_RATE : 1.0 });
    } catch (error) {
      console.error('Failed to speak verse:', error);
    }
  }, []);

  return { speak, stop: Speech.stop };
}

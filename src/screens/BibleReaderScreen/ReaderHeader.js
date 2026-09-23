import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBookName } from '../../data/bibleData';

// Floating reader header: chapter picker, translation toggle and settings.
export const ReaderHeader = ({
  currentBook,
  currentChapter,
  showTranslations,
  onToggleTranslations,
  setShowChapterSelector,
  setShowSettingsModal,
  theme,
  styles,
}) => (
  <View style={styles.headerBar}>
    <TouchableOpacity
      style={styles.referenceButton}
      onPress={() => setShowChapterSelector(true)}
    >
      <Text style={styles.referenceText}>
        {getBookName(currentBook)} {currentChapter}
      </Text>
      <Ionicons name="chevron-down" size={16} color={theme.colors.text} />
    </TouchableOpacity>

    <View style={styles.headerRightButtons}>

      <TouchableOpacity
        style={[styles.translationButton, showTranslations && styles.headerButtonActive]}
        onPress={onToggleTranslations}
      >
        <Ionicons
          name={showTranslations ? "eye-off" : "eye"}
          size={20}
          color={showTranslations ? theme.colors.textOnPrimary : theme.colors.text}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.translationButton}
        onPress={() => setShowSettingsModal(true)}
      >
        <Ionicons name="settings-outline" size={20} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  </View>
);

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBookName } from '../../data/bibleData';
import GlassSurface from '../../components/glass/GlassSurface';

const HeaderIcon = ({ name, label, onPress, color, styles }) => (
  <Pressable
    style={styles.glassIconButton}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    hitSlop={4}
  >
    <Ionicons name={name} size={20} color={color} />
  </Pressable>
);

// Floating Liquid Glass header: chapter picker on the left; on the right the
// study screens (phones only; tablets have tabs), translation toggle and settings.
export const ReaderHeader = ({
  currentBook,
  currentChapter,
  showTranslations,
  onToggleTranslations,
  setShowChapterSelector,
  setShowSettingsModal,
  onOpenFlashcards,
  onOpenMemorize,
  theme,
  styles,
}) => (
  <View style={styles.headerBar}>
    <GlassSurface style={styles.glassCapsule} interactive>
      <Pressable
        style={styles.referenceButton}
        onPress={() => setShowChapterSelector(true)}
        accessibilityRole="button"
        accessibilityLabel="Choose chapter"
      >
        <Text style={styles.referenceText}>
          {getBookName(currentBook)} {currentChapter}
        </Text>
        <Ionicons name="chevron-down" size={16} color={theme.colors.text} />
      </Pressable>
    </GlassSurface>

    <View style={styles.headerRightButtons}>
      {onOpenFlashcards && onOpenMemorize && (
        <GlassSurface style={[styles.glassCapsule, styles.glassButtonGroup]} interactive>
          <HeaderIcon name="albums-outline" label="Flashcards" onPress={onOpenFlashcards} color={theme.colors.text} styles={styles} />
          <HeaderIcon name="bulb-outline" label="Memorize" onPress={onOpenMemorize} color={theme.colors.text} styles={styles} />
        </GlassSurface>
      )}

      <GlassSurface style={[styles.glassCapsule, styles.glassButtonGroup]} interactive>
        <HeaderIcon
          name={showTranslations ? 'eye-off-outline' : 'eye-outline'}
          label={showTranslations ? 'Hide English' : 'Show English'}
          onPress={onToggleTranslations}
          color={showTranslations ? theme.colors.info : theme.colors.text}
          styles={styles}
        />
        <HeaderIcon
          name="settings-outline"
          label="Settings"
          onPress={() => setShowSettingsModal(true)}
          color={theme.colors.text}
          styles={styles}
        />
      </GlassSurface>
    </View>
  </View>
);

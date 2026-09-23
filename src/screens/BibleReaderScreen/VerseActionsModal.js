import React, { useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { formatReference } from '../../data/bibleData';

/**
 * Shown when a verse number is long-pressed: bookmark it, add it to memory
 * verses, or listen to it.
 */
export const VerseActionsModal = ({
  visible,
  onClose,
  verse,
  isBookmarked,
  isMemorizing,
  onBookmark,
  onMemorize,
  onListen,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!verse) return null;

  const actions = [
    {
      key: 'bookmark',
      icon: isBookmarked ? 'bookmark' : 'bookmark-outline',
      label: isBookmarked ? 'Bookmarked' : 'Bookmark verse',
      disabled: isBookmarked,
      onPress: onBookmark,
    },
    {
      key: 'memorize',
      icon: isMemorizing ? 'bulb' : 'bulb-outline',
      label: isMemorizing ? 'In your memory verses' : 'Memorize this verse',
      disabled: isMemorizing,
      onPress: onMemorize,
    },
    { key: 'listen', icon: 'volume-high-outline', label: 'Listen', disabled: false, onPress: onListen },
  ];

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback accessible={false} onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback accessible={false} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheet}>
              <Text style={styles.reference}>{formatReference(verse.book, verse.chapter, verse.verse)}</Text>
              {verse.verseTextArabic ? (
                <Text style={[theme.arabic.small, styles.preview]} numberOfLines={3}>
                  {verse.verseTextArabic}
                </Text>
              ) : null}

              {actions.map((action) => (
                <TouchableOpacity
                  key={action.key}
                  style={[styles.action, action.disabled && styles.actionDisabled]}
                  onPress={action.onPress}
                  disabled={action.disabled}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: action.disabled }}
                >
                  <Ionicons
                    name={action.icon}
                    size={22}
                    color={action.disabled ? theme.colors.textSecondary : theme.colors.text}
                  />
                  <Text style={[styles.actionText, action.disabled && styles.actionTextDisabled]}>{action.label}</Text>
                  {action.disabled ? (
                    <Ionicons name="checkmark" size={20} color={theme.colors.success} />
                  ) : null}
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.cancel} onPress={onClose} accessibilityRole="button">
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.overlay },
    sheet: {
      width: '88%',
      maxWidth: 360,
      borderRadius: 16,
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    reference: { fontSize: 17, fontWeight: '600', color: theme.colors.text, textAlign: 'center' },
    preview: { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 12 },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      minHeight: 48,
    },
    actionDisabled: { opacity: 0.8 },
    actionText: { flex: 1, fontSize: 16, color: theme.colors.text },
    actionTextDisabled: { color: theme.colors.textSecondary },
    cancel: {
      marginTop: 8,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
    },
    cancelText: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  });

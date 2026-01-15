import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getBookName } from '../../data/bibleData';

export const BookmarkConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  book,
  chapter,
  verse,
  alreadyBookmarked,
}) => {
  const { theme } = useTheme();

  const reference = `${getBookName(book)} ${chapter}:${verse}`;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
              <Ionicons
                name={alreadyBookmarked ? "bookmark" : "bookmark-outline"}
                size={40}
                color={alreadyBookmarked ? theme.colors.primary : theme.colors.text}
              />

              <Text style={[styles.title, { color: theme.colors.text }]}>
                {alreadyBookmarked ? 'Already Bookmarked' : 'Add Bookmark?'}
              </Text>

              <Text style={[styles.reference, { color: theme.colors.primary }]}>
                {reference}
              </Text>

              {alreadyBookmarked ? (
                <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                  This verse is already in your bookmarks.
                </Text>
              ) : (
                <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                  Add this verse to your bookmarks?
                </Text>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
                  onPress={onClose}
                >
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                    {alreadyBookmarked ? 'OK' : 'Cancel'}
                  </Text>
                </TouchableOpacity>

                {!alreadyBookmarked && (
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton, { backgroundColor: theme.colors.primary }]}
                    onPress={onConfirm}
                  >
                    <Text style={[styles.buttonText, { color: '#fff' }]}>
                      Yes
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    maxWidth: 300,
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  reference: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

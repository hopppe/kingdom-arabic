import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getBookName } from '../../data/bibleData';

export const AllBookmarksModal = ({
  visible,
  onClose,
  bookmarks,
  onSelectBookmark,
  onDeleteBookmark,
}) => {
  const { theme } = useTheme();

  const handleDelete = (bookmark) => {
    Alert.alert(
      'Delete Bookmark',
      `Remove ${getBookName(bookmark.book)} ${bookmark.chapter}:${bookmark.verse} from bookmarks?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteBookmark(bookmark.id),
        },
      ]
    );
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
              <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  All Bookmarks
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {bookmarks.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="bookmark-outline" size={48} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    No bookmarks yet
                  </Text>
                  <Text style={[styles.emptyHint, { color: theme.colors.textSecondary }]}>
                    Tap a verse number to add a bookmark
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                  {bookmarks.map((bookmark) => (
                    <TouchableOpacity
                      key={bookmark.id}
                      style={[styles.bookmarkItem, {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      }]}
                      onPress={() => {
                        onSelectBookmark(bookmark);
                        onClose();
                      }}
                    >
                      <View style={styles.bookmarkContent}>
                        <View style={styles.referenceRow}>
                          <Ionicons name="bookmark" size={16} color={theme.colors.primary} />
                          <Text style={[styles.reference, { color: theme.colors.primary }]}>
                            {getBookName(bookmark.book)} {bookmark.chapter}:{bookmark.verse}
                          </Text>
                        </View>
                        {bookmark.verseTextEnglish && (
                          <Text style={[styles.preview, { color: theme.colors.textSecondary }]}>
                            {truncateText(bookmark.verseTextEnglish)}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(bookmark)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#800020" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
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
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  list: {
    padding: 16,
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  bookmarkContent: {
    flex: 1,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  reference: {
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptyHint: {
    fontSize: 14,
    marginTop: 4,
  },
});

import React, { useMemo, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BOOKS, OLD_TESTAMENT_BOOK_COUNT } from '../../data/bibleData';
import { useTheme } from '../../context/ThemeContext';
import { getChapterGridLayout } from '../../utils/layout';

// Books sit two to a row (Genesis | Exodus, Leviticus | Numbers, …) so the list is half as long.
// Each testament starts on its own row, so Matthew begins a new group after Malachi.
const BOOKS_PER_ROW = 2;
const toRows = (books) =>
  Array.from({ length: Math.ceil(books.length / BOOKS_PER_ROW) }, (_, i) =>
    books.slice(i * BOOKS_PER_ROW, (i + 1) * BOOKS_PER_ROW)
  );
// Inner padding of the chapter grid card (its outer margin is theme.spacing.md).
const GRID_PADDING = 8;

const TESTAMENTS = [
  { key: 'ot', title: 'Old Testament', rows: toRows(BOOKS.slice(0, OLD_TESTAMENT_BOOK_COUNT)) },
  { key: 'nt', title: 'New Testament', rows: toRows(BOOKS.slice(OLD_TESTAMENT_BOOK_COUNT)) },
];

export const ChapterSelector = ({
  visible,
  onClose,
  currentBook,
  currentChapter,
  expandedBook,
  setExpandedBook,
  onChapterSelect,
  theme,
  styles,
}) => {
  const { theme: fullTheme } = useTheme();
  const localStyles = useMemo(() => createLocalStyles(fullTheme), [fullTheme]);
  // Chapter boxes are sized from the sheet's width (measured before any book opens).
  const [listWidth, setListWidth] = useState(0);
  const { cellSize } = getChapterGridLayout(listWidth - 2 * (fullTheme.spacing.md + GRID_PADDING));
  const cellStyle = { width: cellSize, height: cellSize };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.selectorOverlay}>
        {/* Tapping the dimmed area above the sheet closes it, like Cancel. */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <View style={styles.selectorContent}>
          <View style={styles.selectorHeader}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.selectorTitle}>Books</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView
            onLayout={(event) => setListWidth(event.nativeEvent.layout.width)}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {TESTAMENTS.map((testament) => (
              <View key={testament.key}>
                <Text style={localStyles.testamentTitle}>{testament.title}</Text>
                {testament.rows.map((row) => {
                  // A tapped book opens its chapters full-width below its row.
                  const expanded = row.find((book) => book.id === expandedBook);

                  return (
                    <View key={row[0].id}>
                      <View style={localStyles.bookPairRow}>
                        {row.map((book) => {
                          const isExpanded = expandedBook === book.id;
                          return (
                            <TouchableOpacity
                              key={book.id}
                              style={[
                                localStyles.bookCard,
                                isExpanded && localStyles.bookCardExpanded,
                              ]}
                              onPress={() => setExpandedBook(isExpanded ? null : book.id)}
                              accessibilityRole="button"
                              accessibilityState={{ expanded: isExpanded }}
                            >
                              <Text
                                style={[localStyles.bookName, isExpanded && styles.bookNameExpanded]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                              >
                                {book.name}
                              </Text>
                              <Ionicons
                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                size={18}
                                color={theme.colors.textSecondary}
                              />
                            </TouchableOpacity>
                          );
                        })}
                        {row.length < BOOKS_PER_ROW && <View style={localStyles.bookCardSpacer} />}
                      </View>

                      {expanded && (
                        <View style={[styles.chapterGrid, localStyles.chapterGridCard]}>
                          {expanded.chapters.map((chapterNum) => {
                            const isCurrent = expanded.id === currentBook && chapterNum === currentChapter;
                            return (
                              <View key={chapterNum} style={[styles.chapterButton, cellStyle]}>
                                <TouchableOpacity
                                  style={[
                                    styles.chapterButtonInner,
                                    isCurrent && styles.chapterButtonCurrent,
                                  ]}
                                  onPress={() => onChapterSelect(expanded.id, chapterNum)}
                                >
                                  <Text style={[
                                    styles.chapterNumber,
                                    isCurrent && styles.chapterNumberCurrent,
                                  ]}>
                                    {chapterNum}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createLocalStyles = (theme) =>
  StyleSheet.create({
    testamentTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      marginHorizontal: theme.spacing.md,
    },
    bookPairRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    bookCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.cardBackground,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    bookCardExpanded: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
      paddingVertical: 13,
      paddingHorizontal: 13,
    },
    bookCardSpacer: {
      flex: 1,
    },
    chapterGridCard: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      paddingTop: 12,
      paddingHorizontal: GRID_PADDING,
      paddingBottom: 12,
      borderRadius: theme.borderRadius.md,
      borderBottomWidth: 0,
    },
    bookName: {
      flexShrink: 1,
      marginRight: theme.spacing.xs,
      fontSize: 17,
      fontWeight: '500',
      color: theme.colors.text,
    },
  });

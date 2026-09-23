import React, { useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BOOKS } from '../../data/bibleData';
import { useTheme } from '../../context/ThemeContext';
import { useReadingProgress } from '../../context/ReadingProgressContext';

const BookProgressBar = ({ fraction, progressStyles }) => (
  <View style={progressStyles.track}>
    <View style={[progressStyles.fill, { width: `${Math.round(fraction * 100)}%` }]} />
  </View>
);

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
  const { getBookProgress, isChapterRead } = useReadingProgress();
  const progressStyles = useMemo(() => createProgressStyles(fullTheme), [fullTheme]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.selectorOverlay}>
        <View style={styles.selectorContent}>
          <View style={styles.selectorHeader}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.selectorTitle}>Books</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {BOOKS.map((book) => {
              const isExpanded = expandedBook === book.id;
              const progress = getBookProgress(book.id);

              return (
                <View key={book.id}>
                  <TouchableOpacity
                    style={[styles.bookRow, isExpanded && styles.bookRowExpanded]}
                    onPress={() => setExpandedBook(isExpanded ? null : book.id)}
                  >
                    <View style={progressStyles.bookInfo}>
                      <Text style={[styles.bookName, isExpanded && styles.bookNameExpanded]}>
                        {book.name}
                      </Text>
                      {progress.total > 0 && (
                        <View style={progressStyles.progressRow}>
                          <BookProgressBar fraction={progress.fraction} progressStyles={progressStyles} />
                          <Text style={progressStyles.progressLabel}>
                            {progress.read}/{progress.total}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.chapterGrid}>
                      {book.chapters.map((chapterNum) => {
                        const isCurrent = book.id === currentBook && chapterNum === currentChapter;
                        const read = isChapterRead(book.id, chapterNum);
                        return (
                          <View key={chapterNum} style={styles.chapterButton}>
                            <TouchableOpacity
                              style={[
                                styles.chapterButtonInner,
                                read && progressStyles.chapterButtonRead,
                                isCurrent && styles.chapterButtonCurrent,
                              ]}
                              onPress={() => onChapterSelect(book.id, chapterNum)}
                            >
                              <Text style={[
                                styles.chapterNumber,
                                isCurrent && styles.chapterNumberCurrent,
                              ]}>
                                {chapterNum}
                              </Text>
                              {read && !isCurrent && (
                                <Ionicons
                                  name="checkmark"
                                  size={10}
                                  color={fullTheme.colors.success}
                                  style={progressStyles.checkmark}
                                />
                              )}
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createProgressStyles = (theme) =>
  StyleSheet.create({
    bookInfo: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    track: {
      flex: 1,
      height: 3,
      borderRadius: 2,
      backgroundColor: theme.colors.borderLight,
      overflow: 'hidden',
      marginRight: theme.spacing.xs,
    },
    fill: {
      height: '100%',
      borderRadius: 2,
      backgroundColor: theme.colors.success,
    },
    progressLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
      minWidth: 34,
      textAlign: 'right',
    },
    chapterButtonRead: {
      borderWidth: 1,
      borderColor: theme.colors.success,
    },
    checkmark: {
      position: 'absolute',
      top: 2,
      right: 2,
    },
  });

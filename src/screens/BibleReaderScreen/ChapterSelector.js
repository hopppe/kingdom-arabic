import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BOOKS } from '../../data/bibleData';

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

          <ScrollView showsVerticalScrollIndicator={false}>
            {BOOKS.map((book) => {
              const isExpanded = expandedBook === book.id;

              return (
                <View key={book.id}>
                  <TouchableOpacity
                    style={[styles.bookRow, isExpanded && styles.bookRowExpanded]}
                    onPress={() => setExpandedBook(isExpanded ? null : book.id)}
                  >
                    <Text style={[styles.bookName, isExpanded && styles.bookNameExpanded]}>
                      {book.name}
                    </Text>
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
                        return (
                          <View key={chapterNum} style={styles.chapterButton}>
                            <TouchableOpacity
                              style={[
                                styles.chapterButtonInner,
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

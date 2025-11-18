import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { getBookName } from '../../data/bibleData';

export const SavedWordsPanel = ({
  visible,
  onClose,
  savedWords,
  onAddToFlashcards,
  onClearAll,
  onRemoveWord,
  styles,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
      hardwareAccelerated
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Saved Words</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {savedWords.length > 0 && (
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.addToFlashcardsButton}
                onPress={onAddToFlashcards}
              >
                <Text style={styles.addToFlashcardsButtonText}>Add to Flashcards</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearAllButton} onPress={onClearAll}>
                <Text style={styles.clearAllButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView style={styles.savedWordsList} showsVerticalScrollIndicator={false}>
            {savedWords.length > 0 ? (
              <>
                <Text style={styles.wordCount}>
                  {savedWords.length} {savedWords.length === 1 ? 'word' : 'words'} total
                </Text>
                {savedWords.map((item) => (
                  <View key={`${item.word}-${item.timestamp}`} style={styles.savedWordItem}>
                    <View style={styles.wordContent}>
                      <Text style={styles.savedWordArabic}>{item.word}</Text>
                      <Text style={styles.savedWordEnglish}>{item.translation}</Text>
                      {item.book && item.chapter && item.verse && (
                        <Text style={styles.savedWordReference}>
                          {getBookName(item.book)} {item.chapter}:{item.verse}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.removeWordButton}
                      onPress={() => onRemoveWord(item.timestamp)}
                    >
                      <Text style={styles.removeWordText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No words saved yet</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

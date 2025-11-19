import React, { useState, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { getBookName } from '../../data/bibleData';

export const SavedWordsPanel = ({
  visible,
  onClose,
  savedWords,
  onAddToFlashcards,
  onClearAll,
  onRemoveWord,
  onUpdateTranslation,
  styles,
}) => {
  const [editingWord, setEditingWord] = useState(null);
  const scrollViewRef = useRef(null);
  const wordRefs = useRef({});
  const handleWordPress = (timestamp) => {
    const isCurrentlyEditing = editingWord === timestamp;

    // If tapping the same word that's being edited, close edit mode
    if (isCurrentlyEditing) {
      setEditingWord(null);
      Keyboard.dismiss();
      return;
    }

    // Otherwise, open edit mode for this word (closing any other word being edited)
    setEditingWord(timestamp);

    if (wordRefs.current[timestamp]) {
      // Scroll the word into view after a short delay to let the keyboard appear
      setTimeout(() => {
        wordRefs.current[timestamp]?.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            // Scroll to position the editing word near the top, accounting for keyboard
            // On iOS, keyboard height is typically ~290-350px, so scroll more aggressively
            const offset = Platform.OS === 'ios' ? y - 50 : y - 100;
            scrollViewRef.current?.scrollTo({ y: Math.max(0, offset), animated: true });
          },
          () => {}
        );
      }, 350);
    }
  };

  const dismissEdit = () => {
    if (editingWord) {
      setEditingWord(null);
      Keyboard.dismiss();
    }
  };

  const handleOverlayPress = () => {
    // If editing, just dismiss edit mode
    if (editingWord) {
      dismissEdit();
    } else {
      // Otherwise close the entire modal
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
      hardwareAccelerated
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Saved Words</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              {savedWords.length > 0 && (
                <>
                  <Text style={styles.editHint}>Tap any word to edit its translation</Text>
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
                </>
              )}

              <ScrollView
                ref={scrollViewRef}
                style={styles.savedWordsList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {savedWords.length > 0 ? (
                  <>
                    <Text style={styles.wordCount}>
                      {savedWords.length} {savedWords.length === 1 ? 'word' : 'words'} total
                    </Text>
                    {savedWords.map((item) => {
                      const isEditing = editingWord === item.timestamp;
                      return (
                        <View
                          key={`${item.word}-${item.timestamp}`}
                          ref={(ref) => { wordRefs.current[item.timestamp] = ref; }}
                          collapsable={false}
                        >
                          <TouchableOpacity
                            style={styles.savedWordItem}
                            onPress={() => handleWordPress(item.timestamp)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.wordContent}>
                              <Text style={styles.savedWordArabic}>{item.word}</Text>
                              {isEditing ? (
                                <TextInput
                                  style={styles.translationInput}
                                  value={item.translation}
                                  onChangeText={(text) => onUpdateTranslation(item.timestamp, text)}
                                  placeholder="Enter translation"
                                  autoFocus
                                  onSubmitEditing={dismissEdit}
                                  blurOnSubmit={true}
                                />
                              ) : (
                                <Text style={styles.savedWordEnglish}>{item.translation}</Text>
                              )}
                              {item.book && item.chapter && item.verse && (
                                <Text style={styles.savedWordReference}>
                                  {getBookName(item.book)} {item.chapter}:{item.verse}
                                </Text>
                              )}
                            </View>
                            <TouchableOpacity
                              style={styles.removeWordButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                onRemoveWord(item.timestamp);
                              }}
                            >
                              <Text style={styles.removeWordText}>×</Text>
                            </TouchableOpacity>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No words saved yet</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

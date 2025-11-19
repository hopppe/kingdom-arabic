import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export const FlashcardListModal = ({
  visible,
  onClose,
  flashcards,
  onRemoveCard,
  onUpdateTranslation,
}) => {
  const { theme } = useTheme();
  const [editingCard, setEditingCard] = useState(null);
  const scrollViewRef = useRef(null);
  const cardRefs = useRef({});

  const handleCardPress = (cardId) => {
    const isCurrentlyEditing = editingCard === cardId;

    if (isCurrentlyEditing) {
      setEditingCard(null);
      Keyboard.dismiss();
      return;
    }

    setEditingCard(cardId);

    if (cardRefs.current[cardId]) {
      setTimeout(() => {
        cardRefs.current[cardId]?.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            const offset = Platform.OS === 'ios' ? y - 50 : y - 100;
            scrollViewRef.current?.scrollTo({ y: Math.max(0, offset), animated: true });
          },
          () => {}
        );
      }, 350);
    }
  };

  const dismissEdit = () => {
    if (editingCard) {
      setEditingCard(null);
      Keyboard.dismiss();
    }
  };

  const handleOverlayPress = () => {
    if (editingCard) {
      dismissEdit();
    } else {
      onClose();
    }
  };

  const modalStyles = {
    modalContent: {
      backgroundColor: theme.colors.cardBackground || theme.colors.surface || '#fff',
    },
    modalTitle: {
      color: theme.colors.text,
    },
    closeButton: {
      backgroundColor: theme.colors.error || '#FF3B30',
    },
    wordCount: {
      color: theme.colors.textSecondary,
    },
    cardItem: {
      backgroundColor: theme.colors.background || '#f5f5f5',
      borderColor: theme.colors.border || '#ddd',
    },
    arabicText: {
      color: theme.colors.text,
    },
    translationInput: {
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.primary,
    },
    englishText: {
      color: theme.colors.textSecondary,
    },
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
              <View style={[styles.modalContent, modalStyles.modalContent]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, modalStyles.modalTitle]}>
                    All Flashcards
                  </Text>
                  <TouchableOpacity
                    style={[styles.closeButton, modalStyles.closeButton]}
                    onPress={onClose}
                  >
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                {flashcards && flashcards.length > 0 && (
                  <Text style={styles.editHint}>
                    Tap any card to edit its translation
                  </Text>
                )}

                <ScrollView
                  ref={scrollViewRef}
                  style={styles.cardList}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={[styles.wordCount, modalStyles.wordCount]}>
                    {flashcards ? flashcards.length : 0} {flashcards?.length === 1 ? 'card' : 'cards'} total
                  </Text>
                  {flashcards && flashcards.length > 0 ? (
                    <>
                      {flashcards.map((card) => {
                        const isEditing = editingCard === card.id;
                        return (
                          <View
                            key={card.id}
                            ref={(ref) => {
                              cardRefs.current[card.id] = ref;
                            }}
                            collapsable={false}
                          >
                            <TouchableOpacity
                              style={[styles.cardItem, modalStyles.cardItem]}
                              onPress={() => handleCardPress(card.id)}
                              activeOpacity={0.7}
                            >
                              <View style={styles.cardContent}>
                                <Text style={[styles.arabicText, modalStyles.arabicText]}>
                                  {card.arabic}
                                </Text>
                                {isEditing ? (
                                  <TextInput
                                    style={[styles.translationInput, modalStyles.translationInput]}
                                    value={card.english}
                                    onChangeText={(text) => onUpdateTranslation(card.id, text)}
                                    placeholder="Enter translation"
                                    autoFocus
                                    onSubmitEditing={dismissEdit}
                                    blurOnSubmit={true}
                                  />
                                ) : (
                                  <Text style={[styles.englishText, modalStyles.englishText]}>
                                    {card.english}
                                  </Text>
                                )}
                                {card.reference && (
                                  <Text style={[styles.definition, modalStyles.englishText]}>
                                    {card.reference}
                                  </Text>
                                )}
                              </View>
                              <TouchableOpacity
                                style={styles.removeButton}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  onRemoveCard(card.id);
                                }}
                              >
                                <Text style={styles.removeButtonText}>×</Text>
                              </TouchableOpacity>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={[styles.emptyText, modalStyles.modalTitle]}>
                        No flashcards yet
                      </Text>
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editHint: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardList: {
    flexGrow: 1,
    maxHeight: 500,
  },
  wordCount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  arabicText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  translationInput: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 4,
  },
  englishText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  definition: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#800020',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

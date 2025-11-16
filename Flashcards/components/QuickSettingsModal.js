import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from '../../../context/LanguageContext';

export const QuickSettingsModal = ({
  visible,
  onClose,
  currentCard,
  userProgress,
  onRemoveCard,
  onResetProgress,
  settingsLoading,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const modalStyles = {
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      margin: 20,
      maxWidth: 300,
      width: '80%',
    },
    removeButton: {
      backgroundColor: theme.components.flashcard.remove.backgroundColor,
    },
    addAndStudyButton: {
      backgroundColor: theme.components.flashcard.add.backgroundColor,
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={modalStyles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={[styles.modalIcon, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="card" size={30} color="white" />
            </View>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('flashcardScreen.cardActions')}
            </Text>
            <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
              "{currentCard?.word}"
            </Text>

            {/* Card Progress Information */}
            {currentCard && (
              <View style={styles.progressInfo}>
                <View style={styles.progressRow}>
                  <View style={styles.progressItem}>
                    <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                      {t('flashcardScreen.cardState')}
                    </Text>
                    <Text style={[styles.progressValue, { color: theme.colors.primary }]}>
                      {(() => {
                        const progress = userProgress[currentCard.id];
                        const cardState = progress?.card_state || 'new';
                        switch (cardState) {
                          case 'new': return t('flashcardScreen.cardStateNew');
                          case 'learning': return t('flashcardScreen.cardStateLearning');
                          case 'review': return t('flashcardScreen.cardStateReview');
                          case 'relearning': return t('flashcardScreen.cardStateRelearning');
                          default: return t('flashcardScreen.cardStateNew');
                        }
                      })()}
                    </Text>
                  </View>
                  <View style={styles.progressItem}>
                    <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                      {t('flashcardScreen.easeFactor')}
                    </Text>
                    <Text style={[styles.progressValue, { color: theme.colors.warning }]}>
                      {(userProgress[currentCard.id]?.ease_factor || 2.50).toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressRow}>
                  <View style={styles.progressItem}>
                    <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                      {t('flashcardScreen.reviewsCount')}
                    </Text>
                    <Text style={[styles.progressValue, { color: theme.colors.text }]}>
                      {userProgress[currentCard.id]?.reviews_count || 0}
                    </Text>
                  </View>
                  <View style={styles.progressItem}>
                    <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                      {t('flashcardScreen.intervalDays')}
                    </Text>
                    <Text style={[styles.progressValue, { color: theme.colors.textSecondary }]}>
                      {(() => {
                        const progress = userProgress[currentCard.id];
                        const intervalDays = progress?.interval_days || 0;
                        if (intervalDays === 0) return '0d';
                        return intervalDays < 1 ?
                          `${Math.round(intervalDays * 24 * 60)}m` :
                          `${Math.round(intervalDays)}d`;
                      })()}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Show "New Card" if no progress */}
            {currentCard && !userProgress[currentCard.id] && (
              <View style={styles.newCardBadge}>
                <Text style={[styles.newCardText, { color: theme.colors.primary }]}>
                  {t('flashcardScreen.newCard')}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, modalStyles.removeButton]}
              onPress={onRemoveCard}
              disabled={settingsLoading}
            >
              <Ionicons name="trash" size={20} color={theme.components.flashcard.remove.textColor} />
              <Text style={[styles.modalButtonText, { color: theme.components.flashcard.remove.textColor }]}>
                {settingsLoading ? t('flashcardScreen.removing') : t('flashcardScreen.removeFromDeck')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, modalStyles.addAndStudyButton]}
              onPress={onResetProgress}
              disabled={settingsLoading}
            >
              <Ionicons name="refresh" size={20} color={theme.components.flashcard.add.textColor} />
              <Text style={[styles.modalButtonText, { color: theme.components.flashcard.add.textColor }]}>
                {settingsLoading ? t('flashcardScreen.resetting') : t('flashcardScreen.resetProgress')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, modalStyles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
    paddingHorizontal: 4,
  },
  progressInfo: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  newCardBadge: {
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 12,
  },
  newCardText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  modalButtons: {
    gap: 10,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 10,
    minHeight: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
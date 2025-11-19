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
  onOpenFlashcardList,
  settingsLoading,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const modalStyles = {
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      margin: 20,
      maxWidth: 320,
      width: '85%',
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
          {/* Compact Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              "{currentCard?.word}"
            </Text>

            {/* Compact Progress Info - Single Row */}
            {currentCard && userProgress[currentCard.id] && (
              <View style={[styles.compactProgressInfo, { backgroundColor: theme.colors.background }]}>
                <View style={styles.compactProgressItem}>
                  <Text style={[styles.compactLabel, { color: theme.colors.textSecondary }]}>
                    {(() => {
                      const progress = userProgress[currentCard.id];
                      const cardState = progress?.card_state || 'new';
                      switch (cardState) {
                        case 'new': return 'New';
                        case 'learning': return 'Learning';
                        case 'review': return 'Review';
                        case 'relearning': return 'Relearning';
                        default: return 'New';
                      }
                    })()}
                  </Text>
                </View>
                <View style={styles.compactProgressDivider} />
                <View style={styles.compactProgressItem}>
                  <Text style={[styles.compactLabel, { color: theme.colors.textSecondary }]}>
                    {userProgress[currentCard.id]?.reviews_count || 0} reviews
                  </Text>
                </View>
                <View style={styles.compactProgressDivider} />
                <View style={styles.compactProgressItem}>
                  <Text style={[styles.compactLabel, { color: theme.colors.textSecondary }]}>
                    {(() => {
                      const progress = userProgress[currentCard.id];
                      const intervalDays = progress?.interval_days || 0;
                      if (intervalDays === 0) return '0d';
                      return intervalDays < 1 ?
                        `${Math.round(intervalDays * 24 * 60)}m` :
                        `${Math.round(intervalDays)}d`;
                    })()} interval
                  </Text>
                </View>
              </View>
            )}

            {/* Compact "New Card" badge */}
            {currentCard && !userProgress[currentCard.id] && (
              <View style={[styles.compactProgressInfo, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.compactLabel, { color: theme.colors.textSecondary }]}>
                  New Card
                </Text>
              </View>
            )}
          </View>

          {/* Simplified Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.compactButton, { borderColor: theme.colors.border }]}
              onPress={() => {
                onClose();
                setTimeout(() => {
                  onOpenFlashcardList();
                }, 300);
              }}
            >
              <Ionicons name="list-outline" size={18} color={theme.colors.text} />
              <Text style={[styles.compactButtonText, { color: theme.colors.text }]}>
                View All Cards
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compactButton, { borderColor: theme.colors.border }]}
              onPress={onResetProgress}
              disabled={settingsLoading}
            >
              <Ionicons name="refresh-outline" size={18} color={theme.colors.text} />
              <Text style={[styles.compactButtonText, { color: theme.colors.text }]}>
                {settingsLoading ? 'Resetting...' : 'Reset Progress'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compactButton, styles.removeButton]}
              onPress={onRemoveCard}
              disabled={settingsLoading}
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
              <Text style={[styles.compactButtonText, { color: '#ef4444' }]}>
                {settingsLoading ? 'Removing...' : 'Remove Card'}
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
    padding: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  compactProgressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  compactProgressItem: {
    alignItems: 'center',
  },
  compactProgressDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginHorizontal: 12,
  },
  compactLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalButtons: {
    gap: 8,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  compactButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  removeButton: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
});
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export const QuickSettingsModal = ({
  visible,
  onClose,
  currentCard,
  onRemoveCard,
  onResetProgress,
  settingsLoading,
  showEnglishFirst,
  onToggleFlip,
  showVerseOnFront,
  onToggleVerseOnFront,
}) => {
  const { theme } = useTheme();

  const modalStyles = {
    modalContent: {
      backgroundColor: theme.colors.cardBackground || theme.colors.surface || '#fff',
      borderRadius: 20,
      padding: 24,
      marginHorizontal: 24,
      maxWidth: 400,
      width: '90%',
    },
  };

  // Get card state based on review count and interval
  const getCardState = () => {
    if (!currentCard) return 'New';
    if (currentCard.reviewCount === 0) return 'New';
    if (currentCard.interval < 1) return 'Learning';
    if (currentCard.interval >= 21) return 'Mature';
    return 'Review';
  };

  // Format interval for display
  const formatInterval = (days) => {
    if (!days || days === 0) return '0d';
    if (days < 1) {
      return `${Math.round(days * 24 * 60)}m`;
    }
    return `${Math.round(days)}d`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={modalStyles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Settings
                </Text>
              </View>

          {/* Display Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              Display
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.text }]}
              onPress={onToggleFlip}
            >
              <Ionicons name="swap-horizontal" size={20} color={theme.colors.background} />
              <Text style={[styles.modalButtonText, { color: theme.colors.background }]}>
                {showEnglishFirst ? 'Show Arabic First' : 'Show English First'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: showVerseOnFront ? theme.colors.text : theme.colors.textSecondary, marginTop: 10 }]}
              onPress={onToggleVerseOnFront}
            >
              <Ionicons name={showVerseOnFront ? 'eye' : 'eye-off'} size={20} color={theme.colors.background} />
              <Text style={[styles.modalButtonText, { color: theme.colors.background }]}>
                {showVerseOnFront ? 'Hide Verse on Front' : 'Show Verse on Front'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Flashcard Section */}
          {currentCard && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                Current Flashcard
              </Text>

              <Text style={[styles.cardWord, { color: theme.colors.text }]}>
                {currentCard?.arabic}
              </Text>

              <View style={[styles.progressInfo, { backgroundColor: theme.colors.surface || 'rgba(0, 0, 0, 0.05)' }]}>
                <View style={styles.progressRow}>
                  <View style={styles.progressItem}>
                    <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                      State
                    </Text>
                    <Text style={[styles.progressValue, { color: theme.colors.primary }]}>
                      {getCardState()}
                    </Text>
                  </View>
                  <View style={styles.progressItem}>
                    <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                      Ease
                    </Text>
                    <Text style={[styles.progressValue, { color: '#FF9500' }]}>
                      {(currentCard.easeFactor || 2.5).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.progressItem}>
                    <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                      Reviews
                    </Text>
                    <Text style={[styles.progressValue, { color: theme.colors.text }]}>
                      {currentCard.reviewCount || 0}
                    </Text>
                  </View>
                  <View style={styles.progressItem}>
                    <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                      Interval
                    </Text>
                    <Text style={[styles.progressValue, { color: theme.colors.text }]}>
                      {formatInterval(currentCard.interval)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: '#FF3B30' }]}
                  onPress={onRemoveCard}
                  disabled={settingsLoading}
                >
                  <Ionicons name="trash" size={16} color="white" />
                  <Text style={[styles.smallButtonText, { color: 'white' }]}>
                    {settingsLoading ? 'Removing...' : 'Remove'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: theme.colors.text }]}
                  onPress={onResetProgress}
                  disabled={settingsLoading}
                >
                  <Ionicons name="refresh" size={16} color={theme.colors.background} />
                  <Text style={[styles.smallButtonText, { color: theme.colors.background }]}>
                    {settingsLoading ? 'Resetting...' : 'Reset'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
              Close
            </Text>
          </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  cardWord: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressInfo: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  smallButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  smallButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 4,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});

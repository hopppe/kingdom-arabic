import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
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
}) => {
  const { theme } = useTheme();

  const modalStyles = {
    modalContent: {
      backgroundColor: theme.colors.cardBackground || theme.colors.surface || '#fff',
      borderRadius: 20,
      padding: 20,
      margin: 20,
      maxWidth: 300,
      width: '80%',
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
              Card Actions
            </Text>
            <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
              "{currentCard?.arabic}"
            </Text>

            {/* Card Progress Information */}
            {currentCard && (
              <View style={styles.progressInfo}>
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
                </View>
                <View style={styles.progressRow}>
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
                    <Text style={[styles.progressValue, { color: theme.colors.textSecondary }]}>
                      {formatInterval(currentCard.interval)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Show "New Card" if no reviews */}
            {currentCard && currentCard.reviewCount === 0 && (
              <View style={styles.newCardBadge}>
                <Text style={[styles.newCardText, { color: theme.colors.primary }]}>
                  New Card
                </Text>
              </View>
            )}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#FF3B30' }]}
              onPress={onRemoveCard}
              disabled={settingsLoading}
            >
              <Ionicons name="trash" size={20} color="white" />
              <Text style={[styles.modalButtonText, { color: 'white' }]}>
                {settingsLoading ? 'Removing...' : 'Remove from Deck'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#34C759' }]}
              onPress={onResetProgress}
              disabled={settingsLoading}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={[styles.modalButtonText, { color: 'white' }]}>
                {settingsLoading ? 'Resetting...' : 'Reset Progress'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                Cancel
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
    fontSize: 18,
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
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
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

import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MAPPING_TYPES } from '../../utils/bibleLoader';

export const SettingsModal = ({ visible, onClose, styles, mappingType, onMappingTypeChange }) => {
  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.settingsModalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.settingsModalContent}>
              <Text style={styles.settingsModalTitle}>Settings</Text>

              {/* Translation Type Toggle */}
              <View style={localStyles.section}>
                <Text style={localStyles.sectionTitle}>Word Translation Style</Text>

                <TouchableOpacity
                  style={[
                    localStyles.optionButton,
                    mappingType === MAPPING_TYPES.INTERPRETIVE && localStyles.selectedOption
                  ]}
                  onPress={() => onMappingTypeChange(MAPPING_TYPES.INTERPRETIVE)}
                >
                  <View style={localStyles.optionContent}>
                    <View style={localStyles.optionHeader}>
                      <Ionicons
                        name="book"
                        size={20}
                        color={mappingType === MAPPING_TYPES.INTERPRETIVE ? "#007AFF" : "#8E8E93"}
                      />
                      <Text style={[
                        localStyles.optionTitle,
                        mappingType === MAPPING_TYPES.INTERPRETIVE && localStyles.selectedOptionTitle
                      ]}>
                        Contextual (Natural)
                      </Text>
                      {mappingType === MAPPING_TYPES.INTERPRETIVE && (
                        <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                      )}
                    </View>
                    <Text style={localStyles.optionDescription}>
                      Natural translations that convey meaning in context (produced by AI)
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    localStyles.optionButton,
                    mappingType === MAPPING_TYPES.LITERAL && localStyles.selectedOption
                  ]}
                  onPress={() => onMappingTypeChange(MAPPING_TYPES.LITERAL)}
                >
                  <View style={localStyles.optionContent}>
                    <View style={localStyles.optionHeader}>
                      <Ionicons
                        name="language"
                        size={20}
                        color={mappingType === MAPPING_TYPES.LITERAL ? "#007AFF" : "#8E8E93"}
                      />
                      <Text style={[
                        localStyles.optionTitle,
                        mappingType === MAPPING_TYPES.LITERAL && localStyles.selectedOptionTitle
                      ]}>
                        Literal (Word-for-Word)
                      </Text>
                      {mappingType === MAPPING_TYPES.LITERAL && (
                        <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                      )}
                    </View>
                    <Text style={localStyles.optionDescription}>
                      Direct word-for-word translations for vocabulary learning (produced by AI)
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={styles.settingsModalText}>
                If you enjoy the app you can leave an optional tip!
              </Text>
              <TouchableOpacity
                style={styles.venmoButton}
                onPress={() => Linking.openURL('venmo://paycharge?txn=pay&recipients=EthanHoppe').catch(() =>
                  Linking.openURL('https://venmo.com/u/EthanHoppe')
                )}
              >
                <Text style={styles.venmoButtonText}>Tip on Venmo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.paypalButton}
                onPress={() => Linking.openURL('https://paypal.me/ethandhoppe')}
              >
                <Text style={styles.paypalButtonText}>Tip on PayPal</Text>
              </TouchableOpacity>
              <View style={styles.feedbackSection}>
                <Text style={styles.settingsModalText}>Leave feedback or comments:</Text>
                <TouchableOpacity
                  style={styles.emailLink}
                  onPress={() => Linking.openURL('mailto:ethan@ingenuitylabs.net')}
                >
                  <Text style={styles.emailText}>ethan@ingenuitylabs.net</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.settingsModalButton}
                onPress={onClose}
              >
                <Text style={styles.settingsModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  optionButton: {
    backgroundColor: '#F2F2F7',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  optionContent: {
    gap: 6,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  selectedOptionTitle: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    marginLeft: 30,
  },
});

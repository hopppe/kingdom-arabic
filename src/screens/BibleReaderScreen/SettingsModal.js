import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, Linking, StyleSheet, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStudyReminders } from '../../hooks/useStudyReminders';

const TimePickerModal = ({ visible, onClose, currentHour, currentMinute, onSave }) => {
  const [hour, setHour] = useState(currentHour);
  const [minute, setMinute] = useState(currentMinute);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  const formatHour = (h) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour} ${period}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={timePickerStyles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={timePickerStyles.content}>
              <Text style={timePickerStyles.title}>Set Reminder Time</Text>

              <View style={timePickerStyles.pickerContainer}>
                <View style={timePickerStyles.column}>
                  <Text style={timePickerStyles.columnLabel}>Hour</Text>
                  <ScrollView style={timePickerStyles.scrollView} showsVerticalScrollIndicator={false}>
                    {hours.map((h) => (
                      <TouchableOpacity
                        key={h}
                        style={[
                          timePickerStyles.option,
                          hour === h && timePickerStyles.selectedOption,
                        ]}
                        onPress={() => setHour(h)}
                      >
                        <Text
                          style={[
                            timePickerStyles.optionText,
                            hour === h && timePickerStyles.selectedOptionText,
                          ]}
                        >
                          {formatHour(h)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={timePickerStyles.column}>
                  <Text style={timePickerStyles.columnLabel}>Minute</Text>
                  <ScrollView style={timePickerStyles.scrollView} showsVerticalScrollIndicator={false}>
                    {minutes.map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[
                          timePickerStyles.option,
                          minute === m && timePickerStyles.selectedOption,
                        ]}
                        onPress={() => setMinute(m)}
                      >
                        <Text
                          style={[
                            timePickerStyles.optionText,
                            minute === m && timePickerStyles.selectedOptionText,
                          ]}
                        >
                          {m.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={timePickerStyles.buttonRow}>
                <TouchableOpacity style={timePickerStyles.cancelButton} onPress={onClose}>
                  <Text style={timePickerStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={timePickerStyles.saveButton}
                  onPress={() => {
                    onSave(hour, minute);
                    onClose();
                  }}
                >
                  <Text style={timePickerStyles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const SettingsModal = ({ visible, onClose, styles }) => {
  const {
    enabled,
    hour,
    minute,
    hasPermission,
    isLoading,
    formattedTime,
    toggleReminders,
    setReminderTime,
  } = useStudyReminders();

  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleToggle = async () => {
    const success = await toggleReminders();
    if (!success && !enabled) {
      // Permission was denied - could show an alert here
    }
  };

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

              {/* Study Reminders Section */}
              <View style={localStyles.section}>
                <Text style={localStyles.sectionTitle}>Study Reminders</Text>

                <View style={localStyles.settingRow}>
                  <View style={localStyles.settingInfo}>
                    <Text style={localStyles.settingLabel}>Daily Reminder</Text>
                    <Text style={localStyles.settingDescription}>
                      Get a notification to study Arabic
                    </Text>
                  </View>
                  <Switch
                    value={enabled}
                    onValueChange={handleToggle}
                    disabled={isLoading}
                    trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {enabled && (
                  <TouchableOpacity
                    style={localStyles.timeButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <View style={localStyles.timeButtonContent}>
                      <Ionicons name="time-outline" size={20} color="#007AFF" />
                      <Text style={localStyles.timeButtonLabel}>Reminder Time</Text>
                    </View>
                    <View style={localStyles.timeButtonValue}>
                      <Text style={localStyles.timeText}>{formattedTime}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
                    </View>
                  </TouchableOpacity>
                )}

                {!hasPermission && enabled && (
                  <View style={localStyles.warningBox}>
                    <Ionicons name="warning" size={16} color="#FF9500" />
                    <Text style={localStyles.warningText}>
                      Notification permission required
                    </Text>
                  </View>
                )}
              </View>

              {/* AI Translation Disclaimer */}
              <View style={localStyles.section}>
                <View style={localStyles.disclaimerBox}>
                  <Ionicons name="information-circle" size={20} color="#007AFF" />
                  <Text style={localStyles.disclaimerText}>
                    Word translations are generated by AI. New Testament translations are mostly accurate, but Old Testament translations may have errors. They are provided as a learning aid.
                  </Text>
                </View>
              </View>

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

      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        currentHour={hour}
        currentMinute={minute}
        onSave={setReminderTime}
      />
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
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#8E8E93',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  timeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeButtonLabel: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  timeButtonValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8E6',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#996600',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#1A1A1A',
    lineHeight: 18,
  },
});

const timePickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 320,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  scrollView: {
    maxHeight: 200,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

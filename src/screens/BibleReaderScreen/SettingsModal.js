import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView, StyleSheet, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getBookName } from '../../data/bibleData';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';

export const SettingsModal = ({
  visible,
  onClose,
  styles,
  bookmarks = [],
  onShowAllBookmarks,
  onSelectBookmark,
  onShowHelp,
  onShowSearch,
}) => {
  const recentBookmarks = bookmarks.slice(0, 3);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const {
    notificationsEnabled,
    reminderTime,
    toggleNotifications,
    updateReminderTime,
    formatTime,
  } = useNotificationPreferences();

  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      updateReminderTime(selectedDate.getHours(), selectedDate.getMinutes());
    }
  };

  const getTimePickerDate = () => {
    const date = new Date();
    date.setHours(reminderTime.hour);
    date.setMinutes(reminderTime.minute);
    return date;
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

              <ScrollView style={localStyles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Bookmarks Section */}
              <View style={localStyles.section}>
                <TouchableOpacity style={localStyles.sectionHeader} onPress={onShowAllBookmarks}>
                  <Ionicons name="bookmark" size={18} color="#007AFF" />
                  <Text style={localStyles.sectionTitle}>Bookmarks</Text>
                  <Text style={localStyles.bookmarkCount}>({bookmarks.length})</Text>
                  <Ionicons name="chevron-forward" size={18} color="#999" />
                </TouchableOpacity>

                {recentBookmarks.length > 0 ? (
                  <>
                    {recentBookmarks.map((bookmark) => (
                      <TouchableOpacity
                        key={bookmark.id}
                        style={localStyles.bookmarkItem}
                        onPress={() => {
                          onSelectBookmark(bookmark);
                          onClose();
                        }}
                      >
                        <View style={localStyles.bookmarkInfo}>
                          <Text style={localStyles.bookmarkReference}>
                            {getBookName(bookmark.book)} {bookmark.chapter}:{bookmark.verse}
                          </Text>
                          {bookmark.verseTextEnglish && (
                            <Text style={localStyles.bookmarkPreview}>
                              {truncateText(bookmark.verseTextEnglish)}
                            </Text>
                          )}
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#999" />
                      </TouchableOpacity>
                    ))}
                  </>
                ) : (
                  <Text style={localStyles.emptyText}>
                    No bookmarks yet. Long-press a verse number to add one.
                  </Text>
                )}
              </View>

              {/* Search Button */}
              <TouchableOpacity
                style={localStyles.searchButton}
                onPress={() => {
                  onClose();
                  onShowSearch();
                }}
              >
                <Ionicons name="search" size={20} color="#007AFF" />
                <Text style={localStyles.searchButtonText}>Search Bible</Text>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </TouchableOpacity>

              {/* Reminders Section */}
              <View style={localStyles.reminderSection}>
                <View style={localStyles.reminderRow}>
                  <Text style={localStyles.reminderLabel}>Daily Reminder</Text>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={() => {
                      if (notificationsEnabled) {
                        setShowTimePicker(false);
                      }
                      toggleNotifications();
                    }}
                    trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
                    thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                  />
                </View>

                {notificationsEnabled && (
                  <TouchableOpacity
                    style={localStyles.timePickerButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={localStyles.reminderLabel}>Reminder Time</Text>
                    <View style={localStyles.timeDisplay}>
                      <Text style={localStyles.timeText}>
                        {formatTime(reminderTime.hour, reminderTime.minute)}
                      </Text>
                      <Ionicons name="chevron-forward" size={18} color="#999" />
                    </View>
                  </TouchableOpacity>
                )}

                {showTimePicker && (
                  Platform.OS === 'ios' ? (
                    <View style={localStyles.iosPickerContainer}>
                      <DateTimePicker
                        value={getTimePickerDate()}
                        mode="time"
                        display="spinner"
                        onChange={handleTimeChange}
                        style={localStyles.iosPicker}
                      />
                      <TouchableOpacity
                        style={localStyles.doneButton}
                        onPress={() => setShowTimePicker(false)}
                      >
                        <Text style={localStyles.doneButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <DateTimePicker
                      value={getTimePickerDate()}
                      mode="time"
                      display="default"
                      onChange={handleTimeChange}
                    />
                  )
                )}
              </View>

              {/* Help Button */}
              <TouchableOpacity
                style={localStyles.helpButton}
                onPress={() => {
                  onClose();
                  onShowHelp();
                }}
              >
                <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
                <Text style={localStyles.helpButtonText}>How to use this app</Text>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </TouchableOpacity>

              {/* AI Translation Disclaimer */}
              <View style={localStyles.disclaimerSection}>
                <View style={localStyles.disclaimerBox}>
                  <Ionicons name="information-circle" size={20} color="#007AFF" />
                  <Text style={localStyles.disclaimerText}>
                    Translation keys are made with AI and could be inaccurate.
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
              </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    flexShrink: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  bookmarkCount: {
    fontSize: 14,
    color: '#999',
    marginRight: 4,
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    marginBottom: 8,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkReference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 2,
  },
  bookmarkPreview: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  showAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginRight: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    marginBottom: 8,
    gap: 10,
  },
  reminderSection: {
    marginBottom: 8,
  },
  searchButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    marginTop: 0,
    marginBottom: 16,
    gap: 10,
  },
  helpButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  disclaimerSection: {
    marginBottom: 16,
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
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
  },
  reminderLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    marginTop: 8,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  iosPickerContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  iosPicker: {
    height: 150,
  },
  doneButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});

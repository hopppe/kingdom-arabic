import React, { useMemo, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView, StyleSheet, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getBookName } from '../../data/bibleData';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';
import { useTheme } from '../../context/ThemeContext';
import { AppearanceSection } from './AppearanceSection';

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
  const { theme } = useTheme();
  const localStyles = useMemo(() => createStyles(theme), [theme]);
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
      <TouchableWithoutFeedback accessible={false} onPress={onClose}>
        <View style={styles.settingsModalOverlay}>
          <TouchableWithoutFeedback accessible={false} onPress={(e) => e.stopPropagation()}>
            <View style={styles.settingsModalContent}>
              <Text style={styles.settingsModalTitle}>Settings</Text>

              <ScrollView
                style={localStyles.scrollContent}
                contentContainerStyle={localStyles.scrollInner}
                showsVerticalScrollIndicator={false}
              >
              {/* Appearance Section */}
              <AppearanceSection />

              {/* Bookmarks Section */}
              <View style={localStyles.section}>
                <TouchableOpacity style={localStyles.sectionHeader} onPress={onShowAllBookmarks}>
                  <Ionicons name="bookmark" size={18} color={theme.colors.info} />
                  <Text style={localStyles.sectionTitle}>Bookmarks</Text>
                  <Text style={localStyles.bookmarkCount}>({bookmarks.length})</Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
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
                        <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
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
                <Ionicons name="search" size={20} color={theme.colors.info} />
                <Text style={localStyles.searchButtonText}>Search Bible</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
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
                    trackColor={{ false: theme.colors.disabled, true: theme.colors.info }}
                    thumbColor={Platform.OS === 'android' ? theme.colors.white : undefined}
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
                      <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
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
                <Ionicons name="help-circle-outline" size={20} color={theme.colors.info} />
                <Text style={localStyles.helpButtonText}>How to use this app</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>

              {/* AI Translation Disclaimer */}
              <View style={localStyles.disclaimerSection}>
                <View style={localStyles.disclaimerBox}>
                  <Ionicons name="information-circle" size={20} color={theme.colors.info} />
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

const createStyles = (theme) => StyleSheet.create({
  // Room below the last item so the time picker's Done button isn't under Close.
  scrollInner: {
    paddingBottom: 56,
  },
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
    color: theme.colors.text,
  },
  bookmarkCount: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    marginRight: 4,
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkReference: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.info,
    marginBottom: 2,
  },
  bookmarkPreview: {
    fontSize: 12,
    color: theme.colors.textTertiary,
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
    color: theme.colors.info,
    marginRight: 4,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
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
    backgroundColor: theme.colors.surface,
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
    color: theme.colors.text,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    marginTop: 0,
    marginBottom: 16,
    gap: 10,
  },
  helpButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  disclaimerSection: {
    marginBottom: 16,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  reminderLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    marginTop: 8,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 15,
    color: theme.colors.info,
    fontWeight: '500',
  },
  iosPickerContainer: {
    backgroundColor: theme.colors.surface,
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
    borderTopColor: theme.colors.border,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.info,
  },
});

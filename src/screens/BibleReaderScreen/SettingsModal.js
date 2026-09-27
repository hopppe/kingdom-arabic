import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, ScrollView, StyleSheet, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getBookName } from '../../data/bibleData';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';
import { useTheme } from '../../context/ThemeContext';
import { AppearanceSection } from './AppearanceSection';
import GlassSurface from '../../components/glass/GlassSurface';
import GlassSegmentedControl from '../../components/glass/GlassSegmentedControl';
import ProgressContent from '../ProgressScreen/ProgressContent';

const TAB_SETTINGS = 'settings';
const TAB_PROGRESS = 'progress';
const SHEET_TABS = [
  { value: TAB_SETTINGS, label: 'Settings' },
  { value: TAB_PROGRESS, label: 'Progress' },
];

export const SettingsModal = ({
  visible,
  onClose,
  styles,
  bookmarks = [],
  onShowAllBookmarks,
  onSelectBookmark,
  onShowHelp,
  onShowSearch,
  showProgress = false,
  onOpenFlashcards,
  onOpenMemorize,
}) => {
  const { theme } = useTheme();
  const localStyles = useMemo(() => createStyles(theme), [theme]);
  const recentBookmarks = bookmarks.slice(0, 3);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tab, setTab] = useState(TAB_SETTINGS);

  // iOS can't present another modal (or push a screen cleanly) while this sheet
  // is still sliding away, so follow-up actions run once it has dismissed.
  const afterDismissRef = useRef(null);
  const closeThen = useCallback((action) => {
    if (Platform.OS === 'ios') {
      afterDismissRef.current = action;
      onClose();
    } else {
      onClose();
      action?.();
    }
  }, [onClose]);
  const handleDismiss = useCallback(() => {
    const action = afterDismissRef.current;
    afterDismissRef.current = null;
    action?.();
  }, []);

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
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      onDismiss={handleDismiss}
    >
      <View style={localStyles.sheet}>
        <View style={localStyles.sheetHeader}>
          {showProgress ? (
            <GlassSegmentedControl options={SHEET_TABS} value={tab} onChange={setTab} />
          ) : (
            <Text style={localStyles.sheetTitle}>Settings</Text>
          )}
          <GlassSurface style={localStyles.closeCapsule} interactive>
            <Pressable style={localStyles.closeButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </Pressable>
          </GlassSurface>
        </View>

        {showProgress && tab === TAB_PROGRESS ? (
          <ScrollView contentContainerStyle={localStyles.progressInner} showsVerticalScrollIndicator={false}>
            <ProgressContent
              onOpenFlashcards={onOpenFlashcards && (() => closeThen(onOpenFlashcards))}
              onOpenMemorize={onOpenMemorize && (() => closeThen(onOpenMemorize))}
            />
          </ScrollView>
        ) : (
              <ScrollView
                style={localStyles.scrollContent}
                contentContainerStyle={localStyles.scrollInner}
                showsVerticalScrollIndicator={false}
              >
              {/* Appearance Section */}
              <AppearanceSection />

              {/* Bookmarks Section */}
              <View style={localStyles.section}>
                <TouchableOpacity style={localStyles.sectionHeader} onPress={() => closeThen(onShowAllBookmarks)}>
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
                onPress={() => closeThen(onShowSearch)}
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
                onPress={() => closeThen(onShowHelp)}
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
        )}
      </View>
    </Modal>
  );
};

const createStyles = (theme) => StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sheetTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeCapsule: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  closeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressInner: {
    paddingTop: 4,
    paddingBottom: 40,
  },
  // Room below the last item so the time picker's Done button isn't under Close.
  scrollInner: {
    paddingHorizontal: 16,
    paddingBottom: 56,
  },
  scrollContent: {
    flex: 1,
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

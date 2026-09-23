import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const STORAGE_KEYS = {
  ENABLED: '@learnarabic_notifications_enabled',
  REMINDER_TIME: '@learnarabic_reminder_time',
};

const DEFAULT_TIME = { hour: 9, minute: 0 };

const REMINDER_CONTENT = {
  title: 'Time to learn Arabic!',
  body: 'Continue your journey through the Arabic Bible.',
};

/**
 * If the reminder is enabled but not scheduled, reschedule it when permission is
 * already granted (no prompt at launch); otherwise turn the setting off so the
 * user re-enables it and gets the permission prompt. Returns the effective state.
 */
async function ensureReminderScheduled(time) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    if (scheduled.length > 0) return true;
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') {
      await Notifications.scheduleNotificationAsync({
        content: REMINDER_CONTENT,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: time.hour, minute: time.minute },
      });
      return true;
    }
    await AsyncStorage.setItem(STORAGE_KEYS.ENABLED, JSON.stringify(false));
    return false;
  } catch (error) {
    console.error('Error checking the scheduled reminder:', error);
    return false;
  }
}

export function useNotificationPreferences() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(DEFAULT_TIME);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from storage
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [enabled, time] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ENABLED),
          AsyncStorage.getItem(STORAGE_KEYS.REMINDER_TIME),
        ]);

        const storedTime = time !== null ? JSON.parse(time) : DEFAULT_TIME;
        const storedEnabled = enabled !== null && JSON.parse(enabled) === true;
        setReminderTime(storedTime);
        // Stored settings can say "on" without anything being scheduled (e.g. after
        // restoring a backup on a new phone), so make the two agree.
        if (storedEnabled) {
          setNotificationsEnabled(await ensureReminderScheduled(storedTime));
        } else {
          setNotificationsEnabled(false);
          await Notifications.cancelAllScheduledNotificationsAsync();
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, []);

  // Schedule notification
  const scheduleDailyReminder = useCallback(async (hour, minute) => {
    try {
      // Cancel any existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule new daily notification
      await Notifications.scheduleNotificationAsync({
        content: REMINDER_CONTENT,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hour,
          minute: minute,
        },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }, []);

  // Cancel notifications
  const cancelAllNotifications = useCallback(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }, []);

  // Request notification permissions
  const requestPermissions = useCallback(async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please enable notifications in your device settings to receive daily reminders.',
        [{ text: 'OK' }]
      );
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reminder', {
        name: 'Daily Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    return true;
  }, []);

  // Toggle notifications on/off
  const toggleNotifications = useCallback(async () => {
    try {
      if (!notificationsEnabled) {
        // Enabling notifications - request permissions first
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
          return false;
        }

        // Enable and schedule
        setNotificationsEnabled(true);
        await AsyncStorage.setItem(STORAGE_KEYS.ENABLED, JSON.stringify(true));
        await scheduleDailyReminder(reminderTime.hour, reminderTime.minute);
      } else {
        // Disabling notifications
        setNotificationsEnabled(false);
        await AsyncStorage.setItem(STORAGE_KEYS.ENABLED, JSON.stringify(false));
        await cancelAllNotifications();
      }
      return true;
    } catch (error) {
      console.error('Error toggling notifications:', error);
      return false;
    }
  }, [notificationsEnabled, reminderTime, requestPermissions, scheduleDailyReminder, cancelAllNotifications]);

  // Update reminder time
  const updateReminderTime = useCallback(async (hour, minute) => {
    try {
      const newTime = { hour, minute };
      setReminderTime(newTime);
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_TIME, JSON.stringify(newTime));

      // If notifications are enabled, reschedule with new time
      if (notificationsEnabled) {
        await scheduleDailyReminder(hour, minute);
      }
    } catch (error) {
      console.error('Error updating reminder time:', error);
    }
  }, [notificationsEnabled, scheduleDailyReminder]);

  // Format time for display (e.g., "9:00 AM")
  const formatTime = useCallback((hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  }, []);

  return {
    notificationsEnabled,
    reminderTime,
    isLoading,
    toggleNotifications,
    updateReminderTime,
    formatTime,
  };
}

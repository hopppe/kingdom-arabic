import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestNotificationPermissions,
  hasNotificationPermissions,
  scheduleStudyReminder,
  cancelAllStudyReminders,
} from '../utils/notifications';

const STORAGE_KEY = '@learnarabic_study_reminder';

// Default reminder settings
const DEFAULT_SETTINGS = {
  enabled: false,
  hour: 9,    // 9 AM
  minute: 0,
};

/**
 * Hook to manage study reminder notification settings
 */
export function useStudyReminders() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [stored, permission] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          hasNotificationPermissions(),
        ]);

        if (stored) {
          setSettings(JSON.parse(stored));
        }
        setHasPermission(permission);
      } catch (error) {
        console.error('Error loading reminder settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings and update scheduled notification
  const saveSettings = useCallback(async (newSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);

      if (newSettings.enabled) {
        await scheduleStudyReminder(newSettings.hour, newSettings.minute);
      } else {
        await cancelAllStudyReminders();
      }
    } catch (error) {
      console.error('Error saving reminder settings:', error);
    }
  }, []);

  // Toggle reminders on/off
  const toggleReminders = useCallback(async () => {
    // If enabling, check/request permission first
    if (!settings.enabled) {
      let permission = await hasNotificationPermissions();
      if (!permission) {
        permission = await requestNotificationPermissions();
        setHasPermission(permission);
      }

      if (!permission) {
        // User denied permission
        return false;
      }
    }

    const newSettings = { ...settings, enabled: !settings.enabled };
    await saveSettings(newSettings);
    return true;
  }, [settings, saveSettings]);

  // Update reminder time
  const setReminderTime = useCallback(async (hour, minute) => {
    const newSettings = { ...settings, hour, minute };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Format time for display (e.g., "9:00 AM")
  const formatTime = useCallback((hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  }, []);

  // Get formatted current reminder time
  const formattedTime = formatTime(settings.hour, settings.minute);

  return {
    enabled: settings.enabled,
    hour: settings.hour,
    minute: settings.minute,
    hasPermission,
    isLoading,
    formattedTime,
    toggleReminders,
    setReminderTime,
    formatTime,
  };
}

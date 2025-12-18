import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Study reminder messages to rotate through
const REMINDER_MESSAGES = [
  { title: 'Time to Study Arabic! 📖', body: 'A few minutes of practice helps build lasting knowledge.' },
  { title: 'Arabic Study Reminder', body: 'Keep your streak going! Open the app to review.' },
  { title: 'Ready to Learn?', body: 'Your flashcards are waiting for you.' },
  { title: 'Daily Arabic Practice', body: 'Small steps lead to big progress.' },
  { title: 'Study Time! 🌟', body: 'Review your Arabic vocabulary today.' },
];

/**
 * Request notification permissions from the user
 * @returns {Promise<boolean>} Whether permission was granted
 */
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Check if notification permissions are granted
 * @returns {Promise<boolean>}
 */
export async function hasNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule a daily study reminder at a specific time
 * @param {number} hour - Hour of day (0-23)
 * @param {number} minute - Minute (0-59)
 * @returns {Promise<string>} The notification identifier
 */
export async function scheduleStudyReminder(hour, minute) {
  // Cancel any existing reminders first
  await cancelAllStudyReminders();

  // Pick a random message
  const message = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      data: { type: 'study_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return identifier;
}

/**
 * Cancel all scheduled study reminders
 */
export async function cancelAllStudyReminders() {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduledNotifications) {
    if (notification.content.data?.type === 'study_reminder') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * Get all scheduled notifications (for debugging)
 * @returns {Promise<Array>}
 */
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Initialize notification channel for Android
 */
export async function initializeNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('study-reminders', {
      name: 'Study Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#007AFF',
    });
  }
}

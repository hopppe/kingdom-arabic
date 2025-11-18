import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LEARNING_STEPS, GRADUATING_INTERVAL, EASY_INTERVAL, LAPSE_NEW_INTERVAL_MULTIPLIER } from '../../../Flashcards/utils/ankiScheduler';

const { height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 700;
const isMediumScreen = screenHeight >= 700 && screenHeight < 800;

export const AnkiRatingButtons = ({ onRatingPress, currentCard, cardProgress, disabled = false }) => {
  // Calculate timing hints based on card state and progress
  const getTimingHint = (rating) => {
    const cardState = cardProgress?.card_state || 'new';
    const stepIndex = cardProgress?.step_index || 0;
    const intervalDays = cardProgress?.interval_days || 0;
    const easeFactor = cardProgress?.ease_factor || 2.5;
    const scheduledDaysBeforeLapse = cardProgress?.scheduled_days_before_lapse;

    let nextInterval = 0;

    if (cardState === 'new') {
      // New card behavior
      if (rating === 1) {
        // Again - first learning step (1m)
        nextInterval = LEARNING_STEPS[0] / (24 * 60);
      } else if (rating === 2) {
        // Hard - average of first two steps (Anki behavior: 6m for [1m, 10m])
        if (LEARNING_STEPS.length >= 2) {
          const hardMinutes = (LEARNING_STEPS[0] + LEARNING_STEPS[1]) / 2;
          nextInterval = hardMinutes / (24 * 60);
        } else {
          nextInterval = (LEARNING_STEPS[0] * 1.5) / (24 * 60);
        }
      } else if (rating === 3) {
        // Good - first learning step (1m)
        nextInterval = LEARNING_STEPS[0] / (24 * 60);
      } else if (rating === 4) {
        // Easy graduates immediately
        nextInterval = EASY_INTERVAL;
      }
    } else if (cardState === 'learning') {
      // Learning card behavior
      if (rating === 1) {
        // Again - reset to first step
        nextInterval = LEARNING_STEPS[0] / (24 * 60);
      } else if (rating === 2) {
        // Hard - On first step, average of Again and Good; otherwise repeat current step
        if (stepIndex === 0 && LEARNING_STEPS.length >= 2) {
          const hardMinutes = (LEARNING_STEPS[0] + LEARNING_STEPS[1]) / 2;
          nextInterval = hardMinutes / (24 * 60);
        } else {
          const stepMinutes = LEARNING_STEPS[Math.min(stepIndex, LEARNING_STEPS.length - 1)];
          nextInterval = stepMinutes / (24 * 60);
        }
      } else if (rating === 3) {
        // Good - advance to next step or graduate
        const nextStepIndex = stepIndex + 1;
        if (nextStepIndex >= LEARNING_STEPS.length) {
          nextInterval = GRADUATING_INTERVAL;
        } else {
          nextInterval = LEARNING_STEPS[nextStepIndex] / (24 * 60);
        }
      } else if (rating === 4) {
        // Easy - graduate immediately
        nextInterval = EASY_INTERVAL;
      }
    } else if (cardState === 'review') {
      // Review card behavior
      if (rating === 1) {
        // Again - back to relearning
        nextInterval = LEARNING_STEPS[0] / (24 * 60);
      } else if (rating === 2) {
        // Hard - multiply by 1.2
        nextInterval = Math.max(1, intervalDays * 1.2);
      } else if (rating === 3) {
        // Good - multiply by ease factor
        nextInterval = intervalDays * easeFactor;
      } else if (rating === 4) {
        // Easy - multiply by ease * 1.15
        nextInterval = intervalDays * easeFactor * 1.15;
      }
    } else if (cardState === 'relearning') {
      // Relearning card behavior
      if (rating === 1) {
        // Again - reset to first step
        nextInterval = LEARNING_STEPS[0] / (24 * 60);
      } else if (rating === 2) {
        // Hard - repeat current step
        const stepMinutes = LEARNING_STEPS[Math.min(stepIndex, LEARNING_STEPS.length - 1)];
        nextInterval = stepMinutes / (24 * 60);
      } else if (rating === 3) {
        // Good - advance to next step or graduate back to review
        const nextStepIndex = stepIndex + 1;
        if (nextStepIndex >= LEARNING_STEPS.length) {
          const baseInterval = scheduledDaysBeforeLapse || 1;
          nextInterval = Math.max(1, baseInterval * LAPSE_NEW_INTERVAL_MULTIPLIER);
        } else {
          nextInterval = LEARNING_STEPS[nextStepIndex] / (24 * 60);
        }
      } else if (rating === 4) {
        // Easy - graduate back to review
        const baseInterval = scheduledDaysBeforeLapse || 1;
        nextInterval = Math.max(1, baseInterval * Math.min(0.70, LAPSE_NEW_INTERVAL_MULTIPLIER * 1.4));
      }
    }

    return formatInterval(nextInterval);
  };

  const formatInterval = (days) => {
    if (days < 1/1440) {
      // Less than 1 minute
      return '< 1m';
    } else if (days < 1/24) {
      // Less than 1 hour - show in minutes
      const minutes = Math.round(days * 24 * 60);
      return `${minutes}m`;
    } else if (days < 1) {
      // Less than 1 day - show in hours
      const hours = Math.round(days * 24);
      return `${hours}h`;
    } else if (days < 2) {
      // Between 1 and 2 days - show with decimal precision
      return `${days.toFixed(1)}d`;
    } else if (days < 30) {
      // Less than 30 days - show in days (round to nearest integer)
      const d = Math.round(days);
      return `${d}d`;
    } else if (days < 365) {
      // Less than 1 year - show in months
      const months = Math.round(days / 30);
      return `${months}mo`;
    } else {
      // Show in years
      const years = Math.round(days / 365);
      return `${years}y`;
    }
  };

  const isDisabled = disabled || !currentCard;

  return (
    <View style={[styles.ankiButtonContainer, isDisabled && styles.disabledContainer]}>
      <TouchableOpacity
        style={[styles.ankiButton, { backgroundColor: '#FF3B30' }, isDisabled && styles.disabledButton]}
        onPress={() => onRatingPress(1)}
        disabled={isDisabled}
      >
        <Text style={styles.ankiButtonText}>Again</Text>
        <Text style={styles.ankiButtonSubtext}>{getTimingHint(1)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.ankiButton, { backgroundColor: '#FF9500' }, isDisabled && styles.disabledButton]}
        onPress={() => onRatingPress(2)}
        disabled={isDisabled}
      >
        <Text style={styles.ankiButtonText}>Hard</Text>
        <Text style={styles.ankiButtonSubtext}>{getTimingHint(2)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.ankiButton, { backgroundColor: '#34C759' }, isDisabled && styles.disabledButton]}
        onPress={() => onRatingPress(3)}
        disabled={isDisabled}
      >
        <Text style={styles.ankiButtonText}>Good</Text>
        <Text style={styles.ankiButtonSubtext}>{getTimingHint(3)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.ankiButton, { backgroundColor: '#007AFF' }, isDisabled && styles.disabledButton]}
        onPress={() => onRatingPress(4)}
        disabled={isDisabled}
      >
        <Text style={styles.ankiButtonText}>Easy</Text>
        <Text style={styles.ankiButtonSubtext}>{getTimingHint(4)}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ankiButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: isSmallScreen ? 16 : isMediumScreen ? 20 : 24,
    paddingHorizontal: 4,
    gap: isSmallScreen ? 8 : 12,
  },
  disabledContainer: {
    opacity: 0.4,
  },
  disabledButton: {
    opacity: 0.8,
  },
  ankiButton: {
    flex: 1,
    paddingVertical: isSmallScreen ? 10 : isMediumScreen ? 12 : 14,
    paddingHorizontal: isSmallScreen ? 4 : 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isSmallScreen ? 52 : isMediumScreen ? 56 : 60,
    minWidth: 65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  ankiButtonText: {
    fontSize: isSmallScreen ? 11 : isMediumScreen ? 12 : 13,
    fontWeight: '700',
    letterSpacing: 0.1,
    textAlign: 'center',
    color: 'white',
  },
  ankiButtonSubtext: {
    fontSize: isSmallScreen ? 9 : isMediumScreen ? 10 : 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    textAlign: 'center',
  },
});

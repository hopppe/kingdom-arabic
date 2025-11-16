import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import BaseActivity from '../BaseActivity';

// This is a wrapper component that redirects to the existing FlashcardScreen
const FlashcardReview = ({ 
  onComplete, 
  onSkip,
  onProgress,
  activityType,
  allocatedTime 
}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Immediately navigate to flashcard screen when this component loads
  React.useEffect(() => {
    navigation.navigate('Activities', { 
      screen: 'ActivitiesMain',
      params: { navigateToFlashcards: true, autoStart: true, autoStartId: Date.now() }
    });
  }, [navigation]);

  const styles = StyleSheet.create({
    redirectMessage: {
      ...theme.typography.textStyles.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.lg,
    },
  });

  return (
    <BaseActivity
      title={t('activities.flashcardReview') || 'Flashcard Review'}
      description={t('activities.flashcardReviewDescription') || 'Review vocabulary with spaced repetition'}
      progress={0}
      onComplete={onComplete}
      onSkip={onSkip}
      activityType={activityType}
      allocatedTime={allocatedTime}
      showProgress={false}
    >
      <View>
        <Text style={styles.redirectMessage}>
          {t('activities.redirectingToFlashcards') || 'Redirecting to flashcard review...'}
        </Text>
      </View>
    </BaseActivity>
  );
};

export default FlashcardReview;
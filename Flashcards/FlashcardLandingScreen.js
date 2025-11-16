import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
  Text as RNText,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useFlashcards } from '../../context/FlashcardContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation, useLanguage } from '../../context/LanguageContext';
import { useHelp } from '../../context/HelpContext';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Text, Card, Button, HelpButton, HelpOverlay, ScreenContainer } from '../../components/ui';
import AddFlashcardModal from '../../components/ui/AddFlashcardModal';
import { HELP_CONTENT } from '../../data/helpContent';
import { createRTLStyle } from '../../utils/rtlUtils';

const { width: screenWidth } = Dimensions.get('window');


function FlashcardLandingScreenInternal() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    studyDeckCards: mainDeckCards,
    getCardsReadyForReview,
    getCardsReadyForReviewCount,
    getLearningInsights,
    userProgress,
    userProfile,
    loading: contextLoading,
    initialLoadComplete,
    hasCachedData,
    isInitializing,
    resetAllProgress,
    loadUserData,
    createAndAddCustomFlashcard,
    ensureDataLoaded,
    syncPendingFlashcardsToSupabase,
  } = useFlashcards();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const { isFirstTimeScreen, markScreenVisited, showingHelp, endHelp, currentHelpScreen } = useHelp();

  const [loading, setLoading] = useState(false);
  const [suggestedSessionSize, setSuggestedSessionSize] = useState(15);

  // Don't use state - just derive directly from context (always fresh, no sync issues)
  const learningInsights = getLearningInsights();
  const cardsReady = getCardsReadyForReviewCount();
  const [showSettings, setShowSettings] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const lastAutoStartId = useRef(null);
  const [showAddFlashcardModal, setShowAddFlashcardModal] = useState(false);

  // Track if we've loaded data in this screen focus session
  const hasLoadedThisSession = useRef(false);
  const [lastLoadTime, setLastLoadTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Help system state
  const [showHelp, setShowHelp] = useState(false);
  const [helpStep, setHelpStep] = useState(0);

  // Pass the setter function to navigation params for header access
  useLayoutEffect(() => {
    navigation.setOptions({ 
      setShowSettings,
      helpHandler: () => {
        setShowHelp(true);
        setHelpStep(0);
      }
    });
  }, [navigation, setShowSettings, setShowHelp, setHelpStep]);

  // Listen for help trigger from navigation params
  useEffect(() => {
    const triggerHelp = route.params?.triggerHelp;
    if (triggerHelp) {
      setShowHelp(true);
      setHelpStep(0);
      // Clear the trigger
      navigation.setParams({ triggerHelp: undefined });
    }
  }, [route.params?.triggerHelp, navigation]);

  // Sync context help state with local help state
  useEffect(() => {
    if (showingHelp && currentHelpScreen === 'flashcards') {
      setShowHelp(true);
      setHelpStep(0);
    }
  }, [showingHelp, currentHelpScreen]);

  // Show help on first visit
  useFocusEffect(
    React.useCallback(() => {
      if (isFirstTimeScreen('flashcards')) {
        setTimeout(() => {
          setShowHelp(true);
        }, 1000);
      }
    }, [isFirstTimeScreen])
  );

  // Help system handlers
  const handleHelpClose = () => {
    setShowHelp(false);
    markScreenVisited('flashcards');
    endHelp(); // End context help as well
  };

  const handleHelpStepChange = (step) => {
    setHelpStep(step);
  };

  const handleHelpComplete = () => {
    markScreenVisited('flashcards');
    endHelp(); // End context help as well
  };



  // No useEffect needed - values are derived directly from context on every render

  // Refresh when returning to this screen (after study sessions)
  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);

      // Let context handle primary data loading, only manage supplementary data here
      const handleScreenFocus = async () => {
        try {
          // ALWAYS ensure data is loaded when screen focuses
          // This is critical - without this call, data never loads!
          if (!hasLoadedThisSession.current) {
            console.log('🔄 Ensuring flashcard data is loaded...');
            await ensureDataLoaded();
            hasLoadedThisSession.current = true;
          } else {
            // Returning from flashcard session - data already loaded
            console.log('📊 Using cached data (returning from flashcard session)');
          }

          // Check if we should auto-navigate to FlashcardScreen
          // This happens when coming from HomeScreen with cards ready for review
          if (initialLoadComplete) {
            const readyCards = getCardsReadyForReview();
            const autoStartId = route.params?.autoStartId;
            if (readyCards && readyCards.length > 0 && route.params?.autoStart &&
                autoStartId && autoStartId !== lastAutoStartId.current) {
              // Mark this autoStart session as processed
              lastAutoStartId.current = autoStartId;

              // Clear the autoStart parameter to prevent repeated auto-navigation
              navigation.setParams({ autoStart: false, autoStartId: null });

              // Small delay to ensure data is loaded
              setTimeout(() => {
                navigation.navigate('Flashcard');
              }, 100);
            }
          }
        } catch (error) {
          console.error('Error in screen focus handler:', error);
        }
      };

      handleScreenFocus();

      return () => {
        setIsScreenFocused(false);
        // DON'T reset hasLoadedThisSession here!
        // We want to keep using local state when returning from flashcard session
        // Only reset on app close or user change (see useEffect below)
      };
    }, [route.params?.autoStart, route.params?.autoStartId, navigation, initialLoadComplete, ensureDataLoaded])
  );


  // Reset when user changes
  useEffect(() => {
    if (userProfile?.id) {
      hasLoadedThisSession.current = false;
      setLastLoadTime(null);
      // No need to reset counts - they're derived from context automatically
    }
  }, [userProfile?.id]);

  const handleStudyMainDeck = async () => {
    if (mainDeckCards.length > 0) {
      // Sync any pending flashcards before starting study
      // This ensures recently created cards have their full data from Supabase
      setLoading(true);
      try {
        await syncPendingFlashcardsToSupabase();
      } catch (error) {
        console.warn('Failed to sync pending flashcards:', error);
        // Continue anyway - user can still study existing cards
      } finally {
        setLoading(false);
      }

      navigation.navigate('Flashcard', { mode: 'study' });
    }
  };



  // Settings handlers
  const handleResetAllProgress = async () => {
    Alert.alert(
      'Reset All Progress',
      'This will reset your progress on all cards in your study deck. This action cannot be undone. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setSettingsLoading(true);
            try {
              await resetAllProgress();
              Alert.alert('Success', 'All card progress has been reset!');
              setShowSettings(false);
              // The context will automatically trigger useEffect to refresh data
            } catch (error) {
              console.error('Error resetting progress:', error);
              Alert.alert('Error', 'Failed to reset progress. Please try again.');
            } finally {
              setSettingsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleStudyAllCards = () => {
    if (mainDeckCards.length > 0) {
      setShowSettings(false);
      navigation.navigate('Flashcard', { mode: 'all' });
    } else {
      Alert.alert('No Cards', 'You need to add some cards to your study deck first!');
    }
  };

  const handleResetDeck = async () => {
    Alert.alert(
      'Reset Study Deck',
      'This will remove all cards from your study deck and reset all progress. This action cannot be undone. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset Deck',
          style: 'destructive',
          onPress: async () => {
            setSettingsLoading(true);
            try {
              const result = await resetAllProgress();
              if (result.success) {
                Alert.alert('Success', 'Study deck has been reset!');
                setShowSettings(false);
                // The context will automatically trigger useEffect to refresh data
              } else {
                Alert.alert('Error', result.error || 'Failed to reset deck. Please try again.');
              }
            } catch (error) {
              console.error('Error resetting deck:', error);
              Alert.alert('Error', 'Failed to reset deck. Please try again.');
            } finally {
              setSettingsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle adding custom flashcard
  const handleAddCustomFlashcard = async (flashcardData) => {
    try {
      const result = await createAndAddCustomFlashcard(flashcardData);
      if (result.success) {
        if (result.alreadyExists) {
          // Show alert for duplicate flashcard
          Alert.alert(
            'Already in Deck',
            result.message || 'This flashcard is already in your study deck.',
            [{ text: 'OK', style: 'default' }]
          );
          return { success: true, alreadyExists: true };
        } else {
          // Context automatically updates state with new card
          // Counts will update automatically on next render
          return { success: true };
        }
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error adding custom flashcard:', error);
      return { success: false, error: 'Failed to add flashcard' };
    }
  };

  // Redesigned main deck card with integrated ready count and study button
  const renderMainDeckCard = () => {
    // Don't show empty state until we're sure there's no data
    const isEmptyAndConfirmed = mainDeckCards.length === 0 && initialLoadComplete && !isInitializing;
    const hasCards = mainDeckCards.length > 0;
    
    return (
      <View
        style={[
          styles.mainDeckCard,
          { backgroundColor: theme.colors.surface },
          isEmptyAndConfirmed && styles.disabledCard
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Ionicons 
              name="library" 
              size={36} 
              color={hasCards ? theme.colors.primary : (isEmptyAndConfirmed ? theme.colors.disabled : theme.colors.primary)} 
            />
            <View style={styles.headerContent}>
              <RNText style={[
                styles.mainDeckTitle,
                { color: theme.colors.text },
                isEmptyAndConfirmed && { color: theme.colors.disabledText }
              ]}>
                {t('flashcardLanding.myStudyDeck')}
              </RNText>
              <RNText style={[
                styles.mainDeckDescription,
                { color: theme.colors.textSecondary },
                isEmptyAndConfirmed && { color: theme.colors.disabledText }
              ]}>
                {hasCards 
                  ? t('flashcardLanding.personalizedCollection')
                  : isEmptyAndConfirmed 
                    ? t('flashcardLanding.noCardsYet')
                    : t('flashcardLanding.personalizedCollection') // Show positive text while loading
                }
            </RNText>
          </View>
        </View>
      </View>
      
      {/* Learning Progress Indicators - Always show to maintain consistent size */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <View style={styles.progressItem}>
            <View style={[styles.progressNumberContainer, { backgroundColor: '#007AFF20' }]}>
              <RNText style={[styles.progressNumber, { color: '#007AFF' }]}>
                {learningInsights.newCards || 0}
              </RNText>
            </View>
            <RNText style={[styles.progressLabel, { color: '#007AFF' }]}>
              {t('flashcardLanding.new') || 'New'}
            </RNText>
          </View>
          <View style={styles.progressItem}>
            <View style={[styles.progressNumberContainer, { backgroundColor: '#FF950020' }]}>
              <RNText style={[styles.progressNumber, { color: '#FF9500' }]}>
                {learningInsights.studyCards || 0}
              </RNText>
            </View>
            <RNText style={[styles.progressLabel, { color: '#FF9500' }]}>
              {t('flashcard.learning') || 'Learning'}
            </RNText>
          </View>
          <View style={styles.progressItem}>
            <View style={[styles.progressNumberContainer, { backgroundColor: '#34C75920' }]}>
              <RNText style={[styles.progressNumber, { color: '#34C759' }]}>
                {learningInsights.reviewCards || 0}
              </RNText>
            </View>
            <RNText style={[styles.progressLabel, { color: '#34C759' }]}>
              {t('flashcardLanding.review') || 'Review'}
            </RNText>
          </View>
          <View style={styles.progressItem}>
            <View style={[styles.progressNumberContainer, { backgroundColor: '#8E8E9320' }]}>
              <RNText style={[styles.progressNumber, { color: '#8E8E93' }]}>
                {learningInsights.totalCards || 0}
              </RNText>
            </View>
            <RNText style={[styles.progressLabel, { color: '#8E8E93' }]}>
              {t('flashcardLanding.total') || 'Total'}
            </RNText>
          </View>
        </View>
      </View>
      
      {/* Study All Cards Button - Always same size */}
      {hasCards ? (
        <TouchableOpacity
          style={[
            styles.studyButton,
            { backgroundColor: theme.colors.primary },
            loading && { opacity: 0.7 }
          ]}
          onPress={handleStudyMainDeck}
          disabled={loading}
        >
          <View style={styles.studyButtonContent}>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.textOnPrimary} />
            ) : (
              <>
                {cardsReady > 0 && (
                  <View style={[styles.readyBadge, { backgroundColor: theme.colors.white }]}>
                    <RNText style={[styles.readyNumber, { color: theme.colors.primary }]}>
                      {cardsReady}
                    </RNText>
                  </View>
                )}
                <Ionicons
                  name="library-outline"
                  size={24}
                  color={theme.colors.textOnPrimary}
                />
              </>
            )}
            <RNText style={[styles.studyButtonText, { color: theme.colors.textOnPrimary }]}>
              {loading ? t('common.loading') || 'Loading...' : t('flashcardLanding.studyAllCards')}
            </RNText>
          </View>
        </TouchableOpacity>
      ) : (
        // Empty state message - same size as other states
        <View
          style={[
            styles.studyButton,
            {
              backgroundColor: 'transparent',
              shadowColor: 'transparent',
              shadowOpacity: 0,
              elevation: 0,
            }
          ]}
        >
          <View style={styles.studyButtonContent}>
            <Ionicons
              name="library-outline"
              size={24}
              color={theme.colors.textSecondary}
              style={{ opacity: 0.5 }}
            />
            <RNText style={[styles.studyButtonText, { color: theme.colors.textSecondary, opacity: 0.5, fontSize: 16 }]}>
              {t('flashcardLanding.noCardsToStudy')}
            </RNText>
          </View>
        </View>
      )}
    </View>
    );
  };


  const baseStyles = StyleSheet.create({
    container: {
      flex: 1,
    },

    mainDeckCard: {
      margin: 20, // More generous margin
      padding: 24, // Reduced padding for better proportion
      borderRadius: 20, // More rounded for modern look
      borderWidth: 0.5, // Subtle border
      borderColor: theme.colors.borderLight,
      shadowColor: theme.components.card.default.shadowColor,
      shadowOffset: { width: 0, height: 6 }, // Slightly reduced shadow
      shadowOpacity: 0.15, // Slightly reduced opacity
      shadowRadius: 12, // Softer shadow
      elevation: 6,
    },
    disabledCard: {
      opacity: 0.6,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 12, // Reduced margin for tighter layout
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
    },
    headerContent: {
      marginLeft: 15,
      flex: 1,
    },
    mainDeckTitle: {
      fontSize: 26, // Slightly smaller for better proportion
      fontWeight: '700', // Heavier weight
      marginBottom: 4, // Reduced spacing
      letterSpacing: 0.3, // Better letter spacing
      textAlign: 'left', // Will be handled by RTL utils
    },
    mainDeckDescription: {
      fontSize: 15, // Smaller to create better hierarchy
      lineHeight: 20, // Better line height for smaller text
      opacity: 0.8, // Slightly more visible
      letterSpacing: 0.1, // Better letter spacing
      fontWeight: '500', // Medium weight for better distinction
      textAlign: 'left', // Will be handled by RTL utils
    },
    studyButton: {
      paddingVertical: 18, // Slightly reduced padding
      paddingHorizontal: 24, // Reduced padding for better proportion
      borderRadius: 16, // Rounded corners
      alignItems: 'center',
      marginTop: 16, // Increased spacing from progress section
      minHeight: 44, // Minimum touch target
      shadowColor: theme.components.card.default.shadowColor,
      shadowOffset: { width: 0, height: 4 }, // Reduced shadow
      shadowOpacity: 0.12, // Slightly reduced opacity
      shadowRadius: 8, // Softer shadow
      elevation: 4,
    },
    studyButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    studyButtonText: {
      fontSize: 19, // Larger for better readability
      fontWeight: '700', // Heavier weight
      letterSpacing: 0.3, // Better letter spacing
      textAlign: 'center',
    },


    addFlashcardButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
      margin: 20,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 16,
      gap: 12,
      minHeight: 44,
    },
    addFlashcardButtonText: {
      color: theme.colors.primary,
      fontSize: 17,
      fontWeight: '600',
      letterSpacing: 0.2,
      textAlign: 'center',
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay + '80', // Using theme overlay with 50% opacity
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24, // More rounded for modern look
      padding: 28, // More generous padding
      margin: 20,
      maxWidth: 320, // Slightly wider for better content
      width: '85%',
      borderWidth: 0.5, // Subtle border
      borderColor: theme.colors.borderLight,
      shadowColor: theme.components.card.default.shadowColor,
      shadowOffset: { width: 0, height: 12 }, // Enhanced shadow
      shadowOpacity: 0.25, // More prominent modal shadow
      shadowRadius: 20, // Softer shadow
      elevation: 12,
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    modalIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    modalTitle: {
      fontSize: 22, // Larger for better hierarchy
      fontWeight: '700', // Heavier weight
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8, // Better spacing
      letterSpacing: 0.2, // Better letter spacing
    },
    modalDescription: {
      fontSize: 16, // Larger for better readability
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22, // Better line height
      paddingHorizontal: 4, // Padding for better text layout
    },
    modalButtons: {
      gap: 10,
    },
    modalButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16, // Ensure good touch target
      paddingHorizontal: 24, // More generous padding
      borderRadius: 14, // More rounded
      gap: 10, // Better spacing
      minHeight: 44, // Minimum touch target
      shadowColor: theme.components.card.default.shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    studyOnlyButton: {
      backgroundColor: theme.components.flashcard.study.backgroundColor,
    },
    addAndStudyButton: {
      backgroundColor: theme.components.flashcard.add.backgroundColor,
    },
    removeButton: {
      backgroundColor: theme.components.flashcard.remove.backgroundColor,
    },
    disabledButton: {
      backgroundColor: theme.colors.disabled,
    },
    modalButtonText: {
      fontSize: 17, // Apple's body text size
      fontWeight: '600', // Good weight for buttons
      letterSpacing: 0.2, // Better letter spacing
      textAlign: 'center',
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cancelButtonText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    readyBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 18,
      minWidth: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    readyNumber: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    progressSection: {
      marginTop: 18, // Reduced margin for tighter layout
      marginBottom: 6, // Reduced bottom margin
      paddingHorizontal: 4, // Minimal horizontal padding
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8, // Reduced vertical padding
      width: '100%',
      paddingHorizontal: 16, // Add horizontal padding for better edge spacing
    },
    progressItem: {
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1, // Use flex to distribute evenly
      paddingHorizontal: 4, // Reduced padding to give more room for text
      justifyContent: 'flex-start', // Align all items to start
      minHeight: 85, // Set minimum height to accommodate two-line labels
    },
    progressNumberContainer: {
      width: 52, // Slightly smaller for better proportion
      height: 52, // Slightly smaller for better proportion
      borderRadius: 26, // Circular background
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6, // Reduced space between number and label
      // Remove shadows/elevation on Android for cleaner look
    },
    progressNumber: {
      fontSize: 22, // Optimized for smaller circle
      fontWeight: '800', // Bold for emphasis
      letterSpacing: 0.3, // Better letter spacing
      textAlign: 'center',
    },
    progressLabel: {
      fontSize: 11, // Slightly smaller to fit on one line
      fontWeight: '700', // Bold for better visibility
      letterSpacing: 0.2, // Reduced letter spacing to save space
      textAlign: 'center',
      textTransform: 'uppercase', // More dynamic styling
      minHeight: 24, // Reserve space for two lines of text
      lineHeight: 12, // Tight line height for compact two-line text
      width: '100%', // Use full width available
      flexShrink: 0, // Prevent shrinking
    },
    headerSettingsButton: {
      padding: 8,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    allCaughtUpSection: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    allCaughtUpText: {
      fontSize: 15, // Slightly smaller for conciseness
      textAlign: 'center',
      marginTop: 12, // Reduced top margin for better spacing
      marginBottom: 20, // More bottom margin before button
      lineHeight: 22, // Better line height for shorter text
      paddingHorizontal: 12, // More padding for better text layout
      fontWeight: '500', // Medium weight for better readability
    },
    studyAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14, // Ensure good touch target
      paddingHorizontal: 24, // More generous padding
      borderRadius: 12, // More rounded
      gap: 10, // Better spacing
      minHeight: 44, // Minimum touch target
      shadowColor: theme.components.card.default.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    studyAllButtonText: {
      fontSize: 17, // Apple's body text size
      fontWeight: '600',
      letterSpacing: 0.2, // Better letter spacing
      textAlign: 'center',
    },
    refreshIndicator: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    refreshText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
  });

  // Apply RTL styles
  const styles = createRTLStyle(baseStyles, isRTL);

  // Don't show loading screen - data loads so fast from AsyncStorage that we can show UI immediately
  // If there's a brief moment of zeros, it will be imperceptible (<50ms)

  return (
    <ScreenContainer>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={async () => {
              setIsRefreshing(true);
              await loadUserData(true); // Force refresh from Supabase
              setIsRefreshing(false);
            }}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Subtle refresh indicator */}
        {isRefreshing && (
          <View style={styles.refreshIndicator}>
            <Text style={styles.refreshText}>{t('flashcardLanding.updating') || 'Updating...'}</Text>
          </View>
        )}
        
        {/* Main Study Deck with Fun Animation */}
        <Animatable.View
          animation="bounceInDown"
          duration={800}
          delay={300}
          easing="ease-out"
        >
          {renderMainDeckCard()}
        </Animatable.View>

        {/* Add Custom Flashcard Button */}
        <TouchableOpacity 
          style={styles.addFlashcardButton}
          onPress={() => setShowAddFlashcardModal(true)}
        >
          <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
          <Text style={styles.addFlashcardButtonText}>{t('addFlashcard.title')}</Text>
        </TouchableOpacity>

      </ScrollView>


      {/* Settings Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSettings}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIcon, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="ellipsis-horizontal" size={30} color="white" />
              </View>
              <Text style={styles.modalTitle}>{t('flashcardLanding.studyDeckOptions')}</Text>
              <Text style={styles.modalDescription}>
                {t('flashcardLanding.manageStudyDeck')}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.studyOnlyButton]}
                onPress={handleStudyAllCards}
                disabled={mainDeckCards.length === 0}
              >
                <Ionicons name="library" size={20} color={theme.components.flashcard.study.textColor} />
                <Text style={[styles.modalButtonText, { color: theme.components.flashcard.study.textColor }]}>
                  {t('flashcardLanding.studyAllCards')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.addAndStudyButton]}
                onPress={handleResetAllProgress}
                disabled={settingsLoading || mainDeckCards.length === 0}
              >
                <Ionicons name="refresh" size={20} color={theme.components.flashcard.add.textColor} />
                <Text style={[styles.modalButtonText, { color: theme.components.flashcard.add.textColor }]}>
                  {settingsLoading ? t('flashcardLanding.resetting') : t('flashcardLanding.resetAllProgress')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.removeButton]}
                onPress={handleResetDeck}
                disabled={settingsLoading || mainDeckCards.length === 0}
              >
                <Ionicons name="trash" size={20} color={theme.components.flashcard.remove.textColor} />
                <Text style={[styles.modalButtonText, { color: theme.components.flashcard.remove.textColor }]}>
                  {settingsLoading ? t('flashcardLanding.resetting') : t('flashcardLanding.resetStudyDeck')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Flashcard Modal */}
      <AddFlashcardModal
        visible={showAddFlashcardModal}
        onClose={() => setShowAddFlashcardModal(false)}
        onAddFlashcard={handleAddCustomFlashcard}
      />

      {/* Help Overlay */}
      <HelpOverlay
        visible={showHelp}
        onClose={handleHelpClose}
        steps={HELP_CONTENT.flashcards.steps}
        titleKey={HELP_CONTENT.flashcards.titleKey}
        currentStep={helpStep}
        onStepChange={handleHelpStepChange}
        onComplete={handleHelpComplete}
      />
    </ScreenContainer>
  );
}

// FlashcardProvider is now global in App.js - no need to wrap here
export default FlashcardLandingScreenInternal; 
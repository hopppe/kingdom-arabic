import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

const { height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 700;
const isMediumScreen = screenHeight >= 700 && screenHeight < 800;

export const ProgressIndicator = ({ currentIndex, totalCards }) => {
  const { theme } = useTheme();

  const progressPercentage = useMemo(() => {
    if (totalCards === 0) return 0;
    return ((currentIndex + 1) / totalCards) * 100;
  }, [currentIndex, totalCards]);

  return (
    <View style={styles.progressContainer}>
      <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
        {currentIndex + 1} of {totalCards}
      </Text>
      <View style={[styles.progressBar, { backgroundColor: theme.components.flashcard.progressBar.backgroundColor }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.components.flashcard.progressBar.fillColor,
              width: `${progressPercentage}%`
            }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    marginTop: isSmallScreen ? 12 : isMediumScreen ? 16 : 20,
    marginBottom: isSmallScreen ? 24 : isMediumScreen ? 30 : 36,
  },
  progressText: {
    fontSize: isSmallScreen ? 15 : isMediumScreen ? 16 : 17,
    textAlign: 'center',
    marginBottom: isSmallScreen ? 10 : isMediumScreen ? 12 : 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
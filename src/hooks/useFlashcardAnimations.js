import { useRef, useCallback } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export function useFlashcardAnimations() {
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const flipCard = useCallback((showAnswer, setShowAnswer) => {
    Animated.spring(flipAnimation, {
      toValue: showAnswer ? 0 : 1,
      friction: 12,
      tension: 40,
      useNativeDriver: true,
    }).start();
    setShowAnswer(!showAnswer);
  }, [flipAnimation]);

  const slideOut = useCallback((onComplete) => {
    Animated.timing(slideAnimation, {
      toValue: -screenWidth,
      duration: 250,
      useNativeDriver: true,
    }).start(onComplete);
  }, [slideAnimation]);

  const slideIn = useCallback((onComplete) => {
    slideAnimation.setValue(screenWidth);
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(onComplete);
  }, [slideAnimation]);

  const resetAnimations = useCallback(() => {
    flipAnimation.setValue(0);
    slideAnimation.setValue(0);
  }, [flipAnimation, slideAnimation]);

  return {
    flipAnimation,
    slideAnimation,
    frontInterpolate,
    backInterpolate,
    flipCard,
    slideOut,
    slideIn,
    resetAnimations,
  };
}

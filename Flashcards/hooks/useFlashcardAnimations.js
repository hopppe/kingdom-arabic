import { useState, useRef } from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const useFlashcardAnimations = () => {
  // Dual card system state
  const [activeCard, setActiveCard] = useState('A');
  const [isFlippedA, setIsFlippedA] = useState(false);
  const [isFlippedB, setIsFlippedB] = useState(false);

  // Animation values for both cards
  const [panA] = useState(new Animated.ValueXY());
  const [panB] = useState(new Animated.ValueXY({ x: screenWidth, y: 0 }));
  const [scaleA] = useState(new Animated.Value(1));
  const [scaleB] = useState(new Animated.Value(1));
  const [flipAnimationA] = useState(new Animated.Value(0));
  const [flipAnimationB] = useState(new Animated.Value(0));

  // Ref to prevent rapid clicking
  const lastAnswerTime = useRef(0);

  // Handle card flip animation for specific card
  const flipCard = (cardType = null) => {
    const targetCard = cardType || activeCard;
    const isFlipped = targetCard === 'A' ? isFlippedA : isFlippedB;
    const flipAnimation = targetCard === 'A' ? flipAnimationA : flipAnimationB;
    const setIsFlipped = targetCard === 'A' ? setIsFlippedA : setIsFlippedB;

    if (isFlipped) {
      Animated.spring(flipAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 40,  // Slower animation
        friction: 12, // More controlled motion
      }).start();
    } else {
      Animated.spring(flipAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,  // Slower animation
        friction: 12, // More controlled motion
      }).start();
    }
    setIsFlipped(!isFlipped);
  };

  // Create pan responder for swipe gestures
  const createPanResponder = (onSwipeComplete) => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        const activePan = activeCard === 'A' ? panA : panB;
        activePan.setOffset({
          x: activePan.x._value,
          y: activePan.y._value,
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        const activePan = activeCard === 'A' ? panA : panB;
        const activeScale = activeCard === 'A' ? scaleA : scaleB;

        activePan.setValue({ x: gestureState.dx, y: gestureState.dy });

        // Scale effect
        const distance = Math.sqrt(gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy);
        const scaleValue = Math.max(0.8, 1 - distance / 400);
        activeScale.setValue(scaleValue);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const activePan = activeCard === 'A' ? panA : panB;
        const activeScale = activeCard === 'A' ? scaleA : scaleB;

        activePan.flattenOffset();

        const swipeThreshold = 60;
        const isSwipeRight = gestureState.dx > swipeThreshold;
        const isSwipeLeft = gestureState.dx < -swipeThreshold;

        if (isSwipeRight || isSwipeLeft) {
          const rating = isSwipeRight ? 3 : 1; // Good for right swipe, Again for left swipe
          onSwipeComplete(rating, activePan, isSwipeRight);
        } else {
          // Snap back to center
          Animated.spring(activePan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();

          Animated.spring(activeScale, {
            toValue: 1,
            useNativeDriver: false,
          }).start();
        }
      },
    });
  };

  // Animate card transitions for button presses
  const animateCardTransition = (rating, onComplete, isLastCard = false) => {
    // Prevent rapid clicking
    const now = Date.now();
    if (now - lastAnswerTime.current < 300) {
      return false; // Ignore rapid clicks
    }
    lastAnswerTime.current = now;

    const activePan = activeCard === 'A' ? panA : panB;
    const inactivePan = activeCard === 'A' ? panB : panA;

    // Always move cards to the left regardless of rating
    const direction = -1; // Always left

    if (isLastCard) {
      // For the last card, just animate the current card out
      Animated.timing(activePan, {
        toValue: { x: direction * screenWidth, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        onComplete();
      });
    } else {
      // Normal card transition for non-last cards
      const newCardStartX = screenWidth; // Always start from right side

      // Position the new card off-screen on the right side
      inactivePan.setValue({ x: newCardStartX, y: 0 });

      // Animate both cards
      Animated.parallel([
        // Current card slides out
        Animated.timing(activePan, {
          toValue: { x: direction * screenWidth, y: 0 },
          duration: 300,
          useNativeDriver: false,
        }),
        // New card slides in from opposite side
        Animated.timing(inactivePan, {
          toValue: { x: 0, y: 0 },
          duration: 300,
          useNativeDriver: false,
        })
      ]).start(() => {
        onComplete();
      });
    }

    return true; // Animation started successfully
  };

  // Switch to next card and reset states
  const switchToNextCard = () => {
    if (activeCard === 'A') {
      setActiveCard('B');
      panA.setValue({ x: screenWidth, y: 0 });
      scaleA.setValue(1);
      setIsFlippedA(false);
      flipAnimationA.setValue(0);
    } else {
      setActiveCard('A');
      panB.setValue({ x: screenWidth, y: 0 });
      scaleB.setValue(1);
      setIsFlippedB(false);
      flipAnimationB.setValue(0);
    }
  };

  // Reset animation states for study mode
  const resetCurrentCardAnimation = () => {
    if (activeCard === 'A') {
      panA.setValue({ x: 0, y: 0 });
      scaleA.setValue(1);
      setIsFlippedA(false);
      flipAnimationA.setValue(0);
    } else {
      panB.setValue({ x: 0, y: 0 });
      scaleB.setValue(1);
      setIsFlippedB(false);
      flipAnimationB.setValue(0);
    }
  };

  // Reset flip state when active card changes
  const resetFlipState = () => {
    if (activeCard === 'A') {
      setIsFlippedA(false);
      flipAnimationA.setValue(0);
    } else {
      setIsFlippedB(false);
      flipAnimationB.setValue(0);
    }
  };

  return {
    // State
    activeCard,
    isFlippedA,
    isFlippedB,

    // Animation values
    panA,
    panB,
    scaleA,
    scaleB,
    flipAnimationA,
    flipAnimationB,

    // Functions
    flipCard,
    createPanResponder,
    animateCardTransition,
    switchToNextCard,
    resetCurrentCardAnimation,
    resetFlipState,
    setActiveCard,
  };
};
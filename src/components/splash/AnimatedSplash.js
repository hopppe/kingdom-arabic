import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useAppReady } from './splashState';
import { CROWN_CUT, CrownPiece, GateDoor } from './GateHalf';
import { gateTravel } from '../../utils/splashGate';
import { SPLASH_BACKGROUND } from './splashColors';

// Timeline (ms). The gate slams shut with the crown on it, holds, then opens once the app is ready.
const START_DELAY_MS = 120;
const SLAM_MS = 450;
const MIN_VISIBLE_MS = 1300;
const OPEN_MS = 950;
const REDUCED_MOTION_FADE_MS = 350;
// Doors start and end this far past the screen edge (beyond their furthest point).
const OFFSCREEN_MARGIN = 24;
const CROWN_WIDTH_RATIO = 0.72;
const CROWN_MAX_WIDTH = 360;

/**
 * Launch animation: the two leaves of a gate, each carrying a piece of the crown, slam
 * together into the icon. Once the app is ready they pull apart along the crown's own
 * lines, opening onto the app underneath. The first launch installs the Bible meanwhile.
 */
export default function AnimatedSplash({ onFinish }) {
  const ready = useAppReady();
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const crownWidth = Math.min(width * CROWN_WIDTH_RATIO, CROWN_MAX_WIDTH);
  const travel = gateTravel({ width, crownWidth, cut: CROWN_CUT, margin: OFFSCREEN_MARGIN });

  // 0 = gate shut; 1 = leaves fully apart. Starts apart, slams to 0, opens back to 1.
  const gap = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const [closed, setClosed] = useState(false);
  const [opening, setOpening] = useState(false);
  const shownAt = useRef(Date.now()).current;

  useEffect(() => {
    if (reduceMotion === null) return undefined;
    if (reduceMotion) {
      gap.setValue(0);
      setClosed(true);
      return undefined;
    }
    const slam = Animated.sequence([
      Animated.delay(START_DELAY_MS),
      Animated.timing(gap, { toValue: 0, duration: SLAM_MS, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]);
    slam.start(({ finished }) => {
      if (finished) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      setClosed(true);
    });
    return () => slam.stop();
  }, [reduceMotion, gap]);

  useEffect(() => {
    if (!ready || !closed) return undefined;
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt));
    const timer = setTimeout(() => {
      setOpening(true);
      const animation = reduceMotion
        ? Animated.timing(fade, { toValue: 0, duration: REDUCED_MOTION_FADE_MS, useNativeDriver: true })
        : Animated.timing(gap, { toValue: 1, duration: OPEN_MS, easing: Easing.inOut(Easing.cubic), useNativeDriver: true });
      // Always finish: an interrupted animation (app backgrounded) would otherwise leave the overlay up.
      animation.start(() => onFinish());
    }, wait);
    return () => clearTimeout(timer);
  }, [ready, closed, gap, fade, shownAt, onFinish, reduceMotion]);

  const offset = Animated.multiply(gap, travel);
  const doorProps = { width, height, crownWidth, offset };

  return (
    <Animated.View
      style={[styles.overlay, { opacity: fade }]}
      // The native launch screen is the same plain color, so swap to it as soon as we're drawn.
      onLayout={() => SplashScreen.hide()}
      pointerEvents={ready ? 'none' : 'auto'}
      accessibilityLabel="Kingdom Arabic is loading"
    >
      <StatusBar style="light" />
      {/* Covers the screen until the gate opens; the leaves start apart, so this hides the app. */}
      {!opening && <View style={styles.backing} />}
      <GateDoor side="left" {...doorProps} />
      <GateDoor side="right" {...doorProps} />
      {/* The pieces interlock, so they pass over each other; the left one (the band) rides on top. */}
      <CrownPiece side="right" crownWidth={crownWidth} offset={offset} />
      <CrownPiece side="left" crownWidth={crownWidth} offset={offset} />
    </Animated.View>
  );
}

/** null until known, so we don't start the full animation and then cut it short. */
function useReduceMotion() {
  const [reduce, setReduce] = useState(null);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => active && setReduce(Boolean(value)))
      .catch(() => active && setReduce(false));
    return () => {
      active = false;
    };
  }, []);
  return reduce;
}

const styles = StyleSheet.create({
  // Transparent: the leaves paint the background, so the app shows through as they open.
  overlay: { ...StyleSheet.absoluteFill, zIndex: 10000, elevation: 10000 },
  backing: { ...StyleSheet.absoluteFill, backgroundColor: SPLASH_BACKGROUND },
});

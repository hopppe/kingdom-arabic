import React, { useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { gateDoorPoints, pointsToSvgPath } from '../../utils/splashGate';
import { SPLASH_BACKGROUND } from './splashColors';
import CROWN_CUT from './crownCut.json';

// Built by scripts/splash/split_crown.py: sharp, cut along the crown's own lines,
// both on the full crown canvas so they stack in place.
const CROWN_PIECES = {
  left: require('../../../assets/splash-crown-left.png'),
  right: require('../../../assets/splash-crown-right.png'),
};

export const crownHeightFor = (crownWidth) => crownWidth / CROWN_CUT.aspect;
export { CROWN_CUT };

/**
 * One leaf of the gate: its inner edge follows the crown's cut, and its piece of the
 * crown rides on it. `offset` is how far the leaf has moved outward, in points.
 * The door is drawn under both crown pieces (see `layer`), so the overlap never hides gold.
 */
export function GateDoor({ side, width, height, crownWidth, offset }) {
  const path = useMemo(
    () => pointsToSvgPath(gateDoorPoints({ side, width, height, crownWidth, cut: CROWN_CUT })),
    [side, width, height, crownWidth]
  );
  return (
    <Animated.View pointerEvents="none" style={[styles.layer, slide(side, offset)]}>
      <Svg width={width} height={height}>
        {/* The edge sits just inside the gold, so a moving door carries no rim of purple. */}
        <Path d={path} fill={SPLASH_BACKGROUND} />
      </Svg>
    </Animated.View>
  );
}

export function CrownPiece({ side, crownWidth, offset }) {
  return (
    <Animated.View pointerEvents="none" style={[styles.layer, styles.center, slide(side, offset)]}>
      <Animated.Image
        source={CROWN_PIECES[side]}
        style={{ width: crownWidth, height: crownHeightFor(crownWidth) }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

function slide(side, offset) {
  const outward = side === 'left' ? -1 : 1;
  return { transform: [{ translateX: Animated.multiply(offset, outward) }] };
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill },
  center: { alignItems: 'center', justifyContent: 'center' },
});

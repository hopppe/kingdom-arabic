import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useTheme } from '../../context/ThemeContext';

// iOS 26+ renders real Liquid Glass; older iOS and Android get a plain surface.
const HAS_LIQUID_GLASS = isLiquidGlassAvailable();

/**
 * Liquid Glass container. `interactive` gives controls the native press
 * response; `tintColor` tints the glass (e.g. for an active state).
 */
export default function GlassSurface({ style, interactive = false, tintColor, children, ...rest }) {
  const { theme } = useTheme();

  if (HAS_LIQUID_GLASS) {
    return (
      <GlassView
        style={style}
        isInteractive={interactive}
        tintColor={tintColor}
        colorScheme={theme.isDark ? 'dark' : 'light'}
        {...rest}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: tintColor || theme.colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

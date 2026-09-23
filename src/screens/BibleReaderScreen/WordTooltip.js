import React from 'react';
import { Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EDGE_MARGIN = 20;

// Gloss bubble above a tapped word. Tapping it opens word study for that word.
export const WordTooltip = ({ activeWord, theme, styles, onPress }) => {
  const { width: screenWidth } = useWindowDimensions();
  const estimatedWidth = Math.min(Math.max(activeWord.translation.length * 10 + 44, 96), screenWidth - EDGE_MARGIN * 2);
  const tooltipLeft = Math.max(
    EDGE_MARGIN,
    Math.min(activeWord.x - estimatedWidth / 2, screenWidth - estimatedWidth - EDGE_MARGIN)
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${activeWord.translation}. Open word study`}
      style={{
        position: 'absolute',
        left: tooltipLeft,
        top: activeWord.y - 60,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.colors.surfaceElevated,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        ...theme.shadows.lg,
        zIndex: 9999,
        maxWidth: screenWidth - EDGE_MARGIN * 2,
      }}
    >
      <Text style={styles.tooltipText}>{activeWord.translation}</Text>
      <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
};

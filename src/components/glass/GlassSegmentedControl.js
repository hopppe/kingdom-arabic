import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import GlassSurface from './GlassSurface';

/** Glass capsule with one selectable segment per option: [{ value, label }]. */
export default function GlassSegmentedControl({ options, value, onChange }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <GlassSurface style={styles.capsule} interactive>
      <View style={styles.row} accessibilityRole="tablist">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              style={[styles.segment, selected && styles.segmentSelected]}
              onPress={() => onChange(option.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </GlassSurface>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    capsule: {
      borderRadius: 22,
      padding: 3,
    },
    row: {
      flexDirection: 'row',
    },
    segment: {
      paddingHorizontal: 18,
      minHeight: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentSelected: {
      backgroundColor: theme.colors.primary,
    },
    label: {
      fontSize: 15,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    labelSelected: {
      color: theme.colors.textOnPrimary,
    },
  });

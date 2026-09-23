import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { STEP_ORDER, STEP_LABELS } from '../../utils/memory/steps';

export function StepIndicator({ currentStep }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      {STEP_ORDER.map((step, index) => {
        const isActive = step === currentStep;
        const isDone = STEP_ORDER.indexOf(currentStep) > index;
        return (
          <View key={step} style={styles.item}>
            <View
              style={[
                styles.dot,
                isDone && { backgroundColor: theme.colors.success },
                isActive && { backgroundColor: theme.colors.info, transform: [{ scale: 1.2 }] },
              ]}
            />
            <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
              {STEP_LABELS[step]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md },
    item: { alignItems: 'center', flex: 1 },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.border, marginBottom: 4 },
    label: { fontSize: 10, color: theme.colors.textSecondary },
    labelActive: { color: theme.colors.info, fontWeight: theme.typography.fontWeight.semibold },
  });

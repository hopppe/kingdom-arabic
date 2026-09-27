// Shared Liquid Glass card shell used by every section of the Progress dashboard.
import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import GlassSurface from '../../components/glass/GlassSurface';

/** props: title, icon (Ionicons name), iconColor, onPress (makes the card a link), style */
export default function DashboardCard({ title, icon, iconColor, onPress, children, style }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const accent = iconColor || theme.colors.text;

  const header = title ? (
    <View style={styles.header}>
      {icon ? (
        <View style={[styles.iconBadge, { backgroundColor: `${accent}22` }]}>
          <Ionicons name={icon} size={15} color={accent} />
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {onPress ? <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} /> : null}
    </View>
  ) : null;

  return (
    <GlassSurface style={[styles.card, style]} interactive={Boolean(onPress)}>
      {onPress ? (
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
          {header}
          {children}
        </Pressable>
      ) : (
        <>
          {header}
          {children}
        </>
      )}
    </GlassSurface>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    card: {
      borderRadius: 26,
      padding: 18,
      marginHorizontal: theme.spacing.md,
      marginBottom: 14,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
    },
    iconBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      flex: 1,
      fontSize: 17,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
  });

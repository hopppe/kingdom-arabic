import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMemoryVerses } from '../../context/MemoryVerseContext';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../navigation/routes';
import DashboardCard from './DashboardCard';

export default function MemoryVerseCard() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();

  const { stats } = useMemoryVerses();

  if (!stats) return null;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate(ROUTES.MEMORIZE)}>
      <DashboardCard title="Memory verses">
        <View style={styles.row}>
          <Stat value={stats.total} label="Total" styles={styles} />
          <Stat value={stats.learning} label="Learning" styles={styles} color={theme.colors.warning} />
          <Stat value={stats.reviewing} label="Memorized" styles={styles} color={theme.colors.info} />
          <Stat value={stats.mastered} label="Mastered" styles={styles} color={theme.colors.success} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>{stats.dueToday} due today</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
        </View>
      </DashboardCard>
    </TouchableOpacity>
  );
}

const Stat = ({ value, label, styles, color }) => (
  <View style={styles.stat}>
    <Text style={[styles.statValue, color && { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const createStyles = (theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    stat: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    statLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.borderLight,
    },
    footerText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
  });

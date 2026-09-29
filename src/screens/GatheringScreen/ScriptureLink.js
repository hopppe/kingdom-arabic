import React, { useMemo } from 'react';
import { Pressable, Text, View, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { parseScriptureRef, formatScriptureRef, formatScriptureRefArabic } from '../../utils/gathering/scriptureRef';

function Chip({ icon, labelAr, labelEn, showEnglish, onPress, accessibilityLabel, accessibilityRole = 'link' }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Pressable
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
    >
      <Ionicons name={icon} size={14} color={theme.colors.info} />
      <View style={styles.labels}>
        <Text style={styles.labelAr}>{labelAr}</Text>
        {showEnglish && <Text style={styles.labelEn}>{labelEn}</Text>}
      </View>
    </Pressable>
  );
}

/** A scripture reference chip; `onOpen` receives the parsed reference. */
export function ScriptureLink({ reference, onOpen, showEnglish }) {
  const parsed = useMemo(() => parseScriptureRef(reference), [reference]);
  if (!parsed) return null;
  const labelEn = formatScriptureRef(parsed);
  return (
    <Chip
      icon="book-outline"
      labelAr={formatScriptureRefArabic(parsed)}
      labelEn={labelEn}
      showEnglish={showEnglish}
      onPress={() => onOpen(parsed)}
      accessibilityLabel={`Open ${labelEn} in the Bible`}
    />
  );
}

/** A chip that opens a web page or app store listing outside the app. */
export function ExternalLink({ icon = 'open-outline', ar, en, url, showEnglish }) {
  const open = () =>
    Linking.openURL(url).catch((error) => {
      console.error('Failed to open link:', url, error);
      Alert.alert('تعذّر فتح الرابط', 'Could not open the link.');
    });
  return (
    <Chip icon={icon} labelAr={ar} labelEn={en} showEnglish={showEnglish} onPress={open} accessibilityLabel={en} />
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surfaceOverlay,
    },
    chipPressed: { backgroundColor: theme.colors.buttonOverlay },
    labels: { alignItems: 'flex-end' },
    labelAr: { ...theme.arabic.scaled(0.72), color: theme.colors.info, textAlign: 'right' },
    labelEn: { fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary, marginTop: -2, marginBottom: 2 },
  });

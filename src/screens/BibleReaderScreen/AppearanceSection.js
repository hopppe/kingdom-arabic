import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, COLOR_SCHEMES } from '../../context/ThemeContext';
import { ARABIC_TEXT_SIZES, buildArabicTextStyle, getAvailableArabicFonts } from '../../theme/arabicFonts';

// Vowelled sample used to preview each Arabic font ("In the beginning was the Word").
const FONT_SAMPLE = 'فِي الْبَدْءِ كَانَ الْكَلِمَةُ';

const OptionRow = ({ label, description, sample, selected, onPress, styles }) => (
  <TouchableOpacity style={styles.optionRow} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.optionTextColumn}>
      <Text style={styles.optionLabel}>{label}</Text>
      {description ? <Text style={styles.optionDescription}>{description}</Text> : null}
      {sample}
    </View>
    <Ionicons
      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
      size={22}
      color={selected ? styles.colors.checkmarkSelected : styles.colors.checkmarkUnselected}
    />
  </TouchableOpacity>
);

export const AppearanceSection = () => {
  const { theme, prefs, setColorScheme, setArabicFont, setArabicTextSize } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Appearance</Text>

      {/* Color scheme */}
      <Text style={styles.groupLabel}>Color Scheme</Text>
      <View style={styles.optionGroup}>
        {Object.entries(COLOR_SCHEMES).map(([key, label]) => (
          <OptionRow
            key={key}
            label={label}
            selected={prefs.colorScheme === key}
            onPress={() => setColorScheme(key)}
            styles={styles}
          />
        ))}
      </View>

      {/* Arabic font */}
      <Text style={styles.groupLabel}>Arabic Font</Text>
      <View style={styles.optionGroup}>
        {getAvailableArabicFonts().map(([key, font]) => {
          const sampleStyle = buildArabicTextStyle(key, prefs.arabicTextSize);
          return (
            <OptionRow
              key={key}
              label={font.label}
              description={font.description}
              selected={prefs.arabicFont === key}
              onPress={() => setArabicFont(key)}
              styles={styles}
              sample={
                <Text style={[styles.fontSample, sampleStyle, { color: theme.colors.text }]}>
                  {FONT_SAMPLE}
                </Text>
              }
            />
          );
        })}
      </View>

      {/* Text size */}
      <Text style={styles.groupLabel}>Text Size</Text>
      <View style={styles.optionGroup}>
        {Object.entries(ARABIC_TEXT_SIZES).map(([key, size]) => (
          <OptionRow
            key={key}
            label={size.label}
            selected={prefs.arabicTextSize === key}
            onPress={() => setArabicTextSize(key)}
            styles={styles}
          />
        ))}
      </View>
    </View>
  );
};

const createStyles = (theme) => ({
  colors: {
    checkmarkSelected: theme.colors.info,
    checkmarkUnselected: theme.colors.textTertiary,
  },
  ...StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
    paddingHorizontal: 8,
    textTransform: 'uppercase',
  },
  optionGroup: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
    gap: 10,
  },
  optionTextColumn: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  optionDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  fontSample: {
    marginTop: 6,
  },
  }),
});

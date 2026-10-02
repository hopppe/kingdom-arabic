import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Platform } from 'react-native';
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
    {selected && <Ionicons name="checkmark" size={20} color={styles.colors.checkmarkSelected} />}
  </TouchableOpacity>
);

// A dropdown row: shows the current choice and opens its options just below it.
const DropdownRow = ({ label, value, isOpen, onToggle, children, styles }) => (
  <View style={styles.dropdown}>
    <TouchableOpacity
      style={styles.dropdownHeader}
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ expanded: isOpen }}
    >
      <Text style={styles.dropdownLabel}>{label}</Text>
      <Text style={styles.dropdownValue} numberOfLines={1}>{value}</Text>
      <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={styles.colors.chevron} />
    </TouchableOpacity>
    {isOpen && <View style={styles.dropdownOptions}>{children}</View>}
  </View>
);

// A switch with a one-line explanation beneath its label.
const SwitchRow = ({ label, description, value, onValueChange, theme, styles }) => (
  <View style={styles.switchRow}>
    <View style={styles.optionTextColumn}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <Text style={styles.optionDescription}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      accessibilityLabel={label}
      trackColor={{ false: theme.colors.disabled, true: theme.colors.info }}
      thumbColor={Platform.OS === 'android' ? theme.colors.white : undefined}
    />
  </View>
);

// "Reading" in Settings: how the reader shows the text.
export const AppearanceSection = () => {
  const { theme, prefs, setColorScheme, setArabicFont, setArabicTextSize, setInterlinear } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  // Only one dropdown open at a time: 'scheme' | 'font' | 'size' | null.
  const [openKey, setOpenKey] = useState(null);
  const toggle = (key) => setOpenKey((current) => (current === key ? null : key));
  const choose = (setter) => (value) => {
    setter(value);
    setOpenKey(null);
  };

  const fonts = getAvailableArabicFonts();
  const currentFont = fonts.find(([key]) => key === prefs.arabicFont)?.[1];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Reading</Text>

      <SwitchRow
        label="Word-by-word"
        description="Show each word's meaning beneath it"
        value={prefs.interlinear}
        onValueChange={setInterlinear}
        theme={theme}
        styles={styles}
      />

      <DropdownRow
        label="Color Scheme"
        value={COLOR_SCHEMES[prefs.colorScheme]}
        isOpen={openKey === 'scheme'}
        onToggle={() => toggle('scheme')}
        styles={styles}
      >
        {Object.entries(COLOR_SCHEMES).map(([key, label]) => (
          <OptionRow
            key={key}
            label={label}
            selected={prefs.colorScheme === key}
            onPress={() => choose(setColorScheme)(key)}
            styles={styles}
          />
        ))}
      </DropdownRow>

      <DropdownRow
        label="Arabic Font"
        value={currentFont?.label}
        isOpen={openKey === 'font'}
        onToggle={() => toggle('font')}
        styles={styles}
      >
        {fonts.map(([key, font]) => {
          const sampleStyle = buildArabicTextStyle(key, prefs.arabicTextSize);
          return (
            <OptionRow
              key={key}
              label={font.label}
              description={font.description}
              selected={prefs.arabicFont === key}
              onPress={() => choose(setArabicFont)(key)}
              styles={styles}
              sample={
                <Text style={[styles.fontSample, sampleStyle, { color: theme.colors.text }]}>
                  {FONT_SAMPLE}
                </Text>
              }
            />
          );
        })}
      </DropdownRow>

      <DropdownRow
        label="Text Size"
        value={ARABIC_TEXT_SIZES[prefs.arabicTextSize]?.label}
        isOpen={openKey === 'size'}
        onToggle={() => toggle('size')}
        styles={styles}
      >
        {Object.entries(ARABIC_TEXT_SIZES).map(([key, size]) => (
          <OptionRow
            key={key}
            label={size.label}
            selected={prefs.arabicTextSize === key}
            onPress={() => choose(setArabicTextSize)(key)}
            styles={styles}
          />
        ))}
      </DropdownRow>
    </View>
  );
};

const createStyles = (theme) => ({
  colors: {
    checkmarkSelected: theme.colors.info,
    chevron: theme.colors.textTertiary,
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
  dropdown: {
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
    overflow: 'hidden',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  dropdownLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  dropdownValue: {
    flexShrink: 1,
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  dropdownOptions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingLeft: 24,
    paddingRight: 12,
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

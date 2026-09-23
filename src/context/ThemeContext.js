import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme/palettes';
import {
  ARABIC_FONTS,
  isArabicFontAvailable,
  ARABIC_TEXT_SIZES,
  DEFAULT_ARABIC_FONT,
  DEFAULT_ARABIC_TEXT_SIZE,
  buildArabicTextStyle,
} from '../theme/arabicFonts';

const ThemeContext = createContext(null);

export const DISPLAY_PREFS_KEY = '@learnarabic_display_prefs';

export const COLOR_SCHEMES = {
  system: 'Match device',
  light: 'Light',
  dark: 'Dark',
};

const DEFAULT_PREFS = {
  colorScheme: 'system',
  arabicFont: DEFAULT_ARABIC_FONT,
  arabicTextSize: DEFAULT_ARABIC_TEXT_SIZE,
};

const sanitizePrefs = (stored) => ({
  colorScheme: COLOR_SCHEMES[stored?.colorScheme] ? stored.colorScheme : DEFAULT_PREFS.colorScheme,
  arabicFont: isArabicFontAvailable(stored?.arabicFont) ? stored.arabicFont : DEFAULT_PREFS.arabicFont,
  arabicTextSize: ARABIC_TEXT_SIZES[stored?.arabicTextSize] ? stored.arabicTextSize : DEFAULT_PREFS.arabicTextSize,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 };
const borderRadius = { sm: 8, md: 12, lg: 16, xl: 20 };
const typography = {
  fontSize: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, title: 28, header: 32 },
  fontWeight: { light: '300', regular: '400', medium: '500', semibold: '600', bold: '700' },
  lineHeight: { tight: 1.2, normal: 1.4, relaxed: 1.6, arabic: 1.9 },
};

const buildShadows = (isDark) => {
  const opacity = isDark ? 0.5 : 1;
  return {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05 * opacity, shadowRadius: 2, elevation: 1 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1 * opacity, shadowRadius: 8, elevation: 3 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15 * opacity, shadowRadius: 12, elevation: 5 },
  };
};

export function buildTheme({ isDark, arabicFont, arabicTextSize }) {
  const colors = isDark ? darkColors : lightColors;
  return {
    isDark,
    colors,
    spacing,
    borderRadius,
    typography,
    shadows: buildShadows(isDark),
    // Arabic text styles for the chosen font; `arabic.body` is the reading size.
    arabic: {
      body: buildArabicTextStyle(arabicFont, arabicTextSize),
      large: buildArabicTextStyle(arabicFont, arabicTextSize, 1.25),
      small: buildArabicTextStyle(arabicFont, arabicTextSize, 0.8),
      fontFamily: ARABIC_FONTS[arabicFont]?.fontFamily,
      scaled: (scale) => buildArabicTextStyle(arabicFont, arabicTextSize, scale),
    },
  };
}

export const ThemeProvider = ({ children }) => {
  const deviceScheme = useColorScheme();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(DISPLAY_PREFS_KEY)
      .then((stored) => {
        if (!cancelled && stored) setPrefs(sanitizePrefs(JSON.parse(stored)));
      })
      .catch((error) => console.error('Failed to load display preferences:', error))
      .finally(() => {
        if (!cancelled) setPrefsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updatePrefs = useCallback((changes) => {
    setPrefs((current) => {
      const next = sanitizePrefs({ ...current, ...changes });
      AsyncStorage.setItem(DISPLAY_PREFS_KEY, JSON.stringify(next)).catch((error) =>
        console.error('Failed to save display preferences:', error)
      );
      return next;
    });
  }, []);

  const isDark = prefs.colorScheme === 'system' ? deviceScheme === 'dark' : prefs.colorScheme === 'dark';

  const theme = useMemo(
    () => buildTheme({ isDark, arabicFont: prefs.arabicFont, arabicTextSize: prefs.arabicTextSize }),
    [isDark, prefs.arabicFont, prefs.arabicTextSize]
  );

  const value = useMemo(
    () => ({
      theme,
      prefs,
      prefsLoaded,
      setColorScheme: (colorScheme) => updatePrefs({ colorScheme }),
      setArabicFont: (arabicFont) => updatePrefs({ arabicFont }),
      setArabicTextSize: (arabicTextSize) => updatePrefs({ arabicTextSize }),
    }),
    [theme, prefs, prefsLoaded, updatePrefs]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

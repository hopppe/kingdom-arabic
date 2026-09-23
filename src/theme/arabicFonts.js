// Arabic typefaces the reader can choose from. Each one needs generous line height
// so that vowel marks above and below the letters (harakat, shadda, tanween) are
// never clipped by the neighbouring line.

export const ARABIC_FONTS = {
  scheherazade: {
    label: 'Scheherazade New',
    description: 'Built for fully vowelled text. Largest, clearest marks.',
    fontFamily: 'ScheherazadeNew_500Medium',
    lineHeightMultiplier: 2.0,
    sizeAdjust: 1.15,
  },
  amiri: {
    label: 'Amiri',
    description: 'Classic Naskh used in printed Bibles.',
    fontFamily: 'Amiri_400Regular',
    lineHeightMultiplier: 2.1,
    sizeAdjust: 1.05,
  },
  notoNaskh: {
    label: 'Noto Naskh Arabic',
    description: 'Clean, modern Naskh.',
    fontFamily: 'NotoNaskhArabic_500Medium',
    lineHeightMultiplier: 1.9,
    sizeAdjust: 1.0,
  },
  system: {
    label: 'System',
    description: "Your device's built-in Arabic font.",
    fontFamily: undefined,
    lineHeightMultiplier: 1.9,
    sizeAdjust: 1.0,
  },
};

export const DEFAULT_ARABIC_FONT = 'scheherazade';

export const ARABIC_TEXT_SIZES = {
  small: { label: 'Small', fontSize: 20 },
  medium: { label: 'Medium', fontSize: 23 },
  large: { label: 'Large', fontSize: 27 },
  xlarge: { label: 'Extra large', fontSize: 32 },
};

export const DEFAULT_ARABIC_TEXT_SIZE = 'medium';

// Font assets to load at startup (only the weights we use).
export const ARABIC_FONT_ASSETS = {
  ScheherazadeNew_500Medium: require('@expo-google-fonts/scheherazade-new/500Medium/ScheherazadeNew_500Medium.ttf'),
  Amiri_400Regular: require('@expo-google-fonts/amiri/400Regular/Amiri_400Regular.ttf'),
  NotoNaskhArabic_500Medium: require('@expo-google-fonts/noto-naskh-arabic/500Medium/NotoNaskhArabic_500Medium.ttf'),
};

/**
 * Text style for Arabic at a given base size. `scale` lets smaller UI (lists,
 * tooltips) reuse the same face at a proportional size.
 */
export function buildArabicTextStyle(fontKey, sizeKey, scale = 1) {
  const font = ARABIC_FONTS[fontKey] || ARABIC_FONTS[DEFAULT_ARABIC_FONT];
  const size = ARABIC_TEXT_SIZES[sizeKey] || ARABIC_TEXT_SIZES[DEFAULT_ARABIC_TEXT_SIZE];
  const fontSize = Math.round(size.fontSize * font.sizeAdjust * scale);
  return {
    fontFamily: font.fontFamily,
    fontSize,
    lineHeight: Math.round(fontSize * font.lineHeightMultiplier),
    // Custom fonts ship a single weight; a synthetic bold would smear the marks.
    fontWeight: font.fontFamily ? 'normal' : '500',
    writingDirection: 'rtl',
  };
}

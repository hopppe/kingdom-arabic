# Theme Structure - LearnArabic App

This document outlines the complete theme structure used throughout the LearnArabic React Native application.

## Overview

The app uses a centralized theme system via React Context (`ThemeContext.js`) that provides consistent colors, typography, spacing, and component styles across all screens and components.

## Color Palette

### Primary Colors
```javascript
background: '#FFFFFF'           // Pure white backgrounds
backgroundSecondary: '#F2F2F7'  // Light gray for secondary surfaces
text: '#000000'                 // Pure black for primary text
textSecondary: '#8E8E93'        // Muted gray for secondary text
accent: '#666666'               // Medium gray for accents
```

### Interactive Elements
```javascript
buttonBackground: '#333333'     // Dark gray for primary buttons
buttonText: '#FFFFFF'           // White text on dark buttons
activeBackground: '#E5E5EA'     // Light gray for active/pressed states
```

### Card & Surface Colors
```javascript
cardBackground: '#F2F2F7'       // Light gray card backgrounds
border: '#C6C6C8'               // Subtle gray borders
selection: '#E5E5EA'            // Selection highlight color
surface: '#F8F9FA'              // Alternative surface color
surfaceLight: '#FBFBFB'         // Lighter surface variant
```

### Status Colors
```javascript
error: '#FF3B30'                // Red for errors
success: '#34C759'              // Green for success states
warning: '#FF9500'              // Orange for warnings
```

### Arabic-Specific Colors
```javascript
arabicText: '#000000'           // Black for Arabic text
arabicAccent: '#666666'         // Gray accent for Arabic elements
```

### Additional Utility Colors
```javascript
primary: '#333333'              // Primary brand color (dark gray)
primaryLight: '#F5F5F5'         // Light version of primary
white: '#FFFFFF'                // Pure white
overlay: '#000000'              // Black for overlays
disabledText: '#CCCCCC'         // Light gray for disabled text
disabled: '#DDDDDD'             // Light gray for disabled elements
borderLight: '#F0F0F0'          // Very light border color
textOnPrimary: '#FFFFFF'        // White text on primary backgrounds
```

## Typography

### Font Families
```javascript
primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
arabic: 'Noto Naskh Arabic, Arial, sans-serif'
```

### Font Sizes
```javascript
xs: 12      // Extra small text
sm: 14      // Small text
md: 16      // Default body text
lg: 18      // Large text
xl: 20      // Extra large text
xxl: 24     // Headings
title: 28   // Screen titles
header: 32  // Main headers
```

### Font Weights
```javascript
light: '300'
regular: '400'
medium: '500'
semibold: '600'
bold: '700'
```

### Line Heights
```javascript
tight: 1.2      // Compact text
normal: 1.4     // Standard text
relaxed: 1.6    // Spacious text
arabic: 1.8     // Extra spacing for Arabic text
```

## Spacing System

```javascript
xs: 4       // 4px - Very small spacing
sm: 8       // 8px - Small spacing
md: 16      // 16px - Default spacing
lg: 24      // 24px - Large spacing
xl: 32      // 32px - Extra large spacing
xxl: 40     // 40px - Maximum spacing
```

## Border Radius

```javascript
sm: 8       // Small rounded corners
md: 12      // Medium rounded corners
lg: 16      // Large rounded corners
xl: 20      // Extra large rounded corners
```

## Shadow Definitions

### Small Shadow
```javascript
shadowColor: '#000'
shadowOffset: { width: 0, height: 1 }
shadowOpacity: 0.05
shadowRadius: 2
elevation: 1
```

### Medium Shadow
```javascript
shadowColor: '#000'
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.1
shadowRadius: 8
elevation: 3
```

### Large Shadow
```javascript
shadowColor: '#000'
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.15
shadowRadius: 12
elevation: 5
```

## Component-Specific Styles

### Header Component
```javascript
title: {
  fontSize: 20
  fontWeight: '600'
  color: '#000000'
}
subtitle: {
  fontSize: 16
  color: '#8E8E93'
}
button: {
  size: 24
  color: '#333333'
}
```

### Card Component
```javascript
default: {
  shadowColor: '#000'
  shadowOffset: { width: 0, height: 2 }
  shadowOpacity: 0.1
  shadowRadius: 8
  elevation: 3
}
```

### Flashcard Component
```javascript
study: {
  backgroundColor: '#333333'
  textColor: '#FFFFFF'
}
add: {
  backgroundColor: '#34C759'
  textColor: '#FFFFFF'
}
remove: {
  backgroundColor: '#FF3B30'
  textColor: '#FFFFFF'
}
```

## Usage Examples

### Accessing Theme in Components

```javascript
import { useTheme } from '../context/ThemeContext';

export default function MyComponent() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.title,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      ...theme.shadows.md,
    },
  });
}
```

### Typography Usage
```javascript
titleStyle: {
  fontSize: theme.typography.fontSize.title,
  fontWeight: theme.typography.fontWeight.bold,
  lineHeight: theme.typography.lineHeight.tight,
  color: theme.colors.text,
}

arabicTextStyle: {
  fontFamily: theme.typography.fontFamily.arabic,
  fontSize: theme.typography.fontSize.lg,
  lineHeight: theme.typography.lineHeight.arabic,
  color: theme.colors.arabicText,
}
```

## Design Philosophy

The theme follows a **clean, minimal design** inspired by modern reading apps:

- **Neutral Color Palette**: Primarily grays, whites, and blacks for a clean aesthetic
- **High Contrast**: Black text on white backgrounds for optimal readability
- **Subtle Interactions**: Muted colors for buttons and interactive elements
- **Arabic-Friendly**: Proper spacing and typography considerations for Arabic text
- **Consistent Spacing**: Mathematical spacing scale for visual harmony
- **Accessible**: High contrast ratios and legible font sizes

## Files Using Theme

- `src/context/ThemeContext.js` - Theme definition
- `src/screens/HomeScreen.js` - Main screen styling
- `src/screens/StoryReader.js` - Reading interface
- `src/components/NameCollectionModal.js` - Modal styling
- `src/navigation/AppNavigator.js` - Navigation styling
- `src/screens/ComprehensionQuestionModal.js` - Quiz styling

## Migration from Hardcoded Colors

All instances of hardcoded colors have been replaced with theme references:

- ❌ `backgroundColor: '#4CAF50'` (old green)
- ✅ `backgroundColor: theme.colors.primary` (new neutral)

This ensures consistent theming and easier future customization.
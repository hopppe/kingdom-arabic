import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Define theme outside component to prevent recreation on every render
const theme = {
    colors: {
      // Primary palette - clean minimal design like Bible app screenshots
      background: '#FFFFFF',
      backgroundSecondary: '#F2F2F7',
      text: '#000000',
      textSecondary: '#8E8E93',
      accent: '#666666',

      // Card and surface colors
      cardBackground: '#F2F2F7',
      border: '#C6C6C8',
      selection: '#E5E5EA',

      // Interactive states
      buttonBackground: '#333333',
      buttonText: '#FFFFFF',
      activeBackground: '#E5E5EA',

      // Status colors
      error: '#FF3B30',
      success: '#34C759',
      warning: '#FF9500',

      // Arabic text specific
      arabicText: '#000000',
      arabicAccent: '#666666',

      // Additional missing colors
      primary: '#333333',
      primaryLight: '#F5F5F5',
      surface: '#F8F9FA',
      surfaceLight: '#FBFBFB',
      white: '#FFFFFF',
      overlay: '#000000',
      disabledText: '#CCCCCC',
      disabled: '#DDDDDD',
      borderLight: '#F0F0F0',
      textOnPrimary: '#FFFFFF'
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 40
    },
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20
    },
    typography: {
      // Font families
      fontFamily: {
        primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        arabic: 'Noto Naskh Arabic, Arial, sans-serif'
      },

      // Font sizes
      fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        title: 28,
        header: 32
      },

      // Font weights
      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      },

      // Line heights
      lineHeight: {
        tight: 1.2,
        normal: 1.4,
        relaxed: 1.6,
        arabic: 1.8
      }
    },
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5
      }
    },
    components: {
      header: {
        screen: {
          title: {
            fontSize: 20,
            fontWeight: '600',
            color: '#1A1A1A'
          },
          subtitle: {
            fontSize: 16,
            color: '#8E8E93'
          },
          button: {
            size: 24,
            color: '#E74C3C'
          }
        }
      },
      card: {
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3
        }
      },
      flashcard: {
        study: {
          backgroundColor: '#333333',
          textColor: '#FFFFFF'
        },
        add: {
          backgroundColor: '#34C759',
          textColor: '#FFFFFF'
        },
        remove: {
          backgroundColor: '#FF3B30',
          textColor: '#FFFFFF'
        }
      }
    }
};

// Create stable context value object
const contextValue = { theme };

// Simple theme provider with basic colors
export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
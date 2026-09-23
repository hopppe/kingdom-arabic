import React, { useMemo } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ROUTES } from './routes';

import BibleReaderScreen from '../screens/BibleReaderScreen';
import FlashcardScreen from '../screens/FlashcardScreen';
import MemoryScreen from '../screens/MemoryScreen';
import ProgressScreen from '../screens/ProgressScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  [ROUTES.BIBLE]: ['book', 'book-outline'],
  [ROUTES.FLASHCARDS]: ['albums', 'albums-outline'],
  [ROUTES.MEMORIZE]: ['bulb', 'bulb-outline'],
  [ROUTES.PROGRESS]: ['stats-chart', 'stats-chart-outline'],
};

export default function AppNavigator() {
  const { theme } = useTheme();

  const navigationTheme = useMemo(() => {
    const base = theme.isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.colors.tabActive,
        background: theme.colors.background,
        card: theme.colors.tabBar,
        text: theme.colors.text,
        border: theme.colors.tabBarBorder,
      },
    };
  }, [theme]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        initialRouteName={ROUTES.BIBLE}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.tabActive,
          tabBarInactiveTintColor: theme.colors.tabInactive,
          tabBarStyle: { backgroundColor: theme.colors.tabBar, borderTopColor: theme.colors.tabBarBorder },
          tabBarIcon: ({ focused, color, size }) => {
            const [active, inactive] = TAB_ICONS[route.name];
            return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name={ROUTES.BIBLE} component={BibleReaderScreen} />
        <Tab.Screen name={ROUTES.FLASHCARDS} component={FlashcardScreen} />
        <Tab.Screen name={ROUTES.MEMORIZE} component={MemoryScreen} />
        <Tab.Screen name={ROUTES.PROGRESS} component={ProgressScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

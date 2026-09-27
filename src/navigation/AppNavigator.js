import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ROUTES } from './routes';
import { IS_TABLET } from './device';

import BibleReaderScreen from '../screens/BibleReaderScreen';
import FlashcardScreen from '../screens/FlashcardScreen';
import MemoryScreen from '../screens/MemoryScreen';
import ProgressScreen from '../screens/ProgressScreen';

const Stack = createNativeStackNavigator();
const NativeTab = createNativeBottomTabNavigator();
const Tab = createBottomTabNavigator();

// SF Symbols for the native (Liquid Glass) tab bar: [focused, unfocused].
const SF_TAB_ICONS = {
  [ROUTES.BIBLE]: ['book.fill', 'book'],
  [ROUTES.FLASHCARDS]: ['rectangle.stack.fill', 'rectangle.stack'],
  [ROUTES.MEMORIZE]: ['lightbulb.fill', 'lightbulb'],
  [ROUTES.PROGRESS]: ['chart.bar.fill', 'chart.bar'],
};

const TAB_ICONS = {
  [ROUTES.BIBLE]: ['book', 'book-outline'],
  [ROUTES.FLASHCARDS]: ['albums', 'albums-outline'],
  [ROUTES.MEMORIZE]: ['bulb', 'bulb-outline'],
  [ROUTES.PROGRESS]: ['stats-chart', 'stats-chart-outline'],
};

// Phones: no tab bar. The reader is home; Flashcards and Memorize push on top
// with a native (Liquid Glass) back button. Progress lives in reader Settings.
function PhoneNavigator({ theme }) {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.BIBLE}
      screenOptions={{
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name={ROUTES.BIBLE} component={BibleReaderScreen} options={{ headerShown: false }} />
      <Stack.Screen name={ROUTES.FLASHCARDS} component={FlashcardScreen} options={{ title: 'Flashcards' }} />
      {/* Memorize shows its own large title, so the bar only carries the back button. */}
      <Stack.Screen name={ROUTES.MEMORIZE} component={MemoryScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}

// iPad: the system tab bar, which is Liquid Glass on iPadOS 26.
function NativeTabletNavigator({ theme }) {
  return (
    <NativeTab.Navigator
      initialRouteName={ROUTES.BIBLE}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarIcon: ({ focused }) => {
          const [active, inactive] = SF_TAB_ICONS[route.name];
          return { type: 'sfSymbol', name: focused ? active : inactive };
        },
      })}
    >
      <NativeTab.Screen name={ROUTES.BIBLE} component={BibleReaderScreen} />
      <NativeTab.Screen name={ROUTES.FLASHCARDS} component={FlashcardScreen} />
      <NativeTab.Screen name={ROUTES.MEMORIZE} component={MemoryScreen} />
      <NativeTab.Screen name={ROUTES.PROGRESS} component={ProgressScreen} />
    </NativeTab.Navigator>
  );
}

// Android tablets: JS tab bar (native tab icons are SF Symbols, iOS only).
function TabletNavigator({ theme }) {
  return (
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
  );
}

const Navigator = !IS_TABLET
  ? PhoneNavigator
  : Platform.OS === 'ios'
    ? NativeTabletNavigator
    : TabletNavigator;

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
      <Navigator theme={theme} />
    </NavigationContainer>
  );
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';

import BibleReaderScreen from '../screens/BibleReaderScreen';
import FlashcardScreen from '../screens/FlashcardScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Reader"
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
          // Keep screens mounted for instant navigation
          detachInactiveScreens: false,
          // Disable animations for instant switching
          animationEnabled: false,
        }}
      >
        <Stack.Screen
          name="Reader"
          component={BibleReaderScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Flashcards"
          component={FlashcardScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

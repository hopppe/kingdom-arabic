import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { InteractionManager } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSession } from '../context/SessionContext';

import BibleReaderScreen from '../screens/BibleReaderScreen';
import FlashcardScreen from '../screens/FlashcardScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { theme } = useTheme();
  const { session, loading, setLastScreen } = useSession();
  const navigationRef = useRef();

  // Wait for session to load before rendering navigator
  if (loading) {
    return null;
  }

  // Handle navigation state changes - defer session save to not block navigation
  const handleStateChange = () => {
    const currentRoute = navigationRef.current?.getCurrentRoute();
    if (currentRoute) {
      // Defer session save until after navigation animations complete
      InteractionManager.runAfterInteractions(() => {
        setLastScreen(currentRoute.name);
      });
    }
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={handleStateChange}
    >
      <Stack.Navigator
        initialRouteName={session.lastScreen}
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
          // Fast animation for smooth but quick navigation
          animationEnabled: true,
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 150, // Fast 150ms transition
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 150,
              },
            },
          },
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
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

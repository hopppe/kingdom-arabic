import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFlashcards } from '../context/FlashcardContext';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { flashcards, resetToInitialCards } = useFlashcards();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: 40,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 50,
    },
    buttonContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 20,
      paddingHorizontal: 30,
      borderRadius: 12,
      marginVertical: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
    badge: {
      fontSize: 14,
      color: '#fff',
      opacity: 0.9,
      marginTop: 4,
    },
    resetButton: {
      backgroundColor: theme.colors.textSecondary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginTop: 20,
      alignItems: 'center',
    },
    resetButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '500',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Learn Arabic</Text>
      <Text style={styles.subtitle}>Read the Bible in Arabic</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Reader')}
        >
          <Text style={styles.buttonText}>Bible</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Flashcards')}
        >
          <Text style={styles.buttonText}>Flashcards</Text>
          <Text style={styles.badge}>{flashcards.length} words saved</Text>
        </TouchableOpacity>

        {flashcards.length === 0 && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetToInitialCards}
          >
            <Text style={styles.resetButtonText}>Load Sample Cards</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

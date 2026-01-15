import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export const HelpModal = ({ visible, onClose }) => {
  const { theme } = useTheme();

  const helpSections = [
    {
      icon: 'hand-left-outline',
      title: 'Gestures',
      items: [
        'Tap a word → see translation',
        'Tap verse number → play audio',
        'Press and hold verse number → bookmark',
      ],
    },
    {
      icon: 'albums-outline',
      title: 'Flashcards',
      items: [
        'Add saved words to flashcards',
        'Rate how hard words are for spaced repetition',
      ],
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose} />
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              How to Use This App
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
                {helpSections.map((section, index) => (
                  <View key={index} style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons
                        name={section.icon}
                        size={20}
                        color={theme.colors.primary}
                      />
                      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        {section.title}
                      </Text>
                    </View>
                    {section.items.map((item, itemIndex) => (
                      <View key={itemIndex} style={styles.itemRow}>
                        <Text style={[styles.bullet, { color: theme.colors.textSecondary }]}>•</Text>
                        <Text style={[styles.itemText, { color: theme.colors.textSecondary }]}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>

          <TouchableOpacity
            style={[styles.gotItButton, { backgroundColor: theme.colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.gotItButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    maxWidth: 360,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    paddingLeft: 28,
    marginBottom: 4,
  },
  bullet: {
    fontSize: 14,
    marginRight: 8,
  },
  itemText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  gotItButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  gotItButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

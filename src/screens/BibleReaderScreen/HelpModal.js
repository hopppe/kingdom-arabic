import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { IS_TABLET } from '../../navigation/device';

export const HelpModal = ({ visible, onClose }) => {
  const { theme } = useTheme();

  const helpSections = [
    {
      icon: 'hand-left-outline',
      title: 'Gestures',
      items: [
        'Tap a word → translation',
        'Settings → Word-by-word → meanings under every word',
        'Hold a word → word study',
        'Tap a verse number → listen',
        'Hold a verse number → bookmark or memorize',
        'Swipe left / right → next / previous chapter',
        'Saved words button (bottom left) → words you tapped',
      ],
    },
    {
      icon: 'albums-outline',
      title: 'Flashcards',
      items: [
        'Add the words you tapped as cards',
        'Harder cards come back sooner',
      ],
    },
    {
      icon: 'bulb-outline',
      title: 'Memorize',
      items: [
        'Hold a verse number → Memorize',
        'Practice in short steps, then recall it',
        'Reviews are scheduled for you',
      ],
    },
    {
      icon: 'stats-chart-outline',
      title: 'Stats & backup',
      items: [
        IS_TABLET ? 'Stats tab → streak and activity' : 'Settings → Stats → streak and activity',
        'Settings → Your data → back up or restore',
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
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose} />
        <View style={[styles.content, { backgroundColor: theme.colors.surfaceElevated }]}>
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
            <Text style={[styles.gotItButtonText, { color: theme.colors.textOnPrimary }]}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
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
  // Large but still a card: the dimmed backdrop stays visible around it.
  content: {
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 24,
    maxWidth: 480,
    width: '92%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flexShrink: 1,
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
    fontSize: 17,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    paddingLeft: 28,
    marginBottom: 5,
  },
  bullet: {
    fontSize: 15,
    marginRight: 8,
  },
  itemText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  gotItButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  gotItButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Dropdown } from './Dropdown';

export const QuickSettingsModal = ({
  visible,
  onClose,
  currentCard,
  onRemoveCard,
  onResetProgress,
  onResetDeck,
  onUpdateEnglish,
  onCreateGroup,
  onAddToGroup,
  onRemoveFromGroup,
  availableGroups,
  selectedGroup,
  settingsLoading,
  showEnglishFirst,
  onToggleFlip,
  showVerseOnFront,
  onToggleVerseOnFront,
}) => {
  const { theme } = useTheme();
  const [showEditEnglish, setShowEditEnglish] = useState(false);
  const [editedEnglish, setEditedEnglish] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  // Reset edit state when modal closes or card changes
  useEffect(() => {
    if (!visible) {
      setShowEditEnglish(false);
      setEditedEnglish('');
      setShowCreateGroup(false);
      setNewGroupName('');
    }
  }, [visible]);

  // Initialize edited text when opening edit mode
  const handleOpenEditEnglish = () => {
    setEditedEnglish(currentCard?.english || '');
    setShowEditEnglish(true);
  };

  const handleSaveEnglish = () => {
    if (editedEnglish.trim() && onUpdateEnglish) {
      onUpdateEnglish(editedEnglish.trim());
    }
    setShowEditEnglish(false);
  };

  const handleCancelEdit = () => {
    setShowEditEnglish(false);
    setEditedEnglish('');
  };

  const handleOpenCreateGroup = () => {
    setNewGroupName('');
    setShowCreateGroup(true);
  };

  const handleSaveGroup = () => {
    if (newGroupName.trim() && onCreateGroup) {
      const success = onCreateGroup(newGroupName.trim());
      if (success) {
        setShowCreateGroup(false);
        setNewGroupName('');
      }
    }
  };

  const handleCancelCreateGroup = () => {
    setShowCreateGroup(false);
    setNewGroupName('');
  };

  const handleAddToGroup = (groupName) => {
    if (onAddToGroup) {
      onAddToGroup(groupName);
    }
  };

  const handleRemoveFromGroup = (groupName) => {
    if (onRemoveFromGroup) {
      onRemoveFromGroup(groupName);
    }
  };

  const modalStyles = {
    modalContent: {
      backgroundColor: theme.colors.cardBackground || theme.colors.surface || '#fff',
      borderRadius: 20,
      padding: 24,
      marginHorizontal: 24,
      maxWidth: 400,
      width: '90%',
    },
  };


  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={modalStyles.modalContent}>
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={true}
                >
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                      Settings
                    </Text>
                  </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.text }]}
              onPress={onToggleFlip}
            >
              <Ionicons name="swap-horizontal" size={20} color={theme.colors.background} />
              <Text style={[styles.modalButtonText, { color: theme.colors.background }]}>
                {showEnglishFirst ? 'Show Arabic First' : 'Show English First'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: showVerseOnFront ? theme.colors.text : theme.colors.textSecondary, marginTop: 10 }]}
              onPress={onToggleVerseOnFront}
            >
              <Ionicons name={showVerseOnFront ? 'eye' : 'eye-off'} size={20} color={theme.colors.background} />
              <Text style={[styles.modalButtonText, { color: theme.colors.background }]}>
                {showVerseOnFront ? 'Hide Verse on Front' : 'Show Verse on Front'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.primary, marginTop: 10 }]}
              onPress={handleOpenCreateGroup}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                Create Group
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#FF9500', marginTop: 10 }]}
              onPress={onResetDeck}
              disabled={settingsLoading}
            >
              <Ionicons name="refresh-circle-outline" size={20} color="#fff" />
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                Reset Deck ({selectedGroup})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Flashcard Section */}
          {currentCard && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                Current Flashcard
              </Text>

              <Text style={[styles.cardWord, { color: theme.colors.text }]}>
                {currentCard?.arabic}
              </Text>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary, marginBottom: 10 }]}
                onPress={handleOpenEditEnglish}
                disabled={settingsLoading}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  Update English Side
                </Text>
              </TouchableOpacity>

              {availableGroups && availableGroups.length > 0 && (
                <View style={styles.addToGroupContainer}>
                  <Text style={[styles.addToGroupLabel, { color: theme.colors.textSecondary }]}>
                    Add to Group:
                  </Text>
                  <Dropdown
                    items={availableGroups.filter(group => !currentCard?.groups?.includes(group))}
                    selectedValue={null}
                    onSelect={handleAddToGroup}
                    placeholder="Select Group"
                    maxHeight={150}
                    style={styles.dropdownContainer}
                    buttonStyle={styles.addToGroupDropdown}
                    dropdownStyle={{
                      backgroundColor: theme.colors.cardBackground || '#fff',
                      zIndex: 9999,
                    }}
                  />
                </View>
              )}

              {/* Display current groups */}
              {currentCard.groups && currentCard.groups.length > 0 && (
                <View style={[styles.groupsList, { backgroundColor: theme.colors.surface || 'rgba(0, 0, 0, 0.05)' }]}>
                  <Text style={[styles.groupsListTitle, { color: theme.colors.textSecondary }]}>
                    In Groups:
                  </Text>
                  {currentCard.groups.map((group, index) => (
                    <View key={index} style={styles.groupChip}>
                      <Text style={[styles.groupChipText, { color: theme.colors.text }]}>{group}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveFromGroup(group)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.removeButton}
                      >
                        <Ionicons name="close-circle" size={20} color={theme.colors.error || '#FF3B30'} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: '#FF3B30' }]}
                  onPress={onRemoveCard}
                  disabled={settingsLoading}
                >
                  <Ionicons name="trash" size={16} color="white" />
                  <Text style={[styles.smallButtonText, { color: 'white' }]}>
                    {settingsLoading ? 'Removing...' : 'Remove'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: theme.colors.text }]}
                  onPress={onResetProgress}
                  disabled={settingsLoading}
                >
                  <Ionicons name="refresh" size={16} color={theme.colors.background} />
                  <Text style={[styles.smallButtonText, { color: theme.colors.background }]}>
                    {settingsLoading ? 'Resetting...' : 'Reset'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Edit English Popup */}
          {showEditEnglish && (
            <View style={[styles.editPopup, { backgroundColor: theme.colors.surface || 'rgba(0, 0, 0, 0.05)' }]}>
              <Text style={[styles.editPopupTitle, { color: theme.colors.text }]}>
                Edit English Translation
              </Text>
              <TextInput
                style={[styles.editInput, {
                  color: theme.colors.text,
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.cardBackground || '#fff',
                }]}
                value={editedEnglish}
                onChangeText={setEditedEnglish}
                placeholder="Enter new translation"
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus={true}
                selectTextOnFocus={true}
              />
              <View style={styles.editPopupActions}>
                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: theme.colors.textSecondary }]}
                  onPress={handleCancelEdit}
                >
                  <Text style={[styles.smallButtonText, { color: '#fff' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSaveEnglish}
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={[styles.smallButtonText, { color: '#fff' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Create Group Popup */}
          {showCreateGroup && (
            <View style={[styles.editPopup, { backgroundColor: theme.colors.surface || 'rgba(0, 0, 0, 0.05)' }]}>
              <Text style={[styles.editPopupTitle, { color: theme.colors.text }]}>
                Create New Group
              </Text>
              <TextInput
                style={[styles.editInput, {
                  color: theme.colors.text,
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.cardBackground || '#fff',
                }]}
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="Enter group name"
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus={true}
                selectTextOnFocus={true}
              />
              <View style={styles.editPopupActions}>
                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: theme.colors.textSecondary }]}
                  onPress={handleCancelCreateGroup}
                >
                  <Text style={[styles.smallButtonText, { color: '#fff' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSaveGroup}
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={[styles.smallButtonText, { color: '#fff' }]}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
              Close
            </Text>
          </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollView: {
    maxHeight: screenHeight * 0.8,
  },
  scrollContent: {
    flexGrow: 1,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  cardWord: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  smallButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  smallButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 4,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  editPopup: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  editPopupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  editInput: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  editPopupActions: {
    flexDirection: 'row',
    gap: 10,
  },
  groupsList: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  groupsListTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  groupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 6,
  },
  groupChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  addToGroupContainer: {
    marginBottom: 10,
    zIndex: 1000,
  },
  addToGroupLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  dropdownContainer: {
    zIndex: 9999,
    elevation: 9999,
  },
  addToGroupDropdown: {
    width: '100%',
  },
});

import React, { useState, useEffect, useRef } from 'react';
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
  onOpenFlashcardList,
  availableGroups,
  selectedGroup,
  settingsLoading,
  showEnglishFirst,
  onToggleFlip,
  showVerseOnFront,
  onToggleVerseOnFront,
}) => {
  const { theme } = useTheme();
  const scrollViewRef = useRef(null);
  const [editedEnglish, setEditedEnglish] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [activeAction, setActiveAction] = useState(null); // 'english', 'group', 'remove', 'reset', or null
  const [showCreateGroupOnly, setShowCreateGroupOnly] = useState(false); // For general Create Group button

  // Reset edit state when modal closes or card changes
  useEffect(() => {
    if (!visible) {
      setActiveAction(null);
      setEditedEnglish('');
      setNewGroupName('');
      setShowCreateGroupOnly(false);
    }
  }, [visible]);

  // Auto-scroll to show edit popups when they appear
  useEffect(() => {
    if (activeAction || showCreateGroupOnly) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeAction, showCreateGroupOnly]);

  // Initialize edited text when opening edit mode
  const handleOpenEditEnglish = () => {
    setEditedEnglish(currentCard?.english || '');
    setActiveAction('english');
  };

  const handleSaveEnglish = () => {
    if (editedEnglish.trim() && onUpdateEnglish) {
      onUpdateEnglish(editedEnglish.trim());
    }
    setActiveAction(null);
  };

  const handleCancelAction = () => {
    setActiveAction(null);
    setEditedEnglish('');
    setNewGroupName('');
  };

  const handleOpenGroup = () => {
    setNewGroupName('');
    setActiveAction('group');
  };

  const handleSaveGroup = () => {
    if (newGroupName.trim() && onCreateGroup) {
      const success = onCreateGroup(newGroupName.trim());
      if (success) {
        setActiveAction(null);
        setNewGroupName('');
      }
    }
  };

  const handleOpenRemove = () => {
    setActiveAction('remove');
  };

  const handleOpenReset = () => {
    setActiveAction('reset');
  };

  const handleOpenCreateGroupOnly = () => {
    setNewGroupName('');
    setShowCreateGroupOnly(true);
  };

  const handleSaveGroupOnly = () => {
    if (newGroupName.trim() && onCreateGroup) {
      const success = onCreateGroup(newGroupName.trim());
      if (success) {
        setShowCreateGroupOnly(false);
        setNewGroupName('');
      }
    }
  };

  const handleCancelCreateGroupOnly = () => {
    setShowCreateGroupOnly(false);
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
                  ref={scrollViewRef}
                  style={styles.scrollView}
                  contentContainerStyle={[
                    styles.scrollContent,
                    (activeAction || showCreateGroupOnly) && { paddingBottom: 100 }
                  ]}
                  showsVerticalScrollIndicator={true}
                >
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                      Settings
                    </Text>
                  </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.compactButton, { borderColor: theme.colors.border }]}
              onPress={() => {
                onClose();
                setTimeout(() => {
                  if (onOpenFlashcardList) onOpenFlashcardList();
                }, 300);
              }}
            >
              <Ionicons name="list-outline" size={18} color={theme.colors.text} />
              <Text style={[styles.compactButtonText, { color: theme.colors.text }]}>
                View All Cards
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compactButton, { borderColor: theme.colors.border, marginTop: 8 }]}
              onPress={onToggleFlip}
            >
              <Ionicons name="swap-horizontal-outline" size={18} color={theme.colors.text} />
              <Text style={[styles.compactButtonText, { color: theme.colors.text }]}>
                {showEnglishFirst ? 'Show Arabic First' : 'Show English First'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compactButton, { borderColor: theme.colors.border, marginTop: 8 }]}
              onPress={onToggleVerseOnFront}
            >
              <Ionicons name={showVerseOnFront ? 'eye-outline' : 'eye-off-outline'} size={18} color={theme.colors.text} />
              <Text style={[styles.compactButtonText, { color: theme.colors.text }]}>
                {showVerseOnFront ? 'Hide Verse on Front' : 'Show Verse on Front'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compactButton, { borderColor: theme.colors.border, marginTop: 8 }]}
              onPress={handleOpenCreateGroupOnly}
            >
              <Ionicons name="add-circle-outline" size={18} color={theme.colors.text} />
              <Text style={[styles.compactButtonText, { color: theme.colors.text }]}>
                Create Group
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compactButton, { borderColor: '#FF9500', backgroundColor: 'rgba(255, 149, 0, 0.05)', marginTop: 8 }]}
              onPress={onResetDeck}
              disabled={settingsLoading}
            >
              <Ionicons name="refresh-circle-outline" size={18} color="#FF9500" />
              <Text style={[styles.compactButtonText, { color: '#FF9500' }]}>
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

              {/* 2x2 Button Grid or Active Action Panel */}
              {!activeAction ? (
                <View style={styles.buttonGrid}>
                  <TouchableOpacity
                    style={[styles.gridButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleOpenEditEnglish}
                    disabled={settingsLoading}
                  >
                    <Ionicons name="create-outline" size={20} color="#fff" />
                    <Text style={styles.gridButtonText}>Update English</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.gridButton, { backgroundColor: '#5856D6' }]}
                    onPress={handleOpenGroup}
                    disabled={settingsLoading}
                  >
                    <Ionicons name="folder-outline" size={20} color="#fff" />
                    <Text style={styles.gridButtonText}>Group</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.gridButton, { backgroundColor: '#FF3B30' }]}
                    onPress={handleOpenRemove}
                    disabled={settingsLoading}
                  >
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                    <Text style={styles.gridButtonText}>Remove</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.gridButton, { backgroundColor: '#FF9500' }]}
                    onPress={handleOpenReset}
                    disabled={settingsLoading}
                  >
                    <Ionicons name="refresh-outline" size={20} color="#fff" />
                    <Text style={styles.gridButtonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.actionPanel, { backgroundColor: theme.colors.surface || 'rgba(0, 0, 0, 0.05)' }]}>
                  {/* Edit English Panel */}
                  {activeAction === 'english' && (
                    <>
                      <Text style={[styles.actionPanelTitle, { color: theme.colors.text }]}>
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
                      <View style={styles.actionPanelButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: theme.colors.textSecondary }]}
                          onPress={handleCancelAction}
                        >
                          <Text style={styles.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                          onPress={handleSaveEnglish}
                        >
                          <Ionicons name="checkmark" size={16} color="#fff" />
                          <Text style={styles.actionButtonText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {/* Group Panel */}
                  {activeAction === 'group' && (
                    <>
                      <Text style={[styles.actionPanelTitle, { color: theme.colors.text }]}>
                        Manage Groups
                      </Text>

                      {/* Display current groups */}
                      {currentCard.groups && currentCard.groups.length > 0 && (
                        <View style={styles.addToGroupSection}>
                          <Text style={[styles.addToGroupLabel, { color: theme.colors.textSecondary }]}>
                            In groups:
                          </Text>
                          <View style={styles.groupChipsRow}>
                            {currentCard.groups.map((group, index) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.groupChipInline}
                                onPress={() => handleRemoveFromGroup(group)}
                              >
                                <Text style={[styles.groupChipText, { color: theme.colors.text }]}>{group}</Text>
                                <Ionicons name="close" size={14} color={theme.colors.textSecondary} />
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}

                      {availableGroups && availableGroups.filter(group => !currentCard?.groups?.includes(group)).length > 0 && (
                        <View style={styles.addToGroupSection}>
                          <Text style={[styles.addToGroupLabel, { color: theme.colors.textSecondary }]}>
                            Add to existing group:
                          </Text>
                          <Dropdown
                            items={availableGroups.filter(group => !currentCard?.groups?.includes(group))}
                            selectedValue={null}
                            onSelect={(groupName) => {
                              handleAddToGroup(groupName);
                              setActiveAction(null);
                            }}
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
                      <Text style={[styles.orText, { color: theme.colors.textSecondary }]}>
                        Or create a new group:
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
                      />
                      <View style={styles.actionPanelButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: theme.colors.textSecondary }]}
                          onPress={handleCancelAction}
                        >
                          <Text style={styles.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: '#5856D6' }]}
                          onPress={handleSaveGroup}
                          disabled={!newGroupName.trim()}
                        >
                          <Ionicons name="add" size={16} color="#fff" />
                          <Text style={styles.actionButtonText}>Create</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {/* Remove Panel */}
                  {activeAction === 'remove' && (
                    <>
                      <Text style={[styles.actionPanelTitle, { color: theme.colors.text }]}>
                        Remove Flashcard
                      </Text>
                      <Text style={[styles.confirmText, { color: theme.colors.textSecondary }]}>
                        Are you sure you want to remove this flashcard?
                      </Text>
                      <View style={styles.actionPanelButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: theme.colors.textSecondary }]}
                          onPress={handleCancelAction}
                        >
                          <Text style={styles.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
                          onPress={() => {
                            onRemoveCard();
                            setActiveAction(null);
                          }}
                        >
                          <Ionicons name="trash" size={16} color="#fff" />
                          <Text style={styles.actionButtonText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {/* Reset Panel */}
                  {activeAction === 'reset' && (
                    <>
                      <Text style={[styles.actionPanelTitle, { color: theme.colors.text }]}>
                        Reset Progress
                      </Text>
                      <Text style={[styles.confirmText, { color: theme.colors.textSecondary }]}>
                        Reset this card's progress to start fresh?
                      </Text>
                      <View style={styles.actionPanelButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: theme.colors.textSecondary }]}
                          onPress={handleCancelAction}
                        >
                          <Text style={styles.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: '#FF9500' }]}
                          onPress={() => {
                            onResetProgress();
                            setActiveAction(null);
                          }}
                        >
                          <Ionicons name="refresh" size={16} color="#fff" />
                          <Text style={styles.actionButtonText}>Reset</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Create Group Only Popup (for general Create Group button) */}
          {showCreateGroupOnly && (
            <View style={[styles.actionPanel, { backgroundColor: theme.colors.surface || 'rgba(0, 0, 0, 0.05)' }]}>
              <Text style={[styles.actionPanelTitle, { color: theme.colors.text }]}>
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
              />
              <View style={styles.actionPanelButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.textSecondary }]}
                  onPress={handleCancelCreateGroupOnly}
                >
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSaveGroupOnly}
                  disabled={!newGroupName.trim()}
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Create</Text>
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
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  compactButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridButton: {
    width: '47%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  gridButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  actionPanel: {
    borderRadius: 12,
    padding: 16,
  },
  actionPanelTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  actionPanelButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  confirmText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  addToGroupSection: {
    marginBottom: 12,
  },
  groupChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  groupChipInline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    gap: 6,
  },
  orText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
});

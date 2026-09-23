import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Dropdown } from './Dropdown';
import { createStyles } from './QuickSettingsModal.styles';

export const QuickSettingsModal = ({
  visible,
  onClose,
  currentCard,
  onRemoveCard,
  onResetProgress,
  onResetDeck,
  onDeleteGroup,
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
  const styles = useMemo(() => createStyles(theme), [theme]);
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
        <TouchableWithoutFeedback accessible={false} onPress={onClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback accessible={false} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <ScrollView
                  ref={scrollViewRef}
                  keyboardShouldPersistTaps="handled"
                  style={styles.scrollView}
                  contentContainerStyle={[
                    styles.scrollContent,
                    (activeAction || showCreateGroupOnly) && { paddingBottom: 100 }
                  ]}
                  showsVerticalScrollIndicator={true}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      Settings
                    </Text>
                  </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.compactButton}
              onPress={() => {
                onClose();
                setTimeout(() => {
                  if (onOpenFlashcardList) onOpenFlashcardList();
                }, 300);
              }}
            >
              <Ionicons name="list-outline" size={18} color={theme.colors.text} />
              <Text style={styles.compactButtonText}>
                View All Cards
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compactButton, { marginTop: 8 }]}
              onPress={onToggleFlip}
            >
              <Ionicons name="swap-horizontal-outline" size={18} color={theme.colors.text} />
              <Text style={styles.compactButtonText}>
                {showEnglishFirst ? 'Show Arabic First' : 'Show English First'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compactButton, { marginTop: 8 }]}
              onPress={onToggleVerseOnFront}
            >
              <Ionicons name={showVerseOnFront ? 'eye-outline' : 'eye-off-outline'} size={18} color={theme.colors.text} />
              <Text style={styles.compactButtonText}>
                {showVerseOnFront ? 'Hide Verse on Front' : 'Show Verse on Front'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compactButton, { marginTop: 8 }]}
              onPress={handleOpenCreateGroupOnly}
            >
              <Ionicons name="add-circle-outline" size={18} color={theme.colors.text} />
              <Text style={styles.compactButtonText}>
                Create Group
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compactButton, styles.resetDeckButton]}
              onPress={onResetDeck}
              disabled={settingsLoading}
            >
              <Ionicons name="refresh-circle-outline" size={18} color={theme.colors.warning} />
              <Text style={[styles.compactButtonText, styles.resetDeckButtonText]}>
                Reset Deck ({selectedGroup})
              </Text>
            </TouchableOpacity>

            {selectedGroup && selectedGroup !== 'All Cards' && (
              <TouchableOpacity
                style={[styles.compactButton, { marginTop: 8 }]}
                onPress={onDeleteGroup}
                disabled={settingsLoading}
                accessibilityRole="button"
              >
                <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                <Text style={[styles.compactButtonText, { color: theme.colors.error }]}>
                  Delete Group ({selectedGroup})
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Flashcard Section */}
          {currentCard && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Current Flashcard
              </Text>

              <Text style={styles.cardWord}>
                {currentCard?.arabic}
              </Text>

              {/* 2x2 Button Grid or Active Action Panel */}
              {!activeAction ? (
                <View style={styles.buttonGrid}>
                  <TouchableOpacity
                    style={[styles.gridButton, styles.gridButtonEnglish]}
                    onPress={handleOpenEditEnglish}
                    disabled={settingsLoading}
                  >
                    <Ionicons name="create-outline" size={20} color={theme.colors.white} />
                    <Text style={styles.gridButtonText}>Update English</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.gridButton, styles.gridButtonGroup]}
                    onPress={handleOpenGroup}
                    disabled={settingsLoading}
                  >
                    <Ionicons name="folder-outline" size={20} color={theme.colors.white} />
                    <Text style={styles.gridButtonText}>Group</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.gridButton, styles.gridButtonRemove]}
                    onPress={handleOpenRemove}
                    disabled={settingsLoading}
                  >
                    <Ionicons name="trash-outline" size={20} color={theme.colors.white} />
                    <Text style={styles.gridButtonText}>Remove</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.gridButton, styles.gridButtonReset]}
                    onPress={handleOpenReset}
                    disabled={settingsLoading}
                  >
                    <Ionicons name="refresh-outline" size={20} color={theme.colors.white} />
                    <Text style={styles.gridButtonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.actionPanel}>
                  {/* Edit English Panel */}
                  {activeAction === 'english' && (
                    <>
                      <Text style={styles.actionPanelTitle}>
                        Edit English Translation
                      </Text>
                      <TextInput
                        style={styles.editInput}
                        value={editedEnglish}
                        onChangeText={setEditedEnglish}
                        placeholder="Enter new translation"
                        placeholderTextColor={theme.colors.textSecondary}
                        autoFocus={true}
                        selectTextOnFocus={true}
                      />
                      <View style={styles.actionPanelButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.actionButtonCancel]}
                          onPress={handleCancelAction}
                        >
                          <Text style={styles.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.actionButtonPrimary]}
                          onPress={handleSaveEnglish}
                        >
                          <Ionicons name="checkmark" size={16} color={theme.colors.white} />
                          <Text style={styles.actionButtonText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {/* Group Panel */}
                  {activeAction === 'group' && (
                    <>
                      <Text style={styles.actionPanelTitle}>
                        Manage Groups
                      </Text>

                      {/* Display current groups */}
                      {currentCard.groups && currentCard.groups.length > 0 && (
                        <View style={styles.addToGroupSection}>
                          <Text style={styles.addToGroupLabel}>
                            In groups:
                          </Text>
                          <View style={styles.groupChipsRow}>
                            {currentCard.groups.map((group, index) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.groupChipInline}
                                onPress={() => handleRemoveFromGroup(group)}
                              >
                                <Text style={styles.groupChipText}>{group}</Text>
                                <Ionicons name="close" size={14} color={theme.colors.textSecondary} />
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}

                      {availableGroups && availableGroups.filter(group => !currentCard?.groups?.includes(group)).length > 0 && (
                        <View style={styles.addToGroupSection}>
                          <Text style={styles.addToGroupLabel}>
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
                          />
                        </View>
                      )}
                      <Text style={styles.orText}>
                        Or create a new group:
                      </Text>
                      <TextInput
                        style={styles.editInput}
                        value={newGroupName}
                        onChangeText={setNewGroupName}
                        placeholder="Enter group name"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                      <View style={styles.actionPanelButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.actionButtonCancel]}
                          onPress={handleCancelAction}
                        >
                          <Text style={styles.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.actionButtonGroup]}
                          onPress={handleSaveGroup}
                          disabled={!newGroupName.trim()}
                        >
                          <Ionicons name="add" size={16} color={theme.colors.white} />
                          <Text style={styles.actionButtonText}>Create</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {/* Remove Panel */}
                  {activeAction === 'remove' && (
                    <>
                      <Text style={styles.actionPanelTitle}>
                        Remove Flashcard
                      </Text>
                      <Text style={styles.confirmText}>
                        Are you sure you want to remove this flashcard?
                      </Text>
                      <View style={styles.actionPanelButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.actionButtonCancel]}
                          onPress={handleCancelAction}
                        >
                          <Text style={styles.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.actionButtonRemove]}
                          onPress={() => {
                            onRemoveCard();
                            setActiveAction(null);
                          }}
                        >
                          <Ionicons name="trash" size={16} color={theme.colors.white} />
                          <Text style={styles.actionButtonText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {/* Reset Panel */}
                  {activeAction === 'reset' && (
                    <>
                      <Text style={styles.actionPanelTitle}>
                        Reset Progress
                      </Text>
                      <Text style={styles.confirmText}>
                        Reset this card's progress to start fresh?
                      </Text>
                      <View style={styles.actionPanelButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.actionButtonCancel]}
                          onPress={handleCancelAction}
                        >
                          <Text style={styles.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.actionButtonReset]}
                          onPress={() => {
                            onResetProgress();
                            setActiveAction(null);
                          }}
                        >
                          <Ionicons name="refresh" size={16} color={theme.colors.white} />
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
            <View style={styles.actionPanel}>
              <Text style={styles.actionPanelTitle}>
                Create New Group
              </Text>
              <TextInput
                style={styles.editInput}
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="Enter group name"
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus={true}
              />
              <View style={styles.actionPanelButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonCancel]}
                  onPress={handleCancelCreateGroupOnly}
                >
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  onPress={handleSaveGroupOnly}
                  disabled={!newGroupName.trim()}
                >
                  <Ionicons name="checkmark" size={16} color={theme.colors.white} />
                  <Text style={styles.actionButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>
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

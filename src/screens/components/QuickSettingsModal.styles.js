import { StyleSheet, Dimensions } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

export const createStyles = (theme) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    maxWidth: 400,
    width: '90%',
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
    color: theme.colors.text,
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
    color: theme.colors.textSecondary,
  },
  cardWord: {
    ...theme.arabic.small,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    color: theme.colors.text,
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
    borderColor: theme.colors.border,
    marginTop: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
    color: theme.colors.text,
  },
  editInput: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: theme.colors.text,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.cardBackground,
  },
  addToGroupLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    color: theme.colors.textSecondary,
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
    borderColor: theme.colors.border,
  },
  compactButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  resetDeckButton: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.surface,
    marginTop: 8,
  },
  resetDeckButtonText: {
    color: theme.colors.warning,
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
    color: theme.colors.white,
    textAlign: 'center',
  },
  gridButtonEnglish: {
    backgroundColor: theme.colors.primary,
  },
  gridButtonGroup: {
    backgroundColor: theme.colors.purple,
  },
  gridButtonRemove: {
    backgroundColor: theme.colors.error,
  },
  gridButtonReset: {
    backgroundColor: theme.colors.warning,
  },
  actionPanel: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: theme.colors.surface,
  },
  actionPanelTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: theme.colors.text,
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
    color: theme.colors.white,
  },
  actionButtonCancel: {
    backgroundColor: theme.colors.textSecondary,
  },
  actionButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  actionButtonGroup: {
    backgroundColor: theme.colors.purple,
  },
  actionButtonRemove: {
    backgroundColor: theme.colors.error,
  },
  actionButtonReset: {
    backgroundColor: theme.colors.warning,
  },
  confirmText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    color: theme.colors.textSecondary,
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
    backgroundColor: theme.colors.activeBackground,
    gap: 6,
  },
  groupChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  orText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 4,
    color: theme.colors.textSecondary,
  },
});

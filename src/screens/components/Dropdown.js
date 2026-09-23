import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export const Dropdown = ({
  items = [],
  selectedValue,
  onSelect,
  placeholder = 'Select',
  maxHeight = 200,
  style,
  buttonStyle,
  dropdownStyle,
  itemStyle,
  textStyle,
  renderItem,
  icon,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isOpen, setIsOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState(null);
  const buttonRef = useRef(null);

  const toggleDropdown = () => {
    if (!isOpen) {
      // Measure button position before opening
      buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
        setButtonLayout({ x: pageX, y: pageY, width, height });
        setIsOpen(true);
      });
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (item) => {
    onSelect(item);
    setIsOpen(false);
  };

  const selectedItem = items.find(item =>
    typeof item === 'string' ? item === selectedValue : item.value === selectedValue
  );
  const displayText = selectedItem
    ? (typeof selectedItem === 'string' ? selectedItem : selectedItem.label)
    : placeholder;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        ref={buttonRef}
        style={[
          styles.button,
          isOpen && styles.buttonOpen,
          buttonStyle,
        ]}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        {icon && (
          <Ionicons name={icon} size={18} color={theme.colors.text} style={styles.icon} />
        )}
        <Text
          style={[styles.buttonText, textStyle]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={theme.colors.text}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdown,
                  {
                    top: buttonLayout ? buttonLayout.y + buttonLayout.height + 4 : 0,
                    left: buttonLayout ? buttonLayout.x : 0,
                    width: buttonLayout ? buttonLayout.width : 200,
                  },
                  dropdownStyle,
                ]}
              >
                <ScrollView
                  style={[styles.scrollView, { maxHeight }]}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  {items.map((item, index) => {
                    const value = typeof item === 'string' ? item : item.value;
                    const label = typeof item === 'string' ? item : item.label;
                    const isSelected = value === selectedValue;

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.item,
                          isSelected && styles.itemSelected,
                          itemStyle,
                        ]}
                        onPress={() => handleSelect(value)}
                        activeOpacity={0.7}
                      >
                        {renderItem ? (
                          renderItem(item, isSelected)
                        ) : (
                          <>
                            <Text
                              style={[styles.itemText, textStyle]}
                              numberOfLines={1}
                            >
                              {label}
                            </Text>
                            {isSelected && (
                              <Ionicons name="checkmark" size={20} color={theme.colors.info} />
                            )}
                          </>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    minHeight: 44,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  buttonOpen: {
    borderColor: theme.colors.info,
    borderWidth: 2,
  },
  icon: {
    marginRight: 4,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    color: theme.colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
    overflow: 'hidden',
    backgroundColor: theme.colors.cardBackground,
    borderColor: theme.colors.border,
  },
  scrollView: {
    flexGrow: 0,
    backgroundColor: theme.colors.cardBackground,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.borderLight,
    minHeight: 44,
    backgroundColor: theme.colors.cardBackground,
  },
  itemSelected: {
    backgroundColor: theme.colors.selection,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    color: theme.colors.text,
  },
});

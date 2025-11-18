import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
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
  const [isOpen, setIsOpen] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
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

  const maxDropdownHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.min(maxHeight, items.length * 48)],
  });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
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
          style={[
            styles.buttonText,
            { color: theme.colors.text },
            textStyle,
          ]}
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

      {isOpen && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: '#FFFFFF',
              borderColor: theme.colors.border || '#DDDDDD',
            },
            dropdownStyle,
          ]}
        >
          <ScrollView
            style={[styles.scrollView, { backgroundColor: '#FFFFFF' }]}
            contentContainerStyle={{ backgroundColor: '#FFFFFF' }}
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
                    isSelected && { backgroundColor: theme.colors.primary + '20' },
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
                        style={[
                          styles.itemText,
                          { color: theme.colors.text },
                          textStyle,
                        ]}
                        numberOfLines={1}
                      >
                        {label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  buttonOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  icon: {
    marginRight: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
    zIndex: 10000,
  },
  scrollView: {
    flexGrow: 0,
    backgroundColor: '#FFFFFF',
  },
  item: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  itemText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

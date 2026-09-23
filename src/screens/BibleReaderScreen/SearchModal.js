import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPreviewText } from '../../utils/verseSearch';
import { searchVerses } from '../../data/bibleRepository';
import { useBibleDb } from '../../context/BibleDbContext';
import { useTheme } from '../../context/ThemeContext';

export const SearchModal = ({
  visible,
  onClose,
  onSelectResult,
}) => {
  const { theme } = useTheme();
  const localStyles = useMemo(() => createStyles(theme), [theme]);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const inputRef = useRef(null);
  const db = useBibleDb();
  const latestQueryRef = useRef('');

  // Focus input when modal opens
  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      setTotalCount(0);
    }
  }, [visible]);

  // Search on every keystroke; ignore results that arrive after a newer query.
  const handleSearch = useCallback(async (text) => {
    setQuery(text);
    latestQueryRef.current = text;
    try {
      const { results: searchResults, totalCount: count } = await searchVerses(db, text, 25);
      if (latestQueryRef.current !== text) return;
      setResults(searchResults);
      setTotalCount(count);
    } catch (error) {
      console.error('Verse search failed:', error);
    }
  }, [db]);

  const handleResultPress = useCallback((item) => {
    onSelectResult(item.book, item.chapter, item.verse);
    onClose();
  }, [onSelectResult, onClose]);

  const renderResult = useCallback(({ item }) => (
    <TouchableOpacity
      style={localStyles.resultItem}
      onPress={() => handleResultPress(item)}
      activeOpacity={0.7}
    >
      <Text style={localStyles.resultReference}>
        {item.bookName} {item.chapter}:{item.verse}
      </Text>
      <Text style={localStyles.resultPreview} numberOfLines={2}>
        {getPreviewText(item.en, query, 100)}
      </Text>
    </TouchableOpacity>
  ), [query, handleResultPress]);

  const keyExtractor = useCallback((item) =>
    `${item.book}-${item.chapter}-${item.verse}`,
  []);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={localStyles.keyboardView}
      >
        <TouchableWithoutFeedback accessible={false} onPress={onClose}>
          <View style={localStyles.overlay}>
            <TouchableWithoutFeedback accessible={false} onPress={(e) => e.stopPropagation()}>
              <View style={[localStyles.content, { paddingBottom: bottomInset }]}>
                {/* Header */}
                <View style={localStyles.header}>
                  <Text style={localStyles.title}>Search Bible</Text>
                  <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Search Input */}
                <View style={localStyles.searchContainer}>
                  <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={localStyles.searchIcon} />
                  <TextInput
                    ref={inputRef}
                    style={localStyles.searchInput}
                    placeholder="Search English text..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={query}
                    onChangeText={handleSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                  />
                  {query.length > 0 && (
                    <TouchableOpacity
                      onPress={() => handleSearch('')}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Hint text */}
                {query.length === 0 && (
                  <Text style={localStyles.hintText}>
                    Tip: Add a space after a word for exact match
                  </Text>
                )}

                {/* Results */}
                {query.length > 0 && (
                  <>
                    {results.length > 0 ? (
                      <>
                        <FlatList
                          data={results}
                          renderItem={renderResult}
                          keyExtractor={keyExtractor}
                          style={localStyles.resultsList}
                          keyboardShouldPersistTaps="handled"
                          showsVerticalScrollIndicator={false}
                        />
                        {totalCount > 25 && (
                          <View style={localStyles.moreContainer}>
                            <Text style={localStyles.moreText}>
                              ...and {totalCount - 25} more results
                            </Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <View style={localStyles.emptyContainer}>
                        <Text style={localStyles.emptyText}>No verses found</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (theme) => StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: theme.colors.surfaceElevated,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 0,
    width: '100%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  hintText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  resultsList: {
    flexGrow: 1,
    flexShrink: 1,
  },
  resultItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultReference: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.info,
    marginBottom: 4,
  },
  resultPreview: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  moreContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  moreText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});

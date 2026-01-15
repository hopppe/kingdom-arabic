import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { searchVerses, getPreviewText } from '../../utils/verseSearch';

export const SearchModal = ({
  visible,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const inputRef = useRef(null);

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

  // Search immediately on text change (data is pre-loaded)
  const handleSearch = useCallback((text) => {
    setQuery(text);
    const { results: searchResults, totalCount: count } = searchVerses(text, 25);
    setResults(searchResults);
    setTotalCount(count);
  }, []);

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
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={localStyles.overlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={localStyles.content}>
                {/* Header */}
                <View style={localStyles.header}>
                  <Text style={localStyles.title}>Search Bible</Text>
                  <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Search Input */}
                <View style={localStyles.searchContainer}>
                  <Ionicons name="search" size={20} color="#999" style={localStyles.searchIcon} />
                  <TextInput
                    ref={inputRef}
                    style={localStyles.searchInput}
                    placeholder="Search English text..."
                    placeholderTextColor="#999"
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
                      <Ionicons name="close-circle" size={20} color="#999" />
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

const localStyles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
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
    color: '#1A1A1A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
    color: '#1A1A1A',
  },
  hintText: {
    fontSize: 12,
    color: '#999',
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
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 8,
  },
  resultReference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  resultPreview: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  moreContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  moreText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
});

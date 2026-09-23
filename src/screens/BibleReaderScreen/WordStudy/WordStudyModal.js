import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { formatReference } from '../../../data/bibleData';
import { stripPunctuation } from '../../../hooks/useBibleReader';
import { useWordStudy } from './useWordStudy';
import HighlightedVerse from './HighlightedVerse';
import { createWordStudyStyles } from './WordStudyModal.styles';

const TABS = { OCCURRENCES: 'occurrences', RELATED: 'related' };

/**
 * Shows where a word appears across the Bible, its most common meanings, and
 * related forms (same light stem). Tapping a verse jumps the reader there.
 * `word`: { ar, en, formId } of the tapped word.
 */
export default function WordStudyModal({ visible, word, onClose, onSelectVerse }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createWordStudyStyles(theme), [theme]);
  const [stack, setStack] = useState([]);
  const [tab, setTab] = useState(TABS.OCCURRENCES);

  useEffect(() => {
    if (visible && word) {
      setStack([{ formId: word.formId, ar: stripPunctuation(word.ar), gloss: word.en }]);
      setTab(TABS.OCCURRENCES);
    }
  }, [visible, word]);

  const current = stack[stack.length - 1];
  const { loading, error, occurrences, related, hasMore, loadMore } = useWordStudy(visible ? current?.formId : null);

  const openRelated = useCallback((form) => {
    setStack((previous) => [...previous, { formId: form.formId, ar: form.sample, gloss: form.gloss }]);
    setTab(TABS.OCCURRENCES);
  }, []);

  const goBack = useCallback(() => setStack((previous) => previous.slice(0, -1)), []);

  const handleSelectVerse = useCallback(
    (item) => {
      onSelectVerse(item.book, item.chapter, item.verse);
      onClose();
    },
    [onSelectVerse, onClose]
  );

  const renderOccurrence = useCallback(
    ({ item }) => (
      <TouchableOpacity style={styles.row} onPress={() => handleSelectVerse(item)} accessibilityRole="button">
        <View style={styles.rowHeader}>
          <Text style={styles.reference}>{formatReference(item.book, item.chapter, item.verse)}</Text>
          <Text style={styles.rowGloss}>{item.gloss}</Text>
        </View>
        <HighlightedVerse text={item.ar} word={item.word} numberOfLines={3} />
      </TouchableOpacity>
    ),
    [styles, handleSelectVerse]
  );

  const renderRelated = useCallback(
    ({ item }) => (
      <TouchableOpacity style={styles.relatedRow} onPress={() => openRelated(item)} accessibilityRole="button">
        <Ionicons name="chevron-back" size={16} color={theme.colors.textSecondary} />
        <View style={styles.relatedText}>
          <Text style={[theme.arabic.small, styles.relatedArabic]}>{item.sample}</Text>
          <Text style={styles.rowGloss}>
            {item.gloss} · {item.count}×
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [styles, theme, openRelated]
  );

  if (!current) return null;

  const total = occurrences?.totalCount ?? 0;
  const isOccurrences = tab === TABS.OCCURRENCES;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          {stack.length > 1 ? (
            <TouchableOpacity onPress={goBack} style={styles.iconButton} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconButton} />
          )}
          <Text style={styles.topTitle}>Word study</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconButton} accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={[theme.arabic.large, styles.headword]}>{current.ar}</Text>
          {current.gloss ? <Text style={styles.headGloss}>{current.gloss}</Text> : null}
          {occurrences ? (
            <Text style={styles.count}>
              Appears {total} time{total === 1 ? '' : 's'} in the Bible
            </Text>
          ) : null}
          {occurrences?.glosses?.length > 1 ? (
            <View style={styles.chips}>
              {occurrences.glosses.map((gloss) => (
                <View key={gloss.gloss} style={styles.chip}>
                  <Text style={styles.chipText}>
                    {gloss.gloss} <Text style={styles.chipCount}>{gloss.count}</Text>
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.tabs}>
          {[
            [TABS.OCCURRENCES, 'This word'],
            [TABS.RELATED, `Related forms${related.length ? ` (${related.length})` : ''}`],
          ].map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.tab, tab === key && styles.tabActive]}
              onPress={() => setTab(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === key }}
            >
              <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.message}>{error}</Text> : null}
        {loading && !occurrences ? <ActivityIndicator style={styles.spinner} color={theme.colors.textSecondary} /> : null}

        {occurrences && isOccurrences ? (
          <FlatList
            data={occurrences.occurrences}
            keyExtractor={(item, index) => `${item.book}-${item.chapter}-${item.verse}-${index}`}
            renderItem={renderOccurrence}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
              hasMore ? (
                <TouchableOpacity style={styles.moreButton} onPress={loadMore} disabled={loading}>
                  <Text style={styles.moreText}>{loading ? 'Loading…' : 'Show more'}</Text>
                </TouchableOpacity>
              ) : null
            }
          />
        ) : null}

        {occurrences && !isOccurrences ? (
          <FlatList
            data={related}
            keyExtractor={(item) => String(item.formId)}
            renderItem={renderRelated}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              related.length ? (
                <Text style={styles.hint}>Other forms built on the same stem, e.g. with prefixes or suffixes.</Text>
              ) : null
            }
            ListEmptyComponent={<Text style={styles.message}>No related forms found for this word.</Text>}
          />
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

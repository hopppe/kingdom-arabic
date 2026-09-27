import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useBibleDb } from '../../context/BibleDbContext';
import { useMemoryVerses } from '../../context/MemoryVerseContext';
import { BOOKS, formatReference } from '../../data/bibleData';
import { getVerse, getVerseNumbers } from '../../data/bibleRepository';
import { Dropdown } from '../components/Dropdown';
import { STARTER_VERSES } from './starters';
import { CONTENT_MAX_WIDTH } from '../../utils/layout';

const BOOK_ITEMS = BOOKS.map((book) => ({ value: book.id, label: book.name }));

export function AddVerseView({ onClose, onAdded }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const db = useBibleDb();
  const { addVerse, hasVerse } = useMemoryVerses();

  const [book, setBook] = useState(BOOKS[0].id);
  const [chapter, setChapter] = useState(1);
  const [verseNumber, setVerseNumber] = useState(null);
  const [verseNumbers, setVerseNumbers] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const chapterItems = useMemo(() => {
    const bookMeta = BOOKS.find((b) => b.id === book);
    return (bookMeta?.chapters || []).map((c) => ({ value: c, label: String(c) }));
  }, [book]);

  useEffect(() => {
    let cancelled = false;
    getVerseNumbers(db, book, chapter)
      .then((numbers) => {
        if (cancelled) return;
        setVerseNumbers(numbers);
        setVerseNumber(numbers[0] || null);
      })
      .catch((err) => console.error('Failed to load verse numbers:', err));
    return () => {
      cancelled = true;
    };
  }, [db, book, chapter]);

  useEffect(() => {
    if (!verseNumber) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    setLoadingPreview(true);
    getVerse(db, book, chapter, verseNumber)
      .then((row) => {
        if (!cancelled) setPreview(row);
      })
      .catch((err) => console.error('Failed to load verse preview:', err))
      .finally(() => {
        if (!cancelled) setLoadingPreview(false);
      });
    return () => {
      cancelled = true;
    };
  }, [db, book, chapter, verseNumber]);

  const alreadySaved = verseNumber ? hasVerse(book, chapter, verseNumber) : false;

  const handleAdd = async (target) => {
    setError(null);
    setSaving(true);
    const result = await addVerse(target);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.alreadyExists) {
      setError('That verse is already in your list.');
      return;
    }
    onAdded();
  };

  const chapterItemsSafe = chapterItems.length > 0 ? chapterItems : [{ value: chapter, label: String(chapter) }];
  const verseItems = verseNumbers.map((v) => ({ value: v, label: String(v) }));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Verse</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.pickerRow}>
          <Dropdown items={BOOK_ITEMS} selectedValue={book} onSelect={(v) => { setBook(v); setChapter(1); }} placeholder="Book" style={styles.pickerFlex2} />
          <Dropdown items={chapterItemsSafe} selectedValue={chapter} onSelect={setChapter} placeholder="Ch." style={styles.pickerFlex1} />
          <Dropdown items={verseItems} selectedValue={verseNumber} onSelect={setVerseNumber} placeholder="Vs." style={styles.pickerFlex1} />
        </View>

        <View style={styles.previewCard}>
          {loadingPreview ? (
            <ActivityIndicator color={theme.colors.info} />
          ) : preview ? (
            <>
              <Text style={styles.previewReference}>{formatReference(book, chapter, verseNumber)}</Text>
              <Text style={[theme.arabic.body, styles.previewArabic]}>{preview.ar}</Text>
              <Text style={styles.previewEnglish}>{preview.en}</Text>
            </>
          ) : (
            <Text style={styles.previewMissing}>Verse not found.</Text>
          )}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.addButton, (!preview || saving || alreadySaved) && styles.addButtonDisabled]}
          onPress={() => handleAdd({ book, chapter, verse: verseNumber })}
          disabled={!preview || saving || alreadySaved}
        >
          {saving ? (
            <ActivityIndicator color={theme.colors.textOnPrimary} />
          ) : (
            <Text style={styles.addButtonText}>{alreadySaved ? 'Already added' : 'Add to Memorize'}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.startersLabel}>Popular verses</Text>
        <View style={styles.starterWrap}>
          {STARTER_VERSES.map((starter) => {
            const saved = hasVerse(starter.book, starter.chapter, starter.verse);
            return (
              <TouchableOpacity
                key={`${starter.book}-${starter.chapter}-${starter.verse}`}
                style={[styles.starterChip, saved && styles.starterChipSaved]}
                onPress={() => (saved ? null : handleAdd(starter))}
                disabled={saved}
              >
                {saved && <Ionicons name="checkmark" size={14} color={theme.colors.success} style={{ marginRight: 4 }} />}
                <Text style={styles.starterChipText}>{formatReference(starter.book, starter.chapter, starter.verse)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerButton: { minWidth: 60 },
    headerButtonText: { color: theme.colors.info, fontSize: theme.typography.fontSize.md },
    title: { fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text },
    content: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', padding: theme.spacing.md, paddingBottom: theme.spacing.xxl },
    pickerRow: { flexDirection: 'row', gap: 8, marginBottom: theme.spacing.md },
    pickerFlex2: { flex: 2 },
    pickerFlex1: { flex: 1 },
    previewCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      minHeight: 100,
      marginBottom: theme.spacing.md,
    },
    previewReference: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginBottom: 6 },
    previewArabic: { textAlign: 'right', color: theme.colors.text, marginBottom: 8 },
    previewEnglish: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary },
    previewMissing: { color: theme.colors.textSecondary },
    errorText: { color: theme.colors.error, marginBottom: theme.spacing.sm },
    addButton: {
      backgroundColor: theme.colors.info,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    addButtonDisabled: { opacity: 0.5 },
    addButtonText: { color: theme.colors.textOnPrimary, fontWeight: theme.typography.fontWeight.semibold, fontSize: theme.typography.fontSize.md },
    startersLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
    },
    starterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    starterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 4,
    },
    starterChipSaved: { opacity: 0.6 },
    starterChipText: { color: theme.colors.text, fontSize: theme.typography.fontSize.sm },
  });

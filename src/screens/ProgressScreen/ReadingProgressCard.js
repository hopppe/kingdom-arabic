import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BOOKS } from '../../data/bibleData';
import { useTheme } from '../../context/ThemeContext';
import { useReadingProgress } from '../../context/ReadingProgressContext';
import DashboardCard from './DashboardCard';

const ProgressBar = ({ fraction, styles, color, containerStyle }) => (
  <View style={[styles.track, containerStyle]}>
    <View style={[styles.fill, { width: `${Math.round(fraction * 100)}%`, backgroundColor: color }]} />
  </View>
);

export default function ReadingProgressCard() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { overall, getBookProgress, isChapterRead, toggleChapterRead } = useReadingProgress();
  const [booksExpanded, setBooksExpanded] = useState(false);
  const [expandedBook, setExpandedBook] = useState(null);

  return (
    <DashboardCard title="Reading progress" icon="book" iconColor={theme.colors.success}>
      <View style={styles.overallRow}>
        <Text style={styles.overallPercent}>{Math.round(overall.fraction * 100)}%</Text>
        <Text style={styles.overallDetail}>
          {overall.read} / {overall.total} chapters &middot; {overall.booksCompleted} books completed
        </Text>
      </View>
      <ProgressBar fraction={overall.fraction} styles={styles} color={theme.colors.success} />

      <View style={styles.testamentRow}>
        <View style={styles.testamentBlock}>
          <View style={styles.testamentHeader}>
            <Text style={styles.testamentLabel}>Old Testament</Text>
            <Text style={styles.testamentValue}>
              {overall.oldTestament.read}/{overall.oldTestament.total}
            </Text>
          </View>
          <ProgressBar
            fraction={overall.oldTestament.total > 0 ? overall.oldTestament.read / overall.oldTestament.total : 0}
            styles={styles}
            color={theme.colors.info}
          />
        </View>
        <View style={styles.testamentBlock}>
          <View style={styles.testamentHeader}>
            <Text style={styles.testamentLabel}>New Testament</Text>
            <Text style={styles.testamentValue}>
              {overall.newTestament.read}/{overall.newTestament.total}
            </Text>
          </View>
          <ProgressBar
            fraction={overall.newTestament.total > 0 ? overall.newTestament.read / overall.newTestament.total : 0}
            styles={styles}
            color={theme.colors.purple}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.toggleRow} onPress={() => setBooksExpanded((value) => !value)}>
        <Text style={styles.toggleText}>{booksExpanded ? 'Hide books' : 'Show all books'}</Text>
        <Ionicons
          name={booksExpanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {booksExpanded && (
        <View>
          {BOOKS.map((book) => {
            const progress = getBookProgress(book.id);
            const isExpanded = expandedBook === book.id;
            return (
              <View key={book.id}>
                <TouchableOpacity
                  style={styles.bookRow}
                  onPress={() => setExpandedBook(isExpanded ? null : book.id)}
                >
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookName}>{book.name}</Text>
                    <View style={styles.bookProgressRow}>
                      <ProgressBar
                        fraction={progress.fraction}
                        styles={styles}
                        color={theme.colors.success}
                        containerStyle={styles.bookTrack}
                      />
                      <Text style={styles.bookCount}>
                        {progress.read}/{progress.total}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.chapterGrid}>
                    {book.chapters.map((chapterNum) => {
                      const read = isChapterRead(book.id, chapterNum);
                      return (
                        <TouchableOpacity
                          key={chapterNum}
                          style={[styles.chapterCell, read && styles.chapterCellRead]}
                          onPress={() => toggleChapterRead(book.id, chapterNum)}
                        >
                          <Text style={[styles.chapterCellText, read && styles.chapterCellTextRead]}>
                            {chapterNum}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </DashboardCard>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    overallRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: theme.spacing.xs,
    },
    overallPercent: {
      fontSize: 34,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginRight: theme.spacing.sm,
    },
    overallDetail: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      flexShrink: 1,
    },
    track: {
      height: 10,
      width: '100%',
      borderRadius: 5,
      backgroundColor: theme.colors.borderLight,
      overflow: 'hidden',
    },
    bookTrack: {
      flex: 1,
      width: undefined,
    },
    fill: {
      height: '100%',
      borderRadius: 5,
    },
    testamentRow: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 18,
    },
    testamentBlock: {
      flex: 1,
    },
    testamentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    testamentLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
    },
    testamentValue: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      fontWeight: theme.typography.fontWeight.medium,
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.borderLight,
    },
    toggleText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.info,
      marginRight: 4,
    },
    bookRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.borderLight,
    },
    bookInfo: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    bookName: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    bookProgressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    bookCount: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs,
      minWidth: 34,
      textAlign: 'right',
    },
    chapterGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingBottom: theme.spacing.sm,
    },
    chapterCell: {
      width: 36,
      height: 36,
      margin: 3,
      borderRadius: 18,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
    },
    chapterCellRead: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    chapterCellText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    chapterCellTextRead: {
      color: theme.colors.white,
      fontWeight: theme.typography.fontWeight.semibold,
    },
  });

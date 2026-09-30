import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { toArabicDigits } from '../../utils/gathering/scriptureRef';
import { ScriptureLink, ExternalLink } from './ScriptureLink';

const HYMN_ICON = 'musical-notes-outline';

function ItemChip({ item, onOpenScripture, showEnglish }) {
  if (item.ref) return <ScriptureLink reference={item.ref} onOpen={onOpenScripture} showEnglish={showEnglish} />;
  const { ar, en, url } = item.hymn;
  return <ExternalLink icon={HYMN_ICON} ar={ar} en={en} url={url} showEnglish={showEnglish} />;
}

const groupItems = (group) => [
  ...(group.refs ?? []).map((ref) => ({ id: ref, ref })),
  ...(group.hymns ?? []).map((hymn) => ({ id: hymn.id, hymn })),
];

const countItems = (section) => section.groups.reduce((total, group) => total + groupItems(group).length, 0);

/**
 * One part of the gathering (Arabic first, right-to-left).
 * mode 'plan' shows the picked item per group with a shuffle button; 'resources' shows every item,
 * folded away until the title is tapped (when `onToggle` is given) so the list is quick to scan.
 */
export function SectionCard({
  section, mode, number, picks, onReroll, onSwapSection, onOpenScripture, showEnglish, expanded, onToggle,
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isPlan = mode === 'plan';
  const groups = isPlan ? section.groups.filter((group) => group.inPlan !== false) : section.groups;
  const links = (section.links ?? []).filter((link) => !link.platform || link.platform === Platform.OS);
  const collapsible = !isPlan && Boolean(onToggle);
  const showBody = !collapsible || expanded;
  const itemCount = collapsible ? countItems(section) : 0;

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.titleRow}
        onPress={collapsible ? onToggle : undefined}
        disabled={!collapsible}
        accessibilityRole={collapsible ? 'button' : undefined}
        accessibilityState={collapsible ? { expanded: Boolean(expanded) } : undefined}
        accessibilityLabel={collapsible ? section.en : undefined}
      >
        {isPlan ? (
          <View style={styles.number}>
            <Text style={styles.numberText}>{toArabicDigits(number)}</Text>
          </View>
        ) : (
          <Ionicons name={section.icon} size={20} color={theme.colors.text} />
        )}
        <View style={styles.titleText}>
          <Text style={styles.titleAr}>{section.ar}</Text>
          {showEnglish && <Text style={styles.titleEn}>{section.en}</Text>}
        </View>
        {/* Confession / the Lord's Supper: swap this part for the other one. */}
        {isPlan && onSwapSection && (
          <Pressable
            onPress={onSwapSection}
            hitSlop={8}
            style={styles.swapButton}
            accessibilityRole="button"
            accessibilityLabel="Swap between confession and the Lord's Supper"
          >
            <Ionicons name="swap-horizontal" size={18} color={theme.colors.textSecondary} />
          </Pressable>
        )}
        {collapsible && (
          <View style={styles.toggle}>
            {itemCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{toArabicDigits(itemCount)}</Text>
              </View>
            )}
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textSecondary} />
          </View>
        )}
      </Pressable>

      <Text style={styles.noteAr}>{section.noteAr}</Text>
      {showEnglish && <Text style={styles.noteEn}>{section.noteEn}</Text>}

      {showBody && groups.map((group) => {
        const picked = isPlan ? picks?.[group.key] : null;
        if (isPlan && !picked) return null;
        return (
          <View key={group.key} style={styles.group}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupLabel}>
                {group.ar}
                {showEnglish ? `  ·  ${group.en}` : ''}
              </Text>
              {isPlan && (
                <Pressable
                  onPress={() => onReroll(group.key)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Pick different: ${group.en}`}
                >
                  <Ionicons name="shuffle" size={18} color={theme.colors.textSecondary} />
                </Pressable>
              )}
            </View>
            <View style={styles.chipRow}>
              {(isPlan ? [picked] : groupItems(group)).map((item) => (
                <ItemChip key={item.id} item={item} onOpenScripture={onOpenScripture} showEnglish={showEnglish} />
              ))}
            </View>
          </View>
        );
      })}

      {showBody && links.length > 0 && (
        <View style={[styles.chipRow, styles.group]}>
          {links.map((link) => (
            <ExternalLink key={link.url} ar={link.ar} en={link.en} url={link.url} showEnglish={showEnglish} />
          ))}
        </View>
      )}

      {showBody && section.lines && (
        <View style={styles.lines}>
          {section.lines.map((line) => (
            <View key={line.ar} style={styles.line}>
              <Text style={styles.lineAr}>{line.ar}</Text>
              {showEnglish && <Text style={styles.lineEn}>{line.en}</Text>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    titleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: theme.spacing.sm },
    titleText: { flex: 1, alignItems: 'flex-end' },
    swapButton: { padding: 4 },
    toggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    countBadge: {
      minWidth: 24,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceOverlay,
    },
    countText: { fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textSecondary },
    titleAr: { ...theme.arabic.scaled(1.05), color: theme.colors.text, textAlign: 'right' },
    titleEn: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginTop: -4 },
    number: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    numberText: { color: theme.colors.textOnPrimary, fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.bold },
    noteAr: { ...theme.arabic.scaled(0.8), color: theme.colors.textTertiary, textAlign: 'right', marginTop: 2 },
    noteEn: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, textAlign: 'right', lineHeight: 20 },
    group: { marginTop: theme.spacing.sm },
    groupHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
    groupLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textSecondary,
      textAlign: 'right',
    },
    chipRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
    lines: { marginTop: theme.spacing.sm },
    line: { marginBottom: 4 },
    lineAr: { ...theme.arabic.scaled(0.9), color: theme.colors.text, textAlign: 'right' },
    lineEn: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, textAlign: 'right', marginTop: -4 },
  });

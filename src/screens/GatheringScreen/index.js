import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useGatheringPlan } from '../../hooks/useGatheringPlan';
import { GATHERING_SECTIONS, ALTERNATE_SLOT, getPlanSections } from '../../data/gathering/gathering';
import { ROUTES } from '../../navigation/routes';
import { IS_TABLET, pushedScreenEdges } from '../../navigation/device';
import { CONTENT_MAX_WIDTH } from '../../utils/layout';
import GlassSegmentedControl from '../../components/glass/GlassSegmentedControl';
import { SectionCard } from './SectionCard';

const SCREEN_EDGES = pushedScreenEdges();
const TAB_PLAN = 'plan';
const TAB_RESOURCES = 'resources';

// Which tab was open, how far each was scrolled and which resource cards were open.
// On phones, opening a scripture pops this screen off the stack, so "Back to Gathering"
// in the reader mounts it fresh; this keeps the spot for that return (and for the life of the app).
const screenMemory = { tab: TAB_PLAN, offsets: { [TAB_PLAN]: 0, [TAB_RESOURCES]: 0 }, expanded: [] };

/** "جمع روحاني": the parts of a spiritual gathering, plus a random plan. Arabic first. */
export default function GatheringScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { picks, loaded, generate, reroll, clear, showEnglish, toggleEnglish } = useGatheringPlan();
  const [tab, setTab] = useState(screenMemory.tab);
  const [expanded, setExpanded] = useState(screenMemory.expanded);

  const scrollRef = useRef(null);
  const pendingRestoreRef = useRef(screenMemory.offsets[screenMemory.tab]);

  const tabs = useMemo(
    () => [
      { value: TAB_PLAN, label: showEnglish ? 'الخطة · Plan' : 'الخطة' },
      { value: TAB_RESOURCES, label: showEnglish ? 'المصادر · Resources' : 'المصادر' },
    ],
    [showEnglish]
  );

  const changeTab = useCallback((next) => {
    screenMemory.tab = next;
    pendingRestoreRef.current = screenMemory.offsets[next];
    setTab(next);
  }, []);

  const toggleSection = useCallback((key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((current) => {
      const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
      screenMemory.expanded = next;
      return next;
    });
  }, []);

  const handleScroll = useCallback(
    (event) => {
      screenMemory.offsets[tab] = event.nativeEvent.contentOffset.y;
    },
    [tab]
  );

  // Content renders once the saved plan has loaded, so its first size is the full page.
  const handleContentSizeChange = useCallback(() => {
    const offsetY = pendingRestoreRef.current;
    if (!loaded || offsetY === null) return;
    pendingRestoreRef.current = null;
    scrollRef.current?.scrollTo({ y: offsetY, animated: false });
  }, [loaded]);

  // The reader shows a "Back to Gathering" button while it holds a link from here.
  const openScripture = useCallback(
    (reference) => {
      const params = { gatheringLink: { ...reference, openedAt: Date.now() } };
      if (IS_TABLET) navigation.navigate(ROUTES.BIBLE, params);
      else navigation.popTo(ROUTES.BIBLE, params);
    },
    [navigation]
  );

  const confirmClear = useCallback(() => {
    Alert.alert('مسح الخطة؟', 'Clear this plan? You can create a new one any time.', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'مسح', style: 'destructive', onPress: clear },
    ]);
  }, [clear]);

  const plannedSections = picks ? getPlanSections(picks) : [];
  const swapAlternate = useCallback(() => reroll(ALTERNATE_SLOT), [reroll]);

  return (
    <SafeAreaView style={styles.container} edges={SCREEN_EDGES}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        onContentSizeChange={handleContentSizeChange}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>جمع روحاني</Text>
            {showEnglish && <Text style={styles.titleEn}>Spiritual Gathering</Text>}
          </View>
          <Pressable
            style={[styles.englishButton, showEnglish && styles.englishButtonOn]}
            onPress={toggleEnglish}
            accessibilityRole="switch"
            accessibilityState={{ checked: showEnglish }}
            accessibilityLabel="Show English"
          >
            <Ionicons
              name={showEnglish ? 'eye-off-outline' : 'eye-outline'}
              size={16}
              color={showEnglish ? theme.colors.textOnPrimary : theme.colors.text}
            />
            <Text style={[styles.englishButtonText, showEnglish && styles.englishButtonTextOn]}>English</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          <GlassSegmentedControl options={tabs} value={tab} onChange={changeTab} />
        </View>

        {loaded && tab === TAB_PLAN && (
          <View>
            {!picks && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyAr}>
                  احصلوا على خطة جاهزة للّقاء: يُختار عنصر واحد عشوائيًا من كل قسم.
                </Text>
                {showEnglish && (
                  <Text style={styles.emptyEn}>
                    Get a ready-made plan: one item is picked at random from each section.
                  </Text>
                )}
              </View>
            )}
            <View style={styles.actionRow}>
              <Pressable style={styles.primaryButton} onPress={generate} accessibilityRole="button">
                <Ionicons name={picks ? 'shuffle' : 'sparkles-outline'} size={18} color={theme.colors.textOnPrimary} />
                <Text style={styles.primaryButtonText}>
                  {picks ? 'خطة جديدة' : 'أنشئ خطة'}
                  {showEnglish ? (picks ? ' · New plan' : ' · Create plan') : ''}
                </Text>
              </Pressable>
              {picks && (
                <Pressable style={styles.secondaryButton} onPress={confirmClear} accessibilityRole="button">
                  <Text style={styles.secondaryButtonText}>{showEnglish ? 'مسح · Clear' : 'مسح'}</Text>
                </Pressable>
              )}
            </View>
            {plannedSections.map((section, index) => (
              <SectionCard
                key={section.key}
                section={section}
                mode="plan"
                number={index + 1}
                picks={picks}
                onReroll={reroll}
                onSwapSection={section.plan === 'alternate' ? swapAlternate : undefined}
                onOpenScripture={openScripture}
                showEnglish={showEnglish}
              />
            ))}
          </View>
        )}

        {loaded && tab === TAB_RESOURCES && (
          <View>
            {GATHERING_SECTIONS.map((section) => (
              <SectionCard
                key={section.key}
                section={section}
                mode="resources"
                onOpenScripture={openScripture}
                showEnglish={showEnglish}
                expanded={expanded.includes(section.key)}
                onToggle={() => toggleSection(section.key)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      width: '100%',
      maxWidth: CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    headerRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
    headerTitles: { flex: 1, alignItems: 'flex-end' },
    title: { ...theme.arabic.scaled(1.4), color: theme.colors.text, textAlign: 'right' },
    titleEn: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginTop: -6 },
    englishButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: theme.spacing.sm,
    },
    englishButtonOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    englishButtonText: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text },
    englishButtonTextOn: { color: theme.colors.textOnPrimary },
    tabs: { alignItems: 'center', marginVertical: theme.spacing.md },
    emptyCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    },
    emptyAr: { ...theme.arabic.scaled(0.85), color: theme.colors.text, textAlign: 'right' },
    emptyEn: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, textAlign: 'right', lineHeight: 20 },
    actionRow: { flexDirection: 'row-reverse', gap: theme.spacing.sm, marginVertical: theme.spacing.md },
    primaryButton: {
      flex: 1,
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 14,
    },
    primaryButtonText: { color: theme.colors.textOnPrimary, fontWeight: theme.typography.fontWeight.semibold, fontSize: theme.typography.fontSize.md },
    secondaryButton: {
      paddingHorizontal: theme.spacing.lg,
      justifyContent: 'center',
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    secondaryButtonText: { color: theme.colors.text, fontWeight: theme.typography.fontWeight.semibold, fontSize: theme.typography.fontSize.md },
  });

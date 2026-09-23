// Orchestrates the Learn -> Fade -> First letters -> Build -> Recall
// progression for one verse. Reads/writes step position through
// MemoryVerseContext so leaving and returning resumes where the user left off.
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useBibleDb } from '../../context/BibleDbContext';
import { useMemoryVerses } from '../../context/MemoryVerseContext';
import { getChapter } from '../../data/bibleRepository';
import { formatReference } from '../../data/bibleData';
import { tokenizeVerse } from '../../utils/memory/tokenize';
import { chunkVerse } from '../../utils/memory/chunking';
import { alignGlossesToTokens } from '../../utils/memory/glossBuilder';
import { getGlossesForVerse } from '../../utils/memory/verseGlosses';
import { pickBuildUnits } from '../../utils/memory/buildCheck';
import { FADE_FRACTIONS } from '../../utils/memory/hideSelection';
import { STEP } from '../../utils/memory/steps';
import { STATUS } from '../../utils/memory/scheduler';
import { StepIndicator } from './StepIndicator';
import { LearnStep } from './steps/LearnStep';
import { FadeStep } from './steps/FadeStep';
import { FirstLettersStep } from './steps/FirstLettersStep';
import { BuildStep } from './steps/BuildStep';
import { RecallStep } from './steps/RecallStep';
import { useVerseSpeech } from './useVerseSpeech';

export function PracticeSession({ verse, onExit, onGraded, queueLabel }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const db = useBibleDb();
  const { updateStep, recordHint, recordBuildError, recordReview, logPracticeStep } = useMemoryVerses();
  const { speak, stop } = useVerseSpeech();

  // Don't let audio keep playing after leaving this verse.
  useEffect(() => stop, [stop]);

  const [chapterData, setChapterData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getChapter(db, verse.book, verse.chapter)
      .then((data) => {
        if (!cancelled) setChapterData(data);
      })
      .catch((error) => console.error('Failed to load chapter for practice:', error));
    return () => {
      cancelled = true;
    };
  }, [db, verse.book, verse.chapter]);

  const tokens = useMemo(() => tokenizeVerse(verse.ar), [verse.ar]);
  const chunks = useMemo(() => chunkVerse(tokens), [tokens]);
  const alignedTokens = useMemo(() => {
    const glosses = chapterData ? getGlossesForVerse(chapterData, verse.verse) : [];
    return alignGlossesToTokens(tokens, glosses);
  }, [tokens, chapterData, verse.verse]);
  const buildUnits = useMemo(() => pickBuildUnits(tokens, chunks), [tokens, chunks]);

  const reference = formatReference(verse.book, verse.chapter, verse.verse);
  const step = verse.currentStep ?? STEP.LEARN;
  const fadeRound = verse.fadeRound ?? 0;
  const isReview = verse.status !== STATUS.LEARNING;

  const goToStep = (nextStep, nextFadeRound = 0) => updateStep(verse.id, { currentStep: nextStep, fadeRound: nextFadeRound });

  const handleGrade = (rating) => {
    recordReview(verse.id, rating);
    onGraded?.(rating);
  };

  const renderStep = () => {
    if (step === STEP.LEARN) {
      if (!chapterData) {
        return <ActivityIndicator style={styles.loading} color={theme.colors.info} />;
      }
      return (
        <LearnStep
          reference={reference}
          chunks={chunks}
          alignedTokens={alignedTokens}
          englishVerse={verse.en}
          onSpeak={(opts) => speak(verse.ar, opts)}
          onNext={() => {
            logPracticeStep();
            goToStep(STEP.FADE, 0);
          }}
        />
      );
    }
    if (step === STEP.FADE) {
      return (
        <FadeStep
          reference={reference}
          tokens={tokens}
          verseId={verse.id}
          fadeRound={fadeRound}
          onHint={() => recordHint(verse.id)}
          onNextRound={() => {
            logPracticeStep();
            goToStep(STEP.FADE, Math.min(fadeRound + 1, FADE_FRACTIONS.length - 1));
          }}
          onFinish={() => {
            logPracticeStep();
            goToStep(STEP.FIRST_LETTERS);
          }}
        />
      );
    }
    if (step === STEP.FIRST_LETTERS) {
      return (
        <FirstLettersStep
          reference={reference}
          tokens={tokens}
          onHint={() => recordHint(verse.id)}
          onNext={() => {
            logPracticeStep();
            goToStep(STEP.BUILD);
          }}
        />
      );
    }
    if (step === STEP.BUILD) {
      return (
        <BuildStep
          reference={reference}
          units={buildUnits}
          verseId={verse.id}
          onError={() => recordBuildError(verse.id)}
          onComplete={() => {
            logPracticeStep();
            goToStep(STEP.RECALL);
          }}
        />
      );
    }
    return (
      <RecallStep
        reference={reference}
        englishVerse={verse.en}
        tokens={tokens}
        isReview={isReview}
        onHint={() => recordHint(verse.id)}
        onGrade={handleGrade}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.closeButton}>
          <Ionicons name="close" size={26} color={theme.colors.text} />
        </TouchableOpacity>
        {!!queueLabel && <Text style={styles.queueLabel}>{queueLabel}</Text>}
      </View>
      <StepIndicator currentStep={step} />
      {step === STEP.LEARN ? (
        renderStep()
      ) : (
        // Long verses can be taller than the screen; keep Continue/Reveal reachable.
        <ScrollView contentContainerStyle={styles.stepScroll} keyboardShouldPersistTaps="handled">
          {renderStep()}
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm },
    closeButton: { padding: 4 },
    queueLabel: { fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary },
    loading: { marginTop: theme.spacing.xl },
    stepScroll: { flexGrow: 1, paddingBottom: theme.spacing.xl },
  });

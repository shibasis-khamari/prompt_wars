import React, { useState, useEffect, useMemo } from 'react';
import { Navigation, RouteId } from '../components/Navigation';
import { SetupRoute } from './SetupRoute';
import { PuzzleRoute } from './PuzzleRoute';
import { ResultRoute } from './ResultRoute';
import { SkillMapRoute } from './SkillMapRoute';
import { JournalRoute } from './JournalRoute';
import { PyodideLoadingModal } from '../components/PyodideLoadingModal';
import { SelectingPuzzleModal } from '../components/SelectingPuzzleModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SupportedLanguage, Puzzle } from '../data/puzzle';
import seedPuzzles from '../data/seed.json';
import extraPuzzles from '../data/puzzles.json';
import { selectMatchingPuzzle, PuzzleSelectionOptions } from '../services/puzzleSelector';
import { selectDailyBug, getLocalDateString } from '../services/dailyBug';
import { SkillStore } from '../storage/skillStore';
import { StreakStore } from '../storage/streakStore';
import { StreakState } from '../shared/streak';
import { JournalStore } from '../storage/journalStore';
import { calculateXP, calculateRank } from '../shared/rules';
import { pythonRunner, PythonLoadingState } from '../engine/pythonRunner';
import { ApiPuzzleSource } from '../storage/puzzleSource';

export interface GameArenaProps {
  onNavigateHome?: () => void;
  onNavigateSignup?: () => void;
}

export const GameArena: React.FC<GameArenaProps> = () => {
  const [activeRoute, setActiveRoute] = useState<RouteId>('setup');
  const allPuzzles: Puzzle[] = [...(seedPuzzles as Puzzle[]), ...(extraPuzzles as Puzzle[])];

  const [seenPuzzleIds, setSeenPuzzleIds] = useState<Set<string>>(new Set());
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [userCode, setUserCode] = useState<string>('');
  const [learnerSubmittedCode, setLearnerSubmittedCode] = useState<string>('');
  const [isWin, setIsWin] = useState<boolean>(false);
  const [isGivenUp, setIsGivenUp] = useState<boolean>(false);

  const [unlockedHintIndices, setUnlockedHintIndices] = useState<number[]>([]);
  const [totalHintCostDeducted, setTotalHintCostDeducted] = useState<number>(0);
  const [unlockedHintsMap, setUnlockedHintsMap] = useState<Record<number, string>>({});
  const [streak, setStreak] = useState<StreakState>(() => StreakStore.getStreak());

  const [lastEarnedXP, setLastEarnedXP] = useState<number>(0);
  const [currentRank, setCurrentRank] = useState<string>(() => calculateRank(SkillStore.getUserXP()));
  const [isRankUp, setIsRankUp] = useState<boolean>(false);

  const [pythonLoading, setPythonLoading] = useState<PythonLoadingState>(() => pythonRunner.getLoadingState());
  const [dismissPyodideModal, setDismissPyodideModal] = useState<boolean>(false);

  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [loadingNotice, setLoadingNotice] = useState<string>('Finding an unseen puzzle...');
  const [poolNotice, setPoolNotice] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  const apiSource = useMemo(() => new ApiPuzzleSource(), []);

  useEffect(() => {
    return pythonRunner.subscribeLoading((st) => {
      setPythonLoading(st);
      if (st.isLoading) setDismissPyodideModal(false);
    });
  }, []);

  const launchPuzzle = (puzzle: Puzzle, notice?: string) => {
    setCurrentPuzzle(puzzle);
    setUserCode(puzzle.buggyCode);
    setLearnerSubmittedCode('');
    setUnlockedHintIndices([]);
    setTotalHintCostDeducted(0);
    setUnlockedHintsMap({});
    if (notice) setFallbackNotice(notice);
    setSeenPuzzleIds((prev) => new Set(prev).add(puzzle.id));
    setActiveRoute('puzzle');
  };

  const handleStartDailyBug = (language: SupportedLanguage) => {
    const todayDate = getLocalDateString();
    const daily = selectDailyBug(allPuzzles, language, todayDate);
    if (daily) {
      launchPuzzle(daily);
    }
  };

  const handleStartPuzzle = async (options: PuzzleSelectionOptions) => {
    setIsSelecting(true);
    setLoadingNotice('Finding an unseen puzzle...');
    setPoolNotice(null);
    setFallbackNotice(null);

    const timer = setTimeout(() => {
      setLoadingNotice('Generating a fresh diagnostic puzzle with AI for you... Hang tight!');
    }, 2000);

    try {
      let chosen: Puzzle | null = null;
      let notice: string | undefined;

      try {
        const result = await apiSource.getNextPuzzle({
          language: options.language,
          difficulty: options.difficulty,
          topic: options.topic || undefined,
          mode: options.mode,
        });

        if (result?.poolExhausted) {
          setPoolNotice(result.message || 'Pool exhausted for this category. Sign up to unlock infinite AI puzzles!');
          return;
        }

        if (result) {
          chosen = result as unknown as Puzzle;
          notice = result.fallbackNotice;
        }
      } catch (apiErr) {
        console.warn('API getNextPuzzle error, falling back to local pool:', apiErr);
      }

      if (!chosen) {
        const local = selectMatchingPuzzle(allPuzzles, { ...options, seenPuzzleIds });
        chosen = local.puzzle;
        notice = local.fallbackNotice;
      }

      if (chosen) {
        launchPuzzle(chosen, notice);
      }
    } finally {
      clearTimeout(timer);
      setIsSelecting(false);
    }
  };

  const handleSolve = (finalCode: string) => {
    if (!currentPuzzle) return;
    setLearnerSubmittedCode(finalCode);
    setIsWin(true);
    setIsGivenUp(false);

    const prevXP = SkillStore.getUserXP();
    const prevRank = calculateRank(prevXP);
    const earnedXP = calculateXP({
      difficulty: currentPuzzle.difficulty,
      hintsUsed: unlockedHintIndices.length,
    });
    const newXP = prevXP + earnedXP;
    const newRank = calculateRank(newXP);

    setLastEarnedXP(earnedXP);
    setIsRankUp(newRank !== prevRank);
    setCurrentRank(newRank);

    SkillStore.recordTopicResult(currentPuzzle.language, currentPuzzle.topic, {
      solved: true,
      hintsUsed: unlockedHintIndices.length,
    });
    SkillStore.addXP(earnedXP);

    const dailyAttempt = StreakStore.recordDailyAttempt();
    setStreak(dailyAttempt.streak);

    JournalStore.addEntry({
      puzzleId: currentPuzzle.id,
      title: currentPuzzle.title,
      language: currentPuzzle.language,
      topic: currentPuzzle.topic,
      bugType: currentPuzzle.bugType,
      explanation: currentPuzzle.explanation,
      solvedDate: new Date().toISOString(),
    });

    setActiveRoute('result');
  };

  const handleUnlockHint = async (idx: number, cost: number) => {
    setUnlockedHintIndices((prev) => [...prev, idx]);
    setTotalHintCostDeducted((prev) => prev + cost);

    if (currentPuzzle?.hints?.[idx]) {
      setUnlockedHintsMap((prev) => ({ ...prev, [idx]: currentPuzzle.hints![idx] }));
      return;
    }

    if (currentPuzzle?.id) {
      try {
        const res = await apiSource.getHint(currentPuzzle.id, idx);
        if (res?.hint) {
          setUnlockedHintsMap((prev) => ({ ...prev, [idx]: res.hint }));
        }
      } catch (err) {
        console.warn('Failed to fetch hint:', err);
      }
    }
  };

  const handleGiveUp = async () => {
    if (!currentPuzzle) return;
    setIsWin(false);
    setIsGivenUp(true);
    setLastEarnedXP(0);
    setIsRankUp(false);

    if (!currentPuzzle.correctCode || !currentPuzzle.explanation) {
      try {
        const solution = await apiSource.getSolution(currentPuzzle.id);
        if (solution) {
          setCurrentPuzzle((prev) =>
            prev
              ? {
                  ...prev,
                  correctCode: solution.correctCode || prev.correctCode,
                  explanation: solution.explanation || prev.explanation,
                }
              : null
          );
        }
      } catch (err) {
        console.warn('Failed to fetch solution on give-up:', err);
      }
    }

    setActiveRoute('result');
  };

  const setupView = (
    <SetupRoute
      onStartPuzzle={handleStartPuzzle}
      onStartDailyBug={handleStartDailyBug}
      hasPlayedToday={StreakStore.hasPlayedToday()}
      fallbackNotice={poolNotice || fallbackNotice}
    />
  );

  const renderContent = () => {
    if (activeRoute === 'skills') {
      return (
        <SkillMapRoute
          onPracticeTopic={() => setActiveRoute('setup')}
        />
      );
    }
    if (activeRoute === 'journal') {
      return <JournalRoute onNavigatePlay={() => setActiveRoute('setup')} />;
    }
    if (activeRoute === 'puzzle') {
      return currentPuzzle ? (
        <PuzzleRoute
          puzzle={currentPuzzle}
          userCode={userCode}
          onChangeCode={setUserCode}
          onSubmitWin={handleSolve}
          onGiveUp={handleGiveUp}
          onResetCode={() => setUserCode(currentPuzzle.buggyCode)}
          unlockedHintIndices={unlockedHintIndices}
          onUnlockHint={handleUnlockHint}
          totalHintCostDeducted={totalHintCostDeducted}
          unlockedHints={unlockedHintsMap}
        />
      ) : setupView;
    }
    if (activeRoute === 'result') {
      return currentPuzzle ? (
        <ResultRoute
          puzzle={currentPuzzle}
          learnerCode={learnerSubmittedCode || userCode}
          isWin={isWin}
          isGivenUp={isGivenUp}
          earnedXP={lastEarnedXP}
          newRank={currentRank}
          isRankUp={isRankUp}
          onPlayNext={() => setActiveRoute('setup')}
          onTryAgain={() => setActiveRoute('puzzle')}
          onPracticeTopic={() => setActiveRoute('setup')}
          onViewJournal={() => setActiveRoute('journal')}
        />
      ) : setupView;
    }
    return setupView;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Navigation activeRoute={activeRoute} onNavigate={setActiveRoute} streak={streak} />
      <div style={{ flex: 1 }}>
        <ErrorBoundary fallbackTitle="Challenge interrupted" onReset={() => setActiveRoute('setup')}>
          {renderContent()}
        </ErrorBoundary>
      </div>

      <SelectingPuzzleModal isOpen={isSelecting} message={loadingNotice} />

      <PyodideLoadingModal
        isOpen={pythonLoading.isLoading && !dismissPyodideModal}
        percent={pythonLoading.percent}
        stage={pythonLoading.stage}
        onDismiss={() => setDismissPyodideModal(true)}
      />
    </div>
  );
};

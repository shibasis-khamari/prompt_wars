export const BASE_XP_BY_LEVEL: Record<number, number> = {
  1: 10,
  2: 20,
  3: 35,
  4: 50,
  5: 80,
};

export const HINT_COST_BY_LEVEL: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 5,
  5: 8,
};

export interface CalculateXPOptions {
  difficulty: number; // 1 to 5
  hintsUsed: number;  // 0 to 3
  isGivenUp?: boolean;
}

export function calculateXP(options: CalculateXPOptions): number {
  if (options.isGivenUp) return 0;

  const baseXP = BASE_XP_BY_LEVEL[options.difficulty] ?? 10;
  const hintUnitCost = HINT_COST_BY_LEVEL[options.difficulty] ?? 1;
  const totalHintCost = Math.max(options.hintsUsed, 0) * hintUnitCost;

  // Floor of 10 percent of the base value
  const floorXP = Math.round(baseXP * 0.1);
  const earnedXP = baseXP - totalHintCost;

  return Math.max(earnedXP, floorXP);
}

export function calculateRank(totalXP: number): string {
  if (totalXP >= 2500) return 'Debug Master';
  if (totalXP >= 800) return 'Exterminator';
  if (totalXP >= 200) return 'Bug Spotter';
  return 'Rookie';
}

export interface AdaptiveSkillState {
  level: number; // 1 to 5
  consecutiveZeroHintSolves: number;
  consecutiveFailures: number;
}

export function updateAdaptiveSkill(
  current: AdaptiveSkillState,
  event: { solved: boolean; hintsUsed: number }
): AdaptiveSkillState {
  let { level, consecutiveZeroHintSolves, consecutiveFailures } = current;

  if (event.solved) {
    consecutiveFailures = 0;
    if (event.hintsUsed === 0) {
      consecutiveZeroHintSolves += 1;
      if (consecutiveZeroHintSolves >= 3) {
        level = Math.min(level + 1, 5);
        consecutiveZeroHintSolves = 0;
      }
    } else {
      consecutiveZeroHintSolves = 0;
    }
  } else {
    consecutiveZeroHintSolves = 0;
    consecutiveFailures += 1;
    if (consecutiveFailures >= 3) {
      level = Math.max(level - 1, 1);
      consecutiveFailures = 0;
    }
  }

  return { level, consecutiveZeroHintSolves, consecutiveFailures };
}

export interface WarmUpResult {
  passed: boolean;
  finalLevel: number;
  reason: string;
}

export function evaluateWarmUpOutcome(
  targetLevel: number,
  puzzlesSolved: number,
  totalHintsUsed: number
): WarmUpResult {
  if (targetLevel < 4) {
    return { passed: true, finalLevel: targetLevel, reason: 'No warm-up required.' };
  }

  const passed = puzzlesSolved === 2 && totalHintsUsed <= 1;
  if (passed) {
    return {
      passed: true,
      finalLevel: targetLevel,
      reason: `Warm-up passed! You solved both warm-up puzzles with ${totalHintsUsed} hint(s) and qualified for Level ${targetLevel}.`,
    };
  }

  const steppedDownLevel = targetLevel - 1;
  const reason =
    puzzlesSolved < 2
      ? `Warm-up requires solving both puzzles (you solved ${puzzlesSolved}/2). Stepped down to Level ${steppedDownLevel}.`
      : `Warm-up requires at most 1 hint in total (you used ${totalHintsUsed}). Stepped down to Level ${steppedDownLevel}.`;

  return {
    passed: false,
    finalLevel: steppedDownLevel,
    reason,
  };
}

export interface StreakResult {
  currentStreak: number;
  lastActiveDate: string;
  isNewDay: boolean;
}

export function calculateStreak(
  lastActiveDateStr: string | null | undefined,
  currentStreak: number = 0,
  currentDate: Date = new Date()
): StreakResult {
  const todayStr = currentDate.toISOString().split('T')[0];

  if (!lastActiveDateStr) {
    return { currentStreak: 1, lastActiveDate: todayStr, isNewDay: true };
  }

  if (lastActiveDateStr === todayStr) {
    return { currentStreak, lastActiveDate: todayStr, isNewDay: false };
  }

  const lastDate = new Date(lastActiveDateStr);
  const diffTime = currentDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

  if (diffDays === 1) {
    return { currentStreak: currentStreak + 1, lastActiveDate: todayStr, isNewDay: true };
  }

  return { currentStreak: 1, lastActiveDate: todayStr, isNewDay: true };
}

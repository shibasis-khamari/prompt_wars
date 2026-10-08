export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastPlayedDate: string | null; // Format: 'YYYY-MM-DD'
}

export const INITIAL_STREAK_STATE: StreakState = {
  currentStreak: 0,
  bestStreak: 0,
  lastPlayedDate: null,
};

/**
 * Calculates day difference between two YYYY-MM-DD date strings.
 * Returns (toDate - fromDate) in whole days.
 */
export function getDaysDifference(fromDateStr: string, toDateStr: string): number {
  const from = new Date(`${fromDateStr}T00:00:00Z`).getTime();
  const to = new Date(`${toDateStr}T00:00:00Z`).getTime();
  const diffMs = to - from;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Pure calculation of next streak state when playing on playDate.
 * - Playing on consecutive days adds 1.
 * - Missing a day resets it to 1.
 * - Only the first attempt each day counts toward the streak.
 * - Store best streak too.
 */
export function calculateNextStreak(
  state: StreakState,
  playDate: string
): { nextState: StreakState; counted: boolean } {
  // First time ever playing
  if (!state.lastPlayedDate) {
    return {
      nextState: {
        currentStreak: 1,
        bestStreak: Math.max(state.bestStreak, 1),
        lastPlayedDate: playDate,
      },
      counted: true,
    };
  }

  // Already played today: only first attempt counts
  if (state.lastPlayedDate === playDate) {
    return {
      nextState: { ...state },
      counted: false,
    };
  }

  const diffDays = getDaysDifference(state.lastPlayedDate, playDate);

  // If clock somehow moved backwards
  if (diffDays < 0) {
    return {
      nextState: { ...state },
      counted: false,
    };
  }

  // Consecutive day (diff === 1): adds 1
  if (diffDays === 1) {
    const nextCurrent = state.currentStreak + 1;
    return {
      nextState: {
        currentStreak: nextCurrent,
        bestStreak: Math.max(state.bestStreak, nextCurrent),
        lastPlayedDate: playDate,
      },
      counted: true,
    };
  }

  // Missed at least one day (diff > 1): resets to 1, preserves best streak
  return {
    nextState: {
      currentStreak: 1,
      bestStreak: Math.max(state.bestStreak, 1),
      lastPlayedDate: playDate,
    },
    counted: true,
  };
}

/**
 * Calculates the visible active streak for display.
 * If user hasn't played today, but played yesterday, streak is still active.
 * If user missed yesterday, active streak is 0 until they play again.
 */
export function getActiveStreak(state: StreakState, todayDate: string): number {
  if (!state.lastPlayedDate || state.currentStreak === 0) {
    return 0;
  }
  const diffDays = getDaysDifference(state.lastPlayedDate, todayDate);
  if (diffDays === 0 || diffDays === 1) {
    return state.currentStreak;
  }
  // Missed a day
  return 0;
}

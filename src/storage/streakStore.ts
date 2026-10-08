import { StreakState, INITIAL_STREAK_STATE, calculateNextStreak } from '../shared/streak';
import { getLocalDateString } from '../services/dailyBug';

const STREAK_STORAGE_KEY = 'bughunt_streak_v1';

export class StreakStore {
  public static getStreak(): StreakState {
    if (typeof localStorage === 'undefined') {
      return { ...INITIAL_STREAK_STATE };
    }
    try {
      const raw = localStorage.getItem(STREAK_STORAGE_KEY);
      if (!raw) return { ...INITIAL_STREAK_STATE };
      const parsed = JSON.parse(raw);
      return {
        currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0,
        bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : 0,
        lastPlayedDate: typeof parsed.lastPlayedDate === 'string' ? parsed.lastPlayedDate : null,
      };
    } catch {
      return { ...INITIAL_STREAK_STATE };
    }
  }

  public static saveStreak(state: StreakState): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Storage quota or privacy mode fail-safe
      }
    }
  }

  /**
   * Records a daily attempt. Returns the updated streak state and whether
   * this was the first attempt today (which counted toward the streak).
   */
  public static recordDailyAttempt(playDate = getLocalDateString()): {
    streak: StreakState;
    isFirstAttemptToday: boolean;
  } {
    const current = this.getStreak();
    const { nextState, counted } = calculateNextStreak(current, playDate);
    if (counted) {
      this.saveStreak(nextState);
    }
    return {
      streak: nextState,
      isFirstAttemptToday: counted,
    };
  }

  public static hasPlayedToday(todayDate = getLocalDateString()): boolean {
    const current = this.getStreak();
    return current.lastPlayedDate === todayDate;
  }

  public static resetStreak(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(STREAK_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }
}

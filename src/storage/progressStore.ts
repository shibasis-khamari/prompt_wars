import { calculateRank, calculateStreak } from '../shared/rules';

export interface SolvedPuzzleRecord {
  puzzleId: string;
  status: 'solved' | 'given_up';
  hintsUsed: number;
  timeMs: number;
  xpEarned: number;
  solvedAt: string;
}

export interface UserProfileData {
  userId?: string;
  email?: string;
  totalXP: number;
  rank: string;
  currentStreak: number;
  lastActiveDate: string;
  solvedPuzzles: Record<string, SolvedPuzzleRecord>;
}

export interface ProgressStore {
  getProfile(): Promise<UserProfileData>;
  recordSolve(puzzleId: string, details: { hintsUsed: number; timeMs: number; attempts: number }): Promise<{ xpEarned: number; totalXP: number }>;
  recordGiveup(puzzleId: string): Promise<void>;
  importGuestProgress(guestData: UserProfileData): Promise<void>;
}

export class ApiProgressStore implements ProgressStore {
  async getProfile(): Promise<UserProfileData> {
    const res = await fetch('/api/me');
    if (!res.ok) throw new Error('Could not fetch user profile.');
    return res.json();
  }

  async recordSolve(puzzleId: string, details: { hintsUsed: number; timeMs: number; attempts: number }): Promise<{ xpEarned: number; totalXP: number }> {
    const res = await fetch(`/api/puzzles/${puzzleId}/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    if (!res.ok) throw new Error('Failed to record puzzle solve.');
    return res.json();
  }

  async recordGiveup(puzzleId: string): Promise<void> {
    await fetch(`/api/puzzles/${puzzleId}/giveup`, { method: 'POST' });
  }

  async importGuestProgress(guestData: UserProfileData): Promise<void> {
    await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestProgress: guestData }),
    });
  }
}

export class LocalProgressStore implements ProgressStore {
  private STORAGE_KEY = 'bughunt_arena_guest_progress_v1';

  private getStored(): UserProfileData {
    if (typeof localStorage === 'undefined') {
      return {
        totalXP: 0,
        rank: 'Novice Debugger',
        currentStreak: 0,
        lastActiveDate: '',
        solvedPuzzles: {},
      };
    }
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      return {
        totalXP: 0,
        rank: 'Rookie',
        currentStreak: 0,
        lastActiveDate: '',
        solvedPuzzles: {},
      };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        totalXP: 0,
        rank: 'Rookie',
        currentStreak: 0,
        lastActiveDate: '',
        solvedPuzzles: {},
      };
    }
  }

  private saveStored(data: UserProfileData): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }
  }

  async getProfile(): Promise<UserProfileData> {
    return this.getStored();
  }

  async recordSolve(puzzleId: string, details: { hintsUsed: number; timeMs: number; attempts: number }): Promise<{ xpEarned: number; totalXP: number }> {
    const profile = this.getStored();
    const xpEarned = 100 - details.hintsUsed * 20;
    const totalXP = profile.totalXP + xpEarned;
    const rank = calculateRank(totalXP);
    const streakResult = calculateStreak(profile.lastActiveDate, profile.currentStreak);

    profile.totalXP = totalXP;
    profile.rank = rank;
    profile.currentStreak = streakResult.currentStreak;
    profile.lastActiveDate = streakResult.lastActiveDate;

    profile.solvedPuzzles[puzzleId] = {
      puzzleId,
      status: 'solved',
      hintsUsed: details.hintsUsed,
      timeMs: details.timeMs,
      xpEarned,
      solvedAt: new Date().toISOString(),
    };

    this.saveStored(profile);
    return { xpEarned, totalXP };
  }

  async recordGiveup(puzzleId: string): Promise<void> {
    const profile = this.getStored();
    profile.solvedPuzzles[puzzleId] = {
      puzzleId,
      status: 'given_up',
      hintsUsed: 3,
      timeMs: 0,
      xpEarned: 0,
      solvedAt: new Date().toISOString(),
    };
    this.saveStored(profile);
  }

  async importGuestProgress(_guestData: UserProfileData): Promise<void> {
    // Local store is already local
  }
}

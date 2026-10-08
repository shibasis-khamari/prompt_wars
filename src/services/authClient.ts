import { StreakStore } from '../storage/streakStore';
import { SkillStore } from '../storage/skillStore';

export interface AuthUser {
  userId: string;
  email: string;
}

export interface GuestProgressSummary {
  hasProgress: boolean;
  totalXP: number;
  currentStreak: number;
  solvedCount: number;
  rawGuestProgress?: Record<string, unknown>;
}

export function inspectGuestProgress(): GuestProgressSummary {
  if (typeof localStorage === 'undefined') {
    return { hasProgress: false, totalXP: 0, currentStreak: 0, solvedCount: 0 };
  }

  const xp = SkillStore.getUserXP();
  const streak = StreakStore.getStreak().currentStreak;

  let rawGuest: Record<string, unknown> | undefined;
  let solvedCount = 0;

  try {
    const raw = localStorage.getItem('bughunt_arena_guest_progress_v1');
    if (raw) {
      rawGuest = JSON.parse(raw);
      if (rawGuest && typeof rawGuest === 'object' && rawGuest.solvedPuzzles) {
        solvedCount = Object.keys(rawGuest.solvedPuzzles as object).length;
      }
    }
  } catch {
    // Silently continue if parse error
  }

  const hasProgress = xp > 0 || streak > 0 || solvedCount > 0;

  return {
    hasProgress,
    totalXP: xp,
    currentStreak: streak,
    solvedCount,
    rawGuestProgress: rawGuest,
  };
}

export class AuthClient {
  public static async login(email: string, password: string): Promise<AuthUser> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password credentials.');
    }

    return data.user;
  }

  public static async signup(
    email: string,
    password: string,
    keepGuestProgress = false
  ): Promise<AuthUser> {
    const guestData = keepGuestProgress ? inspectGuestProgress().rawGuestProgress : undefined;

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password,
        guestProgress: guestData,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create account.');
    }

    return data.user;
  }

  public static async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  }

  public static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const res = await fetch('/api/me');
      if (!res.ok) return null;
      const data = await res.json();
      return { userId: data.userId, email: data.email };
    } catch {
      return null;
    }
  }
}

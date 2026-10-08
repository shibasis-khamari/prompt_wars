import { Puzzle, SupportedLanguage } from '../data/puzzle';
import seedPuzzles from '../data/seed.json';

export interface PuzzleFilterOptions {
  language?: SupportedLanguage;
  difficulty?: number;
  topic?: string;
  mode?: string;
  exclude?: string[];
}

export interface SanitizedPuzzle {
  id: string;
  language: SupportedLanguage;
  difficulty: number;
  topic: string;
  bugType: string;
  title: string;
  theme: string;
  buggyCode: string;
  tests: { id?: string; description?: string; input: unknown[]; expectedOutput?: unknown }[];
  symptomOutput: string;
  timeLimitMs: number;
  fallbackNotice?: string;
  poolExhausted?: boolean;
  requiresSignup?: boolean;
  message?: string;
}

export interface PuzzleSource {
  getNextPuzzle(options?: PuzzleFilterOptions): Promise<SanitizedPuzzle | null>;
  getDailyPuzzle(language?: SupportedLanguage): Promise<SanitizedPuzzle | null>;
  getHint(puzzleId: string, hintIndex: number): Promise<{ hint: string; hintIndex: number }>;
  getSolution(puzzleId: string): Promise<{ correctCode: string; explanation: string }>;
}

export const GUEST_HISTORY_STORAGE_KEY = 'bug_hunt_guest_history';

export class GuestHistoryStore {
  static getGuestHistory(): string[] {
    try {
      const raw = localStorage.getItem(GUEST_HISTORY_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string').slice(0, 50) : [];
    } catch {
      return [];
    }
  }

  static addGuestHistory(puzzleId: string): void {
    if (!puzzleId) return;
    try {
      const current = GuestHistoryStore.getGuestHistory();
      const updated = Array.from(new Set([puzzleId, ...current])).slice(0, 50);
      localStorage.setItem(GUEST_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }

  static clearGuestHistory(): void {
    try {
      localStorage.removeItem(GUEST_HISTORY_STORAGE_KEY);
    } catch {}
  }
}

export class ApiPuzzleSource implements PuzzleSource {
  async getNextPuzzle(options: PuzzleFilterOptions = {}): Promise<SanitizedPuzzle | null> {
    const query = new URLSearchParams();
    if (options.language) query.append('language', options.language);
    if (options.difficulty) query.append('difficulty', String(options.difficulty));
    if (options.topic) query.append('topic', options.topic);
    if (options.mode) query.append('mode', options.mode);

    const excludeList = options.exclude || GuestHistoryStore.getGuestHistory();
    if (excludeList && excludeList.length > 0) {
      query.append('exclude', excludeList.slice(0, 50).join(','));
    }

    const res = await fetch(`/api/puzzles/next?${query.toString()}`, {
      headers: { 'Cache-Control': 'no-store' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.id && !data.poolExhausted) {
      GuestHistoryStore.addGuestHistory(data.id);
    }
    return data;
  }

  async getDailyPuzzle(language: SupportedLanguage = 'python'): Promise<SanitizedPuzzle | null> {
    const res = await fetch(`/api/daily?language=${language}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.puzzle || data;
  }

  async getHint(puzzleId: string, hintIndex: number): Promise<{ hint: string; hintIndex: number }> {
    const res = await fetch(`/api/puzzles/${puzzleId}/hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hintIndex }),
    });
    if (!res.ok) throw new Error('Could not fetch hint.');
    return res.json();
  }

  async getSolution(puzzleId: string): Promise<{ correctCode: string; explanation: string }> {
    const res = await fetch(`/api/puzzles/${puzzleId}/giveup`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Could not fetch solution.');
    return res.json();
  }
}

export class StaticPuzzleSource implements PuzzleSource {
  private puzzles: Puzzle[];

  constructor(customPuzzles?: Puzzle[]) {
    this.puzzles = (customPuzzles || seedPuzzles) as Puzzle[];
  }

  private sanitize(puzzle: Puzzle): SanitizedPuzzle {
    const { correctCode, explanation, hints, ...rest } = puzzle;
    return rest;
  }

  async getNextPuzzle(options: PuzzleFilterOptions = {}): Promise<SanitizedPuzzle | null> {
    let filtered = this.puzzles;
    if (options.language) {
      filtered = filtered.filter((p) => p.language === options.language);
    }
    if (options.difficulty) {
      filtered = filtered.filter((p) => p.difficulty === options.difficulty);
    }
    if (options.topic) {
      filtered = filtered.filter((p) => p.topic === options.topic);
    }

    if (filtered.length === 0) return null;
    return this.sanitize(filtered[0]);
  }

  async getDailyPuzzle(language: SupportedLanguage = 'python'): Promise<SanitizedPuzzle | null> {
    const match = this.puzzles.find((p) => p.language === language) || this.puzzles[0];
    return match ? this.sanitize(match) : null;
  }

  async getHint(puzzleId: string, hintIndex: number): Promise<{ hint: string; hintIndex: number }> {
    const puzzle = this.puzzles.find((p) => p.id === puzzleId);
    if (!puzzle || !puzzle.hints[hintIndex]) {
      throw new Error('Hint not found');
    }
    return { hint: puzzle.hints[hintIndex], hintIndex };
  }

  async getSolution(puzzleId: string): Promise<{ correctCode: string; explanation: string }> {
    const puzzle = this.puzzles.find((p) => p.id === puzzleId);
    if (!puzzle) throw new Error('Puzzle not found');
    return { correctCode: puzzle.correctCode, explanation: puzzle.explanation };
  }
}

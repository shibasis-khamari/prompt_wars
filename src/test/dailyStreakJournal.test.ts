import { describe, it, expect, beforeEach } from 'vitest';
import { selectDailyBug, hashDateString, getLocalDateString } from '../services/dailyBug';
import {
  calculateNextStreak,
  getDaysDifference,
  getActiveStreak,
  INITIAL_STREAK_STATE,
  StreakState,
} from '../shared/streak';
import {
  filterJournalEntries,
  JournalEntry,
  JournalStore,
} from '../storage/journalStore';
import { StreakStore } from '../storage/streakStore';
import { Puzzle } from '../data/puzzle';

const mockPuzzles: Puzzle[] = [
  {
    id: 'py-puzzle-1',
    language: 'python',
    difficulty: 1,
    topic: 'Loops and conditions',
    bugType: 'Off-by-One Loop Boundary',
    title: 'Python Loop Bug',
    theme: 'Loop counter',
    buggyCode: 'def f(): pass',
    correctCode: 'def f(): return True',
    tests: [{ id: 't1', description: 't', input: [], expectedOutput: true }],
    expectedOutput: true,
    symptomOutput: 'wrong',
    bugLine: 1,
    explanation: 'Loop condition was incorrect on line 1. Common off-by-one bug. Use range properly.',
    hints: ['h1', 'h2', 'h3'],
    timeLimitMs: 3000,
    validated: true,
    createdAt: '2026-10-08T00:00:00.000Z',
  },
  {
    id: 'py-puzzle-2',
    language: 'python',
    difficulty: 2,
    topic: 'Dictionaries',
    bugType: 'Key Overwrite',
    title: 'Python Dict Bug',
    theme: 'Dict counter',
    buggyCode: 'def g(): pass',
    correctCode: 'def g(): return True',
    tests: [{ id: 't1', description: 't', input: [], expectedOutput: true }],
    expectedOutput: true,
    symptomOutput: 'wrong',
    bugLine: 1,
    explanation: 'Key was overwritten on line 1. Dictionary keys must accumulate. Use get.',
    hints: ['h1', 'h2', 'h3'],
    timeLimitMs: 3000,
    validated: true,
    createdAt: '2026-10-08T00:00:00.000Z',
  },
  {
    id: 'py-unvalidated',
    language: 'python',
    difficulty: 2,
    topic: 'Lists',
    bugType: 'Index Error',
    title: 'Unvalidated Bug',
    theme: 'List index',
    buggyCode: 'def h(): pass',
    correctCode: 'def h(): return True',
    tests: [{ id: 't1', description: 't', input: [], expectedOutput: true }],
    expectedOutput: true,
    symptomOutput: 'wrong',
    bugLine: 1,
    explanation: 'Explanation.',
    hints: ['h1', 'h2', 'h3'],
    timeLimitMs: 3000,
    validated: false,
    createdAt: '2026-10-08T00:00:00.000Z',
  },
  {
    id: 'js-puzzle-1',
    language: 'javascript',
    difficulty: 1,
    topic: 'Loops and conditions',
    bugType: 'Off-by-One Loop Boundary',
    title: 'JS Loop Bug',
    theme: 'Loop counter',
    buggyCode: 'function f() {}',
    correctCode: 'function f() { return true; }',
    tests: [{ id: 't1', description: 't', input: [], expectedOutput: true }],
    expectedOutput: true,
    symptomOutput: 'wrong',
    bugLine: 1,
    explanation: 'Condition was off on line 1. Array index 0-based. Check boundary.',
    hints: ['h1', 'h2', 'h3'],
    timeLimitMs: 3000,
    validated: true,
    createdAt: '2026-10-08T00:00:00.000Z',
  },
];

describe('Daily Bug Selection Engine', () => {
  it('is completely stable within a day for the same date string', () => {
    const dateStr = '2026-10-08';
    const pick1 = selectDailyBug(mockPuzzles, 'python', dateStr);
    const pick2 = selectDailyBug(mockPuzzles, 'python', dateStr);
    const pick3 = selectDailyBug(mockPuzzles, 'python', dateStr);

    expect(pick1).not.toBeNull();
    expect(pick1?.id).toBe(pick2?.id);
    expect(pick2?.id).toBe(pick3?.id);
  });

  it('filters out unvalidated puzzles so only validated ones are chosen', () => {
    const dateStr = '2026-10-08';
    const pick = selectDailyBug(mockPuzzles, 'python', dateStr);
    expect(pick?.validated).toBe(true);
    expect(pick?.id).not.toBe('py-unvalidated');
  });

  it('selects correct language puzzle deterministically', () => {
    const dateStr = '2026-10-08';
    const jsPick = selectDailyBug(mockPuzzles, 'javascript', dateStr);
    expect(jsPick).not.toBeNull();
    expect(jsPick?.language).toBe('javascript');
    expect(jsPick?.id).toBe('js-puzzle-1');
  });

  it('returns null when no validated puzzles exist for language', () => {
    const pick = selectDailyBug(mockPuzzles, 'rust', '2026-10-08');
    expect(pick).toBeNull();
  });

  it('produces consistent non-negative integer hashes', () => {
    const hashA = hashDateString('2026-10-08');
    const hashB = hashDateString('2026-10-08');
    expect(hashA).toBe(hashB);
    expect(hashA).toBeGreaterThanOrEqual(0);
  });

  it('formats local date string as YYYY-MM-DD', () => {
    const testDate = new Date(2026, 9, 8); // Oct 8, 2026
    const formatted = getLocalDateString(testDate);
    expect(formatted).toBe('2026-10-08');
  });
});

describe('Streak Engine (calculateNextStreak)', () => {
  it('initializes streak to 1 on first play', () => {
    const result = calculateNextStreak(INITIAL_STREAK_STATE, '2026-10-01');
    expect(result.counted).toBe(true);
    expect(result.nextState).toEqual({ currentStreak: 1, bestStreak: 1, lastPlayedDate: '2026-10-01' });
  });

  it('only counts the first attempt each day toward the streak', () => {
    const day1: StreakState = { currentStreak: 1, bestStreak: 1, lastPlayedDate: '2026-10-01' };

    // Playing again on the same day
    const secondAttempt = calculateNextStreak(day1, '2026-10-01');
    expect(secondAttempt.counted).toBe(false);
    expect(secondAttempt.nextState.currentStreak).toBe(1);
    expect(secondAttempt.nextState.bestStreak).toBe(1);
  });

  it('adds 1 to streak when playing on consecutive days', () => {
    const day1 = calculateNextStreak(INITIAL_STREAK_STATE, '2026-10-01').nextState;
    const day2 = calculateNextStreak(day1, '2026-10-02');
    expect(day2.counted).toBe(true);
    expect(day2.nextState.currentStreak).toBe(2);
    expect(day2.nextState.bestStreak).toBe(2);

    const day3 = calculateNextStreak(day2.nextState, '2026-10-03');
    expect(day3.counted).toBe(true);
    expect(day3.nextState.currentStreak).toBe(3);
    expect(day3.nextState.bestStreak).toBe(3);
  });

  it('resets streak to 1 when a day is missed while preserving best streak', () => {
    // Learner achieved 3-day streak on 2026-10-03
    const establishedStreak: StreakState = {
      currentStreak: 3,
      bestStreak: 3,
      lastPlayedDate: '2026-10-03',
    };

    // Missed 2026-10-04, played on 2026-10-05 (diff is 2 days)
    expect(getDaysDifference('2026-10-03', '2026-10-05')).toBe(2);

    const afterMissedDay = calculateNextStreak(establishedStreak, '2026-10-05');
    expect(afterMissedDay.counted).toBe(true);
    expect(afterMissedDay.nextState.currentStreak).toBe(1);
    // Best streak must be preserved
    expect(afterMissedDay.nextState.bestStreak).toBe(3);
    expect(afterMissedDay.nextState.lastPlayedDate).toBe('2026-10-05');

    // Playing on consecutive day following reset advances to 2
    const nextDay = calculateNextStreak(afterMissedDay.nextState, '2026-10-06');
    expect(nextDay.nextState.currentStreak).toBe(2);
    expect(nextDay.nextState.bestStreak).toBe(3);
  });

  it('calculates active streak correctly for display', () => {
    const streak: StreakState = {
      currentStreak: 4,
      bestStreak: 4,
      lastPlayedDate: '2026-10-05',
    };

    // Played today
    expect(getActiveStreak(streak, '2026-10-05')).toBe(4);
    // Played yesterday (eligible to continue today)
    expect(getActiveStreak(streak, '2026-10-06')).toBe(4);
    // Missed yesterday (streak broken)
    expect(getActiveStreak(streak, '2026-10-07')).toBe(0);
  });
});

describe('StreakStore Integration', () => {
  beforeEach(() => {
    StreakStore.resetStreak();
  });

  it('records daily attempt and flags first attempt vs repeat attempt', () => {
    const first = StreakStore.recordDailyAttempt('2026-10-08');
    expect(first.isFirstAttemptToday).toBe(true);
    expect(first.streak.currentStreak).toBe(1);
    expect(StreakStore.hasPlayedToday('2026-10-08')).toBe(true);

    const second = StreakStore.recordDailyAttempt('2026-10-08');
    expect(second.isFirstAttemptToday).toBe(false);
    expect(second.streak.currentStreak).toBe(1);
  });
});

describe('Bug Journal Filtering & Storage', () => {
  const sampleEntries: JournalEntry[] = [
    { id: 'e1', puzzleId: 'py-1', title: 'Pizza Bug', language: 'python', topic: 'Loops and conditions', bugType: 'Operator', explanation: 'Discount added not subtracted.', solvedDate: '2026-10-07T10:00:00.000Z' },
    { id: 'e2', puzzleId: 'py-3', title: 'Score Bug', language: 'python', topic: 'Dictionaries', bugType: 'Key', explanation: 'Overwrote scores.', solvedDate: '2026-10-08T11:00:00.000Z' },
    { id: 'e3', puzzleId: 'js-1', title: 'Sum Bug', language: 'javascript', topic: 'Loops and conditions', bugType: 'Off-by-One', explanation: 'Loop stopped early.', solvedDate: '2026-10-08T12:00:00.000Z' },
  ];

  beforeEach(() => {
    JournalStore.clear();
  });

  it('filters entries by language correctly', () => {
    const pythonOnly = filterJournalEntries(sampleEntries, { language: 'python' });
    expect(pythonOnly).toHaveLength(2);
    expect(pythonOnly.every((e) => e.language === 'python')).toBe(true);

    const jsOnly = filterJournalEntries(sampleEntries, { language: 'javascript' });
    expect(jsOnly).toHaveLength(1);
    expect(jsOnly[0].title).toBe('Sum Bug');
  });

  it('filters entries by topic correctly', () => {
    const loopsOnly = filterJournalEntries(sampleEntries, { topic: 'Loops and conditions' });
    expect(loopsOnly).toHaveLength(2);

    const dictsOnly = filterJournalEntries(sampleEntries, { topic: 'Dictionaries' });
    expect(dictsOnly).toHaveLength(1);
    expect(dictsOnly[0].puzzleId).toBe('py-3');
  });

  it('filters entries by both language and topic', () => {
    const pyLoops = filterJournalEntries(sampleEntries, { language: 'python', topic: 'Loops and conditions' });
    expect(pyLoops).toHaveLength(1);
    expect(pyLoops[0].id).toBe('e1');
  });

  it('returns all entries when filters are set to all or undefined', () => {
    expect(filterJournalEntries(sampleEntries, { language: 'all', topic: 'all' })).toHaveLength(3);
  });
  it('returns empty array when no entries match filter', () => {
    expect(filterJournalEntries(sampleEntries, { language: 'javascript', topic: 'Recursion' })).toHaveLength(0);
  });

  it('adds and retrieves entries with bug type, explanation, and date from JournalStore', () => {
    JournalStore.addEntry({
      puzzleId: 'py-1',
      title: 'Sample Bug',
      language: 'python',
      topic: 'Strings',
      bugType: 'String Immutability',
      explanation: 'Strings in Python are immutable.',
    });

    const entries = JournalStore.getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].bugType).toBe('String Immutability');
    expect(entries[0].explanation).toBe('Strings in Python are immutable.');
    expect(entries[0].solvedDate).toBeDefined();
  });
});

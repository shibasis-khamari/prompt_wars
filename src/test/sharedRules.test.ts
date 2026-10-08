import { describe, it, expect } from 'vitest';
import {
  calculateXP,
  calculateRank,
  updateAdaptiveSkill,
  evaluateWarmUpOutcome,
  calculateStreak,
} from '../shared/rules';

describe('XP Calculation Formula & 10% Floor', () => {
  it('calculates base XP by level: 10, 20, 35, 50, 80 with 0 hints', () => {
    expect(calculateXP({ difficulty: 1, hintsUsed: 0 })).toBe(10);
    expect(calculateXP({ difficulty: 2, hintsUsed: 0 })).toBe(20);
    expect(calculateXP({ difficulty: 3, hintsUsed: 0 })).toBe(35);
    expect(calculateXP({ difficulty: 4, hintsUsed: 0 })).toBe(50);
    expect(calculateXP({ difficulty: 5, hintsUsed: 0 })).toBe(80);
  });

  it('deducts hint costs based on difficulty level', () => {
    // Level 3 base 35, hint cost 3. 2 hints used -> 35 - 6 = 29 XP
    expect(calculateXP({ difficulty: 3, hintsUsed: 2 })).toBe(29);

    // Level 4 base 50, hint cost 5. 1 hint used -> 50 - 5 = 45 XP
    expect(calculateXP({ difficulty: 4, hintsUsed: 1 })).toBe(45);
  });

  it('enforces minimum floor of 10 percent of the base value', () => {
    // Level 1 base 10, floor 10% = 1 XP. Even if 3 hints used (3 * 1 = 3 deducted -> 7 XP)
    expect(calculateXP({ difficulty: 1, hintsUsed: 3 })).toBe(7);

    // Level 5 base 80, floor 10% = 8 XP. If 15 hints deducted (hypothetical), floor at 8 XP
    expect(calculateXP({ difficulty: 5, hintsUsed: 20 })).toBe(8);
  });

  it('awards 0 XP if the puzzle was given up', () => {
    expect(calculateXP({ difficulty: 3, hintsUsed: 0, isGivenUp: true })).toBe(0);
    expect(calculateXP({ difficulty: 5, hintsUsed: 2, isGivenUp: true })).toBe(0);
  });
});

describe('Rank Thresholds', () => {
  it('assigns correct ranks at 0, 200, 800, and 2500 XP thresholds', () => {
    expect(calculateRank(0)).toBe('Rookie');
    expect(calculateRank(199)).toBe('Rookie');

    expect(calculateRank(200)).toBe('Bug Spotter');
    expect(calculateRank(799)).toBe('Bug Spotter');

    expect(calculateRank(800)).toBe('Exterminator');
    expect(calculateRank(2499)).toBe('Exterminator');

    expect(calculateRank(2500)).toBe('Debug Master');
    expect(calculateRank(5000)).toBe('Debug Master');
  });
});

describe('Adaptive Rule: 3-Solve / 3-Failure Streaks', () => {
  it('raises suggested level by 1 after 3 zero-hint solves in a row', () => {
    let state = { level: 2, consecutiveZeroHintSolves: 0, consecutiveFailures: 0 };

    state = updateAdaptiveSkill(state, { solved: true, hintsUsed: 0 });
    expect(state.level).toBe(2);
    expect(state.consecutiveZeroHintSolves).toBe(1);

    state = updateAdaptiveSkill(state, { solved: true, hintsUsed: 0 });
    expect(state.level).toBe(2);
    expect(state.consecutiveZeroHintSolves).toBe(2);

    // 3rd zero-hint solve raises level to 3
    state = updateAdaptiveSkill(state, { solved: true, hintsUsed: 0 });
    expect(state.level).toBe(3);
    expect(state.consecutiveZeroHintSolves).toBe(0); // counter resets
  });

  it('resets zero-hint streak if a hint is used during a solve', () => {
    let state = { level: 2, consecutiveZeroHintSolves: 2, consecutiveFailures: 0 };

    // Solved but with 1 hint
    state = updateAdaptiveSkill(state, { solved: true, hintsUsed: 1 });
    expect(state.level).toBe(2);
    expect(state.consecutiveZeroHintSolves).toBe(0);
  });

  it('lowers suggested level by 1 after 3 failures or give-ups in a row', () => {
    let state = { level: 3, consecutiveZeroHintSolves: 0, consecutiveFailures: 0 };

    state = updateAdaptiveSkill(state, { solved: false, hintsUsed: 0 });
    expect(state.consecutiveFailures).toBe(1);

    state = updateAdaptiveSkill(state, { solved: false, hintsUsed: 1 });
    expect(state.consecutiveFailures).toBe(2);

    // 3rd failure lowers level to 2
    state = updateAdaptiveSkill(state, { solved: false, hintsUsed: 0 });
    expect(state.level).toBe(2);
    expect(state.consecutiveFailures).toBe(0);
  });

  it('clamps level between 1 and 5', () => {
    // Cannot raise beyond 5
    let maxState = { level: 5, consecutiveZeroHintSolves: 2, consecutiveFailures: 0 };
    maxState = updateAdaptiveSkill(maxState, { solved: true, hintsUsed: 0 });
    expect(maxState.level).toBe(5);

    // Cannot drop below 1
    let minState = { level: 1, consecutiveZeroHintSolves: 0, consecutiveFailures: 2 };
    minState = updateAdaptiveSkill(minState, { solved: false, hintsUsed: 0 });
    expect(minState.level).toBe(1);
  });
});

describe('Warm-Up Evaluation for Levels 4 and 5', () => {
  it('qualifies learner when both puzzles are solved with at most 1 hint in total', () => {
    // 2 solved, 0 hints
    const result0 = evaluateWarmUpOutcome(4, 2, 0);
    expect(result0.passed).toBe(true);
    expect(result0.finalLevel).toBe(4);
    expect(result0.reason).toContain('Warm-up passed');

    // 2 solved, 1 hint total
    const result1 = evaluateWarmUpOutcome(5, 2, 1);
    expect(result1.passed).toBe(true);
    expect(result1.finalLevel).toBe(5);
  });

  it('steps down one level if fewer than 2 puzzles are solved', () => {
    const result = evaluateWarmUpOutcome(4, 1, 0);
    expect(result.passed).toBe(false);
    expect(result.finalLevel).toBe(3); // 4 stepped down to 3
    expect(result.reason).toContain('Stepped down to Level 3');
  });

  it('steps down one level if more than 1 hint total was used', () => {
    const result = evaluateWarmUpOutcome(5, 2, 2);
    expect(result.passed).toBe(false);
    expect(result.finalLevel).toBe(4); // 5 stepped down to 4
    expect(result.reason).toContain('at most 1 hint');
    expect(result.reason).toContain('Stepped down to Level 4');
  });
});

describe('Streak Tracking', () => {
  it('handles streak calculation properly', () => {
    const today = new Date('2026-10-08T12:00:00.000Z');
    const sameDay = calculateStreak('2026-10-08', 3, today);
    expect(sameDay.currentStreak).toBe(3);
    expect(sameDay.isNewDay).toBe(false);

    const consecutive = calculateStreak('2026-10-07', 3, today);
    expect(consecutive.currentStreak).toBe(4);
    expect(consecutive.isNewDay).toBe(true);
  });
});

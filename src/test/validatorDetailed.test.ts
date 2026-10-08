import { describe, it, expect } from 'vitest';
import { validatePuzzleDetailed } from '../engine/validator';
import seedPuzzles from '../data/seed.json';

describe('8-Point Puzzle Fairness Validator', { timeout: 15000 }, () => {
  const goodPuzzle = seedPuzzles[0];

  it('approves a valid puzzle passing all 8 fairness checks', async () => {
    const result = await validatePuzzleDetailed(goodPuzzle);
    expect(result.valid).toBe(true);
    expect(result.checks.every((c) => c.passed)).toBe(true);
  });

  it('rejects puzzle when line diff exceeds 3 changed lines', async () => {
    const brokenPuzzle = {
      ...goodPuzzle,
      id: 'broken-diff-large',
      buggyCode: `def calculate_pizza_total(prices, discount):
    # Line 1 addition
    # Line 2 addition
    # Line 3 addition
    # Line 4 addition
    total = 0
    for price in prices:
        total += price
    return total`,
    };

    const result = await validatePuzzleDetailed(brokenPuzzle);
    expect(result.valid).toBe(false);
    const diffCheck = result.checks.find((c) => c.checkId === 'DIFF_LINE_COUNT');
    expect(diffCheck?.passed).toBe(false);
  });

  it('rejects puzzle when buggy code passes all tests without failing any', async () => {
    const brokenPuzzle = {
      ...goodPuzzle,
      id: 'broken-no-fail',
      buggyCode: goodPuzzle.correctCode,
    };

    const result = await validatePuzzleDetailed(brokenPuzzle);
    expect(result.valid).toBe(false);
    const failCheck = result.checks.find((c) => c.checkId === 'BUGGY_CODE_FAILS');
    expect(failCheck?.passed).toBe(false);
  });

  it('rejects puzzle when hint leaks correct code line verbatim', async () => {
    const brokenPuzzle = {
      ...goodPuzzle,
      id: 'broken-hint-leak',
      hints: [
        'Look at the reduction step',
        'Change line to total -= discount', // Leaks verbatim line from correctCode!
        'What should the total be?',
      ],
    };

    const result = await validatePuzzleDetailed(brokenPuzzle);
    expect(result.valid).toBe(false);
    const hintCheck = result.checks.find((c) => c.checkId === 'HINTS_VALID');
    expect(hintCheck?.passed).toBe(false);
  });

  it('rejects puzzle when bugLine does not match changed lines', async () => {
    const brokenPuzzle = {
      ...goodPuzzle,
      id: 'broken-bugline',
      bugLine: 99, // Line 99 does not exist in diff
    };

    const result = await validatePuzzleDetailed(brokenPuzzle);
    expect(result.valid).toBe(false);
    const bugLineCheck = result.checks.find((c) => c.checkId === 'BUG_LINE_INCLUDED');
    expect(bugLineCheck?.passed).toBe(false);
  });

  it('rejects puzzle when explanation is empty or too short', async () => {
    const brokenPuzzle = {
      ...goodPuzzle,
      id: 'broken-explanation',
      explanation: 'Short',
    };

    const result = await validatePuzzleDetailed(brokenPuzzle);
    expect(result.valid).toBe(false);
    const expCheck = result.checks.find((c) => c.checkId === 'EXPLANATION_NOT_EMPTY');
    expect(expCheck?.passed).toBe(false);
  });
});

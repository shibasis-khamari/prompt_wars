import { describe, it, expect } from 'vitest';
import { selectMatchingPuzzle } from '../services/puzzleSelector';
import { Puzzle } from '../data/puzzle';
import seedPuzzles from '../data/seed.json';
import extraPuzzles from '../data/puzzles.json';
import { runPythonCode } from '../engine/pythonRunner';
import { runJSCode } from '../engine/jsRunner';

describe('Core Loop: Puzzle Selection Logic', () => {
  const allPuzzles: Puzzle[] = [...(seedPuzzles as Puzzle[]), ...(extraPuzzles as Puzzle[])];

  it('selects an exact difficulty match for Python', () => {
    const result = selectMatchingPuzzle(allPuzzles, {
      language: 'python',
      difficulty: 1,
      mode: 'mixed',
    });

    expect(result.puzzle).not.toBeNull();
    expect(result.puzzle?.language).toBe('python');
    expect(result.puzzle?.difficulty).toBe(1);
    expect(result.isNearestFallback).toBe(false);
    expect(result.fallbackNotice).toBeUndefined();
  });

  it('selects an exact difficulty match for JavaScript', () => {
    const result = selectMatchingPuzzle(allPuzzles, {
      language: 'javascript',
      difficulty: 1,
      mode: 'mixed',
    });

    expect(result.puzzle).not.toBeNull();
    expect(result.puzzle?.language).toBe('javascript');
    expect(result.puzzle?.difficulty).toBe(1);
    expect(result.isNearestFallback).toBe(false);
  });

  it('falls back to nearest difficulty when exact level is unavailable and informs learner', () => {
    // There is no difficulty 5 puzzle in seed list, so requesting 5 should fallback to 4
    const result = selectMatchingPuzzle(allPuzzles, {
      language: 'python',
      difficulty: 5,
      mode: 'mixed',
    });

    expect(result.puzzle).not.toBeNull();
    expect(result.puzzle?.difficulty).toBe(4);
    expect(result.isNearestFallback).toBe(true);
    expect(result.fallbackNotice).toContain('No exact match for Level 5');
    expect(result.fallbackNotice).toContain('Selected nearest Level 4');
  });

  it('filters by topic when mode is set to topic focus', () => {
    const result = selectMatchingPuzzle(allPuzzles, {
      language: 'python',
      difficulty: 3,
      mode: 'topic',
      topic: 'Dictionaries',
    });

    expect(result.puzzle).not.toBeNull();
    expect(result.puzzle?.topic).toBe('Dictionaries');
  });

  it('excludes previously seen puzzles when unseen ones are available', () => {
    const firstResult = selectMatchingPuzzle(allPuzzles, {
      language: 'python',
      difficulty: 1,
      mode: 'mixed',
    });
    const seenId = firstResult.puzzle!.id;

    const secondResult = selectMatchingPuzzle(allPuzzles, {
      language: 'python',
      difficulty: 1,
      mode: 'mixed',
      seenPuzzleIds: [seenId],
    });

    // Since there was only one diff 1, it picks nearest unseen puzzle (diff 3)
    expect(secondResult.puzzle?.id).not.toBe(seenId);
  });
});

describe('Core Loop: Submit Logic Accepts Any Fix Passing Tests', () => {
  it('accepts alternative Python code that passes all tests (not matching correctCode verbatim)', async () => {
    const puzzle = (seedPuzzles as Puzzle[]).find((p) => p.id === 'py-pizza-discount-1')!;

    // Stored correctCode uses:
    // total = 0
    // for price in prices: total += price
    // if total > 30: total -= discount
    //
    // Alternative learner solution using sum() and ternary:
    const alternativeLearnerFix = `
def calculate_pizza_total(prices, discount):
    subtotal = sum(prices)
    return subtotal - discount if subtotal > 30 else subtotal
`;

    // Verify against all test cases
    for (const tc of puzzle.tests) {
      const argsJson = tc.input.map((a) => JSON.stringify(a)).join(', ');
      const script = `
${alternativeLearnerFix}
import json
print(json.dumps(calculate_pizza_total(${argsJson})))
`;
      const exec = await runPythonCode(script);
      const actual = JSON.parse(exec.stdout.trim());
      expect(actual).toEqual(tc.expectedOutput);
    }
  });

  it('accepts alternative JavaScript code that passes all tests', async () => {
    const puzzle = (extraPuzzles as Puzzle[]).find((p) => p.id === 'js-pizza-sum-1')!;

    // Alternative learner fix using Array.prototype.reduce
    const alternativeLearnerFix = `
function solution(prices) {
  return prices.reduce((acc, p) => acc + p, 0);
}
`;

    for (const tc of puzzle.tests) {
      const argsJson = tc.input.map((a) => JSON.stringify(a)).join(', ');
      const script = `
${alternativeLearnerFix}
console.log(JSON.stringify(solution(${argsJson})));
`;
      const exec = await runJSCode(script);
      const actual = JSON.parse(exec.stdout.trim());
      expect(actual).toEqual(tc.expectedOutput);
    }
  });

  it('rejects code if any test case fails', async () => {
    const puzzle = (seedPuzzles as Puzzle[]).find((p) => p.id === 'py-pizza-discount-1')!;

    // Buggy code will fail on order over 30
    const buggyCode = puzzle.buggyCode;

    let hasFailure = false;
    for (const tc of puzzle.tests) {
      const argsJson = tc.input.map((a) => JSON.stringify(a)).join(', ');
      const script = `
${buggyCode}
import json
print(json.dumps(calculate_pizza_total(${argsJson})))
`;
      const exec = await runPythonCode(script);
      const actual = JSON.parse(exec.stdout.trim());
      if (JSON.stringify(actual) !== JSON.stringify(tc.expectedOutput)) {
        hasFailure = true;
      }
    }

    expect(hasFailure).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { validatePuzzle } from '../services/validator';
import { Puzzle } from '../types/puzzle';

describe('Rule 2: Puzzle Validator', () => {
  const validPuzzle: Puzzle = {
    id: 'test-valid',
    title: 'Valid Puzzle',
    description: 'Test puzzle',
    difficulty: 'easy',
    category: 'Test',
    buggyCode: 'function solution(x) { return x; }', // fails when expectedOutput is x + 1
    correctCode: 'function solution(x) { return x + 1; }',
    explanation: 'Adds 1',
    hints: ['Add 1'],
    testCases: [
      { id: 't1', description: 'Increments number', input: [2], expectedOutput: 3 },
    ],
  };

  it('approves puzzle when correct code passes all tests and buggy code fails at least one', async () => {
    const result = await validatePuzzle(validPuzzle);
    expect(result.isValid).toBe(true);
    expect(result.correctCodePassed).toBe(true);
    expect(result.buggyCodeFailed).toBe(true);
  });

  it('rejects puzzle if buggy code also passes all tests', async () => {
    const invalidPuzzle: Puzzle = {
      ...validPuzzle,
      buggyCode: 'function solution(x) { return x + 1; }', // identical to correct code
    };

    const result = await validatePuzzle(invalidPuzzle);
    expect(result.isValid).toBe(false);
    expect(result.buggyCodeFailed).toBe(false);
  });

  it('rejects puzzle if correct code fails any test case', async () => {
    const invalidPuzzle: Puzzle = {
      ...validPuzzle,
      correctCode: 'function solution(x) { return x * 10; }',
    };

    const result = await validatePuzzle(invalidPuzzle);
    expect(result.isValid).toBe(false);
    expect(result.correctCodePassed).toBe(false);
  });
});

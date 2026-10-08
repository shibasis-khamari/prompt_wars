import { describe, it, expect } from 'vitest';
import { PuzzleSchema } from '../data/puzzle';
import seedPuzzles from '../data/seed.json';

describe('Puzzle Schema Validation', () => {
  it('successfully validates all 3 seed puzzles against PuzzleSchema', () => {
    expect(seedPuzzles).toHaveLength(3);
    for (const puzzle of seedPuzzles) {
      const parseResult = PuzzleSchema.safeParse(puzzle);
      expect(parseResult.success).toBe(true);
    }
  });

  it('rejects a puzzle with invalid difficulty out of range 1-5', () => {
    const invalidPuzzle = {
      ...seedPuzzles[0],
      difficulty: 10,
    };
    const parseResult = PuzzleSchema.safeParse(invalidPuzzle);
    expect(parseResult.success).toBe(false);
  });

  it('rejects a puzzle with invalid language string', () => {
    const invalidPuzzle = {
      ...seedPuzzles[0],
      language: 'ruby',
    };
    const parseResult = PuzzleSchema.safeParse(invalidPuzzle);
    expect(parseResult.success).toBe(false);
  });

  it('rejects a puzzle with hint tuple length not equal to 3', () => {
    const invalidPuzzle = {
      ...seedPuzzles[0],
      hints: ['Only one hint'],
    };
    const parseResult = PuzzleSchema.safeParse(invalidPuzzle);
    expect(parseResult.success).toBe(false);
  });
});

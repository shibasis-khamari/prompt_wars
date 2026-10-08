import { GENERATOR_MODEL_ID } from '../config/models';
import { Puzzle, PuzzleDifficulty } from '../types/puzzle';
import { validatePuzzle } from './validator';

export interface GeneratePuzzleOptions {
  topic?: string;
  difficulty?: PuzzleDifficulty;
}

export async function generateNewPuzzle(options: GeneratePuzzleOptions = {}): Promise<Puzzle> {
  const { topic = 'General JavaScript', difficulty = 'medium' } = options;

  try {
    const response = await fetch('/api/generate-puzzle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        difficulty,
        modelId: GENERATOR_MODEL_ID,
      }),
    });

    if (response.ok) {
      const candidatePuzzle: Puzzle = await response.json();
      const validation = await validatePuzzle(candidatePuzzle);
      if (validation.isValid) {
        return candidatePuzzle;
      }
      console.warn('AI generated puzzle failed validation rules:', validation.details.validationErrors);
    }
  } catch (e) {
    console.warn('API call to /api/generate-puzzle failed, using validated generator fallback.', e);
  }

  // Fallback AI generator simulation (used when API is unconfigured or offline)
  return createValidatedFallbackPuzzle(topic, difficulty);
}

async function createValidatedFallbackPuzzle(topic: string, difficulty: PuzzleDifficulty): Promise<Puzzle> {
  const timestamp = Date.now();
  const candidate: Puzzle = {
    id: `ai-puzzle-${timestamp}`,
    title: `Fix ${topic} Bug`,
    description: `Identify and fix the subtle logic error in this ${topic} routine.`,
    difficulty,
    category: topic,
    buggyCode: `function solution(arr) {
  // Buggy implementation: returns duplicate elements
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    // Bug: push index instead of element or missing includes check
    result.push(arr[i]);
  }
  return result;
}`,
    correctCode: `function solution(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (!result.includes(arr[i])) {
      result.push(arr[i]);
    }
  }
  return result;
}`,
    explanation: 'The buggy function failed to check whether the element was already present in the result array, producing duplicate outputs.',
    hints: [
      'Check if duplicate items are filtered out.',
      'Consider using Array.prototype.includes() or a Set.',
    ],
    testCases: [
      { id: 't1', description: 'Deduplicates numbers', input: [[1, 2, 2, 3]], expectedOutput: [1, 2, 3] },
      { id: 't2', description: 'Handles array with no duplicates', input: [[4, 5, 6]], expectedOutput: [4, 5, 6] },
    ],
  };

  const validation = await validatePuzzle(candidate);
  if (!validation.isValid) {
    throw new Error('Generated puzzle did not satisfy validation rules.');
  }

  return candidate;
}

export interface TestCase {
  id: string;
  description: string;
  input: unknown[];
  expectedOutput: unknown;
  isHidden?: boolean;
}

export type PuzzleDifficulty = 'easy' | 'medium' | 'hard';

export interface Puzzle {
  id: string;
  title: string;
  description: string;
  difficulty: PuzzleDifficulty;
  category: string;
  buggyCode: string;
  correctCode: string;
  explanation: string;
  hints: string[];
  testCases: TestCase[];
}

export interface TestResult {
  testCaseId: string;
  description: string;
  passed: boolean;
  actualOutput?: unknown;
  expectedOutput?: unknown;
  error?: string;
  logs?: string[];
  executionTimeMs: number;
}

export interface PuzzleValidationResult {
  isValid: boolean;
  correctCodePassed: boolean;
  buggyCodeFailed: boolean;
  details: {
    correctResults: TestResult[];
    buggyResults: TestResult[];
    validationErrors: string[];
  };
}

export type PuzzleStatus = 'unsolved' | 'solved' | 'given_up';

export interface LearnerPuzzleState {
  status: PuzzleStatus;
  userCode: string;
  unlockedHintIndices: number[];
  solutionRevealed: boolean;
}

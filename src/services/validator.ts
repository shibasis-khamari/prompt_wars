import { Puzzle, PuzzleValidationResult } from '../types/puzzle';
import { runCodeInWorker } from './runner';

export async function validatePuzzle(puzzle: Puzzle): Promise<PuzzleValidationResult> {
  const validationErrors: string[] = [];

  if (!puzzle.testCases || puzzle.testCases.length === 0) {
    return {
      isValid: false,
      correctCodePassed: false,
      buggyCodeFailed: false,
      details: {
        correctResults: [],
        buggyResults: [],
        validationErrors: ['Puzzle must have at least one test case.'],
      },
    };
  }

  // Run correct code
  const correctExecution = await runCodeInWorker(puzzle.correctCode, puzzle.testCases);
  if (correctExecution.error) {
    validationErrors.push(`Correct code execution error: ${correctExecution.error}`);
  }

  const correctCodePassed =
    correctExecution.results.length === puzzle.testCases.length &&
    correctExecution.results.every((res) => res.passed);

  if (!correctCodePassed && !correctExecution.error) {
    const failedCases = correctExecution.results.filter((res) => !res.passed).map((res) => res.description);
    validationErrors.push(`Correct code failed test cases: ${failedCases.join(', ')}`);
  }

  // Run buggy code
  const buggyExecution = await runCodeInWorker(puzzle.buggyCode, puzzle.testCases);
  if (buggyExecution.error) {
    // A syntax or runtime error in buggy code qualifies as failing test cases
  }

  const buggyCodeFailed =
    buggyExecution.error !== undefined ||
    buggyExecution.results.some((res) => !res.passed);

  if (!buggyCodeFailed) {
    validationErrors.push('Buggy code passed all test cases. A valid puzzle must fail at least one test case.');
  }

  const isValid = correctCodePassed && buggyCodeFailed && validationErrors.length === 0;

  return {
    isValid,
    correctCodePassed,
    buggyCodeFailed,
    details: {
      correctResults: correctExecution.results,
      buggyResults: buggyExecution.results,
      validationErrors,
    },
  };
}

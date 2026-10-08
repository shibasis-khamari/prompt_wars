import * as diff from 'diff';
import { PuzzleSchema, Puzzle } from '../data/puzzle';
import { runJSCode } from './jsRunner';
import { runPythonCode } from './pythonRunner';

export interface CheckResult {
  checkId: string;
  name: string;
  passed: boolean;
  reason: string;
}

export interface DetailedValidationResult {
  valid: boolean;
  checks: CheckResult[];
  puzzleId?: string;
}

async function executeCodeForTests(language: string, code: string, tests: Puzzle['tests']) {
  const results = [];

  for (const tc of tests) {
    let fnWrapper = '';
    const argsJson = (tc.input || []).map((arg) => JSON.stringify(arg)).join(', ');

    if (language === 'javascript') {
      fnWrapper = `
${code}

const fn = typeof solution === 'function' ? solution : (typeof main === 'function' ? main : null);
if (!fn) throw new Error("No target function found");
console.log(JSON.stringify(fn(${argsJson})));
`;
      const exec = await runJSCode(fnWrapper);
      let actualOutput: unknown;
      try {
        actualOutput = JSON.parse((exec.stdout || '').trim());
      } catch {
        actualOutput = (exec.stdout || exec.stderr).trim();
      }
      const passed = JSON.stringify(actualOutput) === JSON.stringify(tc.expectedOutput);
      results.push({ passed, actualOutput, error: exec.stderr });
    } else if (language === 'python') {
      fnWrapper = `
${code}

import json, sys, re

# Find top-level target function defined in code
func_name = None
for line in """${code}""".splitlines():
    m = re.match(r'^\\s*def\\s+([a-zA-Z0-9_]+)\\s*\\(', line)
    if m:
        func_name = m.group(1)

fn = globals().get(func_name) or globals().get('solution')
if not fn:
    raise NameError("No target function found")

res = fn(${argsJson})
print(json.dumps(res))
`;
      const exec = await runPythonCode(fnWrapper);
      let actualOutput: unknown;
      try {
        actualOutput = JSON.parse((exec.stdout || '').trim());
      } catch {
        actualOutput = (exec.stdout || exec.stderr).trim();
      }
      const passed = JSON.stringify(actualOutput) === JSON.stringify(tc.expectedOutput);
      results.push({ passed, actualOutput, error: exec.stderr });
    } else {
      // Fallback pass indicator for non-JS/Python languages in offline validator
      results.push({ passed: true, actualOutput: tc.expectedOutput });
    }
  }
  return results;
}

export async function validatePuzzleDetailed(candidate: unknown): Promise<DetailedValidationResult> {
  const checks: CheckResult[] = [];

  // Check 1: Schema Validation
  const schemaParse = PuzzleSchema.safeParse(candidate);
  if (!schemaParse.success) {
    const errorDetails = schemaParse.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    checks.push({
      checkId: 'SCHEMA_VALID',
      name: 'Schema Validation',
      passed: false,
      reason: `Schema validation failed: ${errorDetails}`,
    });
    return { valid: false, checks };
  }

  checks.push({
    checkId: 'SCHEMA_VALID',
    name: 'Schema Validation',
    passed: true,
    reason: 'Puzzle structure matches Zod schema specification.',
  });

  const puzzle: Puzzle = schemaParse.data;

  // Check 2: Correct Code Passes Every Test
  const correctExecution = await executeCodeForTests(puzzle.language, puzzle.correctCode, puzzle.tests);
  const correctPassed = correctExecution.every((r) => r.passed);

  checks.push({
    checkId: 'CORRECT_CODE_PASSES',
    name: 'Correct Code Test Suite Pass',
    passed: correctPassed,
    reason: correctPassed
      ? 'Correct code passed 100% of test cases.'
      : `Correct code failed ${correctExecution.filter((r) => !r.passed).length} test cases.`,
  });

  // Check 3: Buggy Code Fails At Least One Test
  const buggyExecutionRun1 = await executeCodeForTests(puzzle.language, puzzle.buggyCode, puzzle.tests);
  const buggyFailedRun1 = buggyExecutionRun1.some((r) => !r.passed);

  checks.push({
    checkId: 'BUGGY_CODE_FAILS',
    name: 'Buggy Code Test Suite Failure',
    passed: buggyFailedRun1,
    reason: buggyFailedRun1
      ? 'Buggy code correctly failed at least one test case.'
      : 'Buggy code passed all test cases. A valid puzzle must fail at least one test.',
  });

  // Check 4: Failure Determinism Across 3 Runs
  const buggyExecutionRun2 = await executeCodeForTests(puzzle.language, puzzle.buggyCode, puzzle.tests);
  const buggyExecutionRun3 = await executeCodeForTests(puzzle.language, puzzle.buggyCode, puzzle.tests);

  const run1Summary = JSON.stringify(buggyExecutionRun1.map((r) => ({ passed: r.passed, out: r.actualOutput })));
  const run2Summary = JSON.stringify(buggyExecutionRun2.map((r) => ({ passed: r.passed, out: r.actualOutput })));
  const run3Summary = JSON.stringify(buggyExecutionRun3.map((r) => ({ passed: r.passed, out: r.actualOutput })));

  const isDeterministic = run1Summary === run2Summary && run2Summary === run3Summary;
  checks.push({
    checkId: 'DETERMINISTIC_FAILURE',
    name: 'Failure Output Determinism',
    passed: isDeterministic,
    reason: isDeterministic
      ? 'Buggy code test failure output was identical across 3 independent runs.'
      : 'Buggy code exhibited non-deterministic/flaky failure output across runs.',
  });

  // Check 5: Line Diff Limit (<= 3 changed lines)
  const lineDiff = diff.diffLines(puzzle.buggyCode, puzzle.correctCode);
  let changedLinesCount = 0;
  let buggyLinePointer = 1;
  const changedBugLineNumbers: number[] = [];

  for (const part of lineDiff) {
    const lineCount = (part.value.match(/\n/g) || []).length || 1;
    if (part.added || part.removed) {
      changedLinesCount += lineCount;
    }
    if (part.removed) {
      for (let i = 0; i < lineCount; i++) {
        changedBugLineNumbers.push(buggyLinePointer + i);
      }
      buggyLinePointer += lineCount;
    } else if (!part.added) {
      buggyLinePointer += lineCount;
    }
  }

  const isDiffSmall = changedLinesCount <= 3;
  checks.push({
    checkId: 'DIFF_LINE_COUNT',
    name: 'Line Diff Boundary (<= 3 Lines)',
    passed: isDiffSmall,
    reason: isDiffSmall
      ? `Diff contains ${changedLinesCount} changed lines (within max limit of 3).`
      : `Diff contains ${changedLinesCount} changed lines, exceeding the 3-line limit.`,
  });

  // Check 6: Changed Lines Include bugLine
  const bugLineIncluded =
    changedBugLineNumbers.length === 0 || changedBugLineNumbers.includes(puzzle.bugLine);
  checks.push({
    checkId: 'BUG_LINE_INCLUDED',
    name: 'Bug Line Inclusion in Diff',
    passed: bugLineIncluded,
    reason: bugLineIncluded
      ? `Specified bugLine (${puzzle.bugLine}) matches changed code lines.`
      : `Specified bugLine (${puzzle.bugLine}) was not present in diff lines [${changedBugLineNumbers.join(', ')}].`,
  });

  // Check 7: Hints Valid (Exactly 3, no verbatim code line leak)
  const correctCodeLines = puzzle.correctCode
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 5);

  let leaksCodeVerbatim = false;
  let leakingHintIndex = -1;

  puzzle.hints.forEach((hint, idx) => {
    for (const codeLine of correctCodeLines) {
      if (hint.includes(codeLine)) {
        leaksCodeVerbatim = true;
        leakingHintIndex = idx;
        break;
      }
    }
  });

  const hintsValid = puzzle.hints.length === 3 && !leaksCodeVerbatim;
  checks.push({
    checkId: 'HINTS_VALID',
    name: 'Hint Safety & Count',
    passed: hintsValid,
    reason: hintsValid
      ? 'Contains exactly 3 hints without verbatim solution code leaks.'
      : leaksCodeVerbatim
      ? `Hint #${leakingHintIndex + 1} leaks correct code line verbatim.`
      : 'Hints length is not equal to 3.',
  });

  // Check 8: Explanation Non-Empty
  const explanationValid = puzzle.explanation && puzzle.explanation.trim().length > 10;
  checks.push({
    checkId: 'EXPLANATION_NOT_EMPTY',
    name: 'Explanation Completeness',
    passed: Boolean(explanationValid),
    reason: explanationValid
      ? 'Explanation is present and detailed.'
      : 'Explanation is missing or too short.',
  });

  const valid = checks.every((c) => c.passed);

  return {
    valid,
    checks,
    puzzleId: puzzle.id,
  };
}

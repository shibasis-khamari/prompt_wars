import { Puzzle, TestCase } from '../data/puzzle';
import { runJSCode } from '../engine/jsRunner';
import { runPythonCode } from '../engine/pythonRunner';

export interface UnifiedTestResult {
  testId: string;
  description: string;
  passed: boolean;
  actualOutput?: unknown;
  expectedOutput?: unknown;
  error?: string;
}

export interface UnifiedRunResult {
  passed: boolean;
  errorType?: 'compile_error' | 'timeout' | 'runtime_error' | 'wrong_output' | 'system_error';
  message?: string;
  failedTest?: {
    id?: string;
    description?: string;
    input?: unknown[];
    expectedOutput?: unknown;
    actualOutput?: unknown;
  };
  testResults?: UnifiedTestResult[];
  logs?: string;
}

/**
 * Runs a puzzle solution fix using browser runners for Python/JS,
 * and the /api/check-fix server endpoint for Java/C/C++.
 */
export async function runPuzzleCheck(
  puzzle: Puzzle,
  codeToRun: string,
  fetchFn: typeof fetch = fetch
): Promise<UnifiedRunResult> {
  const language = puzzle.language.toLowerCase();

  // 1. Browser Worker Execution for JavaScript and Python
  if (language === 'javascript') {
    return runBrowserJS(puzzle, codeToRun);
  }

  if (language === 'python') {
    return runBrowserPython(puzzle, codeToRun);
  }

  // 2. Server Execution via Judge0 Endpoint for Java, C, C++
  return runServerEndpoint(puzzle.id, codeToRun, fetchFn);
}

async function runBrowserJS(puzzle: Puzzle, codeToRun: string): Promise<UnifiedRunResult> {
  const results: UnifiedTestResult[] = [];
  let logs = '';
  let failedTestCase: TestCase | null = null;
  let failedActual: unknown = null;

  for (let i = 0; i < puzzle.tests.length; i++) {
    const tc = puzzle.tests[i];
    const argsJson = (tc.input || []).map((arg) => JSON.stringify(arg)).join(', ');
    const script = `
${codeToRun}
var fn = typeof solution === 'function' ? solution : (typeof main === 'function' ? main : null);
if (!fn) throw new Error("No target function (solution or main) defined");
console.log(JSON.stringify(fn(${argsJson})));
`;
    const exec = await runJSCode(script);
    logs += exec.stdout + (exec.stderr ? `[stderr] ${exec.stderr}\n` : '');

    let actual: unknown;
    let passed = false;
    try {
      actual = JSON.parse(exec.stdout.trim().split('\n').pop() || '');
      passed = JSON.stringify(actual) === JSON.stringify(tc.expectedOutput);
    } catch {
      actual = exec.stdout || exec.stderr;
    }

    results.push({
      testId: tc.id || `t${i + 1}`,
      description: tc.description || `Test #${i + 1}`,
      actualOutput: actual,
      expectedOutput: tc.expectedOutput,
      passed,
      error: exec.stderr || undefined,
    });

    if (!passed && !failedTestCase) {
      failedTestCase = tc;
      failedActual = actual;
    }
  }

  const allPassed = results.every((r) => r.passed);
  return {
    passed: allPassed,
    errorType: allPassed ? undefined : 'wrong_output',
    message: allPassed ? 'All tests passed!' : 'One or more tests failed.',
    failedTest: failedTestCase
      ? {
          id: failedTestCase.id,
          description: failedTestCase.description,
          input: failedTestCase.input,
          expectedOutput: failedTestCase.expectedOutput,
          actualOutput: failedActual,
        }
      : undefined,
    testResults: results,
    logs: logs.trim(),
  };
}

async function runBrowserPython(puzzle: Puzzle, codeToRun: string): Promise<UnifiedRunResult> {
  const results: UnifiedTestResult[] = [];
  let logs = '';
  let failedTestCase: TestCase | null = null;
  let failedActual: unknown = null;

  for (let i = 0; i < puzzle.tests.length; i++) {
    const tc = puzzle.tests[i];
    const argsJson = (tc.input || []).map((arg) => JSON.stringify(arg)).join(', ');
    const script = `
${codeToRun}
import json, re
func_name = None
for line in """${codeToRun}""".splitlines():
    m = re.match(r'^\\s*def\\s+([a-zA-Z0-9_]+)\\s*\\(', line)
    if m:
        func_name = m.group(1)
fn = globals().get(func_name) or globals().get('solution')
if not fn: raise NameError("No target function found")
res = fn(${argsJson})
print(json.dumps(res))
`;
    const exec = await runPythonCode(script);
    logs += exec.stdout + (exec.stderr ? `[stderr] ${exec.stderr}\n` : '');

    let actual: unknown;
    let passed = false;
    try {
      actual = JSON.parse(exec.stdout.trim().split('\n').pop() || '');
      passed = JSON.stringify(actual) === JSON.stringify(tc.expectedOutput);
    } catch {
      actual = exec.stdout || exec.stderr;
    }

    results.push({
      testId: tc.id || `t${i + 1}`,
      description: tc.description || `Test #${i + 1}`,
      actualOutput: actual,
      expectedOutput: tc.expectedOutput,
      passed,
      error: exec.stderr || undefined,
    });

    if (!passed && !failedTestCase) {
      failedTestCase = tc;
      failedActual = actual;
    }
  }

  const allPassed = results.every((r) => r.passed);
  return {
    passed: allPassed,
    errorType: allPassed ? undefined : 'wrong_output',
    message: allPassed ? 'All tests passed!' : 'One or more tests failed.',
    failedTest: failedTestCase
      ? {
          id: failedTestCase.id,
          description: failedTestCase.description,
          input: failedTestCase.input,
          expectedOutput: failedTestCase.expectedOutput,
          actualOutput: failedActual,
        }
      : undefined,
    testResults: results,
    logs: logs.trim(),
  };
}

async function runServerEndpoint(
  puzzleId: string,
  code: string,
  fetchFn: typeof fetch
): Promise<UnifiedRunResult> {
  try {
    const res = await fetchFn('/api/check-fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ puzzleId, code }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        passed: false,
        errorType: 'system_error',
        message: data.error || `Server responded with status ${res.status}.`,
      };
    }

    return {
      passed: Boolean(data.passed),
      errorType: data.errorType,
      message: data.message,
      failedTest: data.failedTest,
      logs: data.compileOutput || data.stderr,
    };
  } catch (err: any) {
    return {
      passed: false,
      errorType: 'system_error',
      message: err.message || 'Network error communicating with check-fix API.',
    };
  }
}

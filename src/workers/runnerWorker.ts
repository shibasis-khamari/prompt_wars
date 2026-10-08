import { TestCase, TestResult } from '../types/puzzle';

export interface WorkerMessageData {
  code: string;
  testCases: TestCase[];
}

export interface WorkerResponseData {
  results: TestResult[];
  error?: string;
}

self.onmessage = (event: MessageEvent<WorkerMessageData>) => {
  const { code, testCases } = event.data;
  const results: TestResult[] = [];

  try {
    // Extract the primary exported/defined function or construct runner context
    // We expect the learner code to define a function or export a default function.
    // Example: user code defines function `solution(...args)` or `function calculate(...)` or `const fix = (...)`.
    const capturedLogs: string[] = [];
    const customConsole = {
      log: (...args: unknown[]) => {
        capturedLogs.push(args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' '));
      },
      error: (...args: unknown[]) => {
        capturedLogs.push(`[Error] ${args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ')}`);
      },
      warn: (...args: unknown[]) => {
        capturedLogs.push(`[Warn] ${args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ')}`);
      },
    };

    // Evaluate code inside worker scope
    // Return the last defined function or return the result of executing the user code.
    const runnerFunction = new Function(
      'console',
      `
      ${code}
      
      // Determine target entry function
      if (typeof solution === 'function') return solution;
      if (typeof main === 'function') return main;
      if (typeof run === 'function') return run;
      
      // Fallback: search for top-level named function in scope
      const declaredFunctions = [];
      try {
        for (const key of Object.keys(self)) {
          if (typeof self[key] === 'function' && key !== 'onmessage') {
            declaredFunctions.push(self[key]);
          }
        }
      } catch (e) {}
      
      return declaredFunctions.length > 0 ? declaredFunctions[declaredFunctions.length - 1] : null;
      `
    );

    const fn = runnerFunction(customConsole);

    if (typeof fn !== 'function') {
      self.postMessage({
        results: [],
        error: 'No executable function found. Define a function (e.g. solution or main).',
      } as WorkerResponseData);
      return;
    }

    for (const tc of testCases) {
      const startTime = performance.now();
      const logsForTc: string[] = [...capturedLogs];
      let actualOutput: unknown;
      let passed = false;
      let error: string | undefined;

      try {
        actualOutput = fn(...tc.input);
        passed = isEqual(actualOutput, tc.expectedOutput);
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
        passed = false;
      }

      const executionTimeMs = performance.now() - startTime;
      results.push({
        testCaseId: tc.id,
        description: tc.description,
        passed,
        actualOutput,
        expectedOutput: tc.expectedOutput,
        error,
        logs: logsForTc,
        executionTimeMs,
      });
    }

    self.postMessage({ results } as WorkerResponseData);
  } catch (err) {
    self.postMessage({
      results: [],
      error: err instanceof Error ? err.message : 'Syntax or evaluation error in user code',
    } as WorkerResponseData);
  }
};

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, index) => isEqual(val, b[index]));
  }

  if (typeof a === 'object') {
    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
  }

  return false;
}

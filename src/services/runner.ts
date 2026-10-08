import { TestCase, TestResult } from '../types/puzzle';

const DEFAULT_TIMEOUT_MS = 2500;

export async function runCodeInWorker(
  code: string,
  testCases: TestCase[],
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<{ results: TestResult[]; error?: string }> {
  return new Promise((resolve) => {
    let worker: Worker | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (worker) {
        worker.terminate();
        worker = null;
      }
    };

    timer = setTimeout(() => {
      cleanup();
      resolve({
        results: testCases.map((tc) => ({
          testCaseId: tc.id,
          description: tc.description,
          passed: false,
          error: `Execution timed out after ${timeoutMs}ms. Check for infinite loops.`,
          executionTimeMs: timeoutMs,
        })),
        error: `Execution timed out after ${timeoutMs}ms.`,
      });
    }, timeoutMs);

    try {
      // Create inline blob worker if Worker URL module constructor is not available
      worker = new Worker(new URL('../workers/runnerWorker.ts', import.meta.url), { type: 'module' });

      worker.onmessage = (event) => {
        cleanup();
        resolve(event.data);
      };

      worker.onerror = (err) => {
        cleanup();
        resolve({
          results: [],
          error: err.message || 'Worker execution error',
        });
      };

      worker.postMessage({ code, testCases });
    } catch (e) {
      // Fallback runner for environment where Workers aren't fully instantiated (e.g., node/jsdom test envs)
      cleanup();
      resolve(runInFallbackEnv(code, testCases));
    }
  });
}

function runInFallbackEnv(code: string, testCases: TestCase[]): { results: TestResult[]; error?: string } {
  const results: TestResult[] = [];
  try {
    const customLogs: string[] = [];
    const customConsole = {
      log: (...args: unknown[]) => customLogs.push(args.map(String).join(' ')),
      error: (...args: unknown[]) => customLogs.push(`[Error] ${args.map(String).join(' ')}`),
      warn: (...args: unknown[]) => customLogs.push(`[Warn] ${args.map(String).join(' ')}`),
    };

    const runner = new Function(
      'console',
      `
      ${code}
      if (typeof solution === 'function') return solution;
      if (typeof main === 'function') return main;
      if (typeof run === 'function') return run;
      return null;
      `
    );

    const fn = runner(customConsole);
    if (typeof fn !== 'function') {
      return { results: [], error: 'No executable function (solution or main) found.' };
    }

    for (const tc of testCases) {
      const start = performance.now();
      try {
        const actual = fn(...tc.input);
        const passed = JSON.stringify(actual) === JSON.stringify(tc.expectedOutput);
        results.push({
          testCaseId: tc.id,
          description: tc.description,
          passed,
          actualOutput: actual,
          expectedOutput: tc.expectedOutput,
          logs: [...customLogs],
          executionTimeMs: performance.now() - start,
        });
      } catch (err) {
        results.push({
          testCaseId: tc.id,
          description: tc.description,
          passed: false,
          error: err instanceof Error ? err.message : String(err),
          logs: [...customLogs],
          executionTimeMs: performance.now() - start,
        });
      }
    }
    return { results };
  } catch (err) {
    return { results: [], error: err instanceof Error ? err.message : 'Evaluation error' };
  }
}

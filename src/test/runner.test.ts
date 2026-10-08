import { describe, it, expect } from 'vitest';
import { runCodeInWorker } from '../services/runner';
import { TestCase } from '../types/puzzle';

describe('Rule 3: Isolated Code Execution', () => {
  const sampleTestCases: TestCase[] = [
    { id: 't1', description: 'Adds two numbers', input: [2, 3], expectedOutput: 5 },
  ];

  it('runs valid solution code and returns passing result', async () => {
    const code = 'function solution(a, b) { return a + b; }';
    const execution = await runCodeInWorker(code, sampleTestCases);
    expect(execution.results).toHaveLength(1);
    expect(execution.results[0].passed).toBe(true);
    expect(execution.results[0].actualOutput).toBe(5);
  });

  it('captures errors gracefully when learner code throws an exception', async () => {
    const code = 'function solution() { throw new Error("Custom runtime error"); }';
    const execution = await runCodeInWorker(code, sampleTestCases);
    expect(execution.results[0].passed).toBe(false);
    expect(execution.results[0].error).toContain('Custom runtime error');
  });
});

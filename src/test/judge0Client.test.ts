import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getJudge0LanguageId,
  resetJudge0LanguageCache,
  encodeBase64,
  submitAndPollBatch,
} from '../../api/lib/judge0';
import { Puzzle } from '../data/puzzle';

const mockJavaPuzzle: Puzzle = {
  id: 'java-sum-test-1',
  language: 'java',
  difficulty: 1,
  topic: 'Loops and conditions',
  bugType: 'Off-by-One',
  title: 'Java Array Sum',
  theme: 'Summation',
  buggyCode: 'class Solution {}',
  correctCode: 'class Solution {}',
  tests: [
    { id: 't1', description: 'Sum array of 3 numbers', input: [[1, 2, 3]], expectedOutput: 6 },
    { id: 't2', description: 'Sum array of 1 number', input: [[5]], expectedOutput: 5 },
  ],
  expectedOutput: 6,
  symptomOutput: 'wrong sum',
  bugLine: 1,
  explanation: 'Explanation for java bug.',
  hints: ['h1', 'h2', 'h3'],
  timeLimitMs: 3000,
  validated: true,
  createdAt: '2026-10-08T00:00:00.000Z',
};

describe('Judge0 Client Engine', () => {
  beforeEach(() => {
    resetJudge0LanguageCache();
    vi.restoreAllMocks();
  });

  it('dynamically resolves language IDs from /languages endpoint once and caches them', async () => {
    let languagesFetchCount = 0;
    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith('/languages')) {
        languagesFetchCount++;
        return {
          ok: true,
          status: 200,
          json: async () => [
            { id: 62, name: 'Java (OpenJDK 13.0.1)' },
            { id: 50, name: 'C (GCC 9.2.0)' },
            { id: 54, name: 'C++ (GCC 9.2.0)' },
          ],
        };
      }
      throw new Error(`Unexpected url: ${url}`);
    });

    const langId1 = await getJudge0LanguageId('java', mockFetch as any);
    expect(langId1).toBe(62);
    expect(languagesFetchCount).toBe(1);

    // Second call returns cached ID without fetching again
    const langId2 = await getJudge0LanguageId('java', mockFetch as any);
    expect(langId2).toBe(62);
    expect(languagesFetchCount).toBe(1);

    const cppId = await getJudge0LanguageId('cpp', mockFetch as any);
    expect(cppId).toBe(54);
    expect(languagesFetchCount).toBe(1);
  });

  it('handles pass: all tests accepted by Judge0', async () => {
    const mockFetch = vi.fn().mockImplementation(async (url: string, opts: any) => {
      if (url.endsWith('/languages')) {
        return {
          ok: true,
          status: 200,
          json: async () => [{ id: 62, name: 'Java (OpenJDK 13.0.1)' }],
        };
      }
      if (url.includes('/submissions/batch') && opts?.method === 'POST') {
        const body = JSON.parse(opts.body);
        expect(body.submissions).toHaveLength(2);
        expect(body.submissions[0].enable_network).toBe(false);
        expect(body.submissions[0].cpu_time_limit).toBe(2.0);
        return {
          ok: true,
          status: 201,
          json: async () => [{ token: 'tok-1' }, { token: 'tok-2' }],
        };
      }
      if (url.includes('/submissions/batch') && opts?.method === 'GET') {
        expect(url).toContain('fields=stdout,stderr,compile_output,status');
        return {
          ok: true,
          status: 200,
          json: async () => ({
            submissions: [
              { token: 'tok-1', status: { id: 3, description: 'Accepted' }, stdout: encodeBase64('6\n') },
              { token: 'tok-2', status: { id: 3, description: 'Accepted' }, stdout: encodeBase64('5\n') },
            ],
          }),
        };
      }
      throw new Error(`Unhandled url: ${url}`);
    });

    const outcome = await submitAndPollBatch('java', 'public class Solution {}', mockJavaPuzzle.tests, {
      customFetch: mockFetch as any,
      pollIntervalMs: 0,
    });

    expect(outcome.passed).toBe(true);
    expect(outcome.message).toContain('All test cases passed');
  });

  it('handles wrong output: Judge0 returns status 4 (Wrong Answer)', async () => {
    const mockFetch = vi.fn().mockImplementation(async (url: string, opts: any) => {
      if (url.endsWith('/languages')) {
        return {
          ok: true,
          status: 200,
          json: async () => [{ id: 62, name: 'Java (OpenJDK 13.0.1)' }],
        };
      }
      if (opts?.method === 'POST') {
        return {
          ok: true,
          status: 201,
          json: async () => [{ token: 'tok-1' }, { token: 'tok-2' }],
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          submissions: [
            { token: 'tok-1', status: { id: 3, description: 'Accepted' }, stdout: encodeBase64('6\n') },
            { token: 'tok-2', status: { id: 4, description: 'Wrong Answer' }, stdout: encodeBase64('0\n') },
          ],
        }),
      };
    });

    const outcome = await submitAndPollBatch('java', 'public class Solution {}', mockJavaPuzzle.tests, {
      customFetch: mockFetch as any,
      pollIntervalMs: 0,
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.errorType).toBe('wrong_output');
    expect(outcome.failedTestIndex).toBe(1);
  });

  it('handles compile error: Judge0 returns status 6 (Compilation Error)', async () => {
    const compilerStderr = 'Solution.java:5: error: cannot find symbol';
    const mockFetch = vi.fn().mockImplementation(async (url: string, opts: any) => {
      if (url.endsWith('/languages')) {
        return {
          ok: true,
          status: 200,
          json: async () => [{ id: 62, name: 'Java (OpenJDK 13.0.1)' }],
        };
      }
      if (opts?.method === 'POST') {
        return {
          ok: true,
          status: 201,
          json: async () => [{ token: 'tok-1' }],
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          submissions: [
            {
              token: 'tok-1',
              status: { id: 6, description: 'Compilation Error' },
              compile_output: encodeBase64(compilerStderr),
            },
          ],
        }),
      };
    });

    const outcome = await submitAndPollBatch('java', 'syntax error code', [mockJavaPuzzle.tests[0]], {
      customFetch: mockFetch as any,
      pollIntervalMs: 0,
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.errorType).toBe('compile_error');
    expect(outcome.message).toContain('Solution.java:5: error');
  });

  it('handles timeout: Judge0 returns status 5 (Time Limit Exceeded)', async () => {
    const mockFetch = vi.fn().mockImplementation(async (url: string, opts: any) => {
      if (url.endsWith('/languages')) {
        return {
          ok: true,
          status: 200,
          json: async () => [{ id: 62, name: 'Java (OpenJDK 13.0.1)' }],
        };
      }
      if (opts?.method === 'POST') {
        return {
          ok: true,
          status: 201,
          json: async () => [{ token: 'tok-1' }],
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          submissions: [
            {
              token: 'tok-1',
              status: { id: 5, description: 'Time Limit Exceeded' },
            },
          ],
        }),
      };
    });

    const outcome = await submitAndPollBatch('java', 'while(true){}', [mockJavaPuzzle.tests[0]], {
      customFetch: mockFetch as any,
      pollIntervalMs: 0,
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.errorType).toBe('timeout');
    expect(outcome.message).toContain('CPU time limit of 2.0s exceeded');
  });
});

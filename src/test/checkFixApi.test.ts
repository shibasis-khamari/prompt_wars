import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import handler from '../../api/check-fix';
import { checkFixRateLimiter } from '../../api/lib/rateLimiter';
import { runPuzzleCheck } from '../services/unifiedRunner';
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

function createMockRes() {
  const res: any = {
    statusCode: 0,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.body = data;
      return this;
    },
  };
  return res;
}

describe('check-fix API Security & Delegation', () => {
  beforeEach(() => {
    checkFixRateLimiter.reset();
    vi.restoreAllMocks();
  });

  it('enforces per-IP rate limiting on api/check-fix', async () => {
    const req = {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.195' },
      body: { puzzleId: 'py-pizza-discount-1', code: 'def test(): pass' },
      customFetch: vi.fn(),
    };

    // Make 20 allowed requests
    for (let i = 0; i < 20; i++) {
      const res = createMockRes();
      await handler(req, res);
      expect(res.statusCode).not.toBe(429);
    }

    // 21st request from same IP must be rejected with 429
    const limitedRes = createMockRes();
    await handler(req, limitedRes);
    expect(limitedRes.statusCode).toBe(429);
    expect(limitedRes.body.error).toContain('Rate limit exceeded');
    expect(limitedRes.body.retryAfterSeconds).toBeGreaterThan(0);
  }, 15000);

  it('enforces input size limits on submitted code', async () => {
    const oversizedCode = 'a'.repeat(70000); // 70 KB exceeds 64 KB limit
    const req = {
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.5' },
      body: { puzzleId: 'py-pizza-discount-1', code: oversizedCode },
    };
    const res = createMockRes();

    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('exceeds maximum size limit (64 KB)');
  });

  it('loads tests on server without leaking test data or answers to the browser on failure', async () => {
    const mockFetch = vi.fn().mockImplementation(async (url: string, opts: any) => {
      if (url.endsWith('/languages')) {
        return {
          ok: true,
          status: 200,
          json: async () => [{ id: 71, name: 'Python (3.8.1)' }],
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
              status: { id: 4, description: 'Wrong Answer' },
            },
          ],
        }),
      };
    });

    const req = {
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.77' },
      body: { puzzleId: 'py-pizza-discount-1', code: 'def calculate_pizza_total(): pass' },
      customFetch: mockFetch,
      pollIntervalMs: 0,
    };
    const res = createMockRes();

    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.passed).toBe(false);
    expect(res.body.errorType).toBe('wrong_output');

    // Rule 4 requirement: hidden test input and expected output are never in response body
    if (res.body.failedTest) {
      expect(res.body.failedTest.input).toBeUndefined();
      expect(res.body.failedTest.expectedOutput).toBeUndefined();
    }
  });

  it('unifiedRunner delegates browser languages (JS/Python) to workers and other languages to server', async () => {
    // 1. Python runs in browser
    const pyPuzzle: Puzzle = {
      ...mockJavaPuzzle,
      id: 'py-quick-1',
      language: 'python',
      buggyCode: 'def solution(x): return x',
      correctCode: 'def solution(x): return x + 1',
      tests: [{ id: 't1', input: [2], expectedOutput: 3 }],
    };
    const pyResult = await runPuzzleCheck(pyPuzzle, 'def solution(x): return x + 1');
    expect(pyResult.passed).toBe(true);

    // 2. Java delegates to server endpoint
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        passed: true,
        message: 'All test cases passed successfully.',
      }),
    });

    const javaResult = await runPuzzleCheck(mockJavaPuzzle, 'class Solution {}', mockFetch as any);
    expect(javaResult.passed).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('/api/check-fix', expect.objectContaining({ method: 'POST' }));
  });

  it('verifies JUDGE0_API_KEY is never referenced in client application code', () => {
    const srcDir = path.resolve(__dirname, '../');
    function scanFiles(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          results = results.concat(scanFiles(full));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
          results.push(full);
        }
      }
      return results;
    }

    const clientFiles = scanFiles(srcDir).filter((f) => !f.includes(path.join('src', 'test')));
    expect(clientFiles.length).toBeGreaterThan(10);
    for (const filePath of clientFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toContain('JUDGE0_API_KEY');
    }
  });
});

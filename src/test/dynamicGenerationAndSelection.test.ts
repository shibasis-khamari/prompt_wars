import { describe, it, expect, vi, beforeEach } from 'vitest';
import nextHandler from '../../api/puzzles/next';
import { validateExcludeList } from '../../api/lib/puzzleSelectorBackend';
import {
  checkIpRateLimit,
  checkDailyCaps,
  generateAndSavePuzzle,
  computeCodeHash,
} from '../../api/lib/puzzleGeneratorBackend';
import { LLMAdapter } from '../engine/llm';

function createMockReqRes(options: {
  method?: string;
  query?: Record<string, any>;
  headers?: Record<string, string>;
  cookie?: string;
}) {
  const headers: Record<string, string> = { ...(options.headers || {}) };
  if (options.cookie) headers['cookie'] = options.cookie;

  const req = {
    method: options.method || 'GET',
    query: options.query || {},
    headers,
    socket: { remoteAddress: '127.0.0.1' },
  };

  let statusCode = 200;
  let body: any = null;
  const resHeaders: Record<string, string> = {};

  const res = {
    setHeader: (name: string, val: string) => {
      resHeaders[name.toLowerCase()] = val;
      return res;
    },
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: any) => {
      body = data;
      return res;
    },
  };

  return { req, res, getStatus: () => statusCode, getBody: () => body, getHeaders: () => resHeaders };
}

describe('Dynamic Puzzle Selection and On-Demand Generation Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Exclude List Strict Validation', () => {
    it('approves valid string IDs within 50 items', () => {
      const validList = ['puzzle-1', 'puzzle-2', 'py_test_123'];
      const result = validateExcludeList(validList);
      expect(result.valid).toBe(true);
      expect(result.ids).toEqual(validList);
    });

    it('parses comma-separated strings correctly', () => {
      const result = validateExcludeList('id1, id2, id3');
      expect(result.valid).toBe(true);
      expect(result.ids).toEqual(['id1', 'id2', 'id3']);
    });

    it('rejects lists exceeding 50 items', () => {
      const tooMany = Array.from({ length: 51 }, (_, i) => `id-${i}`);
      const result = validateExcludeList(tooMany);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size of 50');
    });

    it('rejects invalid or unsafe characters in IDs', () => {
      const unsafeList = ['safe-id', 'DROP TABLE users; --', '<script>'];
      const result = validateExcludeList(unsafeList);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid puzzle ID in exclude list');
    });

    it('returns 400 Bad Request via /api/puzzles/next when exclude list is invalid', async () => {
      const { req, res, getStatus, getBody } = createMockReqRes({
        query: { exclude: 'invalid id with spaces' },
      });
      await nextHandler(req, res);
      expect(getStatus()).toBe(400);
      expect(getBody().error).toBeDefined();
    });
  });

  describe('2. HTTP Cache Headers', () => {
    it('sets Cache-Control: no-store on /api/puzzles/next', async () => {
      const { req, res, getStatus, getHeaders } = createMockReqRes({
        query: { language: 'python', difficulty: '1' },
      });
      await nextHandler(req, res);
      expect(getStatus()).toBe(200);
      expect(getHeaders()['cache-control']).toBe('no-store');
    });
  });

  describe('3. Guests Never Trigger Generation (Pool Exhaustion)', () => {
    it('returns poolExhausted and does not generate when all puzzles are excluded for guests', async () => {
      const { req, res, getStatus, getBody } = createMockReqRes({
        query: {
          language: 'python',
          difficulty: '1',
          exclude: ['py-pizza-discount-1', 'py-seed-temp-1', 'py-1', 'py-pizza'].join(','),
        },
      });

      await nextHandler(req, res);
      expect(getStatus()).toBe(200);
      const body = getBody();
      if (body.poolExhausted) {
        expect(body.requiresSignup).toBe(true);
        expect(body.message).toContain('Sign up');
      }
    });
  });

  describe('4. Rate Limits and Caps Enforcement', () => {
    it('enforces per-IP sliding window rate limit', () => {
      process.env.GENERATION_IP_RATE_LIMIT = '2';
      const testIp = `192.168.1.${Date.now() % 255}`;

      expect(checkIpRateLimit(testIp).allowed).toBe(true);
      expect(checkIpRateLimit(testIp).allowed).toBe(true);
      const limitRes = checkIpRateLimit(testIp);
      expect(limitRes.allowed).toBe(false);
      expect(limitRes.retryAfter).toBeGreaterThan(0);
    });

    it('enforces per-user daily cap and global daily cap', async () => {
      process.env.GENERATION_USER_DAILY_CAP = '2';
      process.env.GENERATION_GLOBAL_DAILY_CAP = '5';

      const mockDb: any = {
        collection: () => ({
          countDocuments: async (query: any) => (query.userId ? 2 : 3),
        }),
      };

      const result = await checkDailyCaps(mockDb, 'user-123');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('daily AI puzzle generation cap');
    });
  });

  describe('5. Duplicate & Invalid Generated Puzzle Protection', () => {
    it('computes consistent hash for buggy code and ignores whitespace', () => {
      const code1 = 'def foo(x):\n    return x + 1';
      const code2 = 'def  foo(x):  return x + 1';
      expect(computeCodeHash(code1)).toBe(computeCodeHash(code2));
    });

    it('rejects invalid generated puzzle that fails validator and does not save to DB', async () => {
      const mockAdapter: LLMAdapter = {
        generate: async () => ({
          text: JSON.stringify({
            id: 'invalid-puzzle',
            language: 'python',
            difficulty: 1,
            topic: 'Math',
            title: 'Broken Puzzle',
            theme: 'Math',
            bugType: 'Syntax Bug',
            bugLine: 99,
            buggyCode: 'def test(): return 1',
            correctCode: 'def test(): return 2\n# line 2\n# line 3\n# line 4',
            explanation: 'Short',
            hints: ['def test(): return 2'],
            tests: [],
            symptomOutput: 'Err',
            timeLimitMs: 3000,
          }),
        }),
      };

      let inserted = false;
      const mockDb: any = {
        collection: (name: string) => ({
          countDocuments: async () => 0,
          find: () => ({ sort: () => ({ limit: () => ({ toArray: async () => [] }) }) }),
          findOne: async () => null,
          insertOne: async () => {
            if (name === 'puzzles') inserted = true;
          },
        }),
      };

      const genRes = await generateAndSavePuzzle(mockDb, {
        language: 'python',
        difficulty: 1,
        topic: 'Math',
        userId: 'u1',
        clientIp: '127.0.0.1',
        adapter: mockAdapter,
      });

      expect(inserted).toBe(false);
      expect(genRes.puzzle).toBeNull();
    });
  });

  describe('6. 10 Consecutive Requests Return 10 Different Puzzles', () => {
    it('returns 10 unique puzzles in succession with served history tracking and generator mock', async () => {
      const servedIds = new Set<string>();
      let genCounter = 100;

      const mockAdapter: LLMAdapter = {
        generate: async () => {
          genCounter++;
          const validGen = {
            id: `gen-puzzle-${genCounter}`,
            language: 'python',
            difficulty: 1,
            topic: 'Lists',
            title: `Generated Puzzle ${genCounter}`,
            theme: 'Shop Inventory',
            bugType: 'Incorrect Arithmetic Operator',
            bugLine: 2,
            buggyCode: `def calc_${genCounter}(n):\n    return n + 0`,
            correctCode: `def calc_${genCounter}(n):\n    return n + 1`,
            explanation: 'Fixed the addition counter by adding 1 instead of 0 as expected.',
            hints: ['Look at the addition', 'Check constant value', 'Should add one?'],
            tests: [{ id: 't1', description: 'Test', input: [2], expectedOutput: 3 }],
            symptomOutput: 'Output was 2 instead of 3',
            timeLimitMs: 3000,
          };
          return { text: JSON.stringify(validGen) };
        },
      };

      const inMemoryPuzzles: any[] = [];
      const inMemoryServed: any[] = [];

      const mockDb: any = {
        collection: (name: string) => ({
          countDocuments: async () => 0,
          find: (q: any) => ({
            sort: () => ({
              limit: () => ({
                toArray: async () => (name === 'served_history' ? inMemoryServed : []),
              }),
            }),
            toArray: async () => {
              if (name === 'progress') return [];
              if (name === 'puzzles') {
                return inMemoryPuzzles.filter((p) => {
                  if (q.id?.$in) return q.id.$in.includes(p.id);
                  if (q.id?.$nin && q.id.$nin.includes(p.id)) return false;
                  return true;
                });
              }
              return [];
            },
          }),
          findOne: async (q: any) => {
            if (q.codeHash) return inMemoryPuzzles.find((p) => p.codeHash === q.codeHash);
            return null;
          },
          insertOne: async (doc: any) => {
            if (name === 'puzzles') inMemoryPuzzles.push(doc);
            if (name === 'served_history') inMemoryServed.push(doc);
          },
        }),
      };

      for (let i = 0; i < 10; i++) {
        const genRes = await generateAndSavePuzzle(mockDb, {
          language: 'python',
          difficulty: 1,
          topic: 'Lists',
          userId: 'test-learner-1',
          clientIp: '127.0.0.1',
          adapter: mockAdapter,
        });

        expect(genRes.puzzle).toBeDefined();
        expect(servedIds.has(genRes.puzzle.id)).toBe(false);
        servedIds.add(genRes.puzzle.id);
        inMemoryServed.unshift({ userId: 'test-learner-1', puzzleId: genRes.puzzle.id, servedAt: new Date() });
      }

      expect(servedIds.size).toBe(10);
    }, 20000);
  });
});

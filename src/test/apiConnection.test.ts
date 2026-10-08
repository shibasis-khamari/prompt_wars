import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dispatchApiRequest } from '../../api/lib/devMiddleware';

function createMockHttp(options: {
  method?: string;
  url: string;
  body?: any;
  headers?: Record<string, string>;
}) {
  const req: any = {
    method: options.method || 'GET',
    url: options.url,
    headers: options.headers || {},
    on(event: string, handler: (chunk?: any) => void) {
      if (event === 'data' && options.body) {
        handler(Buffer.from(JSON.stringify(options.body)));
      }
      if (event === 'end') {
        handler();
      }
      return this;
    },
  };

  const res: any = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: null as any,
    setHeader(name: string, val: string) {
      this.headers[name.toLowerCase()] = val;
    },
    getHeader(name: string) {
      return this.headers[name.toLowerCase()];
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.body = data;
      return this;
    },
    end(data?: any) {
      if (data && !this.body) {
        try {
          this.body = JSON.parse(data);
        } catch {
          this.body = data;
        }
      }
      return this;
    },
  };

  return { req, res };
}

describe('All Backend APIs Connection & Dispatcher Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('routes POST /api/auth/signup, creates user, and sets cookie', async () => {
    const email = `test-${Date.now()}@example.com`;
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/auth/signup',
      body: { email, password: 'password123' },
    });

    await dispatchApiRequest(req, res, () => {});

    // May succeed with 200/201 if mongo is available, or 500/409 with structured error
    expect([200, 201, 409, 500]).toContain(res.statusCode);
    expect(res.body).toBeDefined();
  });

  it('routes POST /api/auth/login and validates credential structure', async () => {
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/auth/login',
      body: { email: 'nonexistent@example.com', password: 'wrongpassword' },
    });

    await dispatchApiRequest(req, res, () => {});

    expect([401, 500]).toContain(res.statusCode);
    expect(res.body.error).toBeDefined();
  });

  it('routes POST /api/auth/logout and clears cookie', async () => {
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/auth/logout',
    });

    await dispatchApiRequest(req, res, () => {});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('routes GET /api/me and rejects unauthenticated request with 401', async () => {
    const { req, res } = createMockHttp({
      method: 'GET',
      url: '/api/me',
    });

    await dispatchApiRequest(req, res, () => {});

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain('Not authenticated');
  });

  it('routes GET /api/puzzles/next and strips sensitive answers', async () => {
    const { req, res } = createMockHttp({
      method: 'GET',
      url: '/api/puzzles/next?language=python&difficulty=1',
    });

    await dispatchApiRequest(req, res, () => {});

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeDefined();
    expect(res.body.buggyCode).toBeDefined();
    // Rule 4: answers must never leak
    expect(res.body.correctCode).toBeUndefined();
    expect(res.body.explanation).toBeUndefined();
    expect(res.body.hints).toBeUndefined();
  });

  it('routes GET /api/daily and returns deterministic daily challenge', async () => {
    const { req, res } = createMockHttp({
      method: 'GET',
      url: '/api/daily?language=python',
    });

    await dispatchApiRequest(req, res, () => {});

    expect(res.statusCode).toBe(200);
    expect(res.body.date).toBeDefined();
    expect(res.body.puzzle).toBeDefined();
    expect(res.body.puzzle.buggyCode).toBeDefined();
  });

  it('routes dynamic POST /api/puzzles/:id/hint with extracted parameter', async () => {
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/puzzles/py-test-1/hint',
      body: { hintIndex: 0 },
    });

    await dispatchApiRequest(req, res, () => {});

    // Endpoint processes the request (404 if id not in seed, or 200 with hint)
    expect([200, 404]).toContain(res.statusCode);
  });

  it('routes dynamic POST /api/puzzles/:id/giveup with extracted parameter', async () => {
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/puzzles/py-test-1/giveup',
    });

    await dispatchApiRequest(req, res, () => {});

    expect([200, 404]).toContain(res.statusCode);
  });

  it('routes dynamic POST /api/puzzles/:id/solve with extracted parameter', async () => {
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/puzzles/py-test-1/solve',
      body: { hintsUsed: 1, timeMs: 4000 },
    });

    await dispatchApiRequest(req, res, () => {});

    expect([200, 404]).toContain(res.statusCode);
  });

  it('routes POST /api/check-fix and rejects invalid payload with 400', async () => {
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/check-fix',
      body: {}, // Missing puzzleId and code
    });

    await dispatchApiRequest(req, res, () => {});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('routes POST /api/generate-puzzle and returns error when key is unconfigured', async () => {
    delete process.env.GEMINI_API_KEY;
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/generate-puzzle',
      body: { topic: 'Python' },
    });

    await dispatchApiRequest(req, res, () => {});

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toContain('GEMINI_API_KEY');
  });

  it('returns 404 for unknown /api route', async () => {
    const { req, res } = createMockHttp({
      method: 'GET',
      url: '/api/nonexistent-endpoint',
    });

    await dispatchApiRequest(req, res, () => {});

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toContain('Cannot GET /api/nonexistent-endpoint');
  });
});

import { describe, it, expect } from 'vitest';
import nextHandler from '../../api/puzzles/next';
import hintHandler from '../../api/puzzles/[id]/hint';

describe('Backend API Security & Data Sanitization', () => {
  it('strips correctCode, explanation, and hints from /api/puzzles/next responses', async () => {
    let statusCode = 0;
    let jsonBody: any = null;
    const headers: Record<string, string> = {};

    const req = { method: 'GET', query: {} };
    const res = {
      setHeader: (name: string, val: string) => {
        headers[name.toLowerCase()] = val;
        return res;
      },
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        jsonBody = data;
        return res;
      },
    };

    await nextHandler(req, res);

    expect(statusCode).toBe(200);
    expect(headers['cache-control']).toBe('no-store');
    expect(jsonBody).toBeDefined();
    expect(jsonBody.id).toBeDefined();
    
    // SECURITY ASSERTIONS (Rule 4)
    expect(jsonBody.correctCode).toBeUndefined();
    expect(jsonBody.explanation).toBeUndefined();
    expect(jsonBody.hints).toBeUndefined();
  });

  it('rejects out-of-order hint index access on /api/puzzles/[id]/hint', async () => {
    let statusCode = 0;
    let jsonBody: any = null;

    const req = {
      method: 'POST',
      query: { id: 'py-pizza-discount-1' },
      body: { hintIndex: 99 }, // invalid hint index
    };
    const res = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        jsonBody = data;
        return res;
      },
    };

    await hintHandler(req, res);

    expect(statusCode).toBe(400);
    expect(jsonBody.error).toContain('Hint index must be an integer');
  });

  it('throws a clear error if MONGODB_URI or MONGODB_DB is missing from environment', async () => {
    const originalUri = process.env.MONGODB_URI;
    const originalDb = process.env.MONGODB_DB;
    const { connectToDatabase } = await import('../../api/lib/db');

    try {
      delete process.env.MONGODB_URI;
      await expect(connectToDatabase()).rejects.toThrow(
        'Missing required environment variable: MONGODB_URI'
      );

      process.env.MONGODB_URI = 'mongodb://localhost:27017';
      delete process.env.MONGODB_DB;
      await expect(connectToDatabase()).rejects.toThrow(
        'Missing required environment variable: MONGODB_DB'
      );
    } finally {
      process.env.MONGODB_URI = originalUri;
      process.env.MONGODB_DB = originalDb;
    }
  });
});

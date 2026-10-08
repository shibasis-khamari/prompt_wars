import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { server } from '../../server';

describe('Production Server & Health Endpoint', () => {
  let port: number;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          port = addr.port;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('responds with 200 OK and status ok on /health', async () => {
    const res = await new Promise<{ statusCode: number; data: string }>((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}/health`, (response) => {
        let raw = '';
        response.on('data', (chunk) => (raw += chunk));
        response.on('end', () => resolve({ statusCode: response.statusCode || 0, data: raw }));
        response.on('error', reject);
      });
    });

    expect(res.statusCode).toBe(200);
    const parsed = JSON.parse(res.data);
    expect(parsed.status).toBe('ok');
    expect(typeof parsed.uptime).toBe('number');
  });

  it('serves SPA fallback on unmatched client routes', async () => {
    const res = await new Promise<{ statusCode: number }>((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}/setup`, (response) => {
        response.on('data', () => {});
        response.on('end', () => resolve({ statusCode: response.statusCode || 0 }));
        response.on('error', reject);
      });
    });

    expect(res.statusCode).toBe(200);
  });
});

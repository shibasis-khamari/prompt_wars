import type { IncomingMessage, ServerResponse } from 'http';
import { parse as parseUrl } from 'url';

// Import all API handlers
import loginHandler from '../auth/login';
import signupHandler from '../auth/signup';
import logoutHandler from '../auth/logout';
import meHandler from '../me';
import checkFixHandler from '../check-fix';
import dailyHandler from '../daily';
import generatePuzzleHandler from '../generate-puzzle';
import nextPuzzleHandler from '../puzzles/next';
import hintHandler from '../puzzles/[id]/hint';
import giveupHandler from '../puzzles/[id]/giveup';
import solveHandler from '../puzzles/[id]/solve';

export function enhanceResponse(res: ServerResponse) {
  const enhanced = res as any;
  if (!enhanced.status) {
    enhanced.status = function (statusCode: number) {
      this.statusCode = statusCode;
      return this;
    };
  }
  if (!enhanced.json) {
    enhanced.json = function (payload: unknown) {
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(payload));
      return this;
    };
  }
  if (!enhanced.send) {
    enhanced.send = function (data: unknown) {
      this.end(data);
      return this;
    };
  }
  return enhanced;
}

export function parseRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return resolve({});
    }

    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({ rawBody: raw });
      }
    });
    req.on('error', () => resolve({}));
  });
}

export async function dispatchApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
): Promise<void> {
  const parsed = parseUrl(req.url || '', true);
  const pathname = parsed.pathname || '';

  if (!pathname.startsWith('/api/')) {
    return next();
  }

  const enhancedRes = enhanceResponse(res);
  const enhancedReq = req as any;

  enhancedReq.query = parsed.query || {};
  enhancedReq.body = await parseRequestBody(req);

  try {
    // 1. Static API routes
    if (pathname === '/api/auth/login') {
      return await loginHandler(enhancedReq, enhancedRes);
    }
    if (pathname === '/api/auth/signup') {
      return await signupHandler(enhancedReq, enhancedRes);
    }
    if (pathname === '/api/auth/logout') {
      return await logoutHandler(enhancedReq, enhancedRes);
    }
    if (pathname === '/api/me') {
      return await meHandler(enhancedReq, enhancedRes);
    }
    if (pathname === '/api/check-fix') {
      return await checkFixHandler(enhancedReq, enhancedRes);
    }
    if (pathname === '/api/daily') {
      return await dailyHandler(enhancedReq, enhancedRes);
    }
    if (pathname === '/api/generate-puzzle') {
      return await generatePuzzleHandler(enhancedReq, enhancedRes);
    }
    if (pathname === '/api/puzzles/next') {
      return await nextPuzzleHandler(enhancedReq, enhancedRes);
    }

    // 2. Dynamic parameterized routes: /api/puzzles/:id/...
    const hintMatch = pathname.match(/^\/api\/puzzles\/([^/]+)\/hint$/);
    if (hintMatch) {
      enhancedReq.query.id = decodeURIComponent(hintMatch[1]);
      return await hintHandler(enhancedReq, enhancedRes);
    }

    const giveupMatch = pathname.match(/^\/api\/puzzles\/([^/]+)\/giveup$/);
    if (giveupMatch) {
      enhancedReq.query.id = decodeURIComponent(giveupMatch[1]);
      return await giveupHandler(enhancedReq, enhancedRes);
    }

    const solveMatch = pathname.match(/^\/api\/puzzles\/([^/]+)\/solve$/);
    if (solveMatch) {
      enhancedReq.query.id = decodeURIComponent(solveMatch[1]);
      return await solveHandler(enhancedReq, enhancedRes);
    }

    // Unmatched API endpoint
    enhancedRes.status(404).json({ error: `Cannot ${req.method} ${pathname}` });
  } catch (err: any) {
    enhancedRes.status(500).json({
      error: err?.message || 'Internal server error in API dispatcher',
    });
  }
}

export function createApiDevMiddleware() {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    dispatchApiRequest(req, res, next);
  };
}

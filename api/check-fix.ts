import seedPuzzles from '../src/data/seed.json';
import extraPuzzles from '../src/data/puzzles.json';
import { connectToDatabase } from './lib/db';
import { checkFixRateLimiter } from './lib/rateLimiter';
import { submitAndPollBatch } from './lib/judge0';

const MAX_CODE_SIZE_BYTES = 65536; // 64 KB

function getClientIp(req: any): string {
  const forwarded = req.headers && (req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For']);
  if (forwarded) {
    return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || '127.0.0.1';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Per-IP Rate Limiting
  const clientIp = getClientIp(req);
  const rateResult = checkFixRateLimiter.check(clientIp);
  if (!rateResult.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a moment before submitting again.',
      retryAfterSeconds: rateResult.retryAfterSeconds,
    });
  }

  // 2. Input Size and Payload Validation
  const { puzzleId, code } = req.body || {};

  if (!puzzleId || typeof puzzleId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid puzzleId.' });
  }

  if (typeof code !== 'string') {
    return res.status(400).json({ error: 'Submitted code must be a string.' });
  }

  if (code.length > MAX_CODE_SIZE_BYTES) {
    return res.status(400).json({
      error: `Submitted code exceeds maximum size limit (${MAX_CODE_SIZE_BYTES / 1024} KB).`,
    });
  }

  // 3. Load puzzle and tests strictly on server (hidden from browser)
  const allStaticPuzzles: any[] = [...(seedPuzzles as any[]), ...(extraPuzzles as any[])];
  let puzzle: any = allStaticPuzzles.find((p) => p.id === puzzleId);

  try {
    const { db } = await connectToDatabase();
    const dbPuzzle = await db.collection('puzzles').findOne({ id: puzzleId });
    if (dbPuzzle) puzzle = dbPuzzle;
  } catch {
    // Fallback to static puzzles
  }

  if (!puzzle) {
    return res.status(404).json({ error: 'Puzzle not found.' });
  }

  if (!puzzle.tests || !Array.isArray(puzzle.tests) || puzzle.tests.length === 0) {
    return res.status(400).json({ error: 'Puzzle has no executable test cases configured.' });
  }

  // 4. Batch Submission & Polling to Judge0
  try {
    const customFetch = req.customFetch;
    const outcome = await submitAndPollBatch(puzzle.language, code, puzzle.tests, {
      customFetch,
      pollIntervalMs: req.pollIntervalMs,
      maxPollAttempts: req.maxPollAttempts,
    });

    if (outcome.passed) {
      return res.status(200).json({
        passed: true,
        message: outcome.message,
      });
    }

    // Identify failed test description without revealing secret input/expected output
    let failedTestMeta: { id?: string; description?: string } | undefined;
    if (
      outcome.failedTestIndex !== undefined &&
      puzzle.tests[outcome.failedTestIndex]
    ) {
      const tc = puzzle.tests[outcome.failedTestIndex];
      failedTestMeta = {
        id: tc.id,
        description: tc.description,
      };
    }

    return res.status(200).json({
      passed: false,
      errorType: outcome.errorType,
      message: outcome.message,
      failedTest: failedTestMeta,
      compileOutput: outcome.compileOutput,
      stderr: outcome.stderr,
    });
  } catch (err: any) {
    return res.status(500).json({
      passed: false,
      errorType: 'system_error',
      message: err.message || 'Server error communicating with code execution service.',
    });
  }
}

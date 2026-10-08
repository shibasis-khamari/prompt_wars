import { connectToDatabase } from '../lib/db';
import { getSessionFromReq } from '../lib/auth';
import {
  validateExcludeList,
  getLearnerExcludedIds,
  findSampledEligiblePuzzle,
  recordServedHistory,
} from '../lib/puzzleSelectorBackend';
import {
  checkIpRateLimit,
  generateAndSavePuzzle,
} from '../lib/puzzleGeneratorBackend';
import type { ApiRequest, ApiResponse } from '../types';

function sanitizePuzzle(puzzle: any, fallbackNotice?: string) {
  const { correctCode, explanation, hints, ...sanitized } = puzzle;
  if (fallbackNotice) {
    sanitized.fallbackNotice = fallbackNotice;
  }
  return sanitized;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mandatory HTTP Cache-Control header
  if (typeof res.setHeader === 'function') {
    res.setHeader('Cache-Control', 'no-store');
  }

  const getQueryParam = (val: string | string[] | undefined): string | undefined =>
    Array.isArray(val) ? val[0] : val;

  const language = getQueryParam(req.query?.language) || 'python';
  const difficultyRaw = getQueryParam(req.query?.difficulty);
  const topic = getQueryParam(req.query?.topic);
  const mode = getQueryParam(req.query?.mode) || 'mixed';
  const exclude = req.query?.exclude;

  // 1. Strictly validate exclude list
  const excludeValidation = validateExcludeList(exclude);
  if (!excludeValidation.valid) {
    return res.status(400).json({ error: excludeValidation.error });
  }

  const session = getSessionFromReq(req);
  const parsedDifficulty = difficultyRaw ? parseInt(difficultyRaw, 10) : 1;
  const clientIp =
    (req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  try {
    let db = null;
    try {
      const dbConn = await connectToDatabase();
      db = dbConn.db;
    } catch (dbErr) {
      console.warn('Database connection unavailable, running in local fallback mode:', dbErr);
    }

    // 2. Compute excluded IDs (solved, given-up, last 30 served for users; localStorage for guests)
    const excludedIds = await getLearnerExcludedIds(
      db,
      session?.userId || null,
      excludeValidation.ids
    );

    // 3. Randomly select eligible validated puzzle from pool ($match then $sample)
    const selected = await findSampledEligiblePuzzle(
      db,
      {
        language,
        difficulty: parsedDifficulty,
        topic,
        mode,
      },
      excludedIds
    );

    if (selected) {
      if (session?.userId && db) {
        await recordServedHistory(db, session.userId, selected.id);
      }
      return res.status(200).json(sanitizePuzzle(selected));
    }

    // 4. When no unseen puzzle matches:
    // Guests do NOT trigger on-demand generation
    if (!session?.userId) {
      return res.status(200).json({
        poolExhausted: true,
        requiresSignup: true,
        message:
          'You have seen all available puzzles in this category! Sign up for free to unlock unlimited on-demand AI-generated puzzles.',
      });
    }

    // Signed-in user: Check per-IP rate limit
    const ipCheck = checkIpRateLimit(clientIp);
    if (!ipCheck.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many generation requests. Please wait ${ipCheck.retryAfter || 60} seconds before trying again.`,
      });
    }

    if (!db) {
      return res.status(503).json({
        error: 'Database unavailable for AI puzzle generation.',
      });
    }

    // Generate, validate, save, and serve
    const genResult = await generateAndSavePuzzle(db, {
      language,
      difficulty: parsedDifficulty,
      topic: topic || (language === 'python' ? 'Variables and types' : 'Syntax and scoping'),
      userId: session.userId,
      clientIp,
    });

    if (genResult.error || !genResult.puzzle) {
      return res.status(429).json({
        error: genResult.error || 'Puzzle generation failed',
        message: genResult.error || 'Failed to generate a valid puzzle. Please try another category.',
      });
    }

    // Record freshly generated or fallback puzzle in served history
    await recordServedHistory(db, session.userId, genResult.puzzle.id);

    return res.status(200).json(sanitizePuzzle(genResult.puzzle, genResult.fallbackNotice));
  } catch (err) {
    console.error('Failed to retrieve next puzzle:', err);
    return res.status(500).json({ error: 'Failed to retrieve next puzzle' });
  }
}

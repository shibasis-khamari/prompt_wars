import crypto from 'crypto';
import { Db } from 'mongodb';
import { GeminiAdapter, LLMAdapter } from '../../src/engine/llm';
import { validatePuzzleDetailed } from '../../src/engine/validator';

// Per-IP in-memory sliding window rate limiter
const ipRateLimits = new Map<string, { count: number; resetAt: number }>();

export function checkIpRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const limit = parseInt(process.env.GENERATION_IP_RATE_LIMIT || '5', 10);
  const now = Date.now();
  const windowMs = 60 * 1000;

  const current = ipRateLimits.get(ip);
  if (!current || now > current.resetAt) {
    ipRateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (current.count >= limit) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  current.count++;
  return { allowed: true };
}

export async function checkDailyCaps(
  db: Db,
  userId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const userCap = parseInt(process.env.GENERATION_USER_DAILY_CAP || '20', 10);
  const globalCap = parseInt(process.env.GENERATION_GLOBAL_DAILY_CAP || '100', 10);

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const [userCount, globalCount] = await Promise.all([
    db.collection('generation_logs').countDocuments({ userId, createdAt: { $gte: startOfDay } }),
    db.collection('generation_logs').countDocuments({ createdAt: { $gte: startOfDay } }),
  ]);

  if (userCount >= userCap) {
    return {
      allowed: false,
      reason: `You have reached your daily AI puzzle generation cap (${userCap} puzzles/day). Please try an existing puzzle or return tomorrow!`,
    };
  }

  if (globalCap > 0 && globalCount >= globalCap) {
    return {
      allowed: false,
      reason: 'The arena has reached its daily global AI puzzle generation quota. Please try existing puzzles or return tomorrow!',
    };
  }

  return { allowed: true };
}

export function computeCodeHash(code: string): string {
  const normalized = code.replace(/\s+/g, ' ').trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export async function getRecentSeenMetadata(
  db: Db,
  userId: string
): Promise<{ titles: string[]; bugTypes: string[] }> {
  try {
    const served = await db
      .collection('served_history')
      .find({ userId })
      .sort({ servedAt: -1 })
      .limit(10)
      .toArray();

    const puzzleIds = served.map((s) => s.puzzleId);
    if (puzzleIds.length === 0) return { titles: [], bugTypes: [] };

    const puzzles = await db
      .collection('puzzles')
      .find({ id: { $in: puzzleIds } })
      .toArray();

    return {
      titles: puzzles.map((p) => p.title).filter(Boolean),
      bugTypes: puzzles.map((p) => p.bugType).filter(Boolean),
    };
  } catch {
    return { titles: [], bugTypes: [] };
  }
}

export interface GenerateAndSaveOptions {
  language: string;
  difficulty: number;
  topic?: string;
  userId: string;
  clientIp: string;
  adapter?: LLMAdapter;
}

export interface GenerationResult {
  puzzle: any | null;
  fallbackNotice?: string;
  error?: string;
}

export async function generateAndSavePuzzle(
  db: Db,
  options: GenerateAndSaveOptions
): Promise<GenerationResult> {
  const { language, difficulty, topic = 'General Logic', userId, clientIp } = options;

  const capsCheck = await checkDailyCaps(db, userId);
  if (!capsCheck.allowed) {
    return { puzzle: null, error: capsCheck.reason };
  }

  const { titles, bugTypes } = await getRecentSeenMetadata(db, userId);
  const adapter = options.adapter || new GeminiAdapter();

  const avoidancePrompt =
    titles.length > 0
      ? `Avoid these previously seen puzzle titles: ${titles.slice(0, 5).join(', ')}. Avoid these bug types: ${bugTypes.slice(0, 5).join(', ')}.`
      : '';

  const prompt = `You are an expert bug designer for a coding game. Create one beginner-friendly debugging puzzle in ${language} at difficulty ${difficulty} of 5 on the topic "${topic}".
${avoidancePrompt}
Rules:
- Provide exactly ONE root cause bug. Fix must be 1 to 2 lines.
- Bug line must be accurately indicated.
- Include 3 to 5 tests with inputs and expected outputs.
- Hints: Hint 1 gives general area; Hint 2 hints at the category; Hint 3 asks a pointed question without giving the solution.
- Explanation: 2 to 3 clear sentences.

Respond strictly with valid JSON without markdown fences matching:
{
  "id": "${language}-${difficulty}-${Date.now().toString(36)}",
  "language": "${language}",
  "difficulty": ${difficulty},
  "topic": "${topic}",
  "title": "Short title",
  "theme": "Theme description",
  "bugType": "Specific bug type",
  "bugLine": 4,
  "buggyCode": "...",
  "correctCode": "...",
  "explanation": "Detailed explanation...",
  "hints": ["Hint 1", "Hint 2", "Hint 3"],
  "tests": [{ "id": "t1", "description": "...", "input": [...], "expectedOutput": ... }],
  "symptomOutput": "Observed symptom",
  "timeLimitMs": 3000
}`;

  let attempts = 0;
  while (attempts <= 2) {
    attempts++;
    try {
      const response = await adapter.generate(prompt);
      if (response.tokensUsed) {
        console.log(
          `[AI Puzzle Generation] User ${userId} | Tokens used: prompt=${response.tokensUsed.inputTokens}, candidate=${response.tokensUsed.outputTokens}, total=${response.tokensUsed.totalTokens}`
        );
      }

      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;

      const candidate = JSON.parse(jsonMatch[0]);
      candidate.language = language;
      candidate.difficulty = difficulty;
      candidate.topic = topic;

      const codeHash = computeCodeHash(candidate.buggyCode || '');
      const existing = await db.collection('puzzles').findOne({
        $or: [{ codeHash }, { buggyCode: candidate.buggyCode }],
      });
      if (existing) continue;

      const validation = await validatePuzzleDetailed(candidate);
      if (validation.valid) {
        candidate.validated = true;
        candidate.codeHash = codeHash;
        candidate.createdAt = new Date().toISOString();

        await db.collection('puzzles').insertOne(candidate);
        await db.collection('generation_logs').insertOne({
          userId,
          clientIp,
          puzzleId: candidate.id,
          tokensUsed: response.tokensUsed || null,
          createdAt: new Date(),
        });

        return { puzzle: candidate };
      }
    } catch (err) {
      console.warn(`[AI Generation] Attempt ${attempts}/3 failed:`, err instanceof Error ? err.message : err);
    }
  }

  // Fallback to nearest difficulty or related topic
  return fallbackToNearestPuzzle(db, language, difficulty, topic);
}

export async function fallbackToNearestPuzzle(
  db: Db,
  language: string,
  targetDifficulty: number,
  topic: string
): Promise<GenerationResult> {
  try {
    const diffOffsets = [1, -1, 2, -2, 3, -3];
    for (const offset of diffOffsets) {
      const altDiff = targetDifficulty + offset;
      if (altDiff < 1 || altDiff > 5) continue;

      const candidate = await db.collection('puzzles').findOne({
        validated: true,
        language,
        difficulty: altDiff,
        topic,
      });

      if (candidate) {
        return {
          puzzle: candidate,
          fallbackNotice: `AI generation was temporarily unavailable. Here is an existing puzzle at Level ${altDiff} on "${topic}" instead.`,
        };
      }
    }

    // Try any topic at target difficulty
    const anyTopicCandidate = await db.collection('puzzles').findOne({
      validated: true,
      language,
      difficulty: targetDifficulty,
    });

    if (anyTopicCandidate) {
      return {
        puzzle: anyTopicCandidate,
        fallbackNotice: `AI generation was unavailable for "${topic}". Here is a Level ${targetDifficulty} puzzle on "${anyTopicCandidate.topic}" instead.`,
      };
    }

    // Any validated puzzle in that language
    const anyLangCandidate = await db.collection('puzzles').findOne({
      validated: true,
      language,
    });

    if (anyLangCandidate) {
      return {
        puzzle: anyLangCandidate,
        fallbackNotice: `AI generation was unavailable. Here is a Level ${anyLangCandidate.difficulty} puzzle on "${anyLangCandidate.topic}" instead.`,
      };
    }
  } catch (err) {
    console.error('Fallback puzzle lookup error:', err);
  }

  return { puzzle: null, error: 'No matching or fallback puzzles available at this time.' };
}

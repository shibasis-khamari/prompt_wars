import { Db } from 'mongodb';
import seedPuzzles from '../../src/data/seed.json';
import extraPuzzles from '../../src/data/puzzles.json';

export interface SelectionFilters {
  language?: string;
  difficulty?: number;
  topic?: string;
  mode?: string;
  exclude?: unknown;
}

export interface ExcludeValidationResult {
  valid: boolean;
  error?: string;
  ids: string[];
}

export function validateExcludeList(rawExclude: unknown): ExcludeValidationResult {
  if (!rawExclude) {
    return { valid: true, ids: [] };
  }

  let parsed: unknown = rawExclude;

  if (typeof rawExclude === 'string') {
    const trimmed = rawExclude.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        return { valid: false, error: 'Malformed JSON in exclude list', ids: [] };
      }
    } else {
      parsed = trimmed ? trimmed.split(',').map((s) => s.trim()) : [];
    }
  }

  if (!Array.isArray(parsed)) {
    return { valid: false, error: 'Exclude list must be an array of puzzle IDs', ids: [] };
  }

  if (parsed.length > 50) {
    return { valid: false, error: 'Exclude list exceeds maximum allowed size of 50 items', ids: [] };
  }

  const ids: string[] = [];
  const safeIdRegex = /^[a-zA-Z0-9_-]{1,100}$/;

  for (const item of parsed) {
    if (typeof item !== 'string' || !safeIdRegex.test(item)) {
      return {
        valid: false,
        error: `Invalid puzzle ID in exclude list: ${typeof item === 'string' ? item : typeof item}`,
        ids: [],
      };
    }
    ids.push(item);
  }

  return { valid: true, ids };
}

export async function getLearnerExcludedIds(
  db: Db | null,
  userId: string | null,
  guestExcludeIds: string[]
): Promise<string[]> {
  if (!userId || !db) {
    return guestExcludeIds.slice(0, 50);
  }

  try {
    const [progressDocs, servedDocs] = await Promise.all([
      db.collection('progress').find({ userId }).toArray(),
      db.collection('served_history').find({ userId }).sort({ servedAt: -1 }).limit(30).toArray(),
    ]);

    const solvedOrGivenUpIds = progressDocs.map((p) => p.puzzleId as string);
    const last30ServedIds = servedDocs.map((s) => s.puzzleId as string);

    return Array.from(new Set([...solvedOrGivenUpIds, ...last30ServedIds]));
  } catch {
    return guestExcludeIds.slice(0, 50);
  }
}

export async function findSampledEligiblePuzzle(
  db: Db | null,
  filters: SelectionFilters,
  excludedIds: string[]
): Promise<any | null> {
  const { language, difficulty, topic, mode } = filters;

  if (db) {
    try {
      const matchStage: any = {
        validated: true,
      };

      if (language) matchStage.language = language;
      if (difficulty) matchStage.difficulty = difficulty;
      if (mode === 'topic' && topic) {
        matchStage.topic = { $regex: new RegExp(`^${topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
      }

      if (excludedIds.length > 0) {
        matchStage.id = { $nin: excludedIds };
      }

      const sampled = await db
        .collection('puzzles')
        .aggregate([{ $match: matchStage }, { $sample: { size: 1 } }])
        .toArray();

      if (sampled.length > 0) {
        return sampled[0];
      }
    } catch (err) {
      console.warn('MongoDB aggregation failed, falling back to local pool:', err);
    }
  }

  // In-memory fallback
  const combined = [...(seedPuzzles as any[]), ...(extraPuzzles as any[])];
  const eligible = combined.filter((p) => {
    if (p.validated === false) return false;
    if (language && p.language !== language) return false;
    if (difficulty && p.difficulty !== difficulty) return false;
    if (mode === 'topic' && topic && p.topic.toLowerCase() !== topic.toLowerCase()) return false;
    if (excludedIds.includes(p.id)) return false;
    return true;
  });

  if (eligible.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex];
}

export async function recordServedHistory(
  db: Db | null,
  userId: string | null,
  puzzleId: string
): Promise<void> {
  if (!userId || !db) return;
  try {
    await db.collection('served_history').insertOne({
      userId,
      puzzleId,
      servedAt: new Date(),
    });
  } catch (err) {
    console.warn('Failed to record served history:', err);
  }
}

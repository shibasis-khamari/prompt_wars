import seedPuzzles from '../src/data/seed.json';
import { connectToDatabase } from './lib/db';
import type { ApiRequest, ApiResponse } from './types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { language = 'python' } = req.query || {};

  let candidates: any[] = (seedPuzzles as any[]).filter((p) => p.language === language);

  try {
    const { db } = await connectToDatabase();
    const dbPuzzles = await db.collection('puzzles').find({ language, validated: true }).toArray();
    if (dbPuzzles.length > 0) candidates = dbPuzzles;
  } catch {}

  if (candidates.length === 0) {
    candidates = seedPuzzles as any[];
  }

  // Deterministic index calculation based on today's date string
  const todayStr = new Date().toISOString().split('T')[0];
  let charSum = 0;
  for (let i = 0; i < todayStr.length; i++) {
    charSum += todayStr.charCodeAt(i);
  }
  const selectedIndex = charSum % candidates.length;
  const selected = candidates[selectedIndex];

  // Strip hidden answers
  const { correctCode, explanation, hints, ...sanitized } = selected;

  return res.status(200).json({
    date: todayStr,
    puzzle: sanitized,
  });
}

import seedPuzzles from '../../../src/data/seed.json';
import { connectToDatabase } from '../../lib/db';
import { getSessionFromReq } from '../../lib/auth';
import type { ApiRequest, ApiResponse } from '../../types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query || {};
  const { hintIndex } = req.body || {};

  if (typeof hintIndex !== 'number' || hintIndex < 0 || hintIndex > 2) {
    return res.status(400).json({ error: 'Hint index must be an integer between 0 and 2.' });
  }

  let puzzle: any = (seedPuzzles as any[]).find((p) => p.id === id);

  try {
    const { db } = await connectToDatabase();
    const dbPuzzle = await db.collection('puzzles').findOne({ id });
    if (dbPuzzle) puzzle = dbPuzzle;
  } catch {}

  if (!puzzle) {
    return res.status(404).json({ error: 'Puzzle not found' });
  }

  const session = getSessionFromReq(req);
  if (session?.userId) {
    try {
      const { db } = await connectToDatabase();
      const progressDoc = await db.collection('progress').findOne({ userId: session.userId, puzzleId: id });
      const currentUnlocked = progressDoc?.unlockedHintCount || 0;

      if (hintIndex > currentUnlocked) {
        return res.status(403).json({
          error: `Hint #${hintIndex + 1} is locked. You must unlock earlier hints in sequence.`,
        });
      }

      await db.collection('progress').updateOne(
        { userId: session.userId, puzzleId: id },
        { $set: { unlockedHintCount: Math.max(currentUnlocked, hintIndex + 1) } },
        { upsert: true }
      );
    } catch {}
  }

  return res.status(200).json({
    hintIndex,
    hint: puzzle.hints[hintIndex],
  });
}

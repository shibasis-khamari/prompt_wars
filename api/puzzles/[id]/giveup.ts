import seedPuzzles from '../../../src/data/seed.json';
import { connectToDatabase } from '../../lib/db';
import { getSessionFromReq } from '../../lib/auth';
import type { ApiRequest, ApiResponse } from '../../types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query || {};

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
      await db.collection('progress').updateOne(
        { userId: session.userId, puzzleId: id },
        {
          $set: {
            userId: session.userId,
            puzzleId: id,
            status: 'given_up',
            xpEarned: 0,
            surrenderedAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    } catch {}
  }

  return res.status(200).json({
    correctCode: puzzle.correctCode,
    explanation: puzzle.explanation,
  });
}

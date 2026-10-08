import seedPuzzles from '../../../src/data/seed.json';
import { connectToDatabase } from '../../lib/db';
import { getSessionFromReq } from '../../lib/auth';
import { calculateXP, calculateRank, calculateStreak } from '../../../src/shared/rules';
import type { ApiRequest, ApiResponse } from '../../types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query || {};
  const { hintsUsed = 0, timeMs = 0 } = req.body || {};

  let puzzle: any = (seedPuzzles as any[]).find((p) => p.id === id);

  try {
    const { db } = await connectToDatabase();
    const dbPuzzle = await db.collection('puzzles').findOne({ id });
    if (dbPuzzle) puzzle = dbPuzzle;
  } catch {}

  if (!puzzle) {
    return res.status(404).json({ error: 'Puzzle not found' });
  }

  const xpEarned = calculateXP({
    difficulty: puzzle.difficulty,
    hintsUsed,
  });

  const session = getSessionFromReq(req);
  let totalXP = xpEarned;

  if (session?.userId) {
    try {
      const { db } = await connectToDatabase();

      // Update progress collection
      await db.collection('progress').updateOne(
        { userId: session.userId, puzzleId: id },
        {
          $set: {
            userId: session.userId,
            puzzleId: id,
            status: 'solved',
            hintsUsed,
            timeMs,
            xpEarned,
            solvedAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );

      // Update skills collection
      await db.collection('skills').updateOne(
        { userId: session.userId, language: puzzle.language, topic: puzzle.topic },
        {
          $inc: { xp: xpEarned },
          $set: { updatedAt: new Date().toISOString() },
        },
        { upsert: true }
      );

      // Calculate total XP & rank
      const allProgress = await db.collection('progress').find({ userId: session.userId, status: 'solved' }).toArray();
      totalXP = allProgress.reduce((acc, p) => acc + (p.xpEarned || 0), 0);
      const newRank = calculateRank(totalXP);

      // Update streak collection
      const streakDoc = await db.collection('streaks').findOne({ userId: session.userId });
      const streakResult = calculateStreak(streakDoc?.lastActiveDate, streakDoc?.currentStreak || 0);

      await db.collection('streaks').updateOne(
        { userId: session.userId },
        {
          $set: {
            userId: session.userId,
            currentStreak: streakResult.currentStreak,
            lastActiveDate: streakResult.lastActiveDate,
          },
        },
        { upsert: true }
      );

      await db.collection('users').updateOne(
        { _id: session.userId as any },
        { $set: { totalXP, rank: newRank } }
      );
    } catch {}
  }

  return res.status(200).json({
    success: true,
    xpEarned,
    totalXP,
  });
}

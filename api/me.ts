import { connectToDatabase } from './lib/db';
import { getSessionFromReq } from './lib/auth';
import { calculateRank } from '../src/shared/rules';
import type { ApiRequest, ApiResponse } from './types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getSessionFromReq(req);
  if (!session?.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { db } = await connectToDatabase();
    const progressList = await db.collection('progress').find({ userId: session.userId }).toArray();
    const skillsList = await db.collection('skills').find({ userId: session.userId }).toArray();
    const streakDoc = await db.collection('streaks').findOne({ userId: session.userId });

    const totalXP = progressList.reduce((acc, p) => acc + (p.xpEarned || 0), 0);
    const rank = calculateRank(totalXP);

    const solvedPuzzlesMap: Record<string, any> = {};
    progressList.forEach((p) => {
      solvedPuzzlesMap[p.puzzleId] = p;
    });

    return res.status(200).json({
      userId: session.userId,
      email: session.email,
      totalXP,
      rank,
      currentStreak: streakDoc?.currentStreak || 0,
      lastActiveDate: streakDoc?.lastActiveDate || '',
      skills: skillsList,
      solvedPuzzles: solvedPuzzlesMap,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}

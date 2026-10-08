import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../lib/db';
import { createSessionToken, setSessionCookie } from '../lib/auth';
import type { ApiRequest, ApiResponse } from '../types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, guestProgress } = req.body || {};
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Valid email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    const result = await usersCollection.insertOne(newUser);
    const userId = result.insertedId.toString();

    // Import guest progress if provided
    if (guestProgress && guestProgress.solvedPuzzles) {
      const progressCollection = db.collection('progress');
      for (const [puzzleId, rec] of Object.entries(guestProgress.solvedPuzzles as Record<string, any>)) {
        await progressCollection.updateOne(
          { userId, puzzleId },
          {
            $set: {
              userId,
              puzzleId,
              status: rec.status || 'solved',
              hintsUsed: rec.hintsUsed || 0,
              timeMs: rec.timeMs || 0,
              xpEarned: rec.xpEarned || 0,
              solvedAt: rec.solvedAt || new Date().toISOString(),
            },
          },
          { upsert: true }
        );
      }
    }

    const token = createSessionToken({ userId, email: newUser.email });
    setSessionCookie(res, token);

    return res.status(201).json({
      success: true,
      user: { userId, email: newUser.email },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create account' });
  }
}

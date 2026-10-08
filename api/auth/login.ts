import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../lib/db';
import { createSessionToken, setSessionCookie } from '../lib/auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    const userId = user._id.toString();
    const token = createSessionToken({ userId, email: user.email });
    setSessionCookie(res, token);

    return res.status(200).json({
      success: true,
      user: { userId, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

import { clearSessionCookie } from '../lib/auth';
import type { ApiRequest, ApiResponse } from '../types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  clearSessionCookie(res);
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

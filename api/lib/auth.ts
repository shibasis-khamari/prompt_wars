import jwt from 'jsonwebtoken';
import { parse, serialize } from 'cookie';

const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback_session_secret_change_in_production';
const COOKIE_NAME = 'bughunt_session';

export interface SessionData {
  userId: string;
  email: string;
}

export function createSessionToken(data: SessionData): string {
  return jwt.sign(data, SESSION_SECRET, { expiresIn: '7d' });
}

export function verifySessionToken(token: string): SessionData | null {
  try {
    return jwt.verify(token, SESSION_SECRET) as SessionData;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: any, token: string): void {
  const cookieHeader = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  res.setHeader('Set-Cookie', cookieHeader);
}

export function clearSessionCookie(res: any): void {
  const cookieHeader = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  res.setHeader('Set-Cookie', cookieHeader);
}

export function getSessionFromReq(req: any): SessionData | null {
  const cookies = parse(req.headers?.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifySessionToken(token);
}

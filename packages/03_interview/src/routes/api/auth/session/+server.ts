/**
 * Session management API
 * POST  /api/auth/session — create session cookie from Firebase ID token
 * DELETE /api/auth/session — destroy session cookie (logout)
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyFirebaseToken } from '$lib/server/verifyToken';

const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 days in seconds

export const POST: RequestHandler = async ({ request, cookies }) => {
  let idToken: string;

  try {
    const body = await request.json();
    idToken = body.idToken;
  } catch {
    return json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!idToken || typeof idToken !== 'string') {
    return json({ error: 'idToken is required' }, { status: 400 });
  }

  const payload = await verifyFirebaseToken(idToken);

  if (!payload) {
    return json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  cookies.set('session', idToken, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
  });

  return json({ ok: true, uid: payload.uid, email: payload.email });
};

export const DELETE: RequestHandler = async ({ cookies }) => {
  cookies.delete('session', { path: '/' });
  return json({ ok: true });
};

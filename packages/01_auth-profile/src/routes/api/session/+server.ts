/**
 * POST /auth/api/session   — verifica o token Firebase e seta o cookie de sessão
 * DELETE /auth/api/session — remove o cookie (logout)
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyFirebaseToken } from '$lib/server/verifyToken';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 5; // 5 dias

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { idToken } = await request.json().catch(() => ({}));

  if (!idToken || typeof idToken !== 'string') {
    return json({ error: 'idToken ausente' }, { status: 400 });
  }

  const payload = await verifyFirebaseToken(idToken);
  if (!payload) {
    return json({ error: 'Token inválido ou expirado' }, { status: 401 });
  }

  cookies.set('session', idToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  return json({ ok: true });
};

export const DELETE: RequestHandler = ({ cookies }) => {
  cookies.delete('session', { path: '/' });
  return json({ ok: true });
};

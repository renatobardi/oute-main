/**
 * SvelteKit server hooks
 * Reads the session cookie and populates event.locals.user on every request
 */
import type { Handle } from '@sveltejs/kit';
import { verifyFirebaseToken } from '$lib/server/verifyToken';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = null;

  const sessionToken = event.cookies.get('session');

  if (sessionToken) {
    const payload = await verifyFirebaseToken(sessionToken);
    if (payload) {
      event.locals.user = payload;
    } else {
      // Token invalid/expired — clear the stale cookie
      event.cookies.delete('session', { path: '/' });
    }
  }

  return resolve(event);
};

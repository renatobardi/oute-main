import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const PUBLIC_PATHS = ['/login'];

export const load: LayoutServerLoad = ({ locals, url }) => {
  const isPublicPath = PUBLIC_PATHS.some((path) => url.pathname.endsWith(path));

  if (!locals.user && !isPublicPath) {
    throw redirect(302, '/chat/login');
  }

  return {
    user: locals.user,
  };
};

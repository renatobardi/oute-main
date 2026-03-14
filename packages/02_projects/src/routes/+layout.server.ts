import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, url }) => {
  if (!locals.user) {
    // Redireciona para o auth-profile centralizado
    const redirectUrl = `/auth/login?redirect=${encodeURIComponent(url.pathname)}`;
    throw redirect(302, redirectUrl);
  }

  return {
    user: locals.user,
  };
};

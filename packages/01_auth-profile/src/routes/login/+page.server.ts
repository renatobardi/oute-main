/**
 * /auth/login — Server load
 * Se o usuário já tem sessão válida, redireciona para o destino.
 */
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
  if (locals.user) {
    const redirectTo = url.searchParams.get('redirect') ?? '/chat';
    throw redirect(302, redirectTo);
  }
  return {};
};

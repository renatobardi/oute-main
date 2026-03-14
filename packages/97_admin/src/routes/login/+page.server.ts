/**
 * /chat/login — redireciona para o auth-profile centralizado.
 * Mantido para compatibilidade com links antigos.
 */
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
  throw redirect(301, '/auth/login?redirect=/chat');
};

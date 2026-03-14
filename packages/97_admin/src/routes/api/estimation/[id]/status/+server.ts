import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const OUTE_MIND_URL = env.OUTE_MIND_URL ?? 'http://localhost:8000';

/**
 * GET /api/estimation/[id]/status
 * Consulta o status atual de uma estimativa no oute-mind (JSON, não SSE).
 * Usado para recovery de sessão ao recarregar a página.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) return json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const res = await fetch(`${OUTE_MIND_URL}/status/${params.id}`);
    if (!res.ok) return json({ error: 'Estimativa não encontrada' }, { status: 404 });
    const data = await res.json();
    return json({ status: data.status, current_phase: data.current_phase });
  } catch (err) {
    console.error('[GET /api/estimation/[id]/status]', err);
    return json({ error: 'oute-mind indisponível' }, { status: 503 });
  }
};

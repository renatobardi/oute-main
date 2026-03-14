import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const OUTE_MIND_URL = env.OUTE_MIND_URL ?? 'http://localhost:8000';

/**
 * POST /api/estimation
 * Inicia um pipeline de estimativa no oute-mind.
 * Body: { project_details: string, estimation_id?: string }
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json();
  if (!body?.project_details || typeof body.project_details !== 'string') {
    return json({ error: 'project_details é obrigatório' }, { status: 400 });
  }

  const payload: Record<string, string> = { project_details: body.project_details };
  if (body.estimation_id) payload.estimation_id = body.estimation_id;

  try {
    const res = await fetch(`${OUTE_MIND_URL}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[POST /api/estimation] oute-mind error:', err);
      return json({ error: 'Falha ao iniciar estimativa' }, { status: 502 });
    }

    const data = await res.json();
    return json({ estimation_id: data.estimation_id, status: data.status });
  } catch (err) {
    console.error('[POST /api/estimation]', err);
    return json({ error: 'oute-mind indisponível' }, { status: 503 });
  }
};

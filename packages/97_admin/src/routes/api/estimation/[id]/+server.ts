import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const OUTE_MIND_URL = env.OUTE_MIND_URL ?? 'http://localhost:8000';
const POLL_INTERVAL_MS = 3000;
const HEARTBEAT_INTERVAL_MS = 15000;

/**
 * GET /api/estimation/[id]
 * SSE stream que faz poll no oute-mind e repassa eventos de fase ao browser.
 * Eventos emitidos:
 *   { type: 'phase', phase, phaseName }
 *   { type: 'awaiting_approval', output }
 *   { type: 'completed', result }
 *   { type: 'failed', error }
 *   { type: 'heartbeat' }
 */
export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) return json({ error: 'Não autorizado' }, { status: 401 });

  const estimationId = params.id;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      let lastPhase = -1;
      let lastStatus = '';
      let done = false;

      // Heartbeat para manter a conexão viva
      const heartbeatTimer = setInterval(() => {
        if (!done) send({ type: 'heartbeat' });
      }, HEARTBEAT_INTERVAL_MS);

      const poll = async () => {
        try {
          const res = await fetch(`${OUTE_MIND_URL}/status/${estimationId}`);

          if (!res.ok) {
            send({ type: 'failed', error: `Status ${res.status} do oute-mind` });
            done = true;
            clearInterval(heartbeatTimer);
            controller.close();
            return;
          }

          const data = await res.json();
          const status: string = data.status;
          const phase: number = data.current_phase ?? 0;
          const phaseName: string | null = data.phase_name ?? null;

          // Emite mudança de fase
          if (phase !== lastPhase && phase > 0) {
            lastPhase = phase;
            if (status === 'running') {
              send({ type: 'phase', phase, phaseName });
            }
          }

          if (status !== lastStatus) {
            lastStatus = status;

            if (status === 'awaiting_approval') {
              send({ type: 'awaiting_approval', output: data.result ?? '' });
            } else if (status === 'completed') {
              send({ type: 'completed', result: data.result ?? '' });
              done = true;
              clearInterval(heartbeatTimer);
              controller.close();
              return;
            } else if (status === 'failed' || status === 'rejected') {
              send({ type: 'failed', error: data.error ?? 'Estimativa falhou' });
              done = true;
              clearInterval(heartbeatTimer);
              controller.close();
              return;
            }
          }
        } catch (err) {
          console.error('[SSE poll]', err);
          send({ type: 'failed', error: 'Erro ao consultar oute-mind' });
          done = true;
          clearInterval(heartbeatTimer);
          controller.close();
          return;
        }

        if (!done) {
          setTimeout(poll, POLL_INTERVAL_MS);
        }
      };

      // Inicia polling imediatamente
      await poll();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};

/**
 * PATCH /api/estimation/[id]
 * Aprova ou rejeita a fase 1 do pipeline.
 * Body: { approved: boolean, feedback?: string }
 */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) return json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json();
  const approved = body?.approved !== false;
  const feedback: string | undefined = body?.feedback;

  try {
    const res = await fetch(`${OUTE_MIND_URL}/approve/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved, ...(feedback ? { feedback } : {}) }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[PATCH /api/estimation/[id]] oute-mind error:', err);
      return json({ error: 'Falha ao enviar aprovação' }, { status: 502 });
    }

    const data = await res.json();
    return json(data);
  } catch (err) {
    console.error('[PATCH /api/estimation/[id]]', err);
    return json({ error: 'oute-mind indisponível' }, { status: 503 });
  }
};

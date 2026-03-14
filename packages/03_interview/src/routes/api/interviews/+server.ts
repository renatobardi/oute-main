import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PostgresInterviewRepository } from '../../../infrastructure/repositories/PostgresInterviewRepository';
import { PostgresInterviewNoteRepository } from '../../../infrastructure/repositories/PostgresInterviewNoteRepository';
import { getDbUserId } from '$lib/server/getUserId';

/**
 * GET /api/interviews
 * Retorna todas as entrevistas do usuário logado.
 */
export const GET: RequestHandler = async ({ locals }) => {
  const firebaseUser = locals.user;
  if (!firebaseUser) return json({ error: 'Não autorizado' }, { status: 401 });

  const dbUserId = await getDbUserId(firebaseUser.uid);
  if (!dbUserId) return json({ error: 'Usuário não encontrado no banco' }, { status: 404 });

  const interviewRepo = new PostgresInterviewRepository();
  try {
    const interviews = await interviewRepo.findByConductedBy(dbUserId);
    return json(interviews.map((i) => i.toPlainObject()));
  } catch (err) {
    console.error('[GET /api/interviews]', err);
    return json({ error: 'Failed to fetch interviews' }, { status: 500 });
  }
};

/**
 * POST /api/interviews
 * Cria uma nova entrevista para o usuário logado.
 *
 * Body: { title: string }
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  const firebaseUser = locals.user;
  if (!firebaseUser) return json({ error: 'Não autorizado' }, { status: 401 });

  const dbUserId = await getDbUserId(firebaseUser.uid);
  if (!dbUserId) return json({ error: 'Usuário não encontrado no banco' }, { status: 404 });

  const interviewRepo = new PostgresInterviewRepository();
  const noteRepo = new PostgresInterviewNoteRepository();
  try {
    const body = await request.json();
    const title = typeof body?.title === 'string' ? body.title.trim() : '';

    if (!title) {
      return json({ error: 'title is required' }, { status: 400 });
    }

    const interview = await interviewRepo.create({
      projectId: '',
      conductedBy: dbUserId,
      title,
    });

    await noteRepo.upsert({
      interviewId: interview.id,
      lastEditedBy: dbUserId,
    });

    return json(interview.toPlainObject(), { status: 201 });
  } catch (err) {
    console.error('[POST /api/interviews]', err);
    return json({ error: 'Failed to create interview' }, { status: 500 });
  }
};

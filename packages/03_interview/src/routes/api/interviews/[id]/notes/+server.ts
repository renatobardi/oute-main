import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PostgresInterviewRepository } from '../../../../../infrastructure/repositories/PostgresInterviewRepository';
import { PostgresInterviewNoteRepository } from '../../../../../infrastructure/repositories/PostgresInterviewNoteRepository';
import { InterviewNotFoundError } from '../../../../../domain/errors/InterviewNotFoundError';
import { getDbUserId } from '$lib/server/getUserId';

export const GET: RequestHandler = async ({ params }) => {
  const interviewRepo = new PostgresInterviewRepository();
  const noteRepo = new PostgresInterviewNoteRepository();
  try {
    const interview = await interviewRepo.findById(params.id);
    if (!interview) throw new InterviewNotFoundError(params.id);
    const note = await noteRepo.findByInterviewId(interview.id);
    return json(note?.toPlainObject() ?? null);
  } catch (err) {
    if (err instanceof InterviewNotFoundError) return json({ error: err.message }, { status: 404 });
    console.error('[GET /api/interviews/[id]/notes]', err);
    return json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const firebaseUser = locals.user;
  const dbUserId = firebaseUser ? await getDbUserId(firebaseUser.uid) : null;

  const interviewRepo = new PostgresInterviewRepository();
  const noteRepo = new PostgresInterviewNoteRepository();
  try {
    const interview = await interviewRepo.findById(params.id);
    if (!interview) throw new InterviewNotFoundError(params.id);

    const body = await request.json();
    const note = await noteRepo.upsert({
      interviewId: interview.id,
      lastEditedBy: dbUserId ?? '019534a0-0000-7000-8000-000000000001',
      summary: body?.summary,
      content: body?.content,
      metrics: body?.metrics,
      tagsSnapshot: body?.tagsSnapshot,
    });

    return json(note.toPlainObject());
  } catch (err) {
    if (err instanceof InterviewNotFoundError) return json({ error: err.message }, { status: 404 });
    console.error('[PUT /api/interviews/[id]/notes]', err);
    return json({ error: 'Failed to update notes' }, { status: 500 });
  }
};

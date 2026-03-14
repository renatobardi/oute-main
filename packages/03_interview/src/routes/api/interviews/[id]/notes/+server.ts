import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PostgresInterviewRepository } from '../../../../../infrastructure/repositories/PostgresInterviewRepository';
import { PostgresInterviewNoteRepository } from '../../../../../infrastructure/repositories/PostgresInterviewNoteRepository';
import { InterviewNotFoundError } from '../../../../../domain/errors/InterviewNotFoundError';

// Fixed dev user until auth is implemented (FASE 6/7)
const DEV_USER_ID = '019534a0-0000-7000-8000-000000000001';

const interviewRepo = new PostgresInterviewRepository();
const noteRepo = new PostgresInterviewNoteRepository();

/**
 * GET /api/interviews/[id]/notes
 * Returns the notes for an interview.
 */
export const GET: RequestHandler = async ({ params }) => {
  try {
    const interview = await interviewRepo.findById(params.id);

    if (!interview) {
      throw new InterviewNotFoundError(params.id);
    }

    const note = await noteRepo.findByInterviewId(interview.id);

    return json(note?.toPlainObject() ?? null);
  } catch (err) {
    if (err instanceof InterviewNotFoundError) {
      return json({ error: err.message }, { status: 404 });
    }
    console.error('[GET /api/interviews/[id]/notes]', err);
    return json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
};

/**
 * PUT /api/interviews/[id]/notes
 * Creates or updates the notes panel for an interview.
 *
 * Body: {
 *   summary?: string
 *   content?: string
 *   metrics?: { progress?: number; estimatedHours?: string; budget?: string }
 *   tagsSnapshot?: string[]
 * }
 */
export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const interview = await interviewRepo.findById(params.id);

    if (!interview) {
      throw new InterviewNotFoundError(params.id);
    }

    const body = await request.json();

    const note = await noteRepo.upsert({
      interviewId: interview.id,
      lastEditedBy: DEV_USER_ID,
      summary: body?.summary,
      content: body?.content,
      metrics: body?.metrics,
      tagsSnapshot: body?.tagsSnapshot,
    });

    return json(note.toPlainObject());
  } catch (err) {
    if (err instanceof InterviewNotFoundError) {
      return json({ error: err.message }, { status: 404 });
    }
    console.error('[PUT /api/interviews/[id]/notes]', err);
    return json({ error: 'Failed to update notes' }, { status: 500 });
  }
};

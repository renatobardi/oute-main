import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PostgresInterviewRepository } from '../../../../infrastructure/repositories/PostgresInterviewRepository';
import { PostgresMessageRepository } from '../../../../infrastructure/repositories/PostgresMessageRepository';
import { PostgresInterviewNoteRepository } from '../../../../infrastructure/repositories/PostgresInterviewNoteRepository';
import { InterviewNotFoundError } from '../../../../domain/errors/InterviewNotFoundError';

/**
 * GET /api/interviews/[id]
 * Returns the interview with its messages and notes in a single response.
 */
export const GET: RequestHandler = async ({ params }) => {
  const interviewRepo = new PostgresInterviewRepository();
  const messageRepo = new PostgresMessageRepository();
  const noteRepo = new PostgresInterviewNoteRepository();
  try {
    const interview = await interviewRepo.findById(params.id);

    if (!interview) {
      throw new InterviewNotFoundError(params.id);
    }

    const [messages, note] = await Promise.all([
      messageRepo.findByInterviewId(interview.id),
      noteRepo.findByInterviewId(interview.id),
    ]);

    return json({
      interview: interview.toPlainObject(),
      messages: messages.map((m) => m.toPlainObject()),
      note: note?.toPlainObject() ?? null,
    });
  } catch (err) {
    if (err instanceof InterviewNotFoundError) {
      return json({ error: err.message }, { status: 404 });
    }
    console.error('[GET /api/interviews/[id]]', err);
    return json({ error: 'Failed to fetch interview' }, { status: 500 });
  }
};

/**
 * PATCH /api/interviews/[id]
 * Updates the interview title.
 */
export const PATCH: RequestHandler = async ({ params, request }) => {
  const interviewRepo = new PostgresInterviewRepository();
  try {
    const { title } = await request.json();
    if (!title?.trim()) {
      return json({ error: 'Title is required' }, { status: 400 });
    }

    const interview = await interviewRepo.findById(params.id);
    if (!interview) {
      throw new InterviewNotFoundError(params.id);
    }

    interview.rename(title);
    await interviewRepo.update(interview);

    return json(interview.toPlainObject());
  } catch (err) {
    if (err instanceof InterviewNotFoundError) {
      return json({ error: err.message }, { status: 404 });
    }
    console.error('[PATCH /api/interviews/[id]]', err);
    return json({ error: 'Failed to update interview' }, { status: 500 });
  }
};

/**
 * DELETE /api/interviews/[id]
 * Soft-deletes the interview.
 */
export const DELETE: RequestHandler = async ({ params }) => {
  const interviewRepo = new PostgresInterviewRepository();
  try {
    const interview = await interviewRepo.findById(params.id);

    if (!interview) {
      throw new InterviewNotFoundError(params.id);
    }

    await interviewRepo.delete(params.id);

    return new Response(null, { status: 204 });
  } catch (err) {
    if (err instanceof InterviewNotFoundError) {
      return json({ error: err.message }, { status: 404 });
    }
    console.error('[DELETE /api/interviews/[id]]', err);
    return json({ error: 'Failed to delete interview' }, { status: 500 });
  }
};

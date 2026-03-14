import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PostgresInterviewRepository } from '../../../infrastructure/repositories/PostgresInterviewRepository';
import { PostgresInterviewNoteRepository } from '../../../infrastructure/repositories/PostgresInterviewNoteRepository';

// Fixed dev user until auth is implemented (FASE 6/7)
const DEV_USER_ID = '019534a0-0000-7000-8000-000000000001';

const interviewRepo = new PostgresInterviewRepository();
const noteRepo = new PostgresInterviewNoteRepository();

/**
 * GET /api/interviews
 * Returns all interviews conducted by the current (dev) user.
 */
export const GET: RequestHandler = async () => {
  try {
    const interviews = await interviewRepo.findByConductedBy(DEV_USER_ID);

    return json(interviews.map((i) => i.toPlainObject()));
  } catch (err) {
    console.error('[GET /api/interviews]', err);
    return json({ error: 'Failed to fetch interviews' }, { status: 500 });
  }
};

/**
 * POST /api/interviews
 * Creates a new interview (and an auto draft project behind the scenes).
 * Also creates the initial empty note for the interview.
 *
 * Body: { title: string }
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const title = typeof body?.title === 'string' ? body.title.trim() : '';

    if (!title) {
      return json({ error: 'title is required' }, { status: 400 });
    }

    const interview = await interviewRepo.create({
      projectId: '', // auto-created inside repository
      conductedBy: DEV_USER_ID,
      title,
    });

    // Create the initial empty note for this interview
    await noteRepo.upsert({
      interviewId: interview.id,
      lastEditedBy: DEV_USER_ID,
    });

    return json(interview.toPlainObject(), { status: 201 });
  } catch (err) {
    console.error('[POST /api/interviews]', err);
    return json({ error: 'Failed to create interview' }, { status: 500 });
  }
};

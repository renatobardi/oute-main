import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PostgresInterviewRepository } from '../../../../../infrastructure/repositories/PostgresInterviewRepository';
import { PostgresMessageRepository } from '../../../../../infrastructure/repositories/PostgresMessageRepository';
import { InterviewNotFoundError } from '../../../../../domain/errors/InterviewNotFoundError';

// Fixed dev user until auth is implemented (FASE 6/7)
const DEV_USER_ID = '019534a0-0000-7000-8000-000000000001';

/**
 * GET /api/interviews/[id]/messages
 * Returns all messages for an interview ordered by created_at ASC.
 */
export const GET: RequestHandler = async ({ params }) => {
  const interviewRepo = new PostgresInterviewRepository();
  const messageRepo = new PostgresMessageRepository();
  try {
    const interview = await interviewRepo.findById(params.id);

    if (!interview) {
      throw new InterviewNotFoundError(params.id);
    }

    const messages = await messageRepo.findByInterviewId(interview.id);

    return json(messages.map((m) => m.toPlainObject()));
  } catch (err) {
    if (err instanceof InterviewNotFoundError) {
      return json({ error: err.message }, { status: 404 });
    }
    console.error('[GET /api/interviews/[id]/messages]', err);
    return json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
};

/**
 * POST /api/interviews/[id]/messages
 * Persists a new message and updates the interview's total_messages counter.
 *
 * Body: {
 *   sender: 'user' | 'ai' | 'system'
 *   type?: 'text' | 'code' | 'image'   (default: 'text')
 *   content: string
 *   metadata?: { userName?: string; avatarColor?: string }
 * }
 */
export const POST: RequestHandler = async ({ params, request }) => {
  const interviewRepo = new PostgresInterviewRepository();
  const messageRepo = new PostgresMessageRepository();
  try {
    const interview = await interviewRepo.findById(params.id);

    if (!interview) {
      throw new InterviewNotFoundError(params.id);
    }

    const body = await request.json();

    if (!body?.content || typeof body.content !== 'string') {
      return json({ error: 'content is required' }, { status: 400 });
    }

    if (!['user', 'ai', 'system'].includes(body.sender)) {
      return json({ error: 'sender must be user, ai or system' }, { status: 400 });
    }

    const isUserMessage = body.sender === 'user';

    const message = await messageRepo.create({
      interviewId: interview.id,
      userId: isUserMessage ? DEV_USER_ID : null,
      sender: body.sender,
      type: body.type ?? 'text',
      content: body.content.trim(),
      metadata: body.metadata ?? {},
    });

    // Keep total_messages counter in sync
    interview.incrementMessageCount();
    await interviewRepo.update(interview);

    // Auto-transition interview to in_progress on first message
    if (interview.status === 'scheduled') {
      interview.start();
      await interviewRepo.update(interview);
    }

    return json(message.toPlainObject(), { status: 201 });
  } catch (err) {
    if (err instanceof InterviewNotFoundError) {
      return json({ error: err.message }, { status: 404 });
    }
    console.error('[POST /api/interviews/[id]/messages]', err);
    return json({ error: 'Failed to send message' }, { status: 500 });
  }
};

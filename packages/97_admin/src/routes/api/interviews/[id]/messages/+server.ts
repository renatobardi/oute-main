import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PostgresInterviewRepository } from '../../../../../infrastructure/repositories/PostgresInterviewRepository';
import { PostgresMessageRepository } from '../../../../../infrastructure/repositories/PostgresMessageRepository';
import { InterviewNotFoundError } from '../../../../../domain/errors/InterviewNotFoundError';
import { getDbUserId } from '$lib/server/getUserId';

export const GET: RequestHandler = async ({ params }) => {
  const interviewRepo = new PostgresInterviewRepository();
  const messageRepo = new PostgresMessageRepository();
  try {
    const interview = await interviewRepo.findById(params.id);
    if (!interview) throw new InterviewNotFoundError(params.id);
    const messages = await messageRepo.findByInterviewId(interview.id);
    return json(messages.map((m) => m.toPlainObject()));
  } catch (err) {
    if (err instanceof InterviewNotFoundError) return json({ error: err.message }, { status: 404 });
    console.error('[GET /api/interviews/[id]/messages]', err);
    return json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const firebaseUser = locals.user;
  const dbUserId = firebaseUser ? await getDbUserId(firebaseUser.uid) : null;

  const interviewRepo = new PostgresInterviewRepository();
  const messageRepo = new PostgresMessageRepository();
  try {
    const interview = await interviewRepo.findById(params.id);
    if (!interview) throw new InterviewNotFoundError(params.id);

    const body = await request.json();
    if (!body?.content || typeof body.content !== 'string')
      return json({ error: 'content is required' }, { status: 400 });
    if (!['user', 'ai', 'system'].includes(body.sender))
      return json({ error: 'sender must be user, ai or system' }, { status: 400 });

    const isUserMessage = body.sender === 'user';

    // Enriquecer metadata do usuário com dados reais do Firebase (name, picture)
    const baseMetadata = body.metadata ?? {};
    const userMetadata =
      isUserMessage && firebaseUser
        ? {
            userName: firebaseUser.name ?? baseMetadata.userName,
            avatarUrl: firebaseUser.picture ?? baseMetadata.avatarUrl,
            ...baseMetadata,
          }
        : baseMetadata;

    const message = await messageRepo.create({
      interviewId: interview.id,
      userId: isUserMessage ? dbUserId : null,
      sender: body.sender,
      type: body.type ?? 'text',
      content: body.content.trim(),
      metadata: userMetadata,
    });

    interview.incrementMessageCount();
    await interviewRepo.update(interview);

    if (interview.status === 'scheduled') {
      interview.start();
      await interviewRepo.update(interview);
    }

    return json(message.toPlainObject(), { status: 201 });
  } catch (err) {
    if (err instanceof InterviewNotFoundError) return json({ error: err.message }, { status: 404 });
    console.error('[POST /api/interviews/[id]/messages]', err);
    return json({ error: 'Failed to send message' }, { status: 500 });
  }
};

/**
 * API client for the interview service endpoints.
 * All routes are relative (same-origin SvelteKit server routes).
 */

import type { Interview, Message, Note } from '$lib/types/index';

// ── Mappers ────────────────────────────────────────────────────────────────

// Maps the API InterviewProps shape to the frontend Interview type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInterview(raw: any): Interview {
  return {
    id: raw.id,
    interviewCode: raw.interviewCode,
    title: raw.title,
    status: raw.status,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

// Maps the API MessageProps shape to the frontend Message type
// metadata.userName / metadata.avatarColor are flattened for ChatMessage.svelte
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMessage(raw: any): Message {
  return {
    id: raw.id,
    timestamp: new Date(raw.createdAt),
    sender: raw.sender,
    content: raw.content,
    type: raw.type ?? 'text',
    userName: raw.metadata?.userName,
    avatarColor: raw.metadata?.avatarColor,
  };
}

// Maps the API InterviewNoteProps shape to the frontend Note type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNote(raw: any): Note {
  return {
    summary: raw.summary ?? '',
    content: raw.content ?? '',
    metrics: {
      progress: raw.metrics?.progress ?? 0,
      estimatedHours: raw.metrics?.estimatedHours ?? '',
      budget: raw.metrics?.budget ?? '',
    },
    tags: raw.tagsSnapshot ?? [],
  };
}

// ── Interviews ─────────────────────────────────────────────────────────────

export async function fetchInterviews(): Promise<Interview[]> {
  const res = await fetch('/api/interviews');
  if (!res.ok) throw new Error('Failed to fetch interviews');
  const data = await res.json();
  return data.map(mapInterview);
}

export async function createInterview(title: string): Promise<Interview> {
  const res = await fetch('/api/interviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create interview');
  return mapInterview(await res.json());
}

// ── Interview detail ───────────────────────────────────────────────────────

export async function fetchInterviewDetail(id: string): Promise<{
  interview: Interview;
  messages: Message[];
  note: Note | null;
}> {
  const res = await fetch(`/api/interviews/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch interview ${id}`);
  const data = await res.json();
  return {
    interview: mapInterview(data.interview),
    messages: data.messages.map(mapMessage),
    note: data.note ? mapNote(data.note) : null,
  };
}

// ── Messages ───────────────────────────────────────────────────────────────

export async function sendMessage(
  interviewId: string,
  payload: {
    sender: 'user' | 'ai' | 'system';
    content: string;
    type?: 'text' | 'code' | 'image';
    metadata?: { userName?: string; avatarColor?: string };
  }
): Promise<Message> {
  const res = await fetch(`/api/interviews/${interviewId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return mapMessage(await res.json());
}

// ── Notes ──────────────────────────────────────────────────────────────────

export async function saveNote(
  interviewId: string,
  note: Partial<Note>
): Promise<Note> {
  const res = await fetch(`/api/interviews/${interviewId}/notes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: note.summary,
      content: note.content,
      metrics: note.metrics,
      tagsSnapshot: note.tags,
    }),
  });
  if (!res.ok) throw new Error('Failed to save note');
  return mapNote(await res.json());
}

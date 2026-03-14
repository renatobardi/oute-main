/**
 * API client for the interview service endpoints.
 * Usa `base` do SvelteKit para respeitar o paths.base = '/chat'.
 */

import { base } from '$app/paths';
import type { Interview, Message, Note, EstimationStatus } from '$lib/types/index';

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
    avatarUrl: raw.metadata?.avatarUrl,
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
  const res = await fetch(`${base}/api/interviews`);
  if (!res.ok) throw new Error('Failed to fetch interviews');
  const data = await res.json();
  return data.map(mapInterview);
}

export async function createInterview(title: string): Promise<Interview> {
  const res = await fetch(`${base}/api/interviews`, {
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
  const res = await fetch(`${base}/api/interviews/${id}`);
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
  const res = await fetch(`${base}/api/interviews/${interviewId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return mapMessage(await res.json());
}

// ── Estimation (oute-mind) ─────────────────────────────────────────────────

/**
 * Inicia um pipeline de estimativa no oute-mind via proxy server-side.
 * Retorna o estimation_id gerado pelo oute-mind.
 */
export async function startEstimation(
  projectDetails: string,
  estimationId?: string
): Promise<{ estimation_id: string; status: string }> {
  const res = await fetch(`${base}/api/estimation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_details: projectDetails, estimation_id: estimationId }),
  });
  if (!res.ok) throw new Error('Failed to start estimation');
  return res.json();
}

export interface EstimationStreamHandlers {
  onPhase?: (phase: number, phaseName: string | null) => void;
  onAwaitingApproval?: (output: string) => void;
  onCompleted?: (result: string) => void;
  onFailed?: (error: string) => void;
}

/**
 * Abre um SSE stream para acompanhar o progresso da estimativa.
 * Retorna o EventSource para que o caller possa fechá-lo se necessário.
 */
export function openEstimationStream(
  estimationId: string,
  handlers: EstimationStreamHandlers
): EventSource {
  const es = new EventSource(`${base}/api/estimation/${estimationId}`);

  es.onmessage = (event) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }

    switch (data.type) {
      case 'phase':
        handlers.onPhase?.(data.phase, data.phaseName ?? null);
        break;
      case 'awaiting_approval':
        handlers.onAwaitingApproval?.(data.output ?? '');
        break;
      case 'completed':
        handlers.onCompleted?.(data.result ?? '');
        es.close();
        break;
      case 'failed':
        handlers.onFailed?.(data.error ?? 'Erro desconhecido');
        es.close();
        break;
    }
  };

  es.onerror = () => {
    handlers.onFailed?.('Conexão SSE perdida');
    es.close();
  };

  return es;
}

/**
 * Aprova ou rejeita a fase 1 do pipeline.
 */
export async function approveEstimation(
  estimationId: string,
  approved: boolean,
  feedback?: string
): Promise<void> {
  const res = await fetch(`${base}/api/estimation/${estimationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved, ...(feedback ? { feedback } : {}) }),
  });
  if (!res.ok) throw new Error('Failed to approve estimation');
}

/**
 * Consulta o status atual de uma estimativa (para recovery de sessão).
 * Retorna null se não encontrada ou oute-mind indisponível.
 */
export async function getEstimationStatus(
  estimationId: string
): Promise<EstimationStatus | null> {
  try {
    const res = await fetch(`${base}/api/estimation/${estimationId}/status`);
    if (!res.ok) return null;
    const data = await res.json();
    return (data.status as EstimationStatus) ?? null;
  } catch {
    return null;
  }
}

// ── Notes ──────────────────────────────────────────────────────────────────

export async function saveNote(
  interviewId: string,
  note: Partial<Note>
): Promise<Note> {
  const res = await fetch(`${base}/api/interviews/${interviewId}/notes`, {
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

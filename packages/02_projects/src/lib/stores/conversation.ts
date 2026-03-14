import { writable } from 'svelte/store';
import type { Project, Message, Note, EstimationStatus } from '$lib/types/index';

export const currentProject = writable<Project | null>(null);
export const messages = writable<Message[]>([]);
export const initialInputValue = writable<string>('');
export const chatWindowScrollState = writable({ showTopGradient: false, showBottomGradient: false });
export const notes = writable<Note>({
  summary: '',
  metrics: {
    progress: 0,
    estimatedHours: '',
    budget: '',
  },
  tags: [],
  content: '',
});

export const estimationId = writable<string | null>(null);
export const estimationStatus = writable<EstimationStatus | null>(null);

export function addMessage(message: Message) {
  messages.update((msgs) => [...msgs, message]);
}

export function updateNotes(newNotes: Partial<Note>) {
  notes.update((currentNotes) => ({ ...currentNotes, ...newNotes }));
}

export function exportNotes(): string {
  let exportText = '';
  let currentNotes: Note;

  notes.subscribe((n) => {
    currentNotes = n;
  })();

  let currentProject_: Project | null;
  currentProject.subscribe((p) => {
    currentProject_ = p;
  })();

  exportText = `Project: ${currentProject_?.title || 'Unknown'}\n`;
  exportText += `ID: ${currentProject_?.id || 'N/A'}\n`;
  exportText += `Date: ${new Date().toISOString()}\n\n`;
  exportText += `Summary:\n${currentNotes.summary}\n\n`;
  exportText += `Metrics:\n`;
  exportText += `- Progress: ${currentNotes.metrics.progress}%\n`;
  exportText += `- Estimated Hours: ${currentNotes.metrics.estimatedHours}\n`;
  exportText += `- Budget: ${currentNotes.metrics.budget}\n\n`;
  exportText += `Tags: ${currentNotes.tags.join(', ')}\n\n`;
  exportText += `Notes:\n${currentNotes.content}`;

  return exportText;
}

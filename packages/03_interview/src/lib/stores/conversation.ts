import { writable } from 'svelte/store';
import type { Interview, Message, Note } from '$lib/types/index';

export const currentInterview = writable<Interview | null>(null);
export const messages = writable<Message[]>([]);
export const initialInputValue = writable<string>('');
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

  let currentInterview_: Interview | null;
  currentInterview.subscribe((i) => {
    currentInterview_ = i;
  })();

  exportText = `Interview: ${currentInterview_?.title || 'Unknown'}\n`;
  exportText += `ID: ${currentInterview_?.id || 'N/A'}\n`;
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

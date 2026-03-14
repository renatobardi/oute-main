import type { InterviewNote, NoteMetrics } from '../entities/InterviewNote';

export interface UpsertNoteProps {
  interviewId: string;
  lastEditedBy: string;
  summary?: string;
  content?: string;
  metrics?: Partial<NoteMetrics>;
  tagsSnapshot?: string[];
}

/**
 * IInterviewNoteRepository Port
 * Notes are 1:1 with interviews — upsert handles both create and update.
 */
export interface IInterviewNoteRepository {
  /** Create or update the note for an interview */
  upsert(props: UpsertNoteProps): Promise<InterviewNote>;

  /** Find the note for an interview (returns null if not yet created) */
  findByInterviewId(interviewId: string): Promise<InterviewNote | null>;
}

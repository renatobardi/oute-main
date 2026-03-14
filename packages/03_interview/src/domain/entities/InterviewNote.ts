export interface NoteMetrics {
  progress: number;
  estimatedHours: string;
  budget: string;
}

export interface InterviewNoteProps {
  id: string;
  interviewId: string;
  lastEditedBy: string;
  summary: string | null;
  content: string | null;
  metrics: NoteMetrics;
  tagsSnapshot: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * InterviewNote Entity
 * The notes panel (cockpit) linked 1:1 to an interview.
 * - metrics: progress %, estimated hours, budget (stored as JSONB)
 * - tagsSnapshot: flat list of tag names at time of save (JSONB array)
 * - lastEditedBy: user who last saved the notes
 */
export class InterviewNote {
  private constructor(private props: InterviewNoteProps) {}

  static reconstruct(row: InterviewNoteProps): InterviewNote {
    return new InterviewNote(row);
  }

  update(changes: {
    summary?: string;
    content?: string;
    metrics?: Partial<NoteMetrics>;
    tagsSnapshot?: string[];
    lastEditedBy?: string;
  }): void {
    if (changes.summary !== undefined) this.props.summary = changes.summary;
    if (changes.content !== undefined) this.props.content = changes.content;
    if (changes.tagsSnapshot !== undefined) this.props.tagsSnapshot = changes.tagsSnapshot;
    if (changes.lastEditedBy !== undefined) this.props.lastEditedBy = changes.lastEditedBy;
    if (changes.metrics) {
      this.props.metrics = { ...this.props.metrics, ...changes.metrics };
    }
    this.props.updatedAt = new Date();
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  get id(): string { return this.props.id; }
  get interviewId(): string { return this.props.interviewId; }
  get lastEditedBy(): string { return this.props.lastEditedBy; }
  get summary(): string | null { return this.props.summary; }
  get content(): string | null { return this.props.content; }
  get metrics(): NoteMetrics { return this.props.metrics; }
  get tagsSnapshot(): string[] { return this.props.tagsSnapshot; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  toPlainObject(): InterviewNoteProps {
    return { ...this.props };
  }
}

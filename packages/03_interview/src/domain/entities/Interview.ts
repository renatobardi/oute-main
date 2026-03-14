import { InvalidInterviewError } from '../errors/InvalidInterviewError';

export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface InterviewProps {
  id: string;
  projectId: string;
  conductedBy: string;
  title: string;
  status: InterviewStatus;
  interviewCode: string;
  totalMessages: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interview Entity
 * Represents a single chat/discovery session within a project.
 * - id and interviewCode are immutable after creation
 * - status transitions: scheduled → in_progress → completed | cancelled
 */
export class Interview {
  private constructor(private props: InterviewProps) {}

  /**
   * Reconstruct from a database row
   */
  static reconstruct(row: InterviewProps): Interview {
    return new Interview(row);
  }

  // ── Transitions ──────────────────────────────────────────────────────────

  start(): void {
    if (this.props.status !== 'scheduled') {
      throw new InvalidInterviewError(`Cannot start an interview with status "${this.props.status}"`);
    }
    this.props.status = 'in_progress';
    this.props.startedAt = new Date();
    this.props.updatedAt = new Date();
  }

  complete(): void {
    if (this.props.status !== 'in_progress') {
      throw new InvalidInterviewError(`Cannot complete an interview with status "${this.props.status}"`);
    }
    this.props.status = 'completed';
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    if (this.props.status === 'completed') {
      throw new InvalidInterviewError('Cannot cancel a completed interview');
    }
    this.props.status = 'cancelled';
    this.props.updatedAt = new Date();
  }

  incrementMessageCount(): void {
    this.props.totalMessages += 1;
    this.props.updatedAt = new Date();
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  get id(): string { return this.props.id; }
  get projectId(): string { return this.props.projectId; }
  get conductedBy(): string { return this.props.conductedBy; }
  get title(): string { return this.props.title; }
  get status(): InterviewStatus { return this.props.status; }
  get interviewCode(): string { return this.props.interviewCode; }
  get totalMessages(): number { return this.props.totalMessages; }
  get startedAt(): Date | null { return this.props.startedAt; }
  get completedAt(): Date | null { return this.props.completedAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  toPlainObject(): InterviewProps {
    return { ...this.props };
  }
}

export type MessageSender = 'user' | 'ai' | 'system';
export type MessageType = 'text' | 'code' | 'image';

export interface MessageMetadata {
  userName?: string;
  avatarColor?: string;
  [key: string]: unknown;
}

export interface MessageProps {
  id: string;
  interviewId: string;
  userId: string | null;
  sender: MessageSender;
  type: MessageType;
  content: string;
  metadata: MessageMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message Entity
 * Represents a single message in the interview chat.
 * - sender = 'user': a human participant (userId required)
 * - sender = 'ai': the AI assistant (userId null)
 * - sender = 'system': system-generated events (userId null)
 * - User display info (name, avatar) is stored in metadata JSONB
 */
export class Message {
  private constructor(private props: MessageProps) {}

  static reconstruct(row: MessageProps): Message {
    return new Message(row);
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  get id(): string { return this.props.id; }
  get interviewId(): string { return this.props.interviewId; }
  get userId(): string | null { return this.props.userId; }
  get sender(): MessageSender { return this.props.sender; }
  get type(): MessageType { return this.props.type; }
  get content(): string { return this.props.content; }
  get metadata(): MessageMetadata { return this.props.metadata; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  toPlainObject(): MessageProps {
    return { ...this.props };
  }
}

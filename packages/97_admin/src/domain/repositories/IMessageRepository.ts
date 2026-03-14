import type { Message, MessageSender, MessageType, MessageMetadata } from '../entities/Message';

export interface CreateMessageProps {
  interviewId: string;
  userId: string | null;
  sender: MessageSender;
  type: MessageType;
  content: string;
  metadata?: MessageMetadata;
}

/**
 * IMessageRepository Port
 */
export interface IMessageRepository {
  /** Persist a new message and return the created entity */
  create(props: CreateMessageProps): Promise<Message>;

  /** Fetch all messages for an interview ordered by created_at ASC */
  findByInterviewId(interviewId: string): Promise<Message[]>;

  /** Find a single message by id */
  findById(id: string): Promise<Message | null>;

  /** Soft-delete a message */
  delete(id: string): Promise<void>;
}

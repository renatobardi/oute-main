import type postgres from 'postgres';
import { getDb } from '@oute/shared/database';
import { Message } from '../../domain/entities/Message';
import type { IMessageRepository, CreateMessageProps } from '../../domain/repositories/IMessageRepository';

/**
 * PostgresMessageRepository
 * Messages are ordered ASC by created_at (oldest first → chat flow).
 * User display info (name, avatar) lives in the metadata JSONB column.
 */
export class PostgresMessageRepository implements IMessageRepository {
  private sql: postgres.Sql;

  constructor(sql?: postgres.Sql) {
    this.sql = sql ?? getDb();
  }

  async create(props: CreateMessageProps): Promise<Message> {
    const metadata = props.metadata ?? {};

    const [row] = await this.sql`
      INSERT INTO messages (interview_id, user_id, sender, type, content, metadata)
      VALUES (
        ${props.interviewId},
        ${props.userId},
        ${props.sender},
        ${props.type},
        ${props.content},
        ${this.sql.json(metadata)}
      )
      RETURNING id, interview_id, user_id, sender, type, content, metadata, created_at, updated_at
    `;

    return this.toDomain(row);
  }

  async findByInterviewId(interviewId: string): Promise<Message[]> {
    const rows = await this.sql`
      SELECT id, interview_id, user_id, sender, type, content, metadata, created_at, updated_at
      FROM messages
      WHERE interview_id = ${interviewId} AND deleted_at IS NULL
      ORDER BY created_at ASC
    `;

    return rows.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<Message | null> {
    const rows = await this.sql`
      SELECT id, interview_id, user_id, sender, type, content, metadata, created_at, updated_at
      FROM messages
      WHERE id = ${id} AND deleted_at IS NULL
    `;

    return rows.length ? this.toDomain(rows[0]) : null;
  }

  async delete(id: string): Promise<void> {
    await this.sql`
      UPDATE messages SET deleted_at = now()
      WHERE id = ${id} AND deleted_at IS NULL
    `;
  }

  private toDomain(row: postgres.Row): Message {
    return Message.reconstruct({
      id: row.id,
      interviewId: row.interview_id,
      userId: row.user_id ?? null,
      sender: row.sender,
      type: row.type,
      content: row.content,
      metadata: row.metadata ?? {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}

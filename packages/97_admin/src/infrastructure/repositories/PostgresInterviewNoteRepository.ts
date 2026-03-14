import type postgres from 'postgres';
import { getDb } from '@oute/shared/database';
import { InterviewNote } from '../../domain/entities/InterviewNote';
import type { IInterviewNoteRepository, UpsertNoteProps } from '../../domain/repositories/IInterviewNoteRepository';

/**
 * PostgresInterviewNoteRepository
 * Notes are 1:1 with interviews.
 * Uses INSERT ... ON CONFLICT to handle both create and update in one query.
 */
export class PostgresInterviewNoteRepository implements IInterviewNoteRepository {
  private sql: postgres.Sql;

  constructor(sql?: postgres.Sql) {
    this.sql = sql ?? getDb();
  }

  async upsert(props: UpsertNoteProps): Promise<InterviewNote> {
    const metrics = {
      progress: props.metrics?.progress ?? 0,
      estimatedHours: props.metrics?.estimatedHours ?? '',
      budget: props.metrics?.budget ?? '',
    };
    const tags = props.tagsSnapshot ?? [];

    const [row] = await this.sql`
      INSERT INTO interview_notes (interview_id, last_edited_by, summary, content, metrics, tags_snapshot)
      VALUES (
        ${props.interviewId},
        ${props.lastEditedBy},
        ${props.summary ?? null},
        ${props.content ?? null},
        ${this.sql.json(metrics)},
        ${this.sql.json(tags)}
      )
      ON CONFLICT (interview_id) WHERE deleted_at IS NULL
      DO UPDATE SET
        last_edited_by = EXCLUDED.last_edited_by,
        summary        = COALESCE(EXCLUDED.summary, interview_notes.summary),
        content        = COALESCE(EXCLUDED.content, interview_notes.content),
        metrics        = interview_notes.metrics || EXCLUDED.metrics,
        tags_snapshot  = EXCLUDED.tags_snapshot,
        updated_at     = now()
      RETURNING
        id, interview_id, last_edited_by, summary, content,
        metrics, tags_snapshot, created_at, updated_at
    `;

    return this.toDomain(row);
  }

  async findByInterviewId(interviewId: string): Promise<InterviewNote | null> {
    const rows = await this.sql`
      SELECT
        id, interview_id, last_edited_by, summary, content,
        metrics, tags_snapshot, created_at, updated_at
      FROM interview_notes
      WHERE interview_id = ${interviewId} AND deleted_at IS NULL
    `;

    return rows.length ? this.toDomain(rows[0]) : null;
  }

  private toDomain(row: postgres.Row): InterviewNote {
    return InterviewNote.reconstruct({
      id: row.id,
      interviewId: row.interview_id,
      lastEditedBy: row.last_edited_by,
      summary: row.summary ?? null,
      content: row.content ?? null,
      metrics: row.metrics ?? { progress: 0, estimatedHours: '', budget: '' },
      tagsSnapshot: row.tags_snapshot ?? [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}

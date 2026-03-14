import type postgres from 'postgres';
import { getDb } from '@oute/shared/database';
import { Interview } from '../../domain/entities/Interview';
import type { IInterviewRepository, CreateInterviewProps } from '../../domain/repositories/IInterviewRepository';

// Fixed dev IDs (from seed 001_dev_user_org.sql)
// Replaced by real auth values in FASE 7
const DEV_ORG_ID = '019534a0-0000-7000-8000-000000000010';

/**
 * PostgresInterviewRepository
 * - Auto-creates a DRAFT project when creating an interview (pre-auth)
 * - project_id and conducted_by will be updated in FASE 7 (post-auth)
 */
export class PostgresInterviewRepository implements IInterviewRepository {
  private sql: postgres.Sql;

  constructor(sql?: postgres.Sql) {
    this.sql = sql ?? getDb();
  }

  async create(props: CreateInterviewProps): Promise<Interview> {
    // Auto-create a DRAFT project linked to the dev org
    const draftCode = 'DRAFT-' + Math.random().toString(36).slice(2, 8).toUpperCase();

    const [project] = await this.sql`
      INSERT INTO projects (organization_id, created_by, code, name, status)
      VALUES (
        ${DEV_ORG_ID},
        ${props.conductedBy},
        ${draftCode},
        ${'Draft Interview Project'},
        'draft'
      )
      RETURNING id
    `;

    const [row] = await this.sql`
      INSERT INTO interviews (project_id, conducted_by, title, status)
      VALUES (
        ${project.id},
        ${props.conductedBy},
        ${props.title},
        'scheduled'
      )
      RETURNING
        id, project_id, conducted_by, title, status,
        interview_code, total_messages,
        started_at, completed_at, created_at, updated_at
    `;

    return this.toDomain(row);
  }

  async findById(id: string): Promise<Interview | null> {
    const rows = await this.sql`
      SELECT
        id, project_id, conducted_by, title, status,
        interview_code, total_messages,
        started_at, completed_at, created_at, updated_at
      FROM interviews
      WHERE id = ${id} AND deleted_at IS NULL
    `;

    return rows.length ? this.toDomain(rows[0]) : null;
  }

  async findByCode(code: string): Promise<Interview | null> {
    const rows = await this.sql`
      SELECT
        id, project_id, conducted_by, title, status,
        interview_code, total_messages,
        started_at, completed_at, created_at, updated_at
      FROM interviews
      WHERE interview_code = ${code} AND deleted_at IS NULL
    `;

    return rows.length ? this.toDomain(rows[0]) : null;
  }

  async findByProjectId(projectId: string): Promise<Interview[]> {
    const rows = await this.sql`
      SELECT
        id, project_id, conducted_by, title, status,
        interview_code, total_messages,
        started_at, completed_at, created_at, updated_at
      FROM interviews
      WHERE project_id = ${projectId} AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    return rows.map((r) => this.toDomain(r));
  }

  async findByConductedBy(userId: string): Promise<Interview[]> {
    const rows = await this.sql`
      SELECT
        id, project_id, conducted_by, title, status,
        interview_code, total_messages,
        started_at, completed_at, created_at, updated_at
      FROM interviews
      WHERE conducted_by = ${userId} AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    return rows.map((r) => this.toDomain(r));
  }

  async update(interview: Interview): Promise<void> {
    const p = interview.toPlainObject();
    await this.sql`
      UPDATE interviews SET
        status         = ${p.status},
        total_messages = ${p.totalMessages},
        started_at     = ${p.startedAt},
        completed_at   = ${p.completedAt},
        updated_at     = now()
      WHERE id = ${p.id} AND deleted_at IS NULL
    `;
  }

  async delete(id: string): Promise<void> {
    await this.sql`
      UPDATE interviews SET deleted_at = now()
      WHERE id = ${id} AND deleted_at IS NULL
    `;
  }

  private toDomain(row: postgres.Row): Interview {
    return Interview.reconstruct({
      id: row.id,
      projectId: row.project_id,
      conductedBy: row.conducted_by,
      title: row.title,
      status: row.status,
      interviewCode: row.interview_code,
      totalMessages: row.total_messages,
      startedAt: row.started_at ? new Date(row.started_at) : null,
      completedAt: row.completed_at ? new Date(row.completed_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}

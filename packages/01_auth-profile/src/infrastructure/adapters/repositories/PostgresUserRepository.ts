import postgres from 'postgres';
import { User, UserId, Email, IUserRepository } from '../../../domain';

/**
 * PostgresUserRepository Adapter
 * - Implements IUserRepository Port
 * - Uses postgres driver for real PostgreSQL persistence
 * - Soft deletes via deleted_at column
 */
export class PostgresUserRepository implements IUserRepository {
  private sql: postgres.Sql;

  constructor(databaseUrl?: string) {
    const url = databaseUrl ?? process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    this.sql = postgres(url, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }

  async save(user: User): Promise<void> {
    const plain = user.toPlainObject();

    await this.sql`
      INSERT INTO users (id, email, password_hash, name, last_login_at, created_at)
      VALUES (
        ${plain.id},
        ${plain.email},
        ${user.getPasswordHash()},
        ${plain.name},
        ${plain.lastLogin},
        ${plain.createdAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        last_login_at = EXCLUDED.last_login_at
    `;
  }

  async findById(id: UserId): Promise<User | null> {
    const rows = await this.sql`
      SELECT id, email, password_hash, name, last_login_at, created_at
      FROM users
      WHERE id = ${id.getValue()} AND deleted_at IS NULL
    `;

    if (rows.length === 0) return null;
    return this.toDomain(rows[0]);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const rows = await this.sql`
      SELECT id, email, password_hash, name, last_login_at, created_at
      FROM users
      WHERE email = ${email.getValue()} AND deleted_at IS NULL
    `;

    if (rows.length === 0) return null;
    return this.toDomain(rows[0]);
  }

  async delete(id: UserId): Promise<void> {
    await this.sql`
      UPDATE users SET deleted_at = now()
      WHERE id = ${id.getValue()} AND deleted_at IS NULL
    `;
  }

  async exists(id: UserId): Promise<boolean> {
    const rows = await this.sql`
      SELECT 1 FROM users
      WHERE id = ${id.getValue()} AND deleted_at IS NULL
      LIMIT 1
    `;
    return rows.length > 0;
  }

  async count(): Promise<number> {
    const [row] = await this.sql`
      SELECT count(*)::int AS n FROM users WHERE deleted_at IS NULL
    `;
    return row.n;
  }

  private toDomain(row: postgres.Row): User {
    return User.reconstruct({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name,
      roles: ['USER'],
      createdAt: new Date(row.created_at),
      lastLogin: row.last_login_at ? new Date(row.last_login_at) : null,
    });
  }
}

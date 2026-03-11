/**
 * OUTE Shared Database Module
 * Singleton connection pool for PostgreSQL, shared across all packages.
 *
 * Usage:
 *   import { getDb, closeDb } from '@oute/shared/database';
 *   const sql = getDb();
 *   const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
 */

import postgres from 'postgres';

let instance: postgres.Sql | null = null;

/**
 * Get the shared database connection pool.
 * Creates a singleton instance on first call.
 */
export function getDb(databaseUrl?: string): postgres.Sql {
  if (instance) return instance;

  const url = databaseUrl ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is required. ' +
      'Set it in .env.local or pass it to getDb().'
    );
  }

  instance = postgres(url, {
    max: 20,
    idle_timeout: 30,
    connect_timeout: 10,
    max_lifetime: 60 * 30,
  });

  return instance;
}

/**
 * Close the database connection pool.
 * Call on server shutdown for graceful cleanup.
 */
export async function closeDb(): Promise<void> {
  if (instance) {
    await instance.end();
    instance = null;
  }
}

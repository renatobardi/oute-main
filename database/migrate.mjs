#!/usr/bin/env node
// =============================================================================
// OUTE - SQL Migration Runner
// =============================================================================
// Usage:
//   node database/migrate.mjs                  # run pending migrations
//   node database/migrate.mjs --status         # show migration status
//   node database/migrate.mjs --rollback       # rollback last batch
//   node database/migrate.mjs --reset          # rollback all + re-migrate
//
// Requires: DATABASE_URL environment variable
// =============================================================================

import postgres from 'postgres';
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, 'migrations');

// ─── Config ──────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 10,
});

// ─── Schema Migrations Table ─────────────────────────────────────────────────

async function ensureMigrationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id            serial       PRIMARY KEY,
      filename      varchar(255) NOT NULL UNIQUE,
      batch         integer      NOT NULL,
      executed_at   timestamptz  NOT NULL DEFAULT now(),
      checksum      varchar(64)  NOT NULL,
      execution_ms  integer
    )
  `;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getExecutedMigrations() {
  const rows = await sql`
    SELECT filename, batch, executed_at, execution_ms
    FROM schema_migrations
    ORDER BY filename ASC
  `;
  return rows;
}

async function getPendingMigrations() {
  const files = await readdir(MIGRATIONS_DIR);
  const sqlFiles = files
    .filter(f => f.endsWith('.sql'))
    .sort();

  const executed = await getExecutedMigrations();
  const executedSet = new Set(executed.map(r => r.filename));

  return sqlFiles.filter(f => !executedSet.has(f));
}

function simpleChecksum(content) {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit int
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

async function getNextBatch() {
  const [row] = await sql`
    SELECT COALESCE(MAX(batch), 0) + 1 AS next_batch
    FROM schema_migrations
  `;
  return row.next_batch;
}

// ─── Commands ────────────────────────────────────────────────────────────────

async function runMigrations() {
  const pending = await getPendingMigrations();

  if (pending.length === 0) {
    console.log('✓ No pending migrations');
    return;
  }

  const batch = await getNextBatch();
  console.log(`Running ${pending.length} migration(s) [batch ${batch}]:\n`);

  for (const filename of pending) {
    const filepath = join(MIGRATIONS_DIR, filename);
    const content = await readFile(filepath, 'utf-8');
    const checksum = simpleChecksum(content);

    const start = Date.now();
    try {
      await sql.unsafe(content);
      const ms = Date.now() - start;

      await sql`
        INSERT INTO schema_migrations (filename, batch, checksum, execution_ms)
        VALUES (${filename}, ${batch}, ${checksum}, ${ms})
      `;

      console.log(`  ✓ ${filename} (${ms}ms)`);
    } catch (err) {
      const ms = Date.now() - start;
      console.error(`  ✗ ${filename} (${ms}ms)`);
      console.error(`    ${err.message}`);
      process.exit(1);
    }
  }

  console.log(`\n✓ Batch ${batch} complete`);
}

async function showStatus() {
  const executed = await getExecutedMigrations();
  const pending = await getPendingMigrations();

  console.log('Migration Status:\n');

  if (executed.length > 0) {
    console.log('  Executed:');
    for (const row of executed) {
      const date = new Date(row.executed_at).toISOString().slice(0, 19);
      console.log(`    ✓ ${row.filename}  [batch ${row.batch}]  ${date}  (${row.execution_ms}ms)`);
    }
  }

  if (pending.length > 0) {
    console.log('\n  Pending:');
    for (const filename of pending) {
      console.log(`    ○ ${filename}`);
    }
  }

  if (executed.length === 0 && pending.length === 0) {
    console.log('  No migrations found');
  }

  console.log('');
}

async function rollbackLastBatch() {
  const [row] = await sql`
    SELECT MAX(batch) AS last_batch FROM schema_migrations
  `;

  if (!row?.last_batch) {
    console.log('Nothing to rollback');
    return;
  }

  const batch = row.last_batch;
  const migrations = await sql`
    SELECT filename FROM schema_migrations
    WHERE batch = ${batch}
    ORDER BY filename DESC
  `;

  console.log(`Rolling back batch ${batch} (${migrations.length} migration(s)):\n`);

  for (const { filename } of migrations) {
    const downFilename = filename.replace('.sql', '.down.sql');
    const downPath = join(MIGRATIONS_DIR, downFilename);

    try {
      const content = await readFile(downPath, 'utf-8');
      await sql.unsafe(content);
      await sql`DELETE FROM schema_migrations WHERE filename = ${filename}`;
      console.log(`  ✓ ${filename} rolled back`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.error(`  ✗ ${downFilename} not found - cannot rollback`);
        console.error(`    Create the down migration file and try again`);
      } else {
        console.error(`  ✗ ${filename}: ${err.message}`);
      }
      process.exit(1);
    }
  }

  console.log(`\n✓ Batch ${batch} rolled back`);
}

async function resetAll() {
  const [row] = await sql`
    SELECT MAX(batch) AS last_batch FROM schema_migrations
  `;

  if (!row?.last_batch) {
    console.log('No migrations to reset, running fresh...\n');
    await runMigrations();
    return;
  }

  // Rollback all batches in reverse order
  for (let b = row.last_batch; b >= 1; b--) {
    const migrations = await sql`
      SELECT filename FROM schema_migrations
      WHERE batch = ${b}
      ORDER BY filename DESC
    `;

    for (const { filename } of migrations) {
      const downFilename = filename.replace('.sql', '.down.sql');
      const downPath = join(MIGRATIONS_DIR, downFilename);

      try {
        const content = await readFile(downPath, 'utf-8');
        await sql.unsafe(content);
        await sql`DELETE FROM schema_migrations WHERE filename = ${filename}`;
        console.log(`  ✓ ${filename} rolled back`);
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.error(`  ✗ ${downFilename} not found`);
        } else {
          console.error(`  ✗ ${filename}: ${err.message}`);
        }
        process.exit(1);
      }
    }
  }

  console.log('\n✓ All rolled back. Running migrations...\n');
  await runMigrations();
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    await ensureMigrationsTable();

    switch (command) {
      case '--status':
        await showStatus();
        break;
      case '--rollback':
        await rollbackLastBatch();
        break;
      case '--reset':
        await resetAll();
        break;
      default:
        await runMigrations();
        break;
    }
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();

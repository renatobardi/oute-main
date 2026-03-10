#!/usr/bin/env node
// =============================================================================
// OUTE - Seed Runner
// =============================================================================
// Usage:
//   node database/seed.mjs                     # run all seeds in order
//   node database/seed.mjs --only 001          # run specific seed
//
// Requires: DATABASE_URL environment variable
// =============================================================================

import postgres from 'postgres';
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEEDS_DIR = join(__dirname, 'seeds');

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

async function runSeeds(only) {
  const files = await readdir(SEEDS_DIR);
  let sqlFiles = files
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (only) {
    sqlFiles = sqlFiles.filter(f => f.startsWith(only));
  }

  if (sqlFiles.length === 0) {
    console.log('No seed files found');
    return;
  }

  console.log(`Running ${sqlFiles.length} seed(s):\n`);

  for (const filename of sqlFiles) {
    const filepath = join(SEEDS_DIR, filename);
    const content = await readFile(filepath, 'utf-8');

    const start = Date.now();
    try {
      await sql.unsafe(content);
      const ms = Date.now() - start;
      console.log(`  ✓ ${filename} (${ms}ms)`);
    } catch (err) {
      const ms = Date.now() - start;
      console.error(`  ✗ ${filename} (${ms}ms)`);
      console.error(`    ${err.message}`);
      process.exit(1);
    }
  }

  console.log('\n✓ Seeds complete');
}

async function main() {
  const args = process.argv.slice(2);
  const onlyIdx = args.indexOf('--only');
  const only = onlyIdx !== -1 ? args[onlyIdx + 1] : null;

  try {
    await runSeeds(only);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();

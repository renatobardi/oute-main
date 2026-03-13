#!/usr/bin/env node
// =============================================================================
// OUTE - Database Validation Script
// =============================================================================
// Validates schema integrity after migrations: tables, FKs, indexes, enums,
// triggers, and row counts.
//
// Usage: node database/validate.mjs
// Requires: DATABASE_URL environment variable
// =============================================================================

import postgres from 'postgres';

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

const EXPECTED_TABLES = [
  'schema_migrations',
  'users', 'organizations', 'organization_members', 'refresh_tokens',
  'projects', 'project_members', 'tags', 'project_tags',
  'interviews', 'messages', 'interview_notes',
  'sdlc_templates', 'template_milestones', 'template_epics', 'template_issues', 'template_checklist_items',
  'estimation_sessions', 'estimation_milestone_statuses', 'estimation_responses', 'estimation_checklist_results', 'estimation_outputs',
  'integration_connections', 'export_sessions', 'export_mappings',
  'audit_log',
];

const EXPECTED_ENUMS = [
  'user_role', 'project_status', 'project_type',
  'interview_status', 'message_sender', 'message_type',
  'milestone_tracking_status', 'estimation_session_status', 'reviewer_verdict',
  'integration_provider', 'export_status',
];

let passed = 0;
let failed = 0;

function ok(msg) { passed++; console.log(`  ✓ ${msg}`); }
function fail(msg) { failed++; console.error(`  ✗ ${msg}`); }

async function main() {
  console.log('Database Validation\n');

  // 1. Tables
  console.log('[1] Tables:');
  const tables = await sql`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
  const tableNames = new Set(tables.map(t => t.tablename));

  for (const t of EXPECTED_TABLES) {
    tableNames.has(t) ? ok(t) : fail(`${t} MISSING`);
  }

  // 2. Enums
  console.log('\n[2] Enums:');
  const enums = await sql`
    SELECT typname FROM pg_type
    WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND typtype = 'e'
    ORDER BY typname
  `;
  const enumNames = new Set(enums.map(e => e.typname));

  for (const e of EXPECTED_ENUMS) {
    enumNames.has(e) ? ok(e) : fail(`${e} MISSING`);
  }

  // 3. Foreign Keys
  console.log('\n[3] Foreign Keys:');
  const fks = await sql`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    ORDER BY tc.table_name, kcu.column_name
  `;
  ok(`${fks.length} foreign keys found`);
  for (const fk of fks) {
    console.log(`    ${fk.table_name}.${fk.column_name} → ${fk.foreign_table}`);
  }

  // 4. Indexes
  console.log('\n[4] Indexes:');
  const indexes = await sql`
    SELECT indexname, tablename
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
    ORDER BY tablename, indexname
  `;
  ok(`${indexes.length} custom indexes found`);

  // 5. Triggers
  console.log('\n[5] Triggers:');
  const triggers = await sql`
    SELECT trigger_name, event_object_table
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    ORDER BY event_object_table, trigger_name
  `;
  ok(`${triggers.length} triggers found`);
  for (const t of triggers) {
    console.log(`    ${t.event_object_table} → ${t.trigger_name}`);
  }

  // 6. Functions
  console.log('\n[6] Custom Functions:');
  const funcs = await sql`
    SELECT routine_name
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    ORDER BY routine_name
  `;
  ok(`${funcs.length} functions found`);
  for (const f of funcs) {
    console.log(`    ${f.routine_name}`);
  }

  // 7. Row counts (seed data)
  console.log('\n[7] Row Counts:');
  const countTables = ['users', 'organizations', 'organization_members',
    'sdlc_templates', 'template_milestones', 'template_epics',
    'template_issues', 'template_checklist_items'];

  for (const t of countTables) {
    const [row] = await sql.unsafe(`SELECT count(*)::int AS n FROM ${t}`);
    console.log(`    ${t}: ${row.n} rows`);
  }

  // Summary
  console.log(`\n${'─'.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

main()
  .catch(err => {
    console.error('Validation error:', err.message);
    process.exit(1);
  })
  .finally(() => sql.end());

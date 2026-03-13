-- =============================================================================
-- Seed 001: Dev User & Organization
-- =============================================================================
-- Creates a default admin user and organization for local development.
-- Password: "dev123456" (bcrypt hash)
-- =============================================================================

-- Dev user
INSERT INTO users (id, email, password_hash, name)
VALUES (
  '019534a0-0000-7000-8000-000000000001',
  'admin@oute.dev',
  '$2b$10$K4GzYGh8J8V7vX6pQwY5aeKl8X9QjZ3kN2mP5rT1wU4xY6zA0bCdE',
  'OUTE Admin'
) ON CONFLICT DO NOTHING;

-- Dev organization
INSERT INTO organizations (id, name, slug, settings)
VALUES (
  '019534a0-0000-7000-8000-000000000010',
  'OUTE Dev',
  'oute-dev',
  '{"plan": "enterprise", "maxProjects": 100, "maxMembers": 50}'
) ON CONFLICT DO NOTHING;

-- Link user to org as owner
INSERT INTO organization_members (id, organization_id, user_id, role)
VALUES (
  '019534a0-0000-7000-8000-000000000020',
  '019534a0-0000-7000-8000-000000000010',
  '019534a0-0000-7000-8000-000000000001',
  'owner'
) ON CONFLICT DO NOTHING;

-- =============================================================================
-- Migration 003: All ENUM Types
-- =============================================================================
-- 11 enums across 7 bounded contexts.
-- =============================================================================

-- IAM
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Project Management
CREATE TYPE project_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE project_type AS ENUM ('greenfield', 'brownfield');

-- Interview & Conversation
CREATE TYPE interview_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE message_sender AS ENUM ('user', 'ai', 'system');
CREATE TYPE message_type AS ENUM ('text', 'code', 'image');

-- Estimation Engine
CREATE TYPE milestone_tracking_status AS ENUM (
  'pending', 'in_progress', 'completed', 'skipped', 'needs_revisit', 'not_applicable'
);
CREATE TYPE estimation_session_status AS ENUM ('draft', 'in_progress', 'completed', 'abandoned');
CREATE TYPE reviewer_verdict AS ENUM ('confirmed_skip', 'must_revisit', 'not_needed');

-- Integrations
CREATE TYPE integration_provider AS ENUM ('linear', 'jira', 'asana', 'github', 'gitlab');
CREATE TYPE export_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');

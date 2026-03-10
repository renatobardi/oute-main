-- =============================================================================
-- Migration 009: Estimation Engine
-- =============================================================================
-- Tables: estimation_sessions, estimation_milestone_statuses,
--         estimation_responses, estimation_checklist_results,
--         estimation_outputs
-- =============================================================================

-- ─── estimation_sessions ─────────────────────────────────────────────────────

CREATE TABLE estimation_sessions (
  id               uuid                      PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id       uuid                      NOT NULL REFERENCES projects(id),
  template_id      uuid                      NOT NULL REFERENCES sdlc_templates(id),
  started_by       uuid                      NOT NULL REFERENCES users(id),
  status           estimation_session_status  NOT NULL DEFAULT 'draft',
  overall_progress integer                   NOT NULL DEFAULT 0 CHECK (overall_progress BETWEEN 0 AND 100),
  config           jsonb                     NOT NULL DEFAULT '{}',
  started_at       timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz               NOT NULL DEFAULT now(),
  updated_at       timestamptz               NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);

CREATE INDEX idx_est_sessions_project_template
  ON estimation_sessions (project_id, template_id);

CREATE INDEX idx_est_sessions_project_id
  ON estimation_sessions (project_id);

CREATE INDEX idx_est_sessions_started_by
  ON estimation_sessions (started_by);

CREATE INDEX idx_est_sessions_status
  ON estimation_sessions (status) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_est_sessions_updated_at
  BEFORE UPDATE ON estimation_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── estimation_milestone_statuses ───────────────────────────────────────────

CREATE TABLE estimation_milestone_statuses (
  id               uuid                       PRIMARY KEY DEFAULT uuid_generate_v7(),
  session_id       uuid                       NOT NULL REFERENCES estimation_sessions(id),
  milestone_id     uuid                       NOT NULL REFERENCES template_milestones(id),
  status           milestone_tracking_status   NOT NULL DEFAULT 'pending',
  skip_reason      text,
  reviewer_verdict reviewer_verdict,
  reviewed_by      uuid                       REFERENCES users(id),
  progress_percent integer                    NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  started_at       timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz                NOT NULL DEFAULT now(),
  updated_at       timestamptz                NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);

CREATE UNIQUE INDEX idx_milestone_status_session_milestone
  ON estimation_milestone_statuses (session_id, milestone_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_milestone_status_session_id
  ON estimation_milestone_statuses (session_id);

CREATE INDEX idx_milestone_status_session_status
  ON estimation_milestone_statuses (session_id, status);

CREATE TRIGGER trg_est_milestone_statuses_updated_at
  BEFORE UPDATE ON estimation_milestone_statuses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── estimation_responses ────────────────────────────────────────────────────

CREATE TABLE estimation_responses (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v7(),
  session_id      uuid        NOT NULL REFERENCES estimation_sessions(id),
  issue_id        uuid        NOT NULL REFERENCES template_issues(id),
  answered_by     uuid        NOT NULL REFERENCES users(id),
  answer          text        NOT NULL,
  structured_data jsonb,
  is_complete     boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE UNIQUE INDEX idx_responses_session_issue
  ON estimation_responses (session_id, issue_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_responses_session_id
  ON estimation_responses (session_id);

CREATE TRIGGER trg_est_responses_updated_at
  BEFORE UPDATE ON estimation_responses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── estimation_checklist_results ────────────────────────────────────────────

CREATE TABLE estimation_checklist_results (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v7(),
  session_id        uuid        NOT NULL REFERENCES estimation_sessions(id),
  checklist_item_id uuid        NOT NULL REFERENCES template_checklist_items(id),
  is_checked        boolean     NOT NULL DEFAULT false,
  note              text,
  checked_by        uuid        NOT NULL REFERENCES users(id),
  checked_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);

CREATE UNIQUE INDEX idx_checklist_results_session_item
  ON estimation_checklist_results (session_id, checklist_item_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_checklist_results_session_id
  ON estimation_checklist_results (session_id);

CREATE TRIGGER trg_est_checklist_results_updated_at
  BEFORE UPDATE ON estimation_checklist_results
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── estimation_outputs ──────────────────────────────────────────────────────

CREATE TABLE estimation_outputs (
  id                     uuid        PRIMARY KEY DEFAULT uuid_generate_v7(),
  session_id             uuid        NOT NULL REFERENCES estimation_sessions(id),
  output_type            varchar(50) NOT NULL DEFAULT 'summary',
  result                 jsonb       NOT NULL DEFAULT '{}',
  architecture_decisions jsonb       NOT NULL DEFAULT '{}',
  compliance_summary     jsonb       NOT NULL DEFAULT '{}',
  confidence_score       integer     CHECK (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 100),
  estimated_hours_min    integer,
  estimated_hours_max    integer,
  estimated_budget_min   integer,
  estimated_budget_max   integer,
  currency               varchar(3)  NOT NULL DEFAULT 'BRL',
  generated_at           timestamptz NOT NULL DEFAULT now(),
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  deleted_at             timestamptz
);

CREATE INDEX idx_outputs_session_id
  ON estimation_outputs (session_id);

CREATE INDEX idx_outputs_session_type
  ON estimation_outputs (session_id, output_type);

CREATE TRIGGER trg_est_outputs_updated_at
  BEFORE UPDATE ON estimation_outputs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
